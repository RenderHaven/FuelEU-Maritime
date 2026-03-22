import { RouteRepository } from '../../ports/RouteRepository';

export class GetRoutes {
  constructor(private routeRepo: RouteRepository) {}

  async execute() {
    return this.routeRepo.findAll();
  }
}
