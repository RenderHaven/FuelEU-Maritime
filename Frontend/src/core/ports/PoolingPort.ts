import type { Pool, PoolMember, AdjustedCB } from "../domain/Pooling";

export interface PoolingPort {
  getAdjustedCB(shipId: string, year: number): Promise<AdjustedCB>;
  createPool(members: PoolMember[]): Promise<Pool>;
}
