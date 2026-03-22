import { Router, Request, Response } from 'express';
import { GetRoutes } from '../../../core/application/usecases/GetRoutes';
import { SetBaseline } from '../../../core/application/usecases/SetBaseline';
import { CompareRoutes } from '../../../core/application/usecases/CompareRoutes';
import { RouteRepositoryImpl } from '../../outbound/prisma/RouteRepositoryImpl';

const router = Router();
const routeRepo = new RouteRepositoryImpl();

const getRoutes = new GetRoutes(routeRepo);
const setBaseline = new SetBaseline(routeRepo);
const compareRoutes = new CompareRoutes(routeRepo);

router.get('/', async (req: Request, res: Response) => {
  try {
    const routes = await getRoutes.execute();
    res.json(routes);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/baseline', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await setBaseline.execute(id);
    res.json({ message: `Baseline set to route: ${id}` });
  } catch (error: any) {
    if (error.message.includes('not found')) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

router.get('/comparison', async (req: Request, res: Response) => {
  try {
    const comparison = await compareRoutes.execute();
    res.json(comparison);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
