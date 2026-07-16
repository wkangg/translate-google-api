import { TranslateError } from '../errors.js';

interface TokenOptions {
    tld?: string;
}

interface Token {
    name: 'tk';
    value: string;
}

const tokenState = { tkk: '0' };

const transform = (value: number, seed: string): number => {
    for (let index = 0; index < seed.length - 2; index += 3) {
        const character = seed[index + 2] ?? '0';
        const amount = character >= 'a' ? character.codePointAt(0)! - 87 : Number(character);
        const shifted = seed[index + 1] === '+' ? value >>> amount : value << amount;
        value = seed[index] === '+' ? value + shifted & 0xFFFFFFFF : value ^ shifted;
    }
    return value;
};

const calculateToken = (text: string): string => {
    const [hours = '0', salt = '0'] = tokenState.tkk.split('.', 2);
    const base = Number(hours) || 0;
    let value = base;

    const bytes = new TextEncoder().encode(text);
    for (const byte of bytes) {
        value += byte;
        value = transform(value, '+-a^+6');
    }

    value = transform(value, '+-3^+b+-f');
    value ^= Number(salt) || 0;
    if (value < 0) value = (value & 0x7FFFFFFF) + 0x80000000;
    value %= 1_000_000;
    return `${value}.${value ^ base}`;
};

const updateTkk = async ({ tld = 'com' }: TokenOptions): Promise<void> => {
    const currentHour = Math.floor(Date.now() / 3_600_000);
    if (Number(tokenState.tkk.split('.', 1)[0]) === currentHour) return;

    try {
        const response = await fetch(`https://translate.google.${tld}/`);
        if (!response.ok) return;
        const html = await response.text();
        const match = /tkk:\s?'(.+?)'/i.exec(html);
        if (match?.[1]) tokenState.tkk = match[1];
    } catch (error) {
        throw new TranslateError('Unable to refresh the Google Translate token', 'BAD_NETWORK', { cause: error });
    }
};

export const generateToken = async (text: string, options: TokenOptions = {}): Promise<Token> => {
    await updateTkk(options);
    return { name: 'tk', value: calculateToken(text) };
};
