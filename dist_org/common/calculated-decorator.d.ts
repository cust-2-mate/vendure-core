import { SelectQueryBuilder } from 'typeorm';
/**
 * The property name we use to store the CalculatedColumnDefinitions to the
 * entity class.
 */
export declare const CALCULATED_PROPERTIES = "__calculatedProperties__";
/**
 * Optional metadata used to tell the ListQueryBuilder how to deal with
 * calculated columns when sorting or filtering.
 */
export interface CalculatedColumnQueryInstruction {
    relations?: string[];
    query?: (qb: SelectQueryBuilder<any>) => void;
    expression: string;
}
export interface CalculatedColumnDefinition {
    name: string | symbol;
    listQuery?: CalculatedColumnQueryInstruction;
}
/**
 * @description
 * Used to define calculated entity getters. The decorator simply attaches an array of "calculated"
 * property names to the entity's prototype. This array is then used by the {@link CalculatedPropertySubscriber}
 * to transfer the getter function from the prototype to the entity instance.
 */
export declare function Calculated(queryInstruction?: CalculatedColumnQueryInstruction): MethodDecorator;
