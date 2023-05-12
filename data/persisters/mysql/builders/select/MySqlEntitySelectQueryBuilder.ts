// Copyright (c) 2023. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import { MySqlSelectQueryBuilder } from "./MySqlSelectQueryBuilder";
import { SelectQueryBuilder } from "../../../types/SelectQueryBuilder";
import { QueryBuilder } from "../../../types/QueryBuilder";
import { MySqlEntityJsonObjectBuilder } from "../formulas/MySqlEntityJsonObjectBuilder";
import { MySqlJsonArrayAggBuilder } from "../formulas/MySqlJsonArrayAggBuilder";
import { EntityField } from "../../../../types/EntityField";
import { EntityRelationOneToMany } from "../../../../types/EntityRelationOneToMany";
import { PersisterMetadataManager } from "../../../types/PersisterMetadataManager";
import { forEach } from "../../../../../functions/forEach";
import { EntityRelationManyToOne } from "../../../../types/EntityRelationManyToOne";
import { find } from "../../../../../functions/find";
import { EntityFieldType } from "../../../../types/EntityFieldType";
import { Sort } from "../../../../Sort";
import { Where } from "../../../../Where";
import { MySqlAndChainBuilder } from "../formulas/MySqlAndChainBuilder";
import { ChainQueryBuilderUtils } from "../../../utils/ChainQueryBuilderUtils";
import { MySqlOrChainBuilder } from "../formulas/MySqlOrChainBuilder";
import { TemporalProperty } from "../../../../types/TemporalProperty";
import { EntitySelectBuilderUtils } from "../../../utils/EntitySelectBuilderUtils";

export class MySqlEntitySelectQueryBuilder implements SelectQueryBuilder {

    private _builder : MySqlSelectQueryBuilder;

    public constructor () {
        this._builder = new MySqlSelectQueryBuilder();
    }

    public includeColumn (tableName: string, columnName: string): void {
        this._builder.includeColumn(tableName, columnName);
    }

    public includeColumnAsText (tableName: string, columnName: string): void {
        this._builder.includeColumnAsText(tableName, columnName);
    }

    public includeColumnAsTime (tableName: string, columnName: string): void {
        this._builder.includeColumnAsTime(tableName, columnName);
    }

    public includeColumnAsDate (tableName: string, columnName: string): void {
        this._builder.includeColumnAsDate(tableName, columnName);
    }

    public includeColumnAsTimestamp (tableName: string, columnName: string): void {
        this._builder.includeColumnAsTimestamp(tableName, columnName);
    }

    public valueOf () {
        return this.toString();
    }

    public toString () : string {
        return this._builder.toString();
    }

    public build (): [ string, any[] ] {
        return this._builder.build();
    }

    public buildQueryString (): string {
        return this._builder.buildQueryString();
    }

    public buildQueryValues (): any[] {
        return this._builder.buildQueryValues();
    }

    public getQueryValueFactories (): (() => any)[] {
        return this._builder.getQueryValueFactories();
    }

    public includeAllColumnsFromTable (tableName: string): void {
        return this._builder.includeAllColumnsFromTable(tableName);
    }

    public includeEntityFields (
        tableName           : string,
        fields              : readonly EntityField[],
        temporalProperties  : readonly TemporalProperty[]
    ): void {
        EntitySelectBuilderUtils.includeEntityFields(
            this._builder,
            tableName,
            fields,
            temporalProperties
        );
    }

    public includeColumnFromQueryBuilder (builder: QueryBuilder, asColumnName: string): void {
        return this._builder.includeColumnFromQueryBuilder(builder, asColumnName);
    }

    public includeFormulaByString (formula: string, asColumnName: string): void {
        return this._builder.includeFormulaByString(formula, asColumnName);
    }

    public leftJoinTable (fromTableName: string, fromColumnName: string, sourceTableName: string, sourceColumnName: string): void {
        return this._builder.leftJoinTable(fromTableName, fromColumnName, sourceTableName, sourceColumnName);
    }

    public setFromTable (tableName: string): void {
        return this._builder.setFromTable(tableName);
    }

    public getShortFromTable (): string {
        return this._builder.getShortFromTable();
    }

    public getCompleteFromTable (): string {
        return this._builder.getCompleteFromTable();
    }

    public setGroupByColumn (columnName: string): void {
        return this._builder.setGroupByColumn(columnName);
    }

    public setOrderBy (
        sort      : Sort,
        tableName : string,
        fields    : readonly EntityField[]
    ): void {
        return this._builder.setOrderByTableFields(sort, tableName, fields);
    }

    public getGroupByColumn (): string {
        return this._builder.getGroupByColumn();
    }

    public setTablePrefix (prefix: string): void {
        return this._builder.setTablePrefix(prefix);
    }

    public getTablePrefix (): string {
        return this._builder.getTablePrefix();
    }

    public getCompleteTableName (tableName: string): string {
        return this._builder.getCompleteTableName(tableName);
    }

    public setWhereFromQueryBuilder (builder: QueryBuilder): void {
        return this._builder.setWhereFromQueryBuilder(builder);
    }

