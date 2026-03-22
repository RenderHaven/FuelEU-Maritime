import { PoolRepository } from '../../../core/ports/PoolRepository';
import { Pool } from '../../../core/domain/entities/Pool';
import { PoolMember } from '../../../core/domain/entities/PoolMember';
import { prisma } from './prismaClient';

export class PoolRepositoryImpl implements PoolRepository {
  async createPool(year: number, members: Omit<PoolMember, 'poolId'>[]): Promise<{ pool: Pool, members: PoolMember[] }> {
    const result = await prisma.$transaction(async (tx) => {
      const pool = await tx.pool.create({
        data: { year }
      });

      const createdMembers = await Promise.all(
        members.map(m => tx.poolMember.create({
          data: {
            poolId: pool.id,
            shipId: m.shipId,
            cbBefore: m.cbBefore,
            cbAfter: m.cbAfter
          }
        }))
      );

      return { pool, members: createdMembers };
    });
    return result;
  }
}
