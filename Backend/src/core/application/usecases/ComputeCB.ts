import { RouteRepository } from '../../ports/RouteRepository';
import { ComplianceRepository } from '../../ports/ComplianceRepository';
import { BankingRepository } from '../../ports/BankingRepository';
import { FuelEUCalculator } from '../../../shared/utils';

export class ComputeCB {
  constructor(
    private routeRepo: RouteRepository,
    private complianceRepo: ComplianceRepository,
    private bankRepo: BankingRepository
  ) {}

  async executeSnapshot(shipId: string, year: number) {
    let route = await this.routeRepo.findByRouteId(shipId);
    if (!route) {
      throw new Error('Route/Ship not found with identifier ' + shipId);
    }

    const cbGco2eq = FuelEUCalculator.calculateComplianceBalance(route.ghgIntensity, route.fuelConsumption);

    let compliance = await this.complianceRepo.findByShipAndYear(shipId, year);
    if (!compliance) {
      compliance = await this.complianceRepo.save({
        shipId,
        year,
        cbGco2eq
      });
    }

    return compliance;
  }

  async executeAdjusted(shipId: string, year: number) {
    const compliance = await this.executeSnapshot(shipId, year);
    
    const entriesThisYear = await this.bankRepo.findByShipAndYear(shipId, year);
    
    let appliedToThisYear = 0;
    for (const entry of entriesThisYear) {
      if (entry.amountGco2eq < 0) {
        appliedToThisYear += Math.abs(entry.amountGco2eq);
      }
    }

    return {
      shipId,
      year,
      cbBefore: compliance.cbGco2eq,
      appliedBanked: appliedToThisYear,
      adjustedCb: compliance.cbGco2eq + appliedToThisYear
    };
  }
}
