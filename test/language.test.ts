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
});
