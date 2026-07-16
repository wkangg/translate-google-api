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

Language names and codes are case-insensitive. The package also exports `langs`, `getCode`,
`isSupported`, and `TranslateError`.

```ts
import { getCode, isSupported, langs } from '@william5553/translate-google-api';

getCode('French'); // 'fr'
isSupported('fr'); // true
console.log(langs);
```
