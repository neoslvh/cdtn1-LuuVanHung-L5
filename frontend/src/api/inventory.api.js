import { request } from "./client";

export const inventoryApi = {
  login: (role) =>
    request("/api/auth/demo-login", { method: "POST", body: JSON.stringify({ role }) }),
  listStock: ({
    page = 1,
    size = 10,
    lowOnly = false,
    keyword = "",
    sortBy = "part_code",
    sortDirection = "asc",
  } = {}) =>
    request(
      `/api/part-stocks?page=${page}&size=${size}&low_only=${lowOnly}&keyword=${encodeURIComponent(keyword)}&sort_by=${sortBy}&sort_direction=${sortDirection}`,
    ),
  listAlerts: ({ page = 1, size = 10 } = {}) =>
    request(`/api/stock-alerts?page=${page}&size=${size}`),
  listTransactionHistory: (partId, { page = 1, size = 10 } = {}) =>
    request(`/api/part-transactions?part_id=${partId}&page=${page}&size=${size}`),
  async listAllStock() {
    const firstPage = await this.listStock({ page: 1, size: 100 });
    const pageCount = Math.ceil(firstPage.total / firstPage.size);
    if (pageCount <= 1) return { ...firstPage, items: firstPage.items };
    const remaining = await Promise.all(
      Array.from({ length: pageCount - 1 }, (_, index) =>
        this.listStock({ page: index + 2, size: 100 }),
      ),
    );
    return {
      ...firstPage,
      items: [firstPage.items, ...remaining.map((page) => page.items)].flat(),
    };
  },
  receive: (payload) =>
    request("/api/stock-receipts", { method: "POST", body: JSON.stringify(payload) }),
  checkAvailability: (partId, requestedQuantity) =>
    request(`/api/parts/${partId}/availability?requested_quantity=${requestedQuantity}`),
  listTickets: () => request("/api/tickets"),
  listTicketParts: (ticketId) => request(`/api/tickets/${ticketId}/parts`),
  issue: (ticketId, payload) =>
    request(`/api/tickets/${ticketId}/part-issues`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
