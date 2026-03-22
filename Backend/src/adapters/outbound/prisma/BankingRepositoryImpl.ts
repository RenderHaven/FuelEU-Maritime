import { BankingRepository } from '../../../core/ports/BankingRepository';
import { BankEntry } from '../../../core/domain/entities/BankEntry';

export class BankingRepositoryImpl implements BankingRepository {
  async findSumByShip(shipId: string): Promise<number> { throw new Error('Not implemented'); }
  async save(entry: Omit<BankEntry, 'id' | 'createdAt'>): Promise<BankEntry> { throw new Error('Not implemented'); }
  async findByShipAndYear(shipId: string, year: number): Promise<BankEntry[]> { throw new Error('Not implemented'); }
}
