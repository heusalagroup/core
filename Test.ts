// Copyright (c) 2020 Sendanor. All rights reserved.
//               2020 Jaakko Heusala <jheusala@iki.fi>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

import {
    isString,
    isNumber,
    isObject,
    isArray,
    keys,
    every
} from "./modules/lodash";

export class Test {

    static isString (value: any) : value is string {
        return isString(value);
    }

    static isNumber (value: any) : value is number {
        return isNumber(value);
    }

    /**
     * Test if it is an regular object (eg. all keys are strings).
     *
     * @param value
     */
    static isRegularObject (value: any) : value is { [name: string]: any } {
        return isObject(value) && !isArray(value) && every(keys(value), (key : any) => isString(key));
    }

    /**
     * Test if the value is an array
     *
     * @param value
     */
    static isArray (value: any) : value is Array<any> {
        return isArray(value);
    }

    static isPromise (value: any) : value is Promise<any> {
        // @ts-ignore
        return isObject(value) && !!value.then && !!value.catch;
    }

}

export default Test;
