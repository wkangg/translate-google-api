# @william5553/translate-google-api

Forked from [Binhluan1234/translate-google-api](https://github.com/Binhluan1234/translate-google-api)

A free and unlimited API for Google Translate  💵🚫
# Feature

- Auto language detection
- Language correction
- Fast and reliable – it uses the same servers that [translate.google.com](https://translate.google.com/) uses
- Free and unlimited (translate.google.com uses a token to authorize the requests. If you are not Google, you do not have this token and will have to pay [$20 per 1 million characters of text](https://cloud.google.com/translate/v2/pricing))
- Supports: React, React-Native, Node.js ...

# Install

```shell
npm install --save @william5553/translate-google-api
```

# Usage

```javascript
const { translate } = await import('@william5553/translate-google-api');
const result = await translate('What time is it?', {
  to: 'fr'
});
```
Returns
```json
{
   "text": "Quelle heure est-il?",
   "from": {
      "language": {
         "didYouMean": false,
         "iso": "en"
      },
      "text": {
         "value": ""
      }
   }
}
```

# API

## translate(text, options)

### text

Type: `string`

The text to be translated

### options

Type: object

**from**
Type: `string` Default: auto

The text language. Must be auto or one of the codes/names (not case sensitive) contained in util/languages.js

**to**
Type: `string` Default: en

The language in which the text should be translated. Must be one of the codes/names (not case-sensitive) contained in util/languages.js.

**raw**
Type: `boolean` Default: false

Whether to return the raw response from Google Translate.

**tld**
Type: `string` Default: com

The TLD for Google Translate. (ex. translate.google.**com**)