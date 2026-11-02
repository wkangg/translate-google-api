# @william5553/translate-google-api

A dependency-free, fully typed client for the same translation endpoint used by
[Google Translate](https://translate.google.com/). It supports automatic language detection,
spelling corrections, custom Google domains, and raw responses.

> This is an unofficial client. For applications that require a supported service-level
> agreement, use the official Google Cloud Translation API.

## Requirements

- Node.js 22 or newer, Bun, or another modern runtime with the Fetch API
- ESM

## Install

```shell
npm install @william5553/translate-google-api
```

## Usage

```ts
import { translate } from '@william5553/translate-google-api';

const result = await translate('What time is it?', { to: 'fr' });
console.log(result.text); // Quelle heure est-il ?
```

`translate()` returns:

```ts
interface TranslationResult {
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
```

## API

### `translate(text, options?)`

- `text` (`string`): text to translate.
- `options.from` (`string`, default `auto`): source language name or code.
- `options.to` (`string`, default `en`): target language name or code.
- `options.tld` (`string`, default `com`): Google Translate domain suffix, such as `ca`.
- `options.client` (`string`, default `gtx`): Google Translate client identifier.
- `options.raw` (`boolean`, default `false`): return Google's response without parsing it.
- `options.signal` (`AbortSignal`): cancels the request. If it aborts, `translate()` rejects
  with the signal's reason, for example `AbortSignal.timeout(5000)`.

Language names and codes are case-insensitive. The package also exports `langs`, `getCode`,
`isSupported`, and `TranslateError`.

```ts
import { getCode, isSupported, langs } from '@william5553/translate-google-api';

getCode('French'); // 'fr'
isSupported('fr'); // true
console.log(langs);
```

## Errors

`translate()` rejects with a `TranslateError` when an input is unsupported or the request fails.
Its `code` is:

- `400`: an unsupported language or Google domain, checked before any request is sent.
- `'BAD_NETWORK'`: Google Translate could not be reached. The original error is in `cause`.
- `'BAD_RESPONSE'`: Google returned an HTTP error (for example when rate limited), invalid JSON,
  or a response that could not be parsed.

If `options.signal` aborts, `translate()` rejects with the signal's reason instead, which is not a
`TranslateError`. For example, `AbortSignal.timeout()` rejects with a `TimeoutError` `DOMException`.

```ts
import { translate, TranslateError } from '@william5553/translate-google-api';

try {
    await translate('Hello', { to: 'es', signal: AbortSignal.timeout(5000) });
} catch (error) {
    if (error instanceof TranslateError) console.error(error.code, error.message);
    else throw error;
}
```
