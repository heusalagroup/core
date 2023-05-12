// Copyright (c) 2023. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import { SortDirection } from "../../../types/SortDirection";

export const PH_VALUE = `?`;
export const PH_TABLE_COLUMN = `??.??`;
export const PH_TABLE_ALL_COLUMNS = `'??.*'`;
export const PH_TABLE_COLUMN_AS_TEXT = `CAST(??.?? as char)`;
export const PH_TABLE_COLUMN_AS_TIME = `TIME_FORMAT(??.??, '%Y-%m-%dT%T.000Z')`;
export const PH_TABLE_COLUMN_AS_DATE = `DATE_FORMAT(??.??, '%Y-%m-%dT%T.000Z')`;
export const PH_TABLE_COLUMN_AS_TIMESTAMP = `FROM_UNIXTIME(??.??, '%Y-%m-%dT%T.000Z')`;
export const PH_AS = (value: string) => `${value} AS ??`;
export const PH_TABLE_COLUMN_AS_TEXT_AS = PH_AS(PH_TABLE_COLUMN_AS_TEXT);
export const PH_TABLE_COLUMN_AS_TIME_AS = PH_AS(PH_TABLE_COLUMN_AS_TIME);
export const PH_TABLE_COLUMN_AS_DATE_AS = PH_AS(PH_TABLE_COLUMN_AS_DATE);
export const PH_TABLE_COLUMN_AS_TIMESTAMP_AS = PH_AS(PH_TABLE_COLUMN_AS_TIMESTAMP);
export const PH_TABLE_COLUMN_WITH_SORT_ORDER = (order : SortDirection) : string => `??.??${ order === SortDirection.ASC ? '' : ' DESC'}`;
export const PH_LEFT_JOIN = `LEFT JOIN ?? ON ??.?? = ??.??`;
export const PH_GROUP_BY_TABLE_COLUMN = `GROUP BY ??.??`;
export const PH_FROM_TABLE = `FROM ??`;
export const PH_TABLE_COLUMN_BETWEEN_RANGE = `??.?? BETWEEN ? AND ?`;
export const PH_TABLE_COLUMN_AFTER = `??.?? > ?`;
export const PH_TABLE_COLUMN_BEFORE = `??.?? < ?`;
export const PH_TABLE_COLUMN_EQUAL = `??.?? = ?`;
export const PH_TABLE_COLUMN_IN = `??.?? IN (?)`;
export const PH_TABLE_COLUMN_EQUALS_LAST_INSERT_ID = `??.?? = LAST_INSERT_ID()`;
