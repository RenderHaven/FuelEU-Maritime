import { BankingRepository } from '../../ports/BankingRepository';
import { ComputeCB } from './ComputeCB';
import { BankingUtils } from '../../../shared/utils';

export class BankSurplus {
  constructor(
    private bankRepo: BankingRepository,
    private computeCb: ComputeCB
  ) {}

  async execute(shipId: string, year: number, amount: number) {
    const snapshot = await this.computeCb.executeSnapshot(shipId, year);
    
    BankingUtils.validateBankSurplus(snapshot.cbGco2eq, amount);

    const entries = await this.bankRepo.findByShipAndYear(shipId, year);
    const currentlyBankedThisYear = entries
      .filter(e => e.amountGco2eq > 0)
      .reduce((sum, e) => sum + e.amountGco2eq, 0);

    if (currentlyBankedThisYear + amount > snapshot.cbGco2eq) {
      throw new Error('Cannot bank more than the total CB surplus for this year.');
    }

    const entry = await this.bankRepo.save({
      shipId,
      year,
      amountGco2eq: amount
    });
    return entry;
  }
}
