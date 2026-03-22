import type { BankingPort } from "../ports/BankingPort";
import type { ComplianceBalance } from "../domain/Banking";

export class BankingUseCases {
  private bankingPort: BankingPort;
  constructor(bankingPort: BankingPort) {
    this.bankingPort = bankingPort;
  }

  async getComplianceBalance(shipId: string, year: number): Promise<ComplianceBalance> {
    return this.bankingPort.getComplianceBalance(shipId, year);
  }

  async bankSurplus(shipId: string, amount: number): Promise<void> {
    return this.bankingPort.bankSurplus(shipId, amount);
  }

  async applyBankedSurplus(shipId: string, targetYear: number, amount: number): Promise<void> {
    return this.bankingPort.applyBankedSurplus(shipId, targetYear, amount);
  }
}
