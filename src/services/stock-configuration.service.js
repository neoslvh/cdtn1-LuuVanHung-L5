const { AppError } = require("../errors/AppError");
const { toStockView } = require("../contracts/stock.contract");

class StockConfigurationService {
  constructor(stockRepository, partRepository) {
    this.stockRepository = stockRepository;
    this.partRepository = partRepository;
  }

  async getStock(centerId, partId) {
    const stock = await this.stockRepository.find(centerId, partId);
    if (!stock) {
      throw new AppError("PART_NOT_FOUND", "Không tìm thấy linh kiện tại trung tâm.", {
        part_id: "Linh kiện không tồn tại trong kho trung tâm.",
      });
    }
    return toStockView(stock);
  }

  async createStock(centerId, { partId, minThreshold }) {
    const part = await this.partRepository.findById(partId);
    if (!part) {
      throw new AppError("PART_NOT_FOUND", "Không tìm thấy linh kiện.", {
        part_id: "Linh kiện không tồn tại.",
      });
    }
    const stock = await this.stockRepository.create(centerId, partId, minThreshold);
    return toStockView(stock);
  }

  async updateThreshold(centerId, partId, { minThreshold }) {
    const stock = await this.stockRepository.updateThreshold(centerId, partId, minThreshold);
    if (!stock) {
      throw new AppError("PART_NOT_FOUND", "Không tìm thấy linh kiện tại trung tâm.", {
        part_id: "Linh kiện không tồn tại trong kho trung tâm.",
      });
    }
    return toStockView(stock);
  }

  async deleteStock(centerId, partId) {
    const stock = await this.stockRepository.find(centerId, partId);
    if (!stock) {
      throw new AppError("PART_NOT_FOUND", "Không tìm thấy linh kiện tại trung tâm.", {
        part_id: "Linh kiện không tồn tại trong kho trung tâm.",
      });
    }
    if (stock.quantity !== 0) {
      throw new AppError(
        "STOCK_NOT_EMPTY",
        "Chỉ được xóa cấu hình tồn kho khi số lượng tồn bằng 0.",
      );
    }
    if (await this.stockRepository.hasTransactions(centerId, partId)) {
      throw new AppError(
        "STOCK_HAS_TRANSACTIONS",
        "Không thể xóa cấu hình tồn kho đã có lịch sử giao dịch.",
      );
    }
    await this.stockRepository.delete(centerId, partId);
  }
}

module.exports = StockConfigurationService;
