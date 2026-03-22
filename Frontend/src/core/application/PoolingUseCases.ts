import type { PoolingPort } from "../ports/PoolingPort";
import type { Pool, PoolMember, AdjustedCB } from "../domain/Pooling";

export class PoolingUseCases {
  private poolingPort: PoolingPort;
  constructor(poolingPort: PoolingPort) {
    this.poolingPort = poolingPort;
  }

  async getAdjustedCB(shipId: string, year: number): Promise<AdjustedCB> {
    return this.poolingPort.getAdjustedCB(shipId, year);
  }

  async createPool(members: PoolMember[]): Promise<Pool> {
    // Note: the backend verifies Sum(adjustedCB) >= 0 and other rules,
    // but the application layer could also pre-validate if needed. Check can be delegated to Port.
    return this.poolingPort.createPool(members);
  }
}
