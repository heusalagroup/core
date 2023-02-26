// Copyright (c) 2023. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import { explainWpPageStatus, isWpPageStatus, WpPageStatus } from "./WpPageStatus";
import { explainString, explainStringOrNull, isString, isStringOrNull } from "../../types/String";
import { explainRegularObject, isRegularObject } from "../../types/RegularObject";
import { explainNoOtherKeys, explainNoOtherKeysInDevelopment, hasNoOtherKeysInDevelopment } from "../../types/OtherKeys";
import { explainReadonlyJsonObject, isReadonlyJsonObject, ReadonlyJsonObject } from "../../Json";
import { explain, explainProperty } from "../../types/explain";
import { explainWpRenderedDTO, isWpRenderedDTO, WpRenderedDTO } from "./WpRenderedDTO";
import { explainNumber, isNumber } from "../../types/Number";

/**
 * Wordpress API page object for /wp-json/wp/v2/pages
 */
export interface WordpressPageDTO {
    readonly title : WpRenderedDTO;
    readonly content : WpRenderedDTO;
    readonly excerpt : WpRenderedDTO;
    readonly type : string;
    readonly id : string;
    readonly date : string | null;
    readonly status : WpPageStatus;
    readonly generated_slug : string;
    readonly permalink_template : string;
    readonly parent : number;
    readonly author : number;
    readonly featured_media : number;
    readonly comment_status : string;
    readonly ping_status : string;
    readonly menu_order : number;
    readonly meta : ReadonlyJsonObject;
    readonly template : string;
    readonly password : string;
    readonly date_gmt : string | null;
    readonly slug : string;
}

export function isWordpressPageDTO (value:any): value is WordpressPageDTO {
    return (
        isRegularObject(value)
        && hasNoOtherKeysInDevelopment(value, [
            'title',
            'content',
            'excerpt',
            'type',
            'id',
            'date',
            'status',
            'generated_slug',
            'permalink_template',
            'parent',
            'author',
            'featured_media',
            'comment_status',
            'ping_status',
            'menu_order',
            'meta',
            'template',
            'password',
            'date_gmt',
            'slug'
        ])
        && isWpRenderedDTO(value?.title)
        && isWpRenderedDTO(value?.content)
        && isWpRenderedDTO(value?.excerpt)
        && isString(value?.type)
        && isString(value?.id)
        && isStringOrNull(value?.date)
        && isWpPageStatus(value?.status)
        && isString(value?.generated_slug)
        && isString(value?.permalink_template)
        && isNumber(value?.parent)
        && isNumber(value?.author)
        && isNumber(value?.featured_media)
        && isString(value?.comment_status)
        && isString(value?.ping_status)
        && isNumber(value?.menu_order)
        && isReadonlyJsonObject(value?.meta)
        && isString(value?.template)
        && isString(value?.password)
        && isStringOrNull(value?.date_gmt)
        && isString(value?.slug)
    )
}

export function explainWordpressPageDTO (value: any) : string {
    return explain(
        [
            explainRegularObject(value),
            explainNoOtherKeysInDevelopment(value, [
                'title',
                'content',
                'excerpt',
                'type',
                'id',
                'date',
                'status',
                'generated_slug',
                'permalink_template',
                'parent',
                'author',
                'featured_media',
                'comment_status',
                'ping_status',
                'menu_order',
                'meta',
                'template',
                'password',
                'date_gmt',
                'slug'
            ])
            , explainProperty("title", explainWpRenderedDTO(value?.title))
            , explainProperty("content", explainWpRenderedDTO(value?.content))
            , explainProperty("excerpt", explainWpRenderedDTO(value?.excerpt))
            , explainProperty("type", explainString(value?.type))
            , explainProperty("id", explainString(value?.id))
            , explainProperty("date", explainStringOrNull(value?.date))
            , explainProperty("status", explainWpPageStatus(value?.status))
            , explainProperty("generated_slug", explainString(value?.generated_slug))
            , explainProperty("permalink_template", explainString(value?.permalink_template))
            , explainProperty("parent", explainNumber(value?.parent))
            , explainProperty("author", explainNumber(value?.author))
            , explainProperty("featured_media", explainNumber(value?.featured_media))
            , explainProperty("comment_status", explainString(value?.comment_status))
            , explainProperty("ping_status", explainString(value?.ping_status))
            , explainProperty("menu_order", explainNumber(value?.menu_order))
            , explainProperty("meta", explainReadonlyJsonObject(value?.meta))
            , explainProperty("template", explainString(value?.template))
            , explainProperty("password", explainString(value?.password))
            , explainProperty("date_gmt", explainStringOrNull(value?.date_gmt))
            , explainProperty("slug", explainString(value?.slug))
        ]
    );
}
