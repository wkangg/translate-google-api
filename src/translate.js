const axios = require('axios');

const { generateToken } = require('./token');
const { isSupported } = require('./language');

module.exports = async (text, options = {}) => {
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

  const token = await generateToken(text, { tld, proxy: options.proxy ?? false });
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
    q: text,
    [token.name]: token.value
  };

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json, text/plain, */*',
    'X-Requested-With': 'XMLHttpRequest'
  };

  return axios({
    method: 'POST',
    headers,
    baseURL: `https://translate.google.${tld}`,
    url: '/translate_a/single',
    params,
    proxy: options.proxy ?? false
  })
    .then(response =>
      response.data[0]
        .map(item => item[0].trim())
        .join(''))
    .catch(error => {
      throw error;
    });
};