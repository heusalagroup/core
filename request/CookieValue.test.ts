// Copyright (c) 2023. Heusala Group Oy <info@hg.fi>. All rights reserved.

import 'reflect-metadata';
import {CookieValue} from './CookieValue';

// Mocking the CookieUtils for testing purposes
jest.mock('./utils/CookieUtils');


describe('CookieValue Decorator', () => {
    class TestController {
        @CookieValue('testCookie')
        testMethod(cookieValue: string): string {
            return cookieValue;
        }

        @CookieValue('testCookieObject')
        testMethodObject(cookie: any): any {
            return cookie;
        }
    }

    it('should extract string cookie value', () => {
        const controller = new TestController();
        const cookieString = 'testCookie=testValue';
        const result = controller.testMethod(cookieString);
        expect(result).toBe('testValue');
    });

    it('should extract cookie object', () => {
        const controller = new TestController();
        const cookieObject = {name: 'testCookieObject', value: 'objectValue'};
        const cookieString = `${cookieObject.name}=${cookieObject.value}`;
        const result = controller.testMethodObject(cookieString);
        expect(result).toEqual(cookieObject);
    });

    it('should throw an error for missing cookie', () => {
        const controller = new TestController();
        const invalidCookieString = 'invalidCookie=invalidValue';
        expect(() => controller.testMethod(invalidCookieString)).toThrowError(
            "Cookie 'testCookie' not found."
        );
    });
});
