/**
 * Last update: 2016/06/26
 * https://translate.google.com/translate/releases/twsfe_w_20160620_RC00/r/js/desktop_module_main.js
 *
 * Everything between 'BEGIN' and 'END' was copied from the url above.
 * fork from https://github.com/vitalets/google-translate-token
 * for support brower
 */

const axios = require('axios');

function sM(a) {
  let b;
  if (yr !== null)
    b = yr;
  else {
    b = wr(String.fromCharCode(84));
    const c = wr(String.fromCharCode(75));
    b = [b(), b()];
    b[1] = c();
    b = (yr = window[b.join(c())] || '') || '';
  }
  let d = wr(String.fromCharCode(116));
  let c = wr(String.fromCharCode(107));
  d = [d(), d()];
  d[1] = c();
  c = '&' + d.join('') + '=';
  d = b.split('.');
  b = Number(d[0]) || 0;
  for (let e = [], f = 0, g = 0; g < a.length; g++) {
    let l = a.charCodeAt(g);
    l < 128 ? e[f++] = l : (l < 2048 ? e[f++] = l >> 6 | 192 : ((l & 64512) == 55296 && g + 1 < a.length && (a.charCodeAt(g + 1) & 64512) == 56320 ? (l = 65536 + ((l & 1023) << 10) + (a.charCodeAt(++g) & 1023),
    e[f++] = l >> 18 | 240,
    e[f++] = l >> 12 & 63 | 128) : e[f++] = l >> 12 | 224,
    e[f++] = l >> 6 & 63 | 128),
    e[f++] = l & 63 | 128);
  }
  a = b;
  let e;
  for (let f = 0; f < e.length; f++)
    a += e[f],
    a = xr(a, '+-a^+6');
  a = xr(a, '+-3^+b+-f');
  a ^= Number(d[1]) || 0;
  a < 0 && (a = (a & 2147483647) + 2147483648);
  a %= 1E6;
  return c + (a.toString() + '.' + (a ^ b));
}

let yr;
const wr = function(a) {
    return function() {
      return a;
    };
  }, xr = function(a, b) {
    for (let c = 0; c < b.length - 2; c += 3) {
      var d = b.charAt(c + 2);
      d = d >= 'a' ? d.charCodeAt(0) - 87 : Number(d);
      d = b.charAt(c + 1) == '+' ? a >>> d : a << d;
      a = b.charAt(c) == '+' ? a + d & 4294967295 : a ^ d;
    }
    return a;
  };

const window = {
  TKK: '0'
};

function updateTKK(opts) {
  opts = opts || {tld: 'com'};
  return new Promise(function(resolve, reject) {
    const now = Math.floor(Date.now() / 3600000);

    if (Number(window.TKK.split('.')[0]) === now) {
      resolve();
    } else {
      axios({
        url: 'https://translate.google.' + opts.tld,
        proxy: opts.proxy
      }).then(function(res) {
        const matches = res.data.match(/tkk:\s?'(.+?)'/i);

        if (matches) {
          window.TKK = matches[1];
        }

        /**
        * Note: If the regex or the eval fail, there is no need to worry. The server will accept
        * relatively old seeds.
        */

        resolve();
      }).catch(function(err) {
        const e = new Error();
        e.code = 'BAD_NETWORK';
        e.message = err.message;
        reject(e);
      });
    }
  });
}

function get(text, opts) {
  return updateTKK(opts).then(function() {
    return {name: 'tk', value: sM(text).replace('&tk=', '')};
  }).catch(function(err) {
    throw err;
  });
}

module.exports.get = get;