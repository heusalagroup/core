// Copyright (c) 2023. Heusala Group Oy <info@hg.fi>. All rights reserved.

import {CurrencyUtils} from "./CurrencyUtils";
import {createCurrencyRates, CurrencyRates} from "./types/CurrencyRates";
import {Currency} from "./types/Currency";


describe('CurrencyUtils', () => {

    const validRates: CurrencyRates = createCurrencyRates(1.2, 0.85);

    describe('stringifySum', () => {
        it('converts a number to a string with two decimal places', () => {
            expect(CurrencyUtils.stringifySum(1234.5678)).toEqual('1234.57');
        });
    });

    describe('getSum', () => {

        it('calculates the sum of price and amount considering a discount', () => {
            expect(CurrencyUtils.getSum(20, 5, 0.10)).toEqual(90);
        });

    });

    describe('getSumWithVat', () => {
        it('calculates the total sum including VAT and considering a discount', () => {
            expect(CurrencyUtils.getSumWithVat(20, 5, 0.1, 0.10)).toEqual(99);
        });
    });

    describe('getSumWithDiscount', () => {
        it('calculates the sum considering a discount', () => {
            expect(CurrencyUtils.getSumWithDiscount(200, 0.10)).toEqual(180);
        });
    });

    describe('getVatlessSum', () => {
        it('calculates the sum without VAT and considering a discount', () => {
            expect(CurrencyUtils.getVatlessSum(110, 0.1, 0.10)).toEqual(90);
        });
    });

    describe('roundByAccuracy', () => {
        it('rounds a number by a specified accuracy', () => {
            expect(CurrencyUtils.roundByAccuracy(1234.5678, 2)).toEqual(1234.57);
        });
    });

    describe('convertCurrencyAmount', () => {

        it('converts a currency amount from one currency to another', () => {
            expect(CurrencyUtils.convertCurrencyAmount(validRates, 100, Currency.EUR, Currency.USD, 2)).toEqual(120);
        });

        it('throws an error when to-currency is invalid', () => {
            expect(() => CurrencyUtils.convertCurrencyAmount(validRates, 100, Currency.EUR,
                // @ts-ignore
                'INVALID',
                2)).toThrow('CurrencyService: To: No exchange rate found: INVALID');
        });

        it('throws an error when from-currency is invalid', () => {
            expect(() => CurrencyUtils.convertCurrencyAmount(validRates, 100,
                // @ts-ignore
                'INVALID',
                Currency.USD, 2)).toThrow('CurrencyService: From: No exchange rate found: INVALID');
        });
    });

    describe('getCents', () => {
        it('converts a decimal number to cents', () => {
            expect(CurrencyUtils.getCents(1234.5678)).toEqual(123457);
        });
    });

});
