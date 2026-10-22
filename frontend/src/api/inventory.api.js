import { request } from "./client";

export const inventoryApi = {
  login: (role) => request("/api/auth/demo-login", { method: "POST", body: JSON.stringify({ role }) }),
  listStock: () => request("/api/part-stocks"),
  listAlerts: () => request("/api/stock-alerts"),
  receive: (payload) => request("/api/stock-receipts", { method: "POST", body: JSON.stringify(payload) }),
  listTickets: () => request("/api/tickets"),
  listTicketParts: (ticketId) => request(`/api/tickets/${ticketId}/parts`),
  issue: (ticketId, payload) => request(`/api/tickets/${ticketId}/part-issues`, { method: "POST", body: JSON.stringify(payload) }),
};
