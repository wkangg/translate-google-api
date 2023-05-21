import fetch from 'node-fetch';
import { generateToken } from './util/token.js';
import { isSupported, getCode } from './util/language.js';

export const translate = async (text, options = {}) => {
  let error;
  [ options.from, options.to ].forEach(lang => {
    if (lang && !isSupported(lang)) {
      error = new Error(`The language '${lang}' is not supported`);
      error.code = 400;
      throw error;
    }
  });

  options.from = Object.hasOwn(options, 'from') ? getCode(options.from) : 'auto';
  options.to = Object.hasOwn(options, 'to') ? getCode(options.to) : 'en';

  const tld = options.tld ?? 'com';

  const token = await generateToken(text, { tld });
  const params = {
    client: options.client ?? 'gtx',
    sl: options.from ?? 'auto',
    tl: options.to ?? 'en',
    hl: options.to ?? 'en',
    ie: 'UTF-8',
    oe: 'UTF-8',
    otf: 1,
    ssel: 0,
    tsel: 0,
    kc: 7,
    q: text,
    [token.name]: token.value
  };

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json, text/plain, */*',
    'X-Requested-With': 'XMLHttpRequest'
  };

  const url = new URL(`https://translate.google.${tld}/translate_a/single`);
  url.search = new URLSearchParams(params);
  [ 'at', 'bd', 'ex', 'ld', 'md', 'qca', 'rw', 'rm', 'ss', 't' ].forEach(param => url.searchParams.append('dt', param));

  return fetch(url, { method: 'POST', headers })
    .then(res => res.json())
    .then(body => {
      if (options.raw) return body;

      const result = {
        text: '',
        from: {
          language: {
            iso: ''
          },
          text: {
            value: ''
          }
        }
      };
    
      body[0].forEach(obj => {
        if (obj[0]) result.text += obj[0];
      });
    
      result.from.language.iso = body[2];
      
      if (body[2] !== body[8][0][0])
        result.from.language.didYouMean = body[8][0][0];
    
      if (body[7] && body[7][0]) {
        result.from.text.value = body[7][0]
          .replaceAll('<b><i>', '[')
          .replaceAll('</i></b>', ']');
    
        body[7][5] === true ? result.from.text.autoCorrected = true : result.from.text.didYouMean = true;
      }
    
      return result;
    });
};


export { langs, getCode, isSupported } from './util/language.js';