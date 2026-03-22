import { RouteRepository } from '../../../core/ports/RouteRepository';
import { Route } from '../../../core/domain/entities/Route';
import { prisma } from './prismaClient';

export class RouteRepositoryImpl implements RouteRepository {
  async findAll(): Promise<Route[]> {
    return prisma.route.findMany();
  }

  async findById(id: string): Promise<Route | null> {
    return prisma.route.findUnique({ where: { id } });
  }

  async findByRouteId(routeId: string): Promise<Route | null> {
    return prisma.route.findUnique({ where: { routeId } });
  }

  async findBaseline(): Promise<Route | null> {
    return prisma.route.findFirst({ where: { isBaseline: true } });
  }

  async setBaseline(id: string): Promise<void> {
    await prisma.route.updateMany({
      where: { isBaseline: true },
      data: { isBaseline: false }
    });
    
    await prisma.route.update({
      where: { id },
      data: { isBaseline: true }
    });
  }
}

