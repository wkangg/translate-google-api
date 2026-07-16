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

    test('resolves language names containing parentheses regardless of case', () => {
        expect(getCode('Chinese (Simplified)')).toBe('zh-CN');
        expect(getCode('chinese (simplified)')).toBe('zh-CN');
    });
});
