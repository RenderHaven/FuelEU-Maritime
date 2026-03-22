import type { RoutePort } from "../ports/RoutePort";
import type { Route } from "../domain/Route";
import type { ComparisonResponse } from "../domain/Comparison";

export class RouteUseCases {
  private routePort: RoutePort;
  constructor(routePort: RoutePort) {
    this.routePort = routePort;
  }

  async getRoutes(): Promise<Route[]> {
    return this.routePort.getRoutes();
  }

  async setBaseline(routeId: string): Promise<void> {
    return this.routePort.setBaseline(routeId);
  }

  async getComparison(): Promise<ComparisonResponse> {
    return this.routePort.getComparison();
  }
}
