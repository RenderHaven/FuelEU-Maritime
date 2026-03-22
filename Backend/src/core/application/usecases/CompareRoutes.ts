import { RouteRepository } from '../../ports/RouteRepository';
import { TARGET_INTENSITY_2025 } from '../../../shared/constants';

export class CompareRoutes {
  constructor(private routeRepo: RouteRepository) {}

  async execute() {
    const allRoutes = await this.routeRepo.findAll();
    const baseline = await this.routeRepo.findBaseline();
    
    if (!baseline) {
      throw new Error('No baseline route is set');
    }

    const comparisons = allRoutes.map(route => {
      const isCompliant = route.ghgIntensity <= TARGET_INTENSITY_2025;
      const percentDiff = ((route.ghgIntensity / baseline.ghgIntensity) - 1) * 100;

      return {
        ...route,
        percentDiff,
        compliant: isCompliant
      };
    });

    return {
      baseline,
      comparisons
    };
  }
}
