import type { ComplianceBalance, BankRecord, BankResult, ApplyResult, AdjustedCB } from "../domain/Banking";

export interface BankingPort {
  getComplianceBalance(shipId: string, year: number): Promise<ComplianceBalance>;
  getAdjustedCb(shipId: string, year: number): Promise<AdjustedCB>;
  getBankingRecords(shipId: string, year: number): Promise<BankRecord[]>;
  bankSurplus(shipId: string, year: number, amount: number): Promise<BankResult>;
  applyBankedSurplus(shipId: string, year: number, amount: number): Promise<ApplyResult>;
}
