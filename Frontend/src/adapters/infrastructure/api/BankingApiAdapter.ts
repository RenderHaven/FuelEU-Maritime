import type { BankingPort } from "../../../core/ports/BankingPort";
import type { ComplianceBalance, BankRecord, BankResult, ApplyResult, AdjustedCB } from "../../../core/domain/Banking";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export class BankingApiAdapter implements BankingPort {
  async getComplianceBalance(shipId: string, year: number): Promise<ComplianceBalance> {
    const response = await fetch(`${API_BASE_URL}/compliance/cb?shipId=${shipId}&year=${year}`);
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || "Failed to fetch compliance balance");
    }
    return response.json();
  }

  async getAdjustedCb(shipId: string, year: number): Promise<AdjustedCB> {
    const response = await fetch(`${API_BASE_URL}/compliance/adjusted-cb?shipId=${shipId}&year=${year}`);
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || "Failed to fetch adjusted compliance balance");
    }
    return response.json();
  }

  async getBankingRecords(shipId: string, year: number): Promise<BankRecord[]> {
    const response = await fetch(`${API_BASE_URL}/banking/records?shipId=${shipId}&year=${year}`);
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || "Failed to fetch banking records");
    }
    return response.json();
  }

  async bankSurplus(shipId: string, year: number, amount: number): Promise<BankResult> {
    const response = await fetch(`${API_BASE_URL}/banking/bank`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shipId, year, amount }),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || "Failed to bank surplus");
    }
    return response.json();
  }

  async applyBankedSurplus(shipId: string, year: number, amount: number): Promise<ApplyResult> {
    const response = await fetch(`${API_BASE_URL}/banking/apply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shipId, year, amount }),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || "Failed to apply banked surplus");
    }
    return response.json();
  }
}
