import { BankEntry } from '../domain/entities/BankEntry';

export interface BankingRepository {
  findSumByShip(shipId: string): Promise<number>;
  save(entry: Omit<BankEntry, 'id' | 'createdAt'>): Promise<BankEntry>;
  findByShipAndYear(shipId: string, year: number): Promise<BankEntry[]>;
}
