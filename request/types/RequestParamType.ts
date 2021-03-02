import {isNumber, isString} from "../../modules/lodash";


export enum RequestParamType {

    STRING,
    INTEGER,
    NUMBER

}

export function isRequestParamType (value : any) : value is RequestParamType {

    return isNumber(value) && value >= 0 && value <= 2;

}

export function parseRequestParamType (value: any) : RequestParamType {

    if (isRequestParamType(value)) return value;

    if (isString(value)) {
        const lowerCaseValue = value.toLowerCase();
        switch (lowerCaseValue) {
            case 'string'  : return RequestParamType.STRING;
            case 'integer' : return RequestParamType.INTEGER;
            case 'number'  : return RequestParamType.NUMBER;
        }
    }

    throw new TypeError(`Value was not parsable to RequestParamType: "${value}"`);

}

export function stringifyRequestParamType (value : RequestParamType) : string {

    switch (value) {
        case RequestParamType.STRING   : return 'string';
        case RequestParamType.INTEGER  : return 'integer';
        case RequestParamType.NUMBER   : return 'number';
    }

    throw new TypeError(`Unsupported value: "${value}"`);

}

export default RequestParamType;
