import { BankingRepository } from '../../ports/BankingRepository';
import { ComputeCB } from './ComputeCB';
import { BankingUtils } from '../../../shared/utils';

export class ApplyBanked {
  constructor(
    private bankRepo: BankingRepository,
    private computeCb: ComputeCB
  ) {}

  async execute(shipId: string, year: number, amount: number) {
    const adjustedCbContext = await this.computeCb.executeAdjusted(shipId, year);
    if (adjustedCbContext.adjustedCb >= 0) {
      throw new Error('Can only apply banked surplus to a deficit.');
    }

    const availableBankedTotal = await this.bankRepo.findSumByShip(shipId);
    BankingUtils.validateApplyBankedSurplus(availableBankedTotal, amount);

    const entry = await this.bankRepo.save({
      shipId,
      year,
      amountGco2eq: -amount
    });

    return {
      cb_before: adjustedCbContext.adjustedCb,
      applied: amount,
      cb_after: adjustedCbContext.adjustedCb + amount
    };
  }
}
