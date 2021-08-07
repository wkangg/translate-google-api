const axios = require('axios');

const { get } = require('./token');
const { isSupport } = require('./language');
const { arrayStringify, parseMultiple } = require('./util');

module.exports.default = (data, options) => {
  let e;
  options.from = options.from || 'auto';
  options.to = options.to || 'en';
  if (options.from) {
    if (!isSupport(options.from)) {
      e = new Error();
      e.language = options.from;
    }
  }
  if (!isSupport(options.to)) {
    e = new Error();
    e.language = options.to;
  }
  if (e) {
    e.code = 400;
    e.message = `The language ${e.language} is not supported`;
    return new Promise((_, reject) => {
      reject(e);
    });
  }

  const tld = options.tld || 'com';
  return get(data.join(''), { tld, proxy: options.proxy || false })
    .then(res => {
      const text = arrayStringify(data);
      const url = '/translate_a/single';
      const query = {
        client: options.client || 'gtx',
        sl: options.from,
        tl: options.to,
        hl: options.to,
        dt: 't',
        ie: 'UTF-8',
        oe: 'UTF-8',
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
          return Promise.resolve(res);
        }).catch(error => {
          return Promise.reject(error);
        });
    });
};
