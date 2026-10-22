const { AppError } = require("../errors/AppError");

class TicketPartService {
  constructor(ticketRepository, ticketPartRepository) {
    this.ticketRepository = ticketRepository;
    this.ticketPartRepository = ticketPartRepository;
  }

  async listForTicket(centerId, ticketId) {
    const ticket = await this.ticketRepository.findById(centerId, ticketId);
    if (!ticket) throw new AppError("TICKET_NOT_FOUND", "Không tìm thấy phiếu bảo hành.");
    return this.ticketPartRepository.listByTicket(ticketId);
  }

  listTickets(centerId) {
    return this.ticketRepository.list(centerId);
  }
}

module.exports = TicketPartService;
