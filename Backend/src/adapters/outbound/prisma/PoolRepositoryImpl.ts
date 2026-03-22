import { PoolRepository } from '../../../core/ports/PoolRepository';
import { Pool } from '../../../core/domain/entities/Pool';
import { PoolMember } from '../../../core/domain/entities/PoolMember';

export class PoolRepositoryImpl implements PoolRepository {
  async createPool(year: number, members: Omit<PoolMember, 'poolId'>[]): Promise<{ pool: Pool, members: PoolMember[] }> { throw new Error('Not implemented'); }
}
