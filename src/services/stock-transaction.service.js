const { AppError } = require("../errors/AppError");
const { toStockView } = require("../contracts/stock.contract");

// Hợp đồng trả về cho lớp HTTP/UI:
// receipt/issue luôn có stock_before, stock_after và low_stock_alerts;
// nếu một dòng xuất sai, transaction PostgreSQL rollback toàn bộ (QT-09).
class StockTransactionService {
  constructor(
    pool,
    stockRepository,
    transactionRepository,
    ticketRepository,
    ticketPartRepository,
  ) {
    this.pool = pool;
    this.stockRepository = stockRepository;
    this.transactionRepository = transactionRepository;
    this.ticketRepository = ticketRepository;
    this.ticketPartRepository = ticketPartRepository;
  }

  async listStocks(centerId, { lowOnly = false, keyword = "", page = 1, size = 10 } = {}) {
    const { rows, total } = await this.stockRepository.list(centerId, {
      lowOnly,
      keyword,
      page,
      size,
    });
    return { items: rows.map(toStockView), page, size, total };
  }

  async getAvailability(centerId, partId, requestedQuantity) {
    const stock = await this.stockRepository.find(centerId, partId);
    if (!stock) throw new AppError("PART_NOT_FOUND", "Không tìm thấy linh kiện.");
    return {
      ...toStockView(stock),
      requested_quantity: requestedQuantity,
      available: stock.quantity >= requestedQuantity,
    };
  }

  async listTransactionHistory(centerId, partId, { page = 1, size = 10 } = {}) {
    const stock = await this.stockRepository.find(centerId, partId);
    if (!stock)
      throw new AppError("PART_NOT_FOUND", "Không tìm thấy linh kiện tại trung tâm.", {
        part_id: "Linh kiện không tồn tại.",
      });
    const { rows, total } = await this.transactionRepository.listByPart(centerId, partId, {
      page,
      size,
    });
    return {
      part: { part_id: stock.part_id, part_code: stock.part_code, part_name: stock.part_name },
      items: rows,
      page,
      size,
      total,
    };
  }

  async receive(centerId, { partId, quantity }) {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const stock = await this.stockRepository.findForUpdate(client, centerId, partId);
      if (!stock)
        throw new AppError("PART_NOT_FOUND", "Không tìm thấy linh kiện tại trung tâm.", {
          part_id: "Linh kiện không tồn tại.",
        });
      const stockAfter = stock.quantity + quantity;
      await this.stockRepository.updateQuantity(client, centerId, partId, stockAfter);
      const transaction = await this.transactionRepository.create(client, {
        centerId,
        partId,
        transactionType: "IN",
        quantity,
      });
      await client.query("COMMIT");
      return {
        ...transaction,
        stock_before: stock.quantity,
        stock_after: stockAfter,
        low_stock_alerts: [],
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async issue(centerId, ticketId, { items }) {
    const ticket = await this.ticketRepository.findById(centerId, ticketId);
    if (!ticket)
      throw new AppError("TICKET_NOT_FOUND", "Không tìm thấy phiếu bảo hành.", {
        ticket_id: "Phiếu bảo hành không tồn tại.",
      });

    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const lockedItems = [];
      for (const item of items) {
        const stock = await this.stockRepository.findForUpdate(client, centerId, item.partId);
        if (!stock)
          throw new AppError("PART_NOT_FOUND", "Không tìm thấy linh kiện tại trung tâm.", {
            part_id: "Linh kiện không tồn tại.",
          });
        if (item.quantity > stock.quantity) {
          throw new AppError("INSUFFICIENT_STOCK", "Không đủ linh kiện để xuất.", {
            [`part_${item.partId}`]: `Linh kiện chỉ còn ${stock.quantity}, không đủ để xuất ${item.quantity}.`,
          });
        }
        lockedItems.push({ ...item, stock });
      }

      const issues = [];
      const lowStockAlerts = [];
      for (const item of lockedItems) {
        const stockAfter = item.stock.quantity - item.quantity;
        await this.stockRepository.updateQuantity(client, centerId, item.partId, stockAfter);
        await this.ticketPartRepository.addQuantity(client, ticketId, item.partId, item.quantity);
        const transaction = await this.transactionRepository.create(client, {
          centerId,
          partId: item.partId,
          ticketId,
          transactionType: "OUT",
          quantity: item.quantity,
        });
        issues.push({
          transaction_id: transaction.transaction_id,
          part_id: item.partId,
          quantity: item.quantity,
          stock_before: item.stock.quantity,
          stock_after: stockAfter,
        });
        if (stockAfter < item.stock.min_threshold) {
          lowStockAlerts.push({
            part_id: item.partId,
            part_code: item.stock.part_code,
            quantity: stockAfter,
            min_threshold: item.stock.min_threshold,
            status: "LOW_STOCK",
          });
        }
      }
      await client.query("COMMIT");
      return {
        ticket_id: ticketId,
        ticket_code: ticket.ticket_code,
        issues,
        low_stock_alerts: lowStockAlerts,
        created_at: new Date().toISOString(),
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = StockTransactionService;
