import { GraphQLSchema } from 'graphql';
import { ErrorResult } from '../../common/error/generated-graphql-admin-errors';
import { ConfigService } from '../../config/config.service';
import { CustomFieldRelationResolverService } from '../common/custom-field-relation-resolver.service';
import { ApiType } from '../common/get-api-type';
/**
 * @description
 * Generates additional resolvers required for things like resolution of union types,
 * custom scalars and "relation"-type custom fields.
 */
export declare function generateResolvers(configService: ConfigService, customFieldRelationResolverService: CustomFieldRelationResolverService, apiType: ApiType, schema: GraphQLSchema): {
    CreateAssetResult: {
        __resolveType(value: any): any;
    };
    NativeAuthenticationResult: {
        __resolveType(value: any): any;
    };
    AuthenticationResult: {
        __resolveType(value: any): any;
    };
    CreateChannelResult: {
        __resolveType(value: any): any;
    };
    UpdateChannelResult: {
        __resolveType(value: any): any;
    };
    CreateCustomerResult: {
        __resolveType(value: any): any;
    };
    UpdateCustomerResult: {
        __resolveType(value: any): any;
    };
    UpdateGlobalSettingsResult: {
        __resolveType(value: any): any;
    };
    SettlePaymentResult: {
        __resolveType(value: any): any;
    };
    AddFulfillmentToOrderResult: {
        __resolveType(value: any): any;
    };
    CancelOrderResult: {
        __resolveType(value: any): any;
    };
    RefundOrderResult: {
        __resolveType(value: any): any;
    };
    SettleRefundResult: {
        __resolveType(value: any): any;
    };
    TransitionOrderToStateResult: {
        __resolveType(value: any): any;
    };
    TransitionFulfillmentToStateResult: {
        __resolveType(value: any): any;
    };
    TransitionPaymentToStateResult: {
        __resolveType(value: any): any;
    };
    ModifyOrderResult: {
        __resolveType(value: any): any;
    };
    AddManualPaymentToOrderResult: {
        __resolveType(value: any): any;
    };
    RemoveOptionGroupFromProductResult: {
        __resolveType(value: any): any;
    };
    CreatePromotionResult: {
        __resolveType(value: any): any;
    };
    UpdatePromotionResult: {
        __resolveType(value: any): any;
    };
    StockMovementItem: {
        __resolveType(value: any): "StockAdjustment" | "Allocation" | "Sale" | "Cancellation" | "Return" | "Release" | undefined;
    };
    StockMovement: {
        __resolveType(value: any): "StockAdjustment" | "Allocation" | "Sale" | "Cancellation" | "Return" | "Release" | undefined;
    };
    JSON: import("graphql").GraphQLScalarType;
    DateTime: import("graphql").GraphQLScalarType;
    Node: {
        __resolveType(): null;
    };
    PaginatedList: {
        __resolveType(): null;
    };
    Upload: any;
    SearchResultPrice: {
        __resolveType(value: any): "SinglePrice" | "PriceRange";
    };
    CustomFieldConfig: {
        __resolveType(value: any): "StringCustomFieldConfig" | "LocaleStringCustomFieldConfig" | "TextCustomFieldConfig" | "IntCustomFieldConfig" | "FloatCustomFieldConfig" | "BooleanCustomFieldConfig" | "DateTimeCustomFieldConfig" | "RelationCustomFieldConfig" | undefined;
    };
    CustomField: {
        __resolveType(value: any): "StringCustomFieldConfig" | "LocaleStringCustomFieldConfig" | "TextCustomFieldConfig" | "IntCustomFieldConfig" | "FloatCustomFieldConfig" | "BooleanCustomFieldConfig" | "DateTimeCustomFieldConfig" | "RelationCustomFieldConfig" | undefined;
    };
    ErrorResult: {
        __resolveType(value: ErrorResult): string;
    };
} | {
    UpdateOrderItemsResult: {
        __resolveType(value: any): any;
    };
    RemoveOrderItemsResult: {
        __resolveType(value: any): any;
    };
    ApplyCouponCodeResult: {
        __resolveType(value: any): any;
    };
    TransitionOrderToStateResult: {
        __resolveType(value: any): any;
    };
    ActiveOrderResult: {
        __resolveType(value: any): any;
    };
    SetOrderShippingMethodResult: {
        __resolveType(value: any): any;
    };
    AddPaymentToOrderResult: {
        __resolveType(value: any): any;
    };
    SetCustomerForOrderResult: {
        __resolveType(value: any): any;
    };
    NativeAuthenticationResult: {
        __resolveType(value: any): any;
    };
    AuthenticationResult: {
        __resolveType(value: any): any;
    };
    RegisterCustomerAccountResult: {
        __resolveType(value: any): any;
    };
    RefreshCustomerVerificationResult: {
        __resolveType(value: any): any;
    };
    VerifyCustomerAccountResult: {
        __resolveType(value: any): any;
    };
    UpdateCustomerPasswordResult: {
        __resolveType(value: any): any;
    };
    RequestUpdateCustomerEmailAddressResult: {
        __resolveType(value: any): any;
    };
    UpdateCustomerEmailAddressResult: {
        __resolveType(value: any): any;
    };
    RequestPasswordResetResult: {
        __resolveType(value: any): any;
    };
    ResetPasswordResult: {
        __resolveType(value: any): any;
    };
    JSON: import("graphql").GraphQLScalarType;
    DateTime: import("graphql").GraphQLScalarType;
    Node: {
        __resolveType(): null;
    };
    PaginatedList: {
        __resolveType(): null;
    };
    Upload: any;
    SearchResultPrice: {
        __resolveType(value: any): "SinglePrice" | "PriceRange";
    };
    CustomFieldConfig: {
        __resolveType(value: any): "StringCustomFieldConfig" | "LocaleStringCustomFieldConfig" | "TextCustomFieldConfig" | "IntCustomFieldConfig" | "FloatCustomFieldConfig" | "BooleanCustomFieldConfig" | "DateTimeCustomFieldConfig" | "RelationCustomFieldConfig" | undefined;
    };
    CustomField: {
        __resolveType(value: any): "StringCustomFieldConfig" | "LocaleStringCustomFieldConfig" | "TextCustomFieldConfig" | "IntCustomFieldConfig" | "FloatCustomFieldConfig" | "BooleanCustomFieldConfig" | "DateTimeCustomFieldConfig" | "RelationCustomFieldConfig" | undefined;
    };
    ErrorResult: {
        __resolveType(value: ErrorResult): string;
    };
};
