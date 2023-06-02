// Copyright (c) 2022-2023. Heusala Group Oy. All rights reserved.
// Copyright (c) 2020-2021. Sendanor. All rights reserved.

import { explainRegularObject, isRegularObject } from "../../types/RegularObject";
import { explainNoOtherKeysInDevelopment, hasNoOtherKeysInDevelopment } from "../../types/OtherKeys";
import { explainString, isString } from "../../types/String";
import { explain, explainProperty } from "../../types/explain";

export interface EntityRelationOneToMany {

    /**
     * The property name of the field in the entity
     */
    readonly propertyName : string;

    /**
     * The property name in which this relation is mapped to in the remote entity
     */
    readonly mappedBy : string;

    /**
     * The remote table in which this entity is mapped to.
     *
     * @See {@link OneToMany}
     */
    readonly mappedTable : string;

}

/**
 *
 * @param propertyName The property name of the field in the entity. See {@link EntityRelationOneToMany.propertyName}
 * @param mappedBy The property name in which this relation is mapped to in the remote entity. See {@link EntityRelationOneToMany.mappedBy}
 * @param mappedTable The remote table in which this entity is mapped to, if known. See {@link EntityRelationOneToMany.mappedTable}
 */
export function createEntityRelationOneToMany (
    propertyName  : string,
    mappedBy      : string,
    mappedTable   : string
) : EntityRelationOneToMany {
    return {
        propertyName,
        mappedBy,
        mappedTable
    };
}

export function isEntityRelationOneToMany (value: unknown) : value is EntityRelationOneToMany {
    return (
        isRegularObject(value)
        && hasNoOtherKeysInDevelopment(value, [
            'propertyName',
            'mappedBy',
            'mappedTable',
        ])
        && isString(value?.propertyName)
        && isString(value?.mappedBy)
        && isString(value?.mappedTable)
    );
}

export function explainEntityRelationOneToMany (value: any) : string {
    return explain(
        [
            explainRegularObject(value),
            explainNoOtherKeysInDevelopment(value, [
                'propertyName',
                'mappedBy',
                'mappedTable',
            ])
            , explainProperty("propertyName", explainString(value?.propertyName))
            , explainProperty("mappedBy", explainString(value?.mappedBy))
            , explainProperty("mappedTable", explainString(value?.mappedTable))
        ]
    );
}

export function stringifyEntityRelationOneToMany (value : EntityRelationOneToMany) : string {
    return `EntityRelationOneToMany(${value})`;
}

export function parseEntityRelationOneToMany (value: unknown) : EntityRelationOneToMany | undefined {
    if (isEntityRelationOneToMany(value)) return value;
    return undefined;
}
