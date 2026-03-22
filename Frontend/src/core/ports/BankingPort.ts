import type { ComplianceBalance } from "../domain/Banking";

export interface BankingPort {
  getComplianceBalance(shipId: string, year: number): Promise<ComplianceBalance>;
  bankSurplus(shipId: string, year: number, amount: number): Promise<void>;
  applyBankedSurplus(shipId: string, year: number, amount: number): Promise<void>;
}
