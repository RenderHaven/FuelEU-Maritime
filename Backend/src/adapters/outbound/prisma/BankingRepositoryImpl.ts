import { BankingRepository } from '../../../core/ports/BankingRepository';
import { BankEntry } from '../../../core/domain/entities/BankEntry';
import { prisma } from './prismaClient';

export class BankingRepositoryImpl implements BankingRepository {
  async findSumByShip(shipId: string): Promise<number> {
    const result = await prisma.bankEntry.aggregate({
      where: { shipId },
      _sum: { amountGco2eq: true }
    });
    return result._sum.amountGco2eq || 0;
  }

  async save(entry: Omit<BankEntry, 'id' | 'createdAt'>): Promise<BankEntry> {
    const record = await prisma.bankEntry.create({
      data: {
        shipId: entry.shipId,
        year: entry.year,
        amountGco2eq: entry.amountGco2eq
      }
    });
    return record;
  }

  async findByShipAndYear(shipId: string, year: number): Promise<BankEntry[]> {
    const records = await prisma.bankEntry.findMany({
      where: { shipId, year },
      orderBy: { createdAt: 'asc' }
    });
    return records;
  }
}
