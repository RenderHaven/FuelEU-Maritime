import type { RoutePort } from "../../../core/ports/RoutePort";
import type { Route } from "../../../core/domain/Route";
import type { ComparisonResult } from "../../../core/domain/Comparison";

const API_BASE_URL = "http://localhost:3000";

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

  async getComparison(): Promise<ComparisonResult[]> {
    const response = await fetch(`${API_BASE_URL}/routes/comparison`);
    if (!response.ok) {
      throw new Error("Failed to fetch comparison data");
    }
    return response.json();
  }
}
