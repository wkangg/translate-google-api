const axios = require('axios');

const { generateToken } = require('./token');
const { isSupported } = require('./language');
const { arrayStringify, parseMultiple } = require('./util');

module.exports = async (data, options = {}) => {
  let error;
  [ options.from, options.to ].forEach(lang => {
    if (lang && !isSupported(lang)) {
      error = new Error(`The language '${lang}' is not supported`);
      error.code = 400;
    }
  });
  if (error) throw error;

  if (!Object.hasOwn(options, 'from'))
    options.from = 'auto';
  if (!Object.hasOwn(options, 'to'))
    options.to = 'en';

  const tld = options.tld ?? 'com';

  const token = await generateToken(data.join(''), { tld, proxy: options.proxy ?? false });
  const text = arrayStringify(data);
  const url = '/translate_a/single';
  const params = {
    client: options.client ?? 'gtx',
    sl: options.from,
    tl: options.to,
    hl: options.to,
    dt: 't', //[ 'at', 'bd', 'ex', 'ld', 'md', 'qca', 'rw', 'rm', 'ss', 't' ],
    ie: 'UTF-8',
    oe: 'UTF-8',
    otf: 1,
    ssel: 0,
    tsel: 0,
    kc: 7,
    [token.name]: token.value,
    q: text
  };

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json, text/plain, */*',
    'X-Requested-With': 'XMLHttpRequest'
  };

  const extra = {
    method: 'POST',
    headers,
    baseURL: `https://translate.google.${tld}`,
    url,
    params,
    proxy: options.proxy ?? false
  };

  return axios(extra)
    .then(response => {
      const res = parseMultiple(response.data[0]);
      return res;
    }).catch(error => {
      throw error;
    });
};