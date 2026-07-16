import { describe, expect, test } from 'bun:test';

import { TranslateError } from '../errors.js';

describe('TranslateError', () => {
    test('exposes the message, name, and a numeric code', () => {
        const error = new TranslateError("The language 'xx' is not supported", 400);

        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(TranslateError);
        expect(error.name).toBe('TranslateError');
        expect(error.message).toBe("The language 'xx' is not supported");
        expect(error.code).toBe(400);
    });

    test('supports the BAD_NETWORK string code', () => {
        const error = new TranslateError('Unable to reach Google Translate', 'BAD_NETWORK');

        expect(error.code).toBe('BAD_NETWORK');
    });

    test('supports the BAD_RESPONSE string code', () => {
        const error = new TranslateError('Google Translate returned an invalid response', 'BAD_RESPONSE');

        expect(error.code).toBe('BAD_RESPONSE');
    });

    test('preserves the original error via the cause option', () => {
        const cause = new Error('socket hang up');
        const error = new TranslateError('Unable to reach Google Translate', 'BAD_NETWORK', { cause });

        expect(error.cause).toBe(cause);
    });

    test('has no cause when none is provided', () => {
        const error = new TranslateError('Google Translate returned an invalid response', 'BAD_RESPONSE');

        expect(error.cause).toBeUndefined();
    });

    test('is throwable and catchable as a typed error', () => {
        const throwError = () => {
            throw new TranslateError('boom', 'BAD_RESPONSE');
        };

        expect(throwError).toThrow(TranslateError);
        expect(throwError).toThrow('boom');
    });

    test('stores an arbitrary numeric HTTP-style code', () => {
        const error = new TranslateError('rate limited', 429);

        expect(error.code).toBe(429);
        expect(typeof error.code).toBe('number');
    });
});