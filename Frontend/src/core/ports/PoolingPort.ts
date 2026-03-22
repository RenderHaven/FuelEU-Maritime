import type { Pool, AdjustedCB } from "../domain/Pooling";

export interface PoolingPort {
  getAdjustedCB(shipId: string, year: number): Promise<AdjustedCB>;
  createPool(year: number, shipIds: string[]): Promise<Pool>;
}
