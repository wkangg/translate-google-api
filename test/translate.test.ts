import { afterEach, describe, expect, mock, test } from 'bun:test';

import { translate, TranslateError } from '../index.js';

const originalFetch = globalThis.fetch;
const currentHour = Math.floor(Date.now() / 3_600_000);

const responseBody = [
    [['Bonjour', 'Hello', undefined, undefined, 1]],
    undefined,
    'en',
    undefined,
    undefined,
    undefined,
    undefined,
    ['<b><i>Hello</i></b>', undefined, undefined, undefined, undefined, true],
    [['fr']]
];

const installFetch = (translationResponse: Response) => {
    const fetchMock = mock((input: string | URL | Request, _init?: RequestInit) => {
        void _init;
        const url = new URL(input instanceof Request ? input.url : input);
        if (url.pathname === '/') {
            return Promise.resolve(new Response(`tkk: '${currentHour}.0'`));
        }
        return Promise.resolve(translationResponse);
    });
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    return fetchMock;
};

const getRejection = async (promise: Promise<unknown>): Promise<unknown> => {
    try {
        await promise;
    } catch (error) {
        return error;
    }
    throw new Error('Expected promise to reject');
};

afterEach(() => {
    globalThis.fetch = originalFetch;
});

describe('translate', () => {
    test('rejects unsupported Google TLDs before making a request', async () => {
        const fetchMock = mock(() => Promise.resolve(new Response()));
        globalThis.fetch = fetchMock as unknown as typeof fetch;

        const error = await getRejection(translate('Hello', { tld: 'attacker.example' }));
        expect(error).toEqual(
            expect.objectContaining({ code: 400, name: 'TranslateError' })
        );
        expect(fetchMock).not.toHaveBeenCalled();
    });

    test('rejects an unusable token response', async () => {
        globalThis.fetch = mock(() => Promise.resolve(new Response('missing token'))) as unknown as typeof fetch;

        const error = await getRejection(translate('Hello'));
        expect(error).toEqual(
            expect.objectContaining({ code: 'BAD_RESPONSE', name: 'TranslateError' })
        );
    });

    test('translates text and parses correction metadata', async () => {
        const fetchMock = installFetch(Response.json(responseBody));
        const options = { from: 'English', to: 'French', tld: 'ca' };

        const result = await translate('Hello', options);

        expect(result).toEqual({
            text: 'Bonjour',
            from: {
                language: { iso: 'en', didYouMean: 'fr' },
                text: { value: '[Hello]', autoCorrected: true }
            }
        });
        expect(options).toEqual({ from: 'English', to: 'French', tld: 'ca' });

        const request = fetchMock.mock.calls
            .map(([input]) => new URL(input instanceof Request ? input.url : input))
            .find(url => url.pathname.endsWith('/translate_a/single'));
        expect(request?.hostname).toBe('translate.google.ca');
        expect(request?.searchParams.get('sl')).toBe('en');
        expect(request?.searchParams.get('tl')).toBe('fr');
        expect(request?.searchParams.get('q')).toBe('Hello');
        expect(request?.searchParams.get('tk')).toMatch(/^\d+\.\d+$/);
        expect(request?.searchParams.getAll('dt')).toHaveLength(10);
        const tokenRequest = fetchMock.mock.calls
            .find(([input]) => new URL(input instanceof Request ? input.url : input).pathname === '/');
        expect(tokenRequest?.[1]?.signal).toBeInstanceOf(AbortSignal);
    });

    test('returns the untouched response in raw mode', async () => {
        const raw = { arbitrary: ['response'] };
        installFetch(Response.json(raw));

        const result = await translate('Hello', { raw: true });
        expect(result).toEqual(raw);
    });

    test('rejects unsupported languages before making a request', async () => {
        const fetchMock = mock(() => Promise.resolve(new Response()));
        globalThis.fetch = fetchMock as unknown as typeof fetch;

        const error = await getRejection(translate('nuqneH', { to: 'Klingon' }));
        expect(error).toEqual(
            expect.objectContaining({ code: 400, name: 'TranslateError' })
        );
        expect(fetchMock).not.toHaveBeenCalled();
    });

    test('reports HTTP failures with a typed error', async () => {
        installFetch(new Response('unavailable', { status: 503 }));

        const error = await getRejection(translate('Hello'));
        expect(error).toEqual(
            expect.objectContaining({ code: 'BAD_RESPONSE', name: 'TranslateError' })
        );
    });

    test('reports JSON decoding failures with a typed error', async () => {
        installFetch(new Response('{', { headers: { 'content-type': 'application/json' } }));

        const error = await getRejection(translate('Hello'));
        expect(error).toEqual(
            expect.objectContaining({ code: 'BAD_RESPONSE', name: 'TranslateError' })
        );
    });

    test('rejects responses without translation segments', async () => {
        installFetch(Response.json([[]]));

        const error = await getRejection(translate('Hello'));
        expect(error).toEqual(
            expect.objectContaining({ code: 'BAD_RESPONSE', name: 'TranslateError' })
        );
    });

    test('reports network failures with a typed error', async () => {
        globalThis.fetch = mock(() => Promise.reject(new Error('offline'))) as unknown as typeof fetch;

        try {
            await translate('Hello');
            throw new Error('Expected translate to reject');
        } catch (error) {
            expect(error).toBeInstanceOf(TranslateError);
            expect((error as TranslateError).code).toBe('BAD_NETWORK');
        }
    });

    test('uses default options when none are provided', async () => {
        const fetchMock = installFetch(Response.json(responseBody));

        await translate('Hello');

        const request = fetchMock.mock.calls
            .map(([input]) => new URL(input instanceof Request ? input.url : input))
            .find(url => url.pathname.endsWith('/translate_a/single'));
        expect(request?.hostname).toBe('translate.google.com');
        expect(request?.searchParams.get('sl')).toBe('auto');
        expect(request?.searchParams.get('tl')).toBe('en');
        expect(request?.searchParams.get('hl')).toBe('en');
        expect(request?.searchParams.get('client')).toBe('gtx');
    });

    test('forwards a custom client option', async () => {
        const fetchMock = installFetch(Response.json(responseBody));

        await translate('Hello', { client: 'te' });

        const request = fetchMock.mock.calls
            .map(([input]) => new URL(input instanceof Request ? input.url : input))
            .find(url => url.pathname.endsWith('/translate_a/single'));
        expect(request?.searchParams.get('client')).toBe('te');
    });

    test('rejects unsupported source languages before making a request', async () => {
        const fetchMock = mock(() => Promise.resolve(new Response()));
        globalThis.fetch = fetchMock as unknown as typeof fetch;

        const error = await getRejection(translate('Hello', { from: 'Klingon' }));
        expect(error).toEqual(
            expect.objectContaining({ code: 400, name: 'TranslateError' })
        );
        expect(fetchMock).not.toHaveBeenCalled();
    });

    test('omits optional correction fields when there is no suggestion', async () => {
        const body = [
            [['Bonjour']],
            undefined,
            'fr',
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            [['fr']]
        ];
        installFetch(Response.json(body));

        const result = await translate('Bonjour', { to: 'French' });

        expect(result).toEqual({
            text: 'Bonjour',
            from: {
                language: { iso: 'fr' },
                text: { value: '' }
            }
        });
    });

    test('flags a spelling suggestion that was not auto-corrected', async () => {
        const body = [
            [['Hello']],
            undefined,
            'en',
            undefined,
            undefined,
            undefined,
            undefined,
            ['<b><i>Hello</i></b>', undefined, undefined, undefined, undefined, false],
            [['en']]
        ];
        installFetch(Response.json(body));

        const result = await translate('Helo');

        expect(result.from.text).toEqual({ value: '[Hello]', didYouMean: true });
    });

    test('throws a typed error when the parsed response is not an array', async () => {
        installFetch(Response.json({ unexpected: true }));

        const error = await getRejection(translate('Hello'));
        expect(error).toEqual(
            expect.objectContaining({ code: 'BAD_RESPONSE', name: 'TranslateError' })
        );
    });

    test('returns the raw response even when the body is malformed', async () => {
        const malformed = { unexpected: true };
        installFetch(Response.json(malformed));

        const result = await translate('Hello', { raw: true });
        expect(result).toEqual(malformed);
    });
});
