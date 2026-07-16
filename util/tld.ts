import { TranslateError } from '../errors.js';

const supportedGoogleTlds = new Set([
    'ca',
    'cn',
    'co.in',
    'co.jp',
    'co.kr',
    'co.nz',
    'co.uk',
    'com',
    'com.au',
    'com.br',
    'com.mx',
    'de',
    'es',
    'fr',
    'it',
    'nl',
    'pl',
    'pt',
    'ru'
]);

export const validateGoogleTld = (value = 'com'): string => {
    const tld = value.toLowerCase();
    if (!supportedGoogleTlds.has(tld)) {
        throw new TranslateError(`The Google Translate TLD '${value}' is not supported`, 400);
    }
    return tld;
};
