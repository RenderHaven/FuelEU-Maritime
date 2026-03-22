import type { Route } from "./Route";

export interface ComparisonResult {
  baselineRoute: Route;
  comparisonRoute: Route;
  percentDiff: number;
  isCompliant: boolean;
}
