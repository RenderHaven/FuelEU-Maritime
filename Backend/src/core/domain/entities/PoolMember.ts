export interface PoolMember {
  poolId: string;
  shipId: string;
  cbBefore: number;
  cbAfter: number;
}

export interface PoolMemberInput {
  shipId: string;
  cbBefore: number;
}

export interface PoolMemberOutput {
  shipId: string;
  cbBefore: number;
  cbAfter: number;
}
