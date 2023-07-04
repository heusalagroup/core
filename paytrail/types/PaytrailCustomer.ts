// Copyright (c) 2023. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import { explainNoOtherKeysInDevelopment, hasNoOtherKeysInDevelopment } from "../../types/OtherKeys";
import { explainRegularObject, isRegularObject } from "../../types/RegularObject";
import { explainString, explainStringOrUndefined, isString, isStringOrUndefined } from "../../types/String";
import { explain, explainProperty } from "../../types/explain";

/**
 * @see https://docs.paytrail.com/#/?id=customer-1
 */
export interface PaytrailCustomer {

    /**
     * Email. Maximum of 200 characters.
     */
    readonly email : string;

    /**
     * First name (required for OPLasku and Walley/Collector). Maximum of 50
     * characters.
     */
    readonly firstName ?: string;

    /**
     * Last name (required for OPLasku and Walley/Collector). Maximum of 50
     * characters.
     */
    readonly lastName ?: string;

    /**
     * Phone number
     */
    readonly phone ?: string;

    /**
     * VAT ID, if any
     */
    readonly vatId ?: string;

    /**
     * Company name, if any
     */
    readonly companyName ?: string;

}

export function createPaytrailCustomer (
    email : string,
    firstName ?: string,
    lastName ?: string,
    phone ?: string,
    vatId ?: string,
    companyName ?: string,
) : PaytrailCustomer {
    return {
        email,
        firstName,
        lastName,
        phone,
        vatId,
        companyName,
    };
}

export function isPaytrailCustomer (value: unknown) : value is PaytrailCustomer {
    return (
        isRegularObject(value)
        && hasNoOtherKeysInDevelopment(value, [
            'email',
            'firstName',
            'lastName',
            'phone',
            'vatId',
            'companyName',
        ])
        && isString(value?.email)
        && isStringOrUndefined(value?.firstName)
        && isStringOrUndefined(value?.lastName)
        && isStringOrUndefined(value?.phone)
        && isStringOrUndefined(value?.vatId)
        && isStringOrUndefined(value?.companyName)
    );
}

export function explainPaytrailCustomer (value: any) : string {
    return explain(
        [
            explainRegularObject(value),
            explainNoOtherKeysInDevelopment(value, [
                'email',
                'firstName',
                'lastName',
                'phone',
                'vatId',
                'companyName',
            ])
            , explainProperty("email", explainString(value?.email))
            , explainProperty("firstName", explainStringOrUndefined(value?.firstName))
            , explainProperty("lastName", explainStringOrUndefined(value?.lastName))
            , explainProperty("phone", explainStringOrUndefined(value?.phone))
            , explainProperty("vatId", explainStringOrUndefined(value?.vatId))
            , explainProperty("companyName", explainStringOrUndefined(value?.companyName))
        ]
    );
}

export function stringifyPaytrailCustomer (value : PaytrailCustomer) : string {
    return `PaytrailCustomer(${value})`;
}

export function parsePaytrailCustomer (value: unknown) : PaytrailCustomer | undefined {
    if (isPaytrailCustomer(value)) return value;
    return undefined;
}
