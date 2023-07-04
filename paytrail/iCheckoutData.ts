// Copyright (c) 2023. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import { iCheckoutItem } from "./iCheckoutItem";

export interface iCheckoutData {
    getStamp(): string;
    getReference(): string;
    getMessage(): string;
    getReturnURL(): string;
    getDelayedURL(): string;
    getAmount(): number;
    getDeliveryDate(): string;
    getFirstName(): string;
    getFamilyName(): string;
    getAddress(): string;
    getPostCode(): string;
    getPostOffice(): string;
    getEmail(): string;
    getPhone(): string;
    getItems(): iCheckoutItem[];
    getVatId(): string;
    isCompany(): boolean;
    getCompany(): string;
}
