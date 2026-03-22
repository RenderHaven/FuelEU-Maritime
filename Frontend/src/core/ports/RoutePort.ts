import type { Route } from "../domain/Route";
import type { ComparisonResult } from "../domain/Comparison";

export interface RoutePort {
  getRoutes(): Promise<Route[]>;
  setBaseline(routeId: string): Promise<void>;
  getComparison(): Promise<ComparisonResult[]>;
}
