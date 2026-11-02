import { describe, expect, test } from 'bun:test';

import { getCode, isSupported, langs } from '../index.js';

describe('language helpers', () => {
    test('resolves names and codes without case sensitivity', () => {
        expect(getCode('French')).toBe('fr');
        expect(getCode('FRENCH')).toBe('fr');
        expect(getCode('FR')).toBe('fr');
    });

    test('reports unsupported languages', () => {
        expect(getCode('Klingon')).toBeUndefined();
        expect(isSupported('Klingon')).toBeFalse();
        expect(isSupported('zh-CN')).toBeTrue();
    });

    test('exports the language map', () => {
        expect(langs.English).toBe('en');
        expect(langs['Baoulé']).toBe('bci');
    });

    test('returns undefined for empty input', () => {
        expect(getCode('')).toBeUndefined();
        expect(isSupported('')).toBeFalse();
    });

    test('resolves hyphenated codes case-insensitively', () => {
        expect(getCode('zh-cn')).toBe('zh-CN');
        expect(getCode('ZH-CN')).toBe('zh-CN');
    });

    test('accepts modern ISO codes for languages Google lists under legacy codes', () => {
        expect(getCode('he')).toBe('iw');
        expect(getCode('jv')).toBe('jw');
        expect(getCode('zh')).toBe('zh-CN');
        expect(getCode('FIL')).toBe('tl');
    });

    test('prefers codes over names in case-insensitive lookups', () => {
        expect(getCode('ga')).toBe('ga');
        expect(getCode('GA')).toBe('ga');
        expect(getCode('Ga')).toBe('gaa');
        expect(getCode('Irish')).toBe('ga');
    });

    test('does not resolve inherited object properties', () => {
        expect(getCode('constructor')).toBeUndefined();
        expect(getCode('__proto__')).toBeUndefined();
    });

    test('resolves language names containing parentheses regardless of case', () => {
        expect(getCode('Chinese (Simplified)')).toBe('zh-CN');
        expect(getCode('chinese (simplified)')).toBe('zh-CN');
    });
});
