import { Router, Request, Response } from 'express';
import { CreatePool } from '../../../core/application/usecases/CreatePool';
import { PoolRepositoryImpl } from '../../outbound/prisma/PoolRepositoryImpl';
import { ComputeCB } from '../../../core/application/usecases/ComputeCB';
import { RouteRepositoryImpl } from '../../outbound/prisma/RouteRepositoryImpl';
import { ComplianceRepositoryImpl } from '../../outbound/prisma/ComplianceRepositoryImpl';
import { BankingRepositoryImpl } from '../../outbound/prisma/BankingRepositoryImpl';

const router = Router();

const poolRepo = new PoolRepositoryImpl();
const routeRepo = new RouteRepositoryImpl();
const complianceRepo = new ComplianceRepositoryImpl();
const bankRepo = new BankingRepositoryImpl();
const computeCb = new ComputeCB(routeRepo, complianceRepo, bankRepo);

const createPool = new CreatePool(poolRepo, computeCb);

router.post('/', async (req: Request, res: Response) => {
  try {
    const { year, shipIds } = req.body;
    
    if (typeof year !== 'number' || !Array.isArray(shipIds)) {
      return res.status(400).json({ error: 'year (number) and shipIds (string array) are required' });
    }

    const result = await createPool.execute(year, shipIds);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
