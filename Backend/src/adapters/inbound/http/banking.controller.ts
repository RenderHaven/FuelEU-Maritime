import { Router, Request, Response } from 'express';
import { BankSurplus } from '../../../core/application/usecases/BankSurplus';
import { ApplyBanked } from '../../../core/application/usecases/ApplyBanked';
import { GetBankingRecords } from '../../../core/application/usecases/GetBankingRecords';
import { BankingRepositoryImpl } from '../../outbound/prisma/BankingRepositoryImpl';
import { ComputeCB } from '../../../core/application/usecases/ComputeCB';
import { RouteRepositoryImpl } from '../../outbound/prisma/RouteRepositoryImpl';
import { ComplianceRepositoryImpl } from '../../outbound/prisma/ComplianceRepositoryImpl';

const router = Router();

const bankRepo = new BankingRepositoryImpl();
const routeRepo = new RouteRepositoryImpl();
const complianceRepo = new ComplianceRepositoryImpl();
const computeCb = new ComputeCB(routeRepo, complianceRepo, bankRepo);

const bankSurplus = new BankSurplus(bankRepo, computeCb);
const applyBanked = new ApplyBanked(bankRepo, computeCb);
const getBankingRecords = new GetBankingRecords(bankRepo);

router.get('/records', async (req: Request, res: Response) => {
  try {
    const shipId = req.query.shipId as string;
    const year = parseInt(req.query.year as string, 10);
    
    if (!shipId || isNaN(year)) {
      return res.status(400).json({ error: 'shipId and year are required parameters' });
    }

    const records = await getBankingRecords.execute(shipId, year);
    res.json(records);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/bank', async (req: Request, res: Response) => {
  try {
    const { shipId, year, amount } = req.body;
    
    if (!shipId || typeof year !== 'number' || typeof amount !== 'number') {
      return res.status(400).json({ error: 'shipId, year, and amount in body are required' });
    }

    const result = await bankSurplus.execute(shipId, year, amount);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/apply', async (req: Request, res: Response) => {
  try {
    const { shipId, year, amount } = req.body;
    
    if (!shipId || typeof year !== 'number' || typeof amount !== 'number') {
      return res.status(400).json({ error: 'shipId, year, and amount in body are required' });
    }

    const result = await applyBanked.execute(shipId, year, amount);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
