import type { BankingPort } from "../ports/BankingPort";
import type { ComplianceBalance, BankRecord, BankResult, ApplyResult, AdjustedCB } from "../domain/Banking";

export class BankingUseCases {
  private bankingPort: BankingPort;
  constructor(bankingPort: BankingPort) {
    this.bankingPort = bankingPort;
  }

  async getComplianceBalance(shipId: string, year: number): Promise<ComplianceBalance> {
    return this.bankingPort.getComplianceBalance(shipId, year);
  }

  async getAdjustedCb(shipId: string, year: number): Promise<AdjustedCB> {
    return this.bankingPort.getAdjustedCb(shipId, year);
  }

  async getBankingRecords(shipId: string, year: number): Promise<BankRecord[]> {
    return this.bankingPort.getBankingRecords(shipId, year);
  }

  async bankSurplus(shipId: string, year: number, amount: number): Promise<BankResult> {
    return this.bankingPort.bankSurplus(shipId, year, amount);
  }

  async applyBankedSurplus(shipId: string, year: number, amount: number): Promise<ApplyResult> {
    return this.bankingPort.applyBankedSurplus(shipId, year, amount);
  }
}
