# @william5553/translate-google-api

Forked from [Binhluan1234/translate-google-api](https://github.com/Binhluan1234/translate-google-api)

A free and unlimited API for Google Translate  💵🚫
# Feature

- Multi-segment text support
- Auto language detection
- Language correction
- Fast and reliable – it uses the same servers that [translate.google.com](https://translate.google.com/) uses
- Free and unlimited (translate.google.com uses a token to authorize the requests. If you are not Google, you do not have this token and will have to pay [$20 per 1 million characters of text](https://cloud.google.com/translate/v2/pricing))
- Supports: ReactJs, React-Native, NodeJs ...

# Install

```shell
npm install --save @william5553/translate-google-api
```

# Usage

Single-segment
```javascript
const translate = require('@william5553/translate-google-api');
const result = await translate('What time is it?', {
  to: 'fr'
});
// Quelle heure est-il?
```

Proxy

[Configuring the proxy](https://github.com/axios/axios#request-config)
```javascript
const result = await translate('How are you?', {
  to: 'fr',
  proxy: {
    host: '127.0.0.1',
    port: 6969,
    auth: {
      username: 'username',
      password: 'password'
    }
  }
});
```

# API

## translate(text, options)

### text

Type: `string`, `array`

The text to be translated

### options

Type: object

**from？**
Type: `string` Default: auto

The text language. Must be auto or one of the codes/names (not case sensitive) contained in src/languages.ts

**to**
Type: `string` Default: en

The language in which the text should be translated. Must be one of the codes/names (not case-sensitive) contained in src/languages.ts.

**tld**
Type: `string` 'com' | 'cn' <Default 'com'>

**proxy**
Type: `AxiosProxyConfig`

proxy for request.

**config**
Type: `object`

config for [axios](https://github.com/axios/axios)
