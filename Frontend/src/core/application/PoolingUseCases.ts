import type { PoolingPort } from "../ports/PoolingPort";
import type { Pool, AdjustedCB } from "../domain/Pooling";

export class PoolingUseCases {
  private poolingPort: PoolingPort;
  constructor(poolingPort: PoolingPort) {
    this.poolingPort = poolingPort;
  }

  async getAdjustedCB(shipId: string, year: number): Promise<AdjustedCB> {
    return this.poolingPort.getAdjustedCB(shipId, year);
  }

  async getAdjustedCBsByYear(year: number): Promise<AdjustedCB[]> {
    return this.poolingPort.getAdjustedCBsByYear(year);
  }

  async createPool(year: number, shipIds: string[]): Promise<Pool> {
    return this.poolingPort.createPool(year, shipIds);
  }
}
