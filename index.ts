import { generateToken } from './util/token.js';
import { getCode, isSupported } from './util/language.js';
import { TranslateError } from './errors.js';

export interface TranslateOptions {
    client?: string;
    from?: string;
    raw?: boolean;
    tld?: string;
    to?: string;
}

export interface TranslationResult {
    text: string;
    from: {
        language: {
            iso: string;
            didYouMean?: string;
        };
        text: {
            value: string;
            autoCorrected?: boolean;
            didYouMean?: boolean;
        };
    };
}

const getArray = (value: unknown): unknown[] => Array.isArray(value) ? value : [];

const parseResponse = (body: unknown[]): TranslationResult => {
    const segments = getArray(body[0]);
    const detectedLanguage = typeof body[2] === 'string' ? body[2] : '';
    const correction = getArray(body[7]);
    const suggestedLanguages = getArray(getArray(body[8])[0]);
    const suggestedLanguage = suggestedLanguages[0];
    const result: TranslationResult = {
        text: segments
            .map(segment => getArray(segment)[0])
            .filter((value): value is string => typeof value === 'string')
            .join(''),
        from: {
            language: { iso: detectedLanguage },
            text: { value: '' }
        }
    };

    if (typeof suggestedLanguage === 'string' && detectedLanguage !== suggestedLanguage) {
        result.from.language.didYouMean = suggestedLanguage;
    }

    if (typeof correction[0] === 'string') {
        result.from.text.value = correction[0]
            .replaceAll('<b><i>', '[')
            .replaceAll('</i></b>', ']');
        if (correction[5] === true) result.from.text.autoCorrected = true;
        else result.from.text.didYouMean = true;
    }

    return result;
};

export async function translate(text: string): Promise<TranslationResult>;
export async function translate(text: string, options: TranslateOptions & { raw: true }): Promise<unknown>;
export async function translate(text: string, options: TranslateOptions & { raw?: false }): Promise<TranslationResult>;
export async function translate(text: string, options: TranslateOptions): Promise<unknown>;
/**
 * Translates text using Google Translate.
 *
 * @param text - The text to translate
 * @param options - Translation settings, including source and target languages, regional domain, client, and raw response mode
 * @returns The structured translation result, or the unprocessed response when `options.raw` is `true`
 * @throws `TranslateError` if a language is unsupported, the request fails, Google Translate returns an unsuccessful status, or the response has an invalid format
 */
export async function translate(text: string, options: TranslateOptions = {}): Promise<unknown> {
    for (const language of [options.from, options.to]) {
        if (language && !isSupported(language)) {
            throw new TranslateError(`The language '${language}' is not supported`, 400);
        }
    }

    const from = options.from ? getCode(options.from) : 'auto';
    const to = options.to ? getCode(options.to) : 'en';
    const tld = options.tld ?? 'com';
    const token = await generateToken(text, { tld });
    const parameters = new URLSearchParams({
        client: options.client ?? 'gtx',
        sl: from ?? 'auto',
        tl: to ?? 'en',
        hl: to ?? 'en',
        ie: 'UTF-8',
        oe: 'UTF-8',
        otf: '1',
        ssel: '0',
        tsel: '0',
        kc: '7',
        q: text,
        [token.name]: token.value
    });

    for (const parameter of ['at', 'bd', 'ex', 'ld', 'md', 'qca', 'rw', 'rm', 'ss', 't']) {
        parameters.append('dt', parameter);
    }

    const url = new URL(`https://translate.google.${tld}/translate_a/single`);
    url.search = parameters.toString();

    let response: Response;
    try {
        response = await fetch(url, {
            method: 'POST',
            headers: {
                accept: 'application/json, text/plain, */*',
                'content-type': 'application/json',
                'x-requested-with': 'XMLHttpRequest'
            }
        });
    } catch (error) {
        throw new TranslateError('Unable to reach Google Translate', 'BAD_NETWORK', { cause: error });
    }

    if (!response.ok) {
        throw new TranslateError(`Google Translate returned HTTP ${response.status}`, 'BAD_RESPONSE');
    }

    const body: unknown = await response.json();
    if (options.raw) return body;
    if (!Array.isArray(body)) {
        throw new TranslateError('Google Translate returned an invalid response', 'BAD_RESPONSE');
    }

    return parseResponse(body);
}

export { getCode, isSupported, langs } from './util/language.js';
export { TranslateError, type TranslateErrorCode } from './errors.js';
