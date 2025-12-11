import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import {
  getContacts,
  createContact,
  updateContact,
  deleteContact,
  toggleBookmark,
  replaceMethods,
  bulkImportContacts,
} from "./api";
import { METHOD_TYPES } from "./methodTypes";
import "./App.css";

const emptyContact = () => ({
  name: "",
  isBookmarked: false,
  methods: [{ type: "phone", value: "", label: "" }],
});

function groupByType(methods, type) {
  return (methods || []).filter((m) => m.type === type).map((m) => m.value);
}

export default function App() {
  const [contacts, setContacts] = useState([]);
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);

  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState(emptyContact());

  const [modalOpen, setModalOpen] = useState(false);
  const [msg, setMsg] = useState("");

  async function refresh() {
    const res = await getContacts(bookmarkedOnly);
    setContacts(res.data);
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookmarkedOnly]);

  function openCreate() {
    setEditing(null);
    setDraft(emptyContact());
    setMsg("");
    setModalOpen(true);
  }

  function openEdit(c) {
    setEditing(c);
    setDraft({
      name: c.name ?? "",
      isBookmarked: !!c.isBookmarked,
      methods:
        c.methods?.length > 0
          ? c.methods.map((m) => ({
              type: m.type,
              value: m.value,
              label: m.label || "",
            }))
          : [{ type: "phone", value: "", label: "" }],
    });
    setMsg("");
    setModalOpen(true);
  }

  function closeModal() {
    setEditing(null);
    setDraft(emptyContact());
    setMsg("");
    setModalOpen(false);
  }

  function updateMethod(idx, patch) {
    setDraft((d) => {
      const next = [...d.methods];
      next[idx] = { ...next[idx], ...patch };
      return { ...d, methods: next };
    });
  }

  function addMethodRow() {
    setDraft((d) => ({
      ...d,
      methods: [...d.methods, { type: "phone", value: "", label: "" }],
    }));
  }

  function removeMethodRow(idx) {
    setDraft((d) => {
      const next = d.methods.filter((_, i) => i !== idx);
      return {
        ...d,
        methods: next.length ? next : [{ type: "phone", value: "", label: "" }],
      };
    });
  }

  async function saveDraft() {
    const name = String(draft.name || "").trim();

    const cleanedMethods = (draft.methods || [])
      .map((m) => ({
        type: m.type,
        value: String(m.value || "").trim(),
        label: m.label?.trim() || null,
      }))
      .filter((m) => m.value);

    if (!name) {
      setMsg("Name is required.");
      return;
    }

    try {
      if (!editing) {
        await createContact({
          name,
          isBookmarked: !!draft.isBookmarked,
          methods: cleanedMethods,
        });
      } else {
        await updateContact(editing.id, {
          name,
          isBookmarked: !!draft.isBookmarked,
        });
        await replaceMethods(editing.id, cleanedMethods);
      }

      await refresh();
      closeModal();
    } catch (e) {
      console.error(e);
      setMsg("Save failed. Please try again.");
    }
  }

  async function handleDelete(id) {
    try {
      await deleteContact(id);
      await refresh();
    } catch (e) {
      console.error(e);
      setMsg("Delete failed.");
    }
  }

  async function handleToggleBookmark(id) {
    try {
      await toggleBookmark(id);
      await refresh();
    } catch (e) {
      console.error(e);
      setMsg("Bookmark update failed.");
    }
  }

  // -------- 1.3 Export (SheetJS) --------
  function exportExcel() {
    const rows = contacts.map((c) => ({
      Name: c.name,
      Bookmarked: c.isBookmarked ? 1 : 0,
      Phones: groupByType(c.methods, "phone").join(";"),
      Emails: groupByType(c.methods, "email").join(";"),
      Socials: groupByType(c.methods, "social").join(";"),
      Addresses: groupByType(c.methods, "address").join(";"),
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Contacts");
    XLSX.writeFile(wb, "address_book.xlsx");
  }

  // -------- 1.3 Import (SheetJS) - A + B safety guards --------
  async function importExcel(file) {
    const MAX_SIZE = 2 * 1024 * 1024; // 2MB
    if (file.size > MAX_SIZE) {
      setMsg("File too large. Please upload <= 2MB Excel.");
      return;
    }

    const lower = file.name.toLowerCase();
    if (!lower.endsWith(".xlsx") && !lower.endsWith(".xls")) {
      setMsg("Invalid file type. Please upload an .xlsx/.xls file.");
      return;
    }

    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });

      if (!wb.SheetNames?.length) {
        setMsg("No sheet found in the Excel file.");
        return;
      }

      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });

      const MAX_ROWS = 2000;
      if (rows.length > MAX_ROWS) {
        setMsg(
          `Too many rows (${rows.length}). Please limit to <= ${MAX_ROWS}.`
        );
        return;
      }

      if (rows.length === 0) {
        setMsg("Excel is empty.");
        return;
      }

      const sample = rows[0] || {};
      const hasNameKey = "Name" in sample || "name" in sample;
      if (!hasNameKey) {
        setMsg(
          "Invalid template. Missing 'Name' column. " +
            "Expected: Name, Bookmarked, Phones, Emails, Socials, Addresses."
        );
        return;
      }

      const parsed = rows
        .map((r) => {
          const name = String(r.Name || r.name || "").trim();
          if (!name) return null;

          const bookmarkedRaw = r.Bookmarked ?? r.bookmarked ?? 0;
          const isBookmarked =
            String(bookmarkedRaw).trim().toLowerCase() === "true" ||
            String(bookmarkedRaw).trim() === "1";

          const methods = [];

          const pushMany = (type, cell) => {
            const text = String(cell || "").trim();
            if (!text) return;
            text
              .split(";")
              .map((s) => s.trim())
              .filter(Boolean)
              .forEach((v) => methods.push({ type, value: v }));
          };

          pushMany("phone", r.Phones ?? r.phones);
          pushMany("email", r.Emails ?? r.emails);
          pushMany("social", r.Socials ?? r.socials);
          pushMany("address", r.Addresses ?? r.addresses);

          return { name, isBookmarked, methods };
        })
        .filter(Boolean);

      if (parsed.length === 0) {
        setMsg("No valid rows found in Excel.");
        return;
      }

      await bulkImportContacts(parsed);
      setMsg(`Imported ${parsed.length} contacts.`);
      await refresh();
    } catch (e) {
      console.error(e);
      setMsg("Import failed. Please check the Excel format.");
    }
  }

  const sortedContacts = useMemo(() => {
    return [...contacts].sort((a, b) => {
      if (a.isBookmarked !== b.isBookmarked) {
        return a.isBookmarked ? -1 : 1;
      }
      return String(a.name || "").localeCompare(String(b.name || ""));
    });
  }, [contacts]);

  return (
    <div className="app">
      <header className="topbar">
        <h1>通訊錄</h1>

        <div className="toolbar">
          <label className="checkbox">
            <input
              type="checkbox"
              checked={bookmarkedOnly}
              onChange={(e) => setBookmarkedOnly(e.target.checked)}
            />
            只收藏
          </label>

          <button onClick={openCreate}>+ 新</button>

          <button onClick={exportExcel}>导出Excel</button>

          <label className="import-btn">
            导入Excel
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) importExcel(f);
                e.target.value = "";
              }}
              hidden
            />
          </label>
        </div>
      </header>

      {msg && <div className="msg">{msg}</div>}

      <main className="list">
        {sortedContacts.map((c) => (
          <div key={c.id} className="card">
            <div className="card-left">
              <button
                className={`star ${c.isBookmarked ? "on" : ""}`}
                onClick={() => handleToggleBookmark(c.id)}
                title="Bookmark"
              >
                {c.isBookmarked ? "★" : "☆"}
              </button>

              <div>
                <div className="name">{c.name}</div>
                <div className="sub">
                  {(c.methods || []).slice(0, 3).map((m, i) => (
                    <span key={i} className="chip">
                      {m.type}:{m.value}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="card-actions">
              <button onClick={() => openEdit(c)}>编辑</button>
              <button className="danger" onClick={() => handleDelete(c.id)}>
                删除
              </button>
            </div>
          </div>
        ))}

        {sortedContacts.length === 0 && (
          <div className="empty">还没有接触点</div>
        )}
      </main>

      {/* -------- Modal -------- */}
      <div className={`modal ${modalOpen ? "show" : ""}`}>
        <div className="modal-content">
          <div className="modal-title">
            <h2>{editing ? "编辑联系人" : "新建联系人"}</h2>
          </div>

          <div className="field">
            <label>姓名</label>
            <input
              value={draft.name}
              onChange={(e) =>
                setDraft((d) => ({ ...d, name: e.target.value }))
              }
              placeholder="联系人姓名"
            />
          </div>

          <label className="checkbox">
            <input
              type="checkbox"
              checked={draft.isBookmarked}
              onChange={(e) =>
                setDraft((d) => ({ ...d, isBookmarked: e.target.checked }))
              }
            />
            收藏
          </label>

          <div className="methods">
            <div className="methods-head">
              <h3>多重联系方式</h3>
              <button onClick={addMethodRow}>+ 添加</button>
            </div>

            {draft.methods.map((m, idx) => (
              <div key={idx} className="method-row">
                <select
                  value={m.type}
                  onChange={(e) => updateMethod(idx, { type: e.target.value })}
                >
                  {METHOD_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>

                <input
                  value={m.value}
                  onChange={(e) => updateMethod(idx, { value: e.target.value })}
                  placeholder="内容"
                />

                <input
                  value={m.label || ""}
                  onChange={(e) => updateMethod(idx, { label: e.target.value })}
                  placeholder="备注(可选)"
                />

                <button className="danger" onClick={() => removeMethodRow(idx)}>
                  移除
                </button>
              </div>
            ))}
          </div>

          <div className="modal-actions">
            <button className="ghost" onClick={closeModal}>
              取消
            </button>
            <button onClick={saveDraft}>保存</button>
          </div>
        </div>
      </div>
    </div>
  );
}
