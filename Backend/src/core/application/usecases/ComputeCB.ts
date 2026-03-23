import { RouteRepository } from '../../ports/RouteRepository';
import { ComplianceRepository } from '../../ports/ComplianceRepository';
import { BankingRepository } from '../../ports/BankingRepository';
import { FuelEUCalculator } from '../../../shared/utils';

export class ComputeCB {
  constructor(
    private routeRepo: RouteRepository,
    private complianceRepo: ComplianceRepository,
    private bankRepo: BankingRepository
  ) { }

  async executeSnapshot(shipId: string, year: number) {
    let route = await this.routeRepo.findByRouteIdAndYear(shipId, year);
    if (!route) {
      throw new Error('Route/Ship not found with identifier ' + shipId);
    }
    
    if (route.year !== year) {
      throw new Error(`Route found for ${shipId} is for year ${route.year}, not requested year ${year}`);
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
  async executeAdjustedForYear(year: number) {
    const allRoutes = await this.routeRepo.findAll();
    const routesThisYear = allRoutes.filter(r => r.year === year);
    
    // Deduplicate ships (routeId) to avoid repeated checks if any
    const uniqueShipIds = Array.from(new Set(routesThisYear.map(r => r.routeId)));

    const results = [];
    for (const shipId of uniqueShipIds) {
      try {
        const adjusted = await this.executeAdjusted(shipId, year);
        results.push(adjusted);
      } catch (e) {
        // Skip if there's any error computing for this ship (e.g. somehow missing)
      }
    }
    return results;
  }
}
