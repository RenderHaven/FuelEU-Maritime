import type { RoutePort } from "../ports/RoutePort";
import type { Route } from "../domain/Route";
import type { ComparisonResult } from "../domain/Comparison";

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

  async getComparison(): Promise<ComparisonResult[]> {
    return this.routePort.getComparison();
  }
}
