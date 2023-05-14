// Copyright (c) 2023. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import { QueryBuilder, QueryBuildResult, QueryValueFactory } from "../../../query/types/QueryBuilder";
import { PgQueryUtils } from "../../utils/PgQueryUtils";
import { map } from "../../../../../functions/map";

/**
 * This generates formulas like `$#, $#, $#` for parameter lists if the input was
 * an array of three parameters.
 *
 * @see {@link PgQueryUtils.getValuePlaceholder}
 */
export class PgParameterListBuilder implements QueryBuilder {

    private _value : readonly any[] | undefined;

    public constructor () {
        this._value = undefined;
    }

    public valueOf () {
        return this.toString();
    }

    public toString () : string {
        return `PgParameterListBuilder "${this.buildQueryString()}" with ${this.buildQueryValues().map(item=>item()).join(' ')}`;
    }

    public build () : QueryBuildResult {
        return [this.buildQueryString(), this.buildQueryValues()];
    }

    public setParams (value : readonly any[]) {
        this._value = value;
    }

    public buildQueryString () : string {
        if (!this._value) throw new TypeError(`Array was not initialized`);
        const placeholder = PgQueryUtils.getValuePlaceholder();
        return map(this._value, () => placeholder).join(', ');
    }

    public buildQueryValues () : readonly any[] {
        return this._value ? map(this._value, (item) => item) : [];
    }

    public getQueryValueFactories () : readonly QueryValueFactory[] {
        return map(this._value, (item) => () => item);
    }

}
