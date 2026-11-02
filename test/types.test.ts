import { expectTypeOf, test } from 'bun:test';

import { translate, type TranslateOptions, type TranslationResult } from '../index.js';

// Never called: `tsc` checks these assertions, so no request is made
const assertOverloads = (options: TranslateOptions) => {
    expectTypeOf(translate('Hello')).toEqualTypeOf<Promise<TranslationResult>>();
    expectTypeOf(translate('Hello', { to: 'fr' })).toEqualTypeOf<Promise<TranslationResult>>();
    expectTypeOf(translate('Hello', { raw: false })).toEqualTypeOf<Promise<TranslationResult>>();
    expectTypeOf(translate('Hello', { raw: true })).toEqualTypeOf<Promise<unknown>>();
    expectTypeOf(translate('Hello', options)).toEqualTypeOf<Promise<unknown>>();
};

test('translate overloads are type-checked by tsc', () => {
    expectTypeOf(assertOverloads).toBeFunction();
});
