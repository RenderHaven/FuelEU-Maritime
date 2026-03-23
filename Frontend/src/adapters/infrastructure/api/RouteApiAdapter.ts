import type { RoutePort } from "../../../core/ports/RoutePort";
import type { Route } from "../../../core/domain/Route";
import type { ComparisonResponse } from "../../../core/domain/Comparison";

const API_BASE_URL = import.meta.env.API_BASE_URL || "http://localhost:3000";

export class RouteApiAdapter implements RoutePort {
  async getRoutes(): Promise<Route[]> {
    const response = await fetch(`${API_BASE_URL}/routes`);
    if (!response.ok) {
      throw new Error("Failed to fetch routes");
    }
    return response.json();
  }

  async setBaseline(routeId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/routes/${routeId}/baseline`, {
      method: "POST",
    });
    if (!response.ok) {
      throw new Error("Failed to set baseline");
    }
  }

  async getComparison(): Promise<ComparisonResponse> {
    const response = await fetch(`${API_BASE_URL}/routes/comparison`);
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || "Failed to fetch comparison data");
    }
    return response.json();
  }
}
