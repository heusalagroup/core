// Copyright (c) 2022. Heusala Group Oy <info@sendanor.fi>. All rights reserved.
// Copyright (c) 2021. Sendanor <info@sendanor.fi>. All rights reserved.

import {
    endsWith,
    get,
    has,
    isArray,
    isArrayOf,
    isString,
    keys,
    map, replaceAll,
    split,
    startsWith
} from "./modules/lodash";
import { ReadonlyJsonObject } from "./Json";

export const DEFAULT_CSV_SEPARATOR  = ',';
export const DEFAULT_CSV_QUOTE      = '"';
export const DEFAULT_CSV_LINE_BREAK = '\n';
export const DEFAULT_CSV_LINE_BREAK_REPLACE_CHARACTER : string = ' ';

// FIXME: Add unit tests
export type CsvRow = string[];
export type Csv = CsvRow[];

export type ReadonlyCsvRow = readonly string[];
export type ReadonlyCsv = ReadonlyCsvRow[];

export function isCsvRow (value: any): value is CsvRow {
    return isArrayOf<string>(value, isString);
}

export function isCsv (value: any): value is Csv {
    return isArrayOf<CsvRow>(value, isCsvRow);
}

export interface CsvPropertyTransformerCallback<T> {
    (item: T, key: string) : string;
}

export interface CsvPropertyTransformerMap<T> {
    [key: string]: CsvPropertyTransformerCallback<T>;
}

export function stringifyCsvCellValue (value: any) : string {
    if (value === undefined) return '';
    if (isArray(value)) {
        return `${value.join(',') ?? ''}`;
    }
    return `${value ?? ''}`;
}

export function getCsvCellFromProperty<T> (item: T, key: string) : string {
    return stringifyCsvCellValue( get(item, key) );
}

export function getCsvRowFromJsonObject<T = ReadonlyJsonObject> (
    item: T,
    properties: readonly string[],
    propertyTransformer : CsvPropertyTransformerMap<T> = {}
): CsvRow {
    return map(
        properties,
        (key: string): string => {
            if (has(propertyTransformer, key)) {
                return stringifyCsvCellValue( propertyTransformer[key](item, key) );
            }
            return getCsvCellFromProperty(item, key);
        }
    );
}

export function getCsvFromJsonObjectList<T = ReadonlyJsonObject> (
    list: readonly T[],
    properties: readonly string[] | undefined = undefined,
    includeHeader : boolean = true,
    propertyTransformer : CsvPropertyTransformerMap<T> = {}
): Csv {

    const keyList : CsvRow = (
        properties === undefined ? (
            list.length === 0 ? [] : keys(list[0])
        ) : (
            map(properties, item => item)
        )
    );

    const rows : Csv = map(
        list,
        (item: T): CsvRow => getCsvRowFromJsonObject<T>(
            item,
            keyList,
            propertyTransformer
        )
    );

    if (includeHeader) {
        return [
            keyList,
            ...rows
        ];
    }

    return rows;
}

/**
 *
 * @fixme Add support to parse quoted line breaks
 *
 * @param value
 * @param separator
 * @param quote
 */
export function parseCsvRow (
    value: any,
    separator: string = DEFAULT_CSV_SEPARATOR,
    quote: string = DEFAULT_CSV_QUOTE
): CsvRow {

    separator = separator ? separator : DEFAULT_CSV_SEPARATOR;
    quote     = quote     ? quote     : DEFAULT_CSV_QUOTE;

    if ( separator?.length !== 1 ) {
        throw new TypeError(`The separator must be exactly 1 character long: ${separator}`);
    }

    if ( quote?.length !== 1 ) {
        throw new TypeError(`The quote must be exactly 1 character long: ${quote}`);
    }

    if ( isCsvRow(value) ) {
        return value;
    }

    if ( !isString(value) ) {
        value = `${value}`;
    }

    let pieces: string[] = [];
    let lastIndex = 0;
    while ( lastIndex < value.length ) {

        const nextIndex = value.indexOf(separator, lastIndex);

        if ( nextIndex < 0 ) {
            pieces.push(value.substr(lastIndex));
            lastIndex = pieces.length;
            break;
        }

        let piece = value.substr(lastIndex, nextIndex - lastIndex);
        if ( piece.length >= 2 && startsWith(piece, quote) && endsWith(piece, quote) ) {
            piece = piece.substr(1, piece.length - 2).split(piece + piece).join(piece);
        }
        pieces.push(piece);
        lastIndex = nextIndex + 1;

    }

    return pieces;

}

