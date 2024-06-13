import { PhoneNumberUtils } from './PhoneNumberUtils';

describe('PhoneNumberUtils', () => {
    describe('getTelLink', () => {
        it('should return the tel link with the provided phone number and default country code', () => {
            const phone = '123456789';
            const expectedTelLink = 'tel:+358123456789';

            expect(PhoneNumberUtils.getTelLink(phone)).toBe(expectedTelLink);

        });

        it('should return the tel link with the provided phone number and custom country code', () => {
            const phone = '987654321';
            const countryCode = '+1';
            const expectedTelLink = 'tel:+1987654321';
            const telLink = PhoneNumberUtils.getTelLink(phone, countryCode);

            expect(telLink).toBe(expectedTelLink);

        });
    });

    describe('getTelLabel', () => {
        it('should return the phone number with leading non-numeric characters removed', () => {
            const phone = '+358 123-456-789';
            const expectedTelLabel = '+358 123456789';
            const telLabel = PhoneNumberUtils.getTelLabel(phone);

            expect(telLabel).toBe(expectedTelLabel);

        });
    });

    describe('validatePhoneNumber', () => {
        it('should return true for a valid phone number', () => {
            const phone = '+358123456789';
            const isValid = PhoneNumberUtils.validatePhoneNumber(phone);

            expect(isValid).toBe(true);

        });

        it('should return false for an invalid phone number', () => {
            const phone = '123';
            const isValid = PhoneNumberUtils.validatePhoneNumber(phone);

            expect(isValid).toBe(false);

        });
    });
});