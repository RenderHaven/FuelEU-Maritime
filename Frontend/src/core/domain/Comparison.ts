import type { Route } from "./Route";

export interface RouteComparison extends Route {
  percentDiff: number;
  compliant: boolean;
}

export interface ComparisonResponse {
  baseline: Route;
  comparisons: RouteComparison[];
}
