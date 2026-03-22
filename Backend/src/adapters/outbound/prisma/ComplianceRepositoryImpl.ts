import { ComplianceRepository } from '../../../core/ports/ComplianceRepository';
import { ShipCompliance } from '../../../core/domain/entities/ShipCompliance';
import { prisma } from './prismaClient';

export class ComplianceRepositoryImpl implements ComplianceRepository {
  async findByShipAndYear(shipId: string, year: number): Promise<ShipCompliance | null> {
    const record = await prisma.shipCompliance.findFirst({
      where: {
        shipId,
        year
      }
    });
    return record;
  }

  async save(compliance: Omit<ShipCompliance, 'id' | 'createdAt'>): Promise<ShipCompliance> {
    const record = await prisma.shipCompliance.create({
      data: {
        shipId: compliance.shipId,
        year: compliance.year,
        cbGco2eq: compliance.cbGco2eq,
      }
    });
    return record;
  }
}
