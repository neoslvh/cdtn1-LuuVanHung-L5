const { AppError } = require("../errors/AppError");

class InventoryService {
  constructor(partRepository) {
    this.partRepository = partRepository;
  }

  listParts() {
    return this.partRepository.findAll();
  }

  async getPart(partId) {
    const part = await this.partRepository.findById(partId);
    if (!part) throw new AppError("PART_NOT_FOUND", "Không tìm thấy linh kiện.");
    return part;
  }

  createPart(data) {
    return this.partRepository.create(data);
  }

  async updatePart(partId, data) {
    const part = await this.partRepository.update(partId, data);
    if (!part) throw new AppError("PART_NOT_FOUND", "Không tìm thấy linh kiện.");
    return part;
  }

  async deletePart(partId) {
    const deleted = await this.partRepository.delete(partId);
    if (!deleted) throw new AppError("PART_NOT_FOUND", "Không tìm thấy linh kiện.");
  }
}

module.exports = InventoryService;