/**
 *
 * @fixme Add support to detect if the input was just a single CsvRow
 * @fixme Add support to convert arrays with (JSON able) objects as Csv
 *
 * @param value
 * @param separator
 * @param quote
 * @param lineBreak
 */
export function parseCsv (
    value: any,
    separator: string = DEFAULT_CSV_SEPARATOR,
    quote: string = DEFAULT_CSV_QUOTE,
    lineBreak: string = DEFAULT_CSV_LINE_BREAK
): Csv | undefined {
    separator = separator ? separator : DEFAULT_CSV_SEPARATOR;
    quote     = quote     ? quote     : DEFAULT_CSV_QUOTE;
    lineBreak = lineBreak ? lineBreak : DEFAULT_CSV_LINE_BREAK;
    if ( isCsv(value) ) return value;
    if ( !isString(value) ) {
        value = `${value}`;
    }
    return map(
        split(value, lineBreak),
        (item: any): CsvRow => parseCsvRow(item, separator, quote)
    );
}

export function stringifyCsvRow (
    value: CsvRow,
    separator: string = DEFAULT_CSV_SEPARATOR,
    quote: string = DEFAULT_CSV_QUOTE,
    lineBreak: string = DEFAULT_CSV_LINE_BREAK
): string {
    separator = separator ? separator : DEFAULT_CSV_SEPARATOR;
    quote     = quote     ? quote     : DEFAULT_CSV_QUOTE;
    return map(value, (column: string) => {
        if ( column.length === 0 ) return column;
        if ( column.indexOf(separator) >= 0 || (column[0] === quote) ) {
            if ( column.indexOf(quote) >= 0 ) {
                return `${quote}${column.split(quote).join(quote + quote)}${quote}`;
            } else {
                return `${quote}${column}${quote}`;
            }
        } else {
            return column;
        }
    }).join(separator);
}

/**
 * @param value
 * @param separator
 * @param quote
 * @param lineBreak
 * @param replaceLineBreak
 */
export function stringifyCsv (
    value            : Csv,
    separator        : string = DEFAULT_CSV_SEPARATOR,
    quote            : string = DEFAULT_CSV_QUOTE,
    lineBreak        : string = DEFAULT_CSV_LINE_BREAK,
    replaceLineBreak : string | false = DEFAULT_CSV_LINE_BREAK_REPLACE_CHARACTER
): string {
    separator = separator ? separator : DEFAULT_CSV_SEPARATOR;
    quote     = quote     ? quote     : DEFAULT_CSV_QUOTE;
    lineBreak = lineBreak ? lineBreak : DEFAULT_CSV_LINE_BREAK;

    if (replaceLineBreak !== false ) {
        value = replaceCsvContentLineBreaks(
            value,
            lineBreak,
            replaceLineBreak
        );
    }

    return map(
        value,
        (row: CsvRow) => stringifyCsvRow(row, separator, quote, lineBreak)
    ).join(lineBreak);
}

/**
 * Can be used to modify Csv data structure so that line breaks in the Csv content
 * are replaced to different character
 * @param value
 * @param lineBreak
 * @param replaceTo
 */
export function replaceCsvContentLineBreaks (
    value     : Csv,
    lineBreak : string = DEFAULT_CSV_LINE_BREAK,
    replaceTo : string = DEFAULT_CSV_LINE_BREAK_REPLACE_CHARACTER
) : Csv {
    return map(
        value,
        (row: CsvRow) : CsvRow =>
            map(
                row,
                (column: string): string => replaceAll(column, lineBreak, replaceTo)
            )
    );
}
