import { Pool } from '../domain/entities/Pool';
import { PoolMember } from '../domain/entities/PoolMember';

export interface PoolRepository {
  createPool(year: number, members: Omit<PoolMember, 'poolId'>[]): Promise<{ pool: Pool, members: PoolMember[] }>;
}
