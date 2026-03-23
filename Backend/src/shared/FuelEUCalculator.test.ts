import { FuelEUCalculator } from './utils';
import { TARGET_INTENSITY_2025 } from './constants';

describe('FuelEUCalculator', () => {
  describe('calculateEnergyInScope', () => {
    it('should calculate energy in scope', () => {
      const fuelConsumptionTs = 100;
      const expectedEnergy = 100 * 41000;
      expect(FuelEUCalculator.calculateEnergyInScope(fuelConsumptionTs)).toBe(expectedEnergy);
    });
  });

  describe('calculateComplianceBalance', () => {
    it('should calculate positive compliance balance (surplus)', () => {
      const ghgIntensity = 80;
      const fuelConsumptionTs = 10;
      const energy = 10 * 41000;
      const expectedCb = (TARGET_INTENSITY_2025 - ghgIntensity) * energy;
      
      expect(FuelEUCalculator.calculateComplianceBalance(ghgIntensity, fuelConsumptionTs)).toBeCloseTo(expectedCb);
      expect(FuelEUCalculator.calculateComplianceBalance(ghgIntensity, fuelConsumptionTs)).toBeGreaterThan(0);
    });

    it('should calculate negative compliance balance (deficit)', () => {
      const ghgIntensity = 100;
      const fuelConsumptionTs = 10;
      const energy = 10 * 41000;
      const expectedCb = (TARGET_INTENSITY_2025 - ghgIntensity) * energy;
      
      expect(FuelEUCalculator.calculateComplianceBalance(ghgIntensity, fuelConsumptionTs)).toBeCloseTo(expectedCb);
      expect(FuelEUCalculator.calculateComplianceBalance(ghgIntensity, fuelConsumptionTs)).toBeLessThan(0);
    });

    it('should calculate zero compliance balance', () => {
      const ghgIntensity = TARGET_INTENSITY_2025;
      const fuelConsumptionTs = 10;
      expect(FuelEUCalculator.calculateComplianceBalance(ghgIntensity, fuelConsumptionTs)).toBeCloseTo(0);
    });
  });
});
