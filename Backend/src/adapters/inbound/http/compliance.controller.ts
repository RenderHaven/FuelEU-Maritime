import { Router, Request, Response } from 'express';
import { ComputeCB } from '../../../core/application/usecases/ComputeCB';
import { RouteRepositoryImpl } from '../../outbound/prisma/RouteRepositoryImpl';
import { ComplianceRepositoryImpl } from '../../outbound/prisma/ComplianceRepositoryImpl';
import { BankingRepositoryImpl } from '../../outbound/prisma/BankingRepositoryImpl';

const router = Router();

const routeRepo = new RouteRepositoryImpl();
const complianceRepo = new ComplianceRepositoryImpl();
const bankRepo = new BankingRepositoryImpl();
const computeCb = new ComputeCB(routeRepo, complianceRepo, bankRepo);

router.get('/cb', async (req: Request, res: Response) => {
  try {
    const shipId = req.query.shipId as string;
    const year = parseInt(req.query.year as string, 10);
    
    if (!shipId || isNaN(year)) {
      return res.status(400).json({ error: 'shipId and year are required parameters' });
    }

    const compliance = await computeCb.executeSnapshot(shipId, year);
    res.json(compliance);
  } catch (error: any) {
    if (error.message.includes('not found')) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

router.get('/adjusted-cb', async (req: Request, res: Response) => {
  try {
    const shipId = req.query.shipId as string;
    const year = parseInt(req.query.year as string, 10);

    if (isNaN(year)) {
      return res.status(400).json({ error: 'year is a required parameter' });
    }

    if (shipId) {
      const adjusted = await computeCb.executeAdjusted(shipId, year);
      res.json(adjusted);
    } else {
      const adjustedList = await computeCb.executeAdjustedForYear(year);
      res.json(adjustedList);
    }
  } catch (error: any) {
    if (error.message.includes('not found')) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

export default router;
