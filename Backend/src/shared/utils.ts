import type { PoolMemberInput, PoolMemberOutput } from '../core/domain/entities/PoolMember.ts';
import { TARGET_INTENSITY_2025 } from './constants';

export class FuelEUCalculator {
  static calculateEnergyInScope(fuelConsumptionTs: number): number {
    return fuelConsumptionTs * 41000;
  }

  static calculateComplianceBalance(ghgIntensity: number, fuelConsumptionTs: number): number {
    const energy = this.calculateEnergyInScope(fuelConsumptionTs);
    return (TARGET_INTENSITY_2025 - ghgIntensity) * energy;
  }
}

export class BankingUtils {
  static validateBankSurplus(currentCb: number, amountToBank: number): void {
    if (currentCb <= 0) {
      throw new Error('Compliance Balance must be positive (surplus) to bank.');
    }
    if (amountToBank <= 0) {
      throw new Error('Amount to bank must be greater than zero.');
    }
    if (amountToBank > currentCb) {
      throw new Error('Cannot bank more than the current Compliance Balance surplus.');
    }
  }

  static validateApplyBankedSurplus(availableBanked: number, amountToApply: number): void {
    if (amountToApply <= 0) {
      throw new Error('Amount down to apply must be greater than zero.');
    }
    if (amountToApply > availableBanked) {
      throw new Error('Cannot apply more than the available banked surplus.');
    }
  }
}

export class PoolingUtils {
  static allocatePool(members: PoolMemberInput[]): PoolMemberOutput[] {
    const totalCb = members.reduce((sum, m) => sum + m.cbBefore, 0);
    if (totalCb < 0) {
      throw new Error('Pool total Compliance Balance must be greater than or equal to 0');
    }

    const sorted = [...members].sort((a, b) => b.cbBefore - a.cbBefore);
    const outputs = sorted.map(m => ({
      shipId: m.shipId,
      cbBefore: m.cbBefore,
      cbAfter: m.cbBefore
    }));

    for (let i = outputs.length - 1; i >= 0; i--) {
      if (outputs[i].cbAfter >= 0) break;

      let deficit = Math.abs(outputs[i].cbAfter);

      for (let j = 0; j < outputs.length; j++) {
        if (outputs[j].cbAfter <= 0) break;
        if (deficit === 0) break;

        const available = outputs[j].cbAfter;
        const transfer = Math.min(available, deficit);

        outputs[j].cbAfter -= transfer;
        outputs[i].cbAfter += transfer;
        deficit -= transfer;
      }
    }

    return outputs;
  }
}
