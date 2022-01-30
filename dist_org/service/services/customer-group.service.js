"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerGroupService = void 0;
const common_1 = require("@nestjs/common");
const generated_types_1 = require("@vendure/common/lib/generated-types");
const errors_1 = require("../../common/error/errors");
const utils_1 = require("../../common/utils");
const customer_group_entity_1 = require("../../entity/customer-group/customer-group.entity");
const customer_entity_1 = require("../../entity/customer/customer.entity");
const event_bus_1 = require("../../event-bus/event-bus");
const customer_group_event_1 = require("../../event-bus/events/customer-group-event");
const list_query_builder_1 = require("../helpers/list-query-builder/list-query-builder");
const patch_entity_1 = require("../helpers/utils/patch-entity");
const transactional_connection_1 = require("../transaction/transactional-connection");
const history_service_1 = require("./history.service");
let CustomerGroupService = class CustomerGroupService {
    constructor(connection, listQueryBuilder, historyService, eventBus) {
        this.connection = connection;
        this.listQueryBuilder = listQueryBuilder;
        this.historyService = historyService;
        this.eventBus = eventBus;
    }
    findAll(ctx, options) {
        return this.listQueryBuilder
            .build(customer_group_entity_1.CustomerGroup, options, { ctx })
            .getManyAndCount()
            .then(([items, totalItems]) => ({ items, totalItems }));
    }
    findOne(ctx, customerGroupId) {
        return this.connection.getRepository(ctx, customer_group_entity_1.CustomerGroup).findOne(customerGroupId);
    }
    getGroupCustomers(ctx, customerGroupId, options) {
        return this.listQueryBuilder
            .build(customer_entity_1.Customer, options, { ctx })
            .leftJoin('customer.groups', 'group')
            .leftJoin('customer.channels', 'channel')
            .andWhere('group.id = :groupId', { groupId: customerGroupId })
            .andWhere('channel.id =:channelId', { channelId: ctx.channelId })
            .getManyAndCount()
            .then(([items, totalItems]) => ({ items, totalItems }));
    }
    async create(ctx, input) {
        const customerGroup = new customer_group_entity_1.CustomerGroup(input);
        const newCustomerGroup = await this.connection.getRepository(ctx, customer_group_entity_1.CustomerGroup).save(customerGroup);
        if (input.customerIds) {
            const customers = await this.getCustomersFromIds(ctx, input.customerIds);
            for (const customer of customers) {
                customer.groups = [...(customer.groups || []), newCustomerGroup];
                await this.historyService.createHistoryEntryForCustomer({
                    ctx,
                    customerId: customer.id,
                    type: generated_types_1.HistoryEntryType.CUSTOMER_ADDED_TO_GROUP,
                    data: {
                        groupName: customerGroup.name,
                    },
                });
            }
            await this.connection.getRepository(ctx, customer_entity_1.Customer).save(customers);
        }
        return utils_1.assertFound(this.findOne(ctx, newCustomerGroup.id));
    }
    async update(ctx, input) {
        const customerGroup = await this.connection.getEntityOrThrow(ctx, customer_group_entity_1.CustomerGroup, input.id);
        const updatedCustomerGroup = patch_entity_1.patchEntity(customerGroup, input);
        await this.connection.getRepository(ctx, customer_group_entity_1.CustomerGroup).save(updatedCustomerGroup, { reload: false });
        return utils_1.assertFound(this.findOne(ctx, customerGroup.id));
    }
    async delete(ctx, id) {
        const group = await this.connection.getEntityOrThrow(ctx, customer_group_entity_1.CustomerGroup, id);
        try {
            await this.connection.getRepository(ctx, customer_group_entity_1.CustomerGroup).remove(group);
            return {
                result: generated_types_1.DeletionResult.DELETED,
            };
        }
        catch (e) {
            return {
                result: generated_types_1.DeletionResult.NOT_DELETED,
                message: e.message,
            };
        }
    }
    async addCustomersToGroup(ctx, input) {
        const customers = await this.getCustomersFromIds(ctx, input.customerIds);
        const group = await this.connection.getEntityOrThrow(ctx, customer_group_entity_1.CustomerGroup, input.customerGroupId);
        for (const customer of customers) {
            if (!customer.groups.map(g => g.id).includes(input.customerGroupId)) {
                customer.groups.push(group);
                await this.historyService.createHistoryEntryForCustomer({
                    ctx,
                    customerId: customer.id,
                    type: generated_types_1.HistoryEntryType.CUSTOMER_ADDED_TO_GROUP,
                    data: {
                        groupName: group.name,
                    },
                });
            }
        }
        await this.connection.getRepository(ctx, customer_entity_1.Customer).save(customers, { reload: false });
        this.eventBus.publish(new customer_group_event_1.CustomerGroupEvent(ctx, customers, group, 'assigned'));
        return utils_1.assertFound(this.findOne(ctx, group.id));
    }
    async removeCustomersFromGroup(ctx, input) {
        const customers = await this.getCustomersFromIds(ctx, input.customerIds);
        const group = await this.connection.getEntityOrThrow(ctx, customer_group_entity_1.CustomerGroup, input.customerGroupId);
        for (const customer of customers) {
            if (!customer.groups.map(g => g.id).includes(input.customerGroupId)) {
                throw new errors_1.UserInputError('error.customer-does-not-belong-to-customer-group');
            }
            customer.groups = customer.groups.filter(g => !utils_1.idsAreEqual(g.id, group.id));
            await this.historyService.createHistoryEntryForCustomer({
                ctx,
                customerId: customer.id,
                type: generated_types_1.HistoryEntryType.CUSTOMER_REMOVED_FROM_GROUP,
                data: {
                    groupName: group.name,
                },
            });
        }
        await this.connection.getRepository(ctx, customer_entity_1.Customer).save(customers, { reload: false });
        this.eventBus.publish(new customer_group_event_1.CustomerGroupEvent(ctx, customers, group, 'removed'));
        return utils_1.assertFound(this.findOne(ctx, group.id));
    }
    getCustomersFromIds(ctx, ids) {
        if (ids.length === 0) {
            return new Array();
        } // TypeORM throws error when list is empty
        return this.connection
            .getRepository(ctx, customer_entity_1.Customer)
            .createQueryBuilder('customer')
            .leftJoin('customer.channels', 'channel')
            .leftJoinAndSelect('customer.groups', 'group')
            .where('customer.id IN (:...customerIds)', { customerIds: ids })
            .andWhere('channel.id = :channelId', { channelId: ctx.channelId })
            .andWhere('customer.deletedAt is null')
            .getMany();
    }
};
CustomerGroupService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [transactional_connection_1.TransactionalConnection,
        list_query_builder_1.ListQueryBuilder,
        history_service_1.HistoryService,
        event_bus_1.EventBus])
], CustomerGroupService);
exports.CustomerGroupService = CustomerGroupService;
//# sourceMappingURL=customer-group.service.js.map