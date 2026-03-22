import { ShipCompliance } from '../domain/entities/ShipCompliance';

export interface ComplianceRepository {
  findByShipAndYear(shipId: string, year: number): Promise<ShipCompliance | null>;
  save(compliance: Omit<ShipCompliance, 'id' | 'createdAt'>): Promise<ShipCompliance>;
}
