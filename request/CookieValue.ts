// Copyright (c) 2023. Heusala Group Oy <info@hg.fi>. All rights reserved.

import 'reflect-metadata';
import {CookieUtils} from './utils/CookieUtils';
import {CookieLike} from './types/CookieLike';

export const CookieValue = (cookieName: string): MethodDecorator => {
    return (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
        const originalMethod = descriptor.value;

        descriptor.value = function (...args: any[]): any {
            const cookies = CookieUtils.parseCookies(args[0]) || []; // Default to an empty array if cookies is undefined

            const paramName =
                Reflect.getMetadata('design:paramtypes', target, propertyKey)?.[0]?.name;

            const cookie = cookies.find((c: CookieLike) => c.getName() === cookieName);

            if (!cookie) {
                throw new Error(`Cookie '${cookieName}' not found.`);
            }

            switch (paramName) {
                case 'String':
                    args[0] = cookie.getValue();
                    break;
                case 'CookieLike':
                default:
                    args[0] = cookie;
                    break;
            }

            return originalMethod.apply(this, args);
        };
    };
};