    /**
     * One to many -style of relations.
     *
     * OneToMany will build a query like this:
     *
     * SELECT
     *   carts.*,
     *   JSON_ARRAYAGG(JSON_OBJECT("cart_item_id", cart_items.cart_item_id, "cart_id", cart_items.cart_id, "cart_item_name", cart_items.cart_item_name)) AS cartItems
     * FROM carts
     * LEFT JOIN cart_items ON carts.cart_id = cart_items.cart_id
     * GROUP BY carts.cart_id;
     *
     * e.g.:
     *
     * SELECT
     *   ??.*,
     *   JSON_ARRAYAGG(JSON_OBJECT(?, ??.??, ?, ??.??, ?, ??.??)) AS ??
     * FROM ??
     * LEFT JOIN ?? ON ??.?? = ??.??
     * GROUP BY ??.??;
     *
     * @param propertyName
     * @param fields
     * @param temporalProperties
     * @param targetTableName
     * @param targetColumnName
     * @param sourceTableName
     * @param sourceColumnName
     */
    public setOneToMany (
        propertyName: string,
        fields: readonly EntityField[],
        temporalProperties: readonly TemporalProperty[],
        targetTableName : string,
        targetColumnName : string,
        sourceTableName  : string,
        sourceColumnName : string
    ) {
        const jsonObjectQueryBuilder = new MySqlEntityJsonObjectBuilder();
        jsonObjectQueryBuilder.setEntityFieldsFromTable( this.getCompleteTableName(targetTableName), fields, temporalProperties );
        const jsonArrayAggBuilder = new MySqlJsonArrayAggBuilder();
        jsonArrayAggBuilder.setFormulaFromQueryBuilder(jsonObjectQueryBuilder);
        this._builder.includeColumnFromQueryBuilder(jsonArrayAggBuilder, propertyName);
        this._builder.leftJoinTable(
            targetTableName, targetColumnName,
            sourceTableName, sourceColumnName
        );
    }

    /**
     *
     * Many to one -style of relations
     *
     * @ManyToOne will do a query like this:
     *
     * SELECT
     *   cart_items.*,
     *   JSON_OBJECT("cart_id", carts.cart_id, "cart_name", carts.cart_name) AS cart
     * FROM cart_items
     * LEFT JOIN carts ON carts.cart_id = cart_items.cart_id
     * GROUP BY cart_items.cart_item_id;
     *
     * SELECT
     *   ??.*,
     *   JSON_OBJECT(?, ??.??, ?, ??.??) AS ??
     * FROM ??
     * LEFT JOIN ?? ON ??.?? = ??.??
     * GROUP BY ??.??;
     *
     * @param propertyName
     * @param fields
     * @param temporalProperties
     * @param targetTableName
     * @param targetColumnName
     * @param sourceTableName
     * @param sourceColumnName
     */
    public setManyToOne (
        propertyName: string,
        fields: readonly EntityField[],
        temporalProperties: readonly TemporalProperty[],
        targetTableName : string,
        targetColumnName : string,
        sourceTableName  : string,
        sourceColumnName : string
    ) {
        const jsonObjectQueryBuilder = new MySqlEntityJsonObjectBuilder();
        jsonObjectQueryBuilder.setEntityFieldsFromTable(this.getCompleteTableName(targetTableName), fields, temporalProperties);
        this._builder.includeColumnFromQueryBuilder(jsonObjectQueryBuilder, propertyName);
        this._builder.leftJoinTable(
            targetTableName, targetColumnName,
            sourceTableName, sourceColumnName
        );
    }

    public setOneToManyRelations (
        relations: readonly EntityRelationOneToMany[],
        metadataManager: PersisterMetadataManager,
    ) {
        forEach(
            relations,
            (relation: EntityRelationOneToMany) : void => {
                const { propertyName } = relation;
                const mappedTable = relation?.mappedTable;
                if (!mappedTable) throw new TypeError(`The relation "${propertyName}" did not have table defined`);
                const mappedMetadata = metadataManager.getMetadataByTable(mappedTable);
                if (!mappedMetadata) throw new TypeError(`Could not find metadata for property "${propertyName}"`);
                this.setOneToMany(
                    propertyName,
                    mappedMetadata.fields,
                    mappedMetadata.temporalProperties,
                    mappedTable, this.getGroupByColumn(),
                    this.getShortFromTable(), this.getGroupByColumn()
                );
            }
        );
    }

    public setManyToOneRelations (
        relations: readonly EntityRelationManyToOne[],
        metadataManager: PersisterMetadataManager,
        fields: readonly EntityField[]
    ) {
        forEach(
            relations,
            (relation: EntityRelationManyToOne) : void => {
                const { propertyName } = relation;
                const mappedTable = relation?.mappedTable;
                if (!mappedTable) throw new TypeError(`The relation "${propertyName}" did not have table defined`);
                const mappedMetadata = metadataManager.getMetadataByTable(mappedTable);
                if (!mappedMetadata) throw new TypeError(`Could not find metadata for property "${propertyName}"`);
                const mappedField : EntityField | undefined = find(fields, (field) => field?.propertyName === propertyName && field?.fieldType === EntityFieldType.JOINED_ENTITY);
                if (!mappedField) throw new TypeError(`Could not find field definition for property "${propertyName}"`);
                const mappedColumnName : string = mappedField.columnName;
                if (!mappedColumnName) throw new TypeError(`Could not find column name for property "${propertyName}"`);
                this.setManyToOne(
                    propertyName,
                    mappedMetadata.fields,
                    mappedMetadata.temporalProperties,
                    mappedTable, mappedColumnName,
                    this.getShortFromTable(), mappedColumnName
                );
            }
        );
    }

    public buildAnd (
        where     : Where,
        tableName : string,
        fields    : readonly EntityField[]
    ) {
        const completeTableName = this.getCompleteTableName(tableName);
        const andBuilder = new MySqlAndChainBuilder();
        ChainQueryBuilderUtils.buildChain(
            andBuilder,
            where,
            completeTableName,
            fields,
            () => new MySqlAndChainBuilder(),
            () => new MySqlOrChainBuilder()
        );
        return andBuilder;
    }

}
