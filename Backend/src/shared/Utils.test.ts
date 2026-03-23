import { BankingUtils, PoolingUtils } from './utils';
import type { PoolMemberInput } from '../core/domain/entities/PoolMember';

describe('BankingUtils', () => {
  describe('validateBankSurplus', () => {
    it('should not throw for valid inputs', () => {
      expect(() => BankingUtils.validateBankSurplus(100, 50)).not.toThrow();
    });

    it('should throw if current compliance balance is zero or negative', () => {
      expect(() => BankingUtils.validateBankSurplus(0, 50)).toThrow('Compliance Balance must be positive');
      expect(() => BankingUtils.validateBankSurplus(-10, 50)).toThrow('Compliance Balance must be positive');
    });

    it('should throw if amount to bank is zero or negative', () => {
      expect(() => BankingUtils.validateBankSurplus(100, 0)).toThrow('Amount to bank must be greater than zero');
      expect(() => BankingUtils.validateBankSurplus(100, -10)).toThrow('Amount to bank must be greater than zero');
    });

    it('should throw if amount to bank is greater than current surplus', () => {
      expect(() => BankingUtils.validateBankSurplus(100, 150)).toThrow('Cannot bank more than the current Compliance Balance');
    });
  });

  describe('validateApplyBankedSurplus', () => {
    it('should not throw for valid inputs', () => {
      expect(() => BankingUtils.validateApplyBankedSurplus(100, 50)).not.toThrow();
    });

    it('should throw if amount to apply is zero or negative', () => {
      expect(() => BankingUtils.validateApplyBankedSurplus(100, 0)).toThrow('Amount down to apply must be greater than zero');
      expect(() => BankingUtils.validateApplyBankedSurplus(100, -10)).toThrow('Amount down to apply must be greater than zero');
    });

    it('should throw if amount to apply is greater than available banked surplus', () => {
      expect(() => BankingUtils.validateApplyBankedSurplus(100, 150)).toThrow('Cannot apply more than the available banked surplus');
    });
  });
});

describe('PoolingUtils', () => {
  describe('allocatePool', () => {
    it('should throw if total compliance balance is negative', () => {
      const members: PoolMemberInput[] = [
        { shipId: 'S1', cbBefore: -100 },
        { shipId: 'S2', cbBefore: 50 }
      ];
      expect(() => PoolingUtils.allocatePool(members)).toThrow('Pool total Compliance Balance must be greater than or equal to 0');
    });

    it('should correctly allocate surplus to deficit ships', () => {
      const members: PoolMemberInput[] = [
        { shipId: 'S1', cbBefore: -100 },
        { shipId: 'S2', cbBefore: 150 }
      ];
      const outputs = PoolingUtils.allocatePool(members);
      
      const s1Output = outputs.find(m => m.shipId === 'S1');
      const s2Output = outputs.find(m => m.shipId === 'S2');
      
      expect(s1Output?.cbAfter).toBe(0);
      expect(s2Output?.cbAfter).toBe(50);
    });

    it('should handle simple redistribution with multiple members', () => {
      const members: PoolMemberInput[] = [
        { shipId: 'S1', cbBefore: -100 },
        { shipId: 'S2', cbBefore: -50 },
        { shipId: 'S3', cbBefore: 200 }
      ];
      const outputs = PoolingUtils.allocatePool(members);
      
      expect(outputs.find(m => m.shipId === 'S1')?.cbAfter).toBe(0);
      expect(outputs.find(m => m.shipId === 'S2')?.cbAfter).toBe(0);
      expect(outputs.find(m => m.shipId === 'S3')?.cbAfter).toBe(50);
    });
  });
});
