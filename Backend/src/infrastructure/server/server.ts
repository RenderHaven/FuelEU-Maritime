import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import routesController from '../../adapters/inbound/http/routes.controller';
import complianceController from '../../adapters/inbound/http/compliance.controller';
import bankingController from '../../adapters/inbound/http/banking.controller';
import poolsController from '../../adapters/inbound/http/pools.controller';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Fuel EU Compliance API is running' });
});

app.use('/routes', routesController);
app.use('/compliance', complianceController);
app.use('/banking', bankingController);
app.use('/pools', poolsController);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`[Server] running on port ${PORT}`);
});
