import { afterEach, describe, expect, mock, spyOn, test } from 'bun:test';

import { TranslateError } from '../errors.js';
import { generateToken } from '../util/token.js';

const originalFetch = globalThis.fetch;

/**
 * Pins `Date.now()` to a specific hour bucket for the duration of `run`, so the
 * module-level token cache in `util/token.ts` can be deterministically forced
 * to either hit or miss regardless of test execution order.
 */
const withMockedHour = async <T>(hour: number, run: () => Promise<T>): Promise<T> => {
    const spy = spyOn(Date, 'now').mockImplementation(() => hour * 3_600_000);
    try {
        return await run();
    } finally {
        spy.mockRestore();
    }
};

afterEach(() => {
    globalThis.fetch = originalFetch;
});

describe('generateToken', () => {
    test('returns a tk token in "number.number" format', async () => {
        globalThis.fetch = mock(() => Promise.resolve(new Response("tkk: '999001.0'"))) as unknown as typeof fetch;

        const token = await generateToken('Hello');

        expect(token.name).toBe('tk');
        expect(token.value).toMatch(/^\d+\.-?\d+$/);
    });

    test('produces different token values for different input text', async () => {
        globalThis.fetch = mock(() => Promise.resolve(new Response("tkk: '999002.0'"))) as unknown as typeof fetch;

        const a = await generateToken('Hello');
        const b = await generateToken('World');

        expect(a.value).not.toBe(b.value);
    });

    test('requests the tkk seed from the configured tld', async () => {
        await withMockedHour(222222, async () => {
            const fetchMock = mock(() => Promise.resolve(new Response("tkk: '222222.0'")));
            globalThis.fetch = fetchMock as unknown as typeof fetch;

            await generateToken('Hi', { tld: 'de' });

            expect(fetchMock).toHaveBeenCalledTimes(1);
            const calls = fetchMock.mock.calls as unknown as [string | URL | Request][];
            const [input] = calls[0]!;
            const url = new URL(input instanceof Request ? input.url : input);
            expect(url.href).toBe('https://translate.google.de/');
        });
    });

    test('does not request a new seed within the same hour', async () => {
        await withMockedHour(111111, async () => {
            const fetchMock = mock(() => Promise.resolve(new Response("tkk: '111111.5'")));
            globalThis.fetch = fetchMock as unknown as typeof fetch;

            await generateToken('A');
            await generateToken('B');

            expect(fetchMock).toHaveBeenCalledTimes(1);
        });
    });

    test('requests a new seed once the hour changes', async () => {
        const fetchMock = mock(() => {
            const hour = Math.floor(Date.now() / 3_600_000);
            return Promise.resolve(new Response(`tkk: '${hour}.0'`));
        });
        globalThis.fetch = fetchMock as unknown as typeof fetch;

        await withMockedHour(333333, () => generateToken('A'));
        await withMockedHour(444444, () => generateToken('B'));

        expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    test('rejects with a TranslateError when the seed request fails due to a network error', async () => {
        await withMockedHour(555555, async () => {
            globalThis.fetch = mock(() => Promise.reject(new Error('offline'))) as unknown as typeof fetch;

            let thrown: unknown;
            try {
                await generateToken('Hello');
            } catch (error) {
                thrown = error;
            }

            expect(thrown).toBeInstanceOf(TranslateError);
            expect((thrown as TranslateError).code).toBe('BAD_NETWORK');
            expect((thrown as TranslateError).cause).toBeInstanceOf(Error);
        });
    });

    test('keeps working and retries later when the seed response is not ok', async () => {
        await withMockedHour(666666, async () => {
            const fetchMock = mock(() => Promise.resolve(new Response('rate limited', { status: 503 })));
            globalThis.fetch = fetchMock as unknown as typeof fetch;

            const first = await generateToken('Hello');
            const second = await generateToken('Hello');

            expect(first.name).toBe('tk');
            expect(second.name).toBe('tk');
            // A non-ok response never updates the cached seed, so every call
            // within the same hour keeps retrying instead of silently caching failure.
            expect(fetchMock).toHaveBeenCalledTimes(2);
        });
    });

    test('keeps working and retries later when the seed response has no tkk match', async () => {
        await withMockedHour(777777, async () => {
            const fetchMock = mock(() => Promise.resolve(new Response('<html>no token here</html>')));
            globalThis.fetch = fetchMock as unknown as typeof fetch;

            await generateToken('Hello');
            await generateToken('Hello');

            expect(fetchMock).toHaveBeenCalledTimes(2);
        });
    });
});