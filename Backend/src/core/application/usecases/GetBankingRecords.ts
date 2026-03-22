import { BankingRepository } from '../../ports/BankingRepository';

export class GetBankingRecords {
  constructor(private bankRepo: BankingRepository) {}

  async execute(shipId: string, year: number) {
    return await this.bankRepo.findByShipAndYear(shipId, year);
  }
}
