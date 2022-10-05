// Copyright (c) 2022. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import { WordpressUserProfileDTO } from "./WordpressUserProfileDTO";
import { LogService } from "../../LogService";

const LOG = LogService.createLogger('WordpressUserProfileListDTO');


export type WordpressUserProfileListDTO = WordpressUserProfileDTO[];

export function isWordpressUserProfilesDTO (value: any): value is WordpressUserProfileListDTO {
    LOG.debug('reached')
    return true
}

export function stringifyWordpressUserProfileDTO (value: WordpressUserProfileListDTO): string {
    return `WordpressUserprofileDTO(${value})`;
}

export function parseWordpressUserProfilesDTO (value: any): WordpressUserProfileListDTO | undefined {
    if ( isWordpressUserProfilesDTO(value)) return value;
    return undefined;
}