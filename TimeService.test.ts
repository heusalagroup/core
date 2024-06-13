import {TimeService} from "./TimeService";

describe('TimeService', () => {
    it('can test getCurrentTimeString', () => {
        const now = new Date();
        const currentTimeString = now.toISOString();

        expect(TimeService.getCurrentTimeString()).toBeTruthy();
        expect(parseInt(TimeService.getCurrentTimeString())).toBeGreaterThanOrEqual(parseInt(currentTimeString));
        expect.assertions(2)

    });

    it('can test getTimeAfterMonths', () => {
        const now = new Date();
        const currentTimeString = now.toISOString();

        expect(TimeService.getTimeAfterMonths(currentTimeString, 12)).toBeTruthy();

    });
});