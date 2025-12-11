import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { prisma } from "./db.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "5mb" }));

// --- Health ---
app.get("/health", (req, res) => res.json({ ok: true }));

// --- Contacts list ---
app.get("/contacts", async (req, res) => {
  const bookmarked = req.query.bookmarked;

  const where =
    bookmarked === "1" || bookmarked === "true" ? { isBookmarked: true } : {};

  const contacts = await prisma.contact.findMany({
    where,
    include: { methods: true },
    orderBy: [{ isBookmarked: "desc" }, { updatedAt: "desc" }],
  });

  res.json(contacts);
});

// --- Create contact ---
app.post("/contacts", async (req, res) => {
  const { name, isBookmarked = false, methods = [] } = req.body;

  if (!name?.trim()) {
    return res.status(400).json({ message: "Name is required." });
  }

  const contact = await prisma.contact.create({
    data: {
      name: name.trim(),
      isBookmarked: !!isBookmarked,
      methods: {
        create: methods.map((m) => ({
          type: m.type,
          value: String(m.value ?? "").trim(),
          label: m.label ?? null,
        })),
      },
    },
    include: { methods: true },
  });

  res.json(contact);
});

// --- Update contact (replace basic fields) ---
app.put("/contacts/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { name, isBookmarked } = req.body;

  const updated = await prisma.contact.update({
    where: { id },
    data: {
      ...(name !== undefined ? { name: name.trim() } : {}),
      ...(isBookmarked !== undefined ? { isBookmarked: !!isBookmarked } : {}),
    },
    include: { methods: true },
  });

  res.json(updated);
});

// --- Delete contact ---
app.delete("/contacts/:id", async (req, res) => {
  const id = Number(req.params.id);
  await prisma.contact.delete({ where: { id } });
  res.json({ ok: true });
});

// --- Toggle bookmark (1.1核心接口) ---
app.patch("/contacts/:id/bookmark", async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.contact.findUnique({ where: { id } });

  if (!existing) return res.status(404).json({ message: "Not found" });

  const updated = await prisma.contact.update({
    where: { id },
    data: { isBookmarked: !existing.isBookmarked },
  });

  res.json(updated);
});

// --- Replace methods for a contact (1.2核心) ---
app.put("/contacts/:id/methods", async (req, res) => {
  const id = Number(req.params.id);
  const { methods = [] } = req.body;

  // 简化策略：先删后加（作业非常够用）
  await prisma.contactMethod.deleteMany({ where: { contactId: id } });

  await prisma.contactMethod.createMany({
    data: methods.map((m) => ({
      contactId: id,
      type: m.type,
      value: String(m.value ?? "").trim(),
      label: m.label ?? null,
    })),
  });

  const contact = await prisma.contact.findUnique({
    where: { id },
    include: { methods: true },
  });

  res.json(contact);
});

// --- Bulk import helper for 1.3 ---
app.post("/contacts/bulk", async (req, res) => {
  const { contacts = [] } = req.body;

  if (!Array.isArray(contacts)) {
    return res.status(400).json({ message: "contacts must be an array" });
  }

  const created = [];

  await prisma.$transaction(async (tx) => {
    for (const c of contacts) {
      if (!c?.name?.trim()) continue;

      const contact = await tx.contact.create({
        data: {
          name: c.name.trim(),
          isBookmarked: !!c.isBookmarked,
          methods: {
            create: (c.methods ?? []).map((m) => ({
              type: m.type,
              value: String(m.value ?? "").trim(),
              label: m.label ?? null,
            })),
          },
        },
        include: { methods: true },
      });

      created.push(contact);
    }
  });

  res.json({ createdCount: created.length });
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
