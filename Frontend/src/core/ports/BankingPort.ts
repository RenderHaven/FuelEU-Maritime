import type { ComplianceBalance } from "../domain/Banking";

export interface BankingPort {
  getComplianceBalance(shipId: string, year: number): Promise<ComplianceBalance>;
  bankSurplus(shipId: string, amount: number): Promise<void>;
  applyBankedSurplus(shipId: string, targetYear: number, amount: number): Promise<void>;
}
