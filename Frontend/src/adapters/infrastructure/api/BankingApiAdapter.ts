import type { BankingPort } from "../../../core/ports/BankingPort";
import type { ComplianceBalance } from "../../../core/domain/Banking";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export class BankingApiAdapter implements BankingPort {
  async getComplianceBalance(shipId: string, year: number): Promise<ComplianceBalance> {
    const response = await fetch(`${API_BASE_URL}/compliance/cb?shipId=${shipId}&year=${year}`);
    if (!response.ok) {
      throw new Error("Failed to fetch compliance balance");
    }
    return response.json();
  }

  async bankSurplus(shipId: string, amount: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/banking/bank`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shipId, amount }),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || "Failed to bank surplus");
    }
  }

  async applyBankedSurplus(shipId: string, targetYear: number, amount: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/banking/apply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shipId, targetYear, amount }),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || "Failed to apply banked surplus");
    }
  }
}
