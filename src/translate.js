const axios = require('axios');

const translateToken = require('./token');
const lang = require('./language');
const util = require('./util');

function translate(data, options) {
  let e;
  options.from = options.from || 'auto';
  options.to = options.to || 'en';
  if (options.from) {
    if (!lang.isSupport(options.from)) {
      e = new Error();
      e.language = options.from;
    }
  }
  if (!lang.isSupport(options.to)) {
    e = new Error();
    e.language = options.to;
  }
  if (e) {
    e.code = 400;
    e.message = 'The language \'' + e.language + '\' is not supported';
    return new Promise(function(_, reject) {
      reject(e);
    });
  }

  var tld = options.tld || 'com';
  return translateToken
    .get(data.join(''), {
      tld: tld,
      proxy: options.proxy || false
    })
    .then(function(res) {
      const text = util.arrayStringify(data);
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
        baseURL: 'https://translate.google.' + tld,
        url,
        params: query,
        proxy: options.proxy || false
      };

      return axios(extra).then(function(response) {
        const res = util.parseMultiple(response.data[0]);
        return Promise.resolve(res);
      }).catch(function(error) {
        return Promise.reject(error);
      });
    });
}

module.exports.default = translate;
