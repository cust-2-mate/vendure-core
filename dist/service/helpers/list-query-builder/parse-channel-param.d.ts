import { ID, Type } from '@vendure/common/lib/shared-types';
import { Connection } from 'typeorm';
import { VendureEntity } from '../../../entity/base/base.entity';
import { WhereCondition } from './parse-filter-params';
/**
 * Creates a WhereCondition for a channel-aware entity, filtering for only those entities
 * which are assigned to the channel specified by channelId,
 */
export declare function parseChannelParam<T extends VendureEntity>(connection: Connection, entity: Type<T>, channelId: ID): WhereCondition | undefined;
