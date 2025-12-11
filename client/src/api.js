import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
});

export const getContacts = (bookmarkedOnly = false) =>
  api.get("/contacts", {
    params: bookmarkedOnly ? { bookmarked: 1 } : {},
  });

export const createContact = (payload) => api.post("/contacts", payload);

export const updateContact = (id, payload) =>
  api.put(`/contacts/${id}`, payload);

export const deleteContact = (id) => api.delete(`/contacts/${id}`);

export const toggleBookmark = (id) => api.patch(`/contacts/${id}/bookmark`);

export const replaceMethods = (id, methods) =>
  api.put(`/contacts/${id}/methods`, { methods });

export const bulkImportContacts = (contacts) =>
  api.post("/contacts/bulk", { contacts });
