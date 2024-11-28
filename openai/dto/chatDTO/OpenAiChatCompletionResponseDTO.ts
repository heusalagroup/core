// Copyright (c) 2023. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import { OpenAiModel } from "../../types/OpenAiModel";
import { explainRegularObject, isRegularObject } from "../../../types/RegularObject";
import { explainNoOtherKeys, hasNoOtherKeys } from "../../../types/OtherKeys";
import {
    explainString, explainStringOrNull,
    explainStringOrUndefined,
    isString,
    isStringOrNull,
    isStringOrUndefined
} from "../../../types/String";
import { explain, explainProperty } from "../../../types/explain";
import { explainArrayOf, isArrayOf } from "../../../types/Array";
import { startsWith } from "../../../functions/startsWith";
import { parseJson } from "../../../Json";
import { explainOpenAiCompletionResponseUsage, isOpenAiCompletionResponseUsage, OpenAiCompletionResponseUsage } from "../OpenAiCompletionResponseUsage";
import { explainNumber, isNumber } from "../../../types/Number";
import { OpenAiError } from "../OpenAiError";
import {
    explainOpenAiChatCompletionResponseChoice,
    isOpenAiChatCompletionResponseChoice,
    OpenAiChatCompletionResponseChoice
} from "./OpenAiChatCompletionResponseChoice";

/**
 * @typedef {Object} OpenAiChatCompletionResponseDTO
 *
 * The response to an OpenAI completion request.
 */
export interface OpenAiChatCompletionResponseDTO {

    /**
     * The ID of the response.
     */
    readonly id: string;

    /**
     *
     */
    readonly object: string;

    /**
     *
     */
    readonly created: number;

    /**
     * The name of the model used to generate the response.
     *
     * @see https://beta.openai.com/docs/api-reference/completions/create#completions/create-model
     */
    readonly model: OpenAiModel | string;

    /**
     */
    readonly choices: readonly (OpenAiChatCompletionResponseChoice| OpenAiError)[];

    /**
     *
     */
    readonly usage : OpenAiCompletionResponseUsage;

    readonly system_fingerprint: string | null

    readonly warning ?: string;

}

/**
 * Create a new `OpenAiChatCompletionResponseDTO` object.
 *
 * @param {string} id - The ID of the response.
 * @param {string} object -
 * @param {number} created -
 * @param {OpenAiModel} model - The name of the model used to generate the response.
 * @param {readonly OpenAiCompletionResponseChoice[]} choices -
 * @param {OpenAiCompletionResponseUsage} usage -
 * @returns {OpenAiChatCompletionResponseDTO} The new `OpenAiChatCompletionResponseDTO` object.
 */
export function createOpenAiChatCompletionResponseDTO (
    id: string,
    object: string,
    created: number,
    model: OpenAiModel | string,
    choices: readonly (OpenAiChatCompletionResponseChoice | OpenAiError)[],
    usage: OpenAiCompletionResponseUsage,
    system_fingerprint: string | null
) : OpenAiChatCompletionResponseDTO {
    return {
        id,
        object,
        created,
        model,
        choices,
        usage,
        system_fingerprint
    };
}

/**
 * Check if the given value is an `OpenAiChatCompletionResponseDTO` object.
 *
 * @param value - The value to check.
 * @returns `true` if the value is a valid `OpenAiChatCompletionResponseDTO` object, `false` otherwise.
 */
export function isOpenAiChatCompletionResponseDTO (value: unknown) : value is OpenAiChatCompletionResponseDTO {
    return (
        isRegularObject(value)
        && hasNoOtherKeys(value, [
            'id',
            'object',
            'created',
            'model',
            'choices',
            'usage',
            'system_fingerprint',
            'warning'
        ])
        && isString(value?.id)
        && isString(value?.object)
        && isNumber(value?.created)
        && isString(value?.model)
        && isArrayOf<OpenAiChatCompletionResponseChoice|OpenAiError>(value?.choices, isOpenAiChatCompletionResponseChoice)
        && isOpenAiCompletionResponseUsage(value?.usage)
        && isStringOrNull(value?.system_fingerprint)
        && isStringOrUndefined(value?.warning)
    );
}

/**
 * Explain why a value is not a valid OpenAiChatCompletionResponseDTO object.
 *
 * @param {any} value - The value to check.
 * @returns {string} A human-readable string explaining why the value is not a valid OpenAiChatCompletionResponseDTO object.
 */
export function explainOpenAiChatCompletionResponseDTO (value: any) : string {
    return explain(
        [
            explainRegularObject(value),
            explainNoOtherKeys(value, [
                'id',
                'object',
                'created',
                'model',
                'choices',
                'usage',
                'system_fingerprint',
                'warning'
            ])
            , explainProperty("id", explainString(value?.id))
            , explainProperty("object", explainString(value?.object))
            , explainProperty("created", explainNumber(value?.created))
            , explainProperty("model", explainString(value?.model))
            , explainProperty("choices", explainArrayOf<OpenAiChatCompletionResponseChoice|OpenAiError>(
            "OpenAiChatCompletionResponseChoice|OpenAiError",
            explainOpenAiChatCompletionResponseChoice,
            value?.choices,
            isOpenAiChatCompletionResponseChoice
        ))
            , explainProperty("usage", explainOpenAiCompletionResponseUsage(value?.usage))
            ,explainProperty("system_fingerprint", explainStringOrNull(value?.system_fingerprint))
            , explainProperty("warning", explainStringOrUndefined(value?.warning))
        ]
    );
}

/**
 * Convert the given `OpenAiChatCompletionResponseDTO` object to a string.
 *
 * @param {OpenAiChatCompletionResponseDTO} value - The value to convert.
 * @returns {string} A string representation of the `OpenAiChatCompletionResponseDTO` object.
 */
export function stringifyOpenAiChatCompletionResponseDTO (value : OpenAiChatCompletionResponseDTO) : string {
    return `OpenAiChatCompletionResponseDTO(${JSON.stringify(value)})`;
}

/**
 * Attempt to parse the given value as an `OpenAiChatCompletionResponseDTO` object.
 *
 * @param {unknown} value - The value to parse.
 * @returns {OpenAiChatCompletionResponseDTO|undefined} The parsed `OpenAiChatCompletionResponseDTO` object, or `undefined` if the value is not a valid `OpenAiChatCompletionResponseDTO` object.
 */
export function parseOpenAiChatCompletionResponseDTO (value: unknown) : OpenAiChatCompletionResponseDTO | undefined {
    if (isString(value)) {
        if (startsWith(value, "OpenAiChatCompletionResponseDTO(")) {
            value = value.substring("OpenAiChatCompletionResponseDTO(".length, value.length -1 );
        }
        value = parseJson(value);
    }
    if (isOpenAiChatCompletionResponseDTO(value)) return value;
    return undefined;
}
