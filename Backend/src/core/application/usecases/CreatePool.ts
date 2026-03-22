import { PoolRepository } from '../../ports/PoolRepository';
import { ComputeCB } from './ComputeCB';
import { PoolingUtils } from '../../../shared/utils';
import { PoolMemberInput } from '../../domain/entities/PoolMember';

export class CreatePool {
  constructor(
    private poolRepo: PoolRepository,
    private computeCb: ComputeCB
  ) {}

  async execute(year: number, shipIds: string[]) {
    if (shipIds.length < 2) {
      throw new Error('A pool must contain at least 2 ships');
    }

    const membersInput: PoolMemberInput[] = [];
    for (const shipId of shipIds) {
      const adjusted = await this.computeCb.executeAdjusted(shipId, year);
      membersInput.push({
        shipId,
        cbBefore: adjusted.adjustedCb
      });
    }

    const poolOutputs = PoolingUtils.allocatePool(membersInput);
    const result = await this.poolRepo.createPool(year, poolOutputs);

    return result;
  }
}
