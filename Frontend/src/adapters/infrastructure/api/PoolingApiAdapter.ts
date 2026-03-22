import type { PoolingPort } from "../../../core/ports/PoolingPort";
import type { Pool, AdjustedCB } from "../../../core/domain/Pooling";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export class PoolingApiAdapter implements PoolingPort {
  async getAdjustedCB(shipId: string, year: number): Promise<AdjustedCB> {
    const response = await fetch(`${API_BASE_URL}/compliance/adjusted-cb?shipId=${shipId}&year=${year}`);
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || "Failed to fetch adjusted compliance balance");
    }
    return response.json();
  }

  async createPool(year: number, shipIds: string[]): Promise<Pool> {
    const response = await fetch(`${API_BASE_URL}/pools`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ year, shipIds }),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || "Failed to create pool");
    }
    return response.json();
  }
}
