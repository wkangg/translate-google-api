const axios = require('axios');

const { get } = require('./token');
const { isSupported } = require('./language');
const { arrayStringify, parseMultiple } = require('./util');

module.exports = (data, options = {}) => {
  let e;

  options.from = options.from ?? 'auto';
  options.to = options.to ?? 'en';

  if (options.from && !isSupported(options.from))
    e = options.from;

  if (!isSupported(options.to))
    e = options.to;

  if (e) {
    const error = new Error(`The language ${e} is not supported`);
    error.code = 400;

    throw error;
  }

  const tld = options.tld || 'com';
  return get(data.join(''), { tld, proxy: options.proxy ?? false })
    .then(res => {
      const text = arrayStringify(data);
      const url = '/translate_a/single';
      const query = {
        client: options.client ?? 'gtx',
        sl: options.from,
        tl: options.to,
        hl: options.to,
        dt: 't',
        ie: 'utf8',
        oe: 'utf8',
        otf: 1,
        ssel: 0,
        tsel: 0,
        kc: 7,
        [res.name]: res.value,
        q: text
      };

      const headers = {
        'content-type': 'application/json',
        'Accept': 'application/json, text/plain, */*',
        'X-Requested-With': 'XMLHttpRequest'
      };

      const extra = {
        method: 'post',
        headers,
        baseURL: `https://translate.google.${tld}`,
        url,
        params: query,
        proxy: options.proxy || false
      };

      return axios(extra)
        .then(response => {
          const res = parseMultiple(response.data[0]);
          return res;
        }).catch(error => {
          throw error;
        });
    });
};
