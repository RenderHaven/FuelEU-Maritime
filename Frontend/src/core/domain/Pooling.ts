export interface PoolMember {
  poolId?: string;
  shipId: string;
  cbBefore: number;
  cbAfter: number;
}

export interface Pool {
  id: string;
  year: number;
  createdAt: string;
  members: PoolMember[];
}

export interface AdjustedCB {
  shipId: string;
  year: number;
  cbBefore: number;
  appliedBanked: number;
  adjustedCb: number;
}
