import { RouteRepository } from '../../ports/RouteRepository';

export class SetBaseline {
  constructor(private routeRepo: RouteRepository) { }

  async execute(id: string) {
    const route = await this.routeRepo.findById(id);
    if (!route) {
      throw new Error(`Route with identifier ${id} not found`);
    }
    await this.routeRepo.setBaseline(route.id);
  }
}
