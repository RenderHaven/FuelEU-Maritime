import { ComplianceRepository } from '../../../core/ports/ComplianceRepository';
import { ShipCompliance } from '../../../core/domain/entities/ShipCompliance';

export class ComplianceRepositoryImpl implements ComplianceRepository {
  async findByShipAndYear(shipId: string, year: number): Promise<ShipCompliance | null> { throw new Error('Not implemented'); }
  async save(compliance: Omit<ShipCompliance, 'id' | 'createdAt'>): Promise<ShipCompliance> { throw new Error('Not implemented'); }
}
