import { RouteRepository } from '../../ports/RouteRepository';

export class SetBaseline {
  constructor(private routeRepo: RouteRepository) {}

  async execute(routeIdOrId: string) {
    let route = await this.routeRepo.findById(routeIdOrId);
    if (!route) {
        route = await this.routeRepo.findByRouteId(routeIdOrId);
    }
    if (!route) {
      throw new Error(`Route with identifier ${routeIdOrId} not found`);
    }
    await this.routeRepo.setBaseline(route.id);
  }
}
