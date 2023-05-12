// Copyright (c) 2023. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import { Entity } from "../../../Entity";

export interface MemoryItem {
    readonly id: string | number;
    value: Entity;
}

export function createMemoryItem (
    id: string | number,
    value: Entity
): MemoryItem {
    return {
        id,
        value
    };
}