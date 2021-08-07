/**
 * Last update: 2016/06/26
 * https://translate.google.com/translate/releases/twsfe_w_20160620_RC00/r/js/desktop_module_main.js
 *
 * fork from https://github.com/vitalets/google-translate-token
 * for support brower
 */

const axios = require('axios');

const sM = a => {
  let b, c;
  if (yr !== null)
    b = yr;
  else {
    b = wr(String.fromCharCode(84));
    c = wr(String.fromCharCode(75));
    b = [b(), b()];
    b[1] = c();
    b = (yr = window[b.join(c())] || '') || '';
  }
  let d = wr(String.fromCharCode(116));
  c = wr(String.fromCharCode(107));
  d = [d(), d()];
  d[1] = c();
  c = '&' + d.join('') + '=';
  d = b.split('.');
  b = Number(d[0]) || 0;
  for (var e = [], f = 0, g = 0; g < a.length; g++) {
    let l = a.charCodeAt(g);
    l < 128 ? e[f++] = l : (l < 2048 ? e[f++] = l >> 6 | 192 : ((l & 64512) == 55296 && g + 1 < a.length && (a.charCodeAt(g + 1) & 64512) == 56320 ? (l = 65536 + ((l & 1023) << 10) + (a.charCodeAt(++g) & 1023),
    e[f++] = l >> 18 | 240,
    e[f++] = l >> 12 & 63 | 128) : e[f++] = l >> 12 | 224,
    e[f++] = l >> 6 & 63 | 128),
    e[f++] = l & 63 | 128);
  }
  a = b;
  for (f = 0; f < e.length; f++)
    a += e[f],
    a = xr(a, '+-a^+6');
  a = xr(a, '+-3^+b+-f');
  a ^= Number(d[1]) || 0;
  a < 0 && (a = (a & 2147483647) + 2147483648);
  a %= 1E6;
  return c + (a.toString() + '.' + (a ^ b));
};

let yr = null;
const wr = a => {
  return () => {
    return a;
  };
};
const xr = (a, b) => {
  for (let c = 0; c < b.length - 2; c += 3) {
    let d = b.charAt(c + 2);
    d = d >= 'a' ? d.charCodeAt(0) - 87 : Number(d);
    d = b.charAt(c + 1) == '+' ? a >>> d : a << d;
    a = b.charAt(c) == '+' ? a + d & 4294967295 : a ^ d;
  }
  return a;
};

const window = { TKK: '0' };

const updateTKK = opts => {
  opts = opts || { tld: 'com' };
  return new Promise((resolve, reject) => {
    const now = Math.floor(Date.now() / 3600000);

    if (Number(window.TKK.split('.')[0]) === now) {
      resolve();
    } else {
      axios({
        url: 'https://translate.google.' + opts.tld,
        proxy: opts.proxy
      }).then(res => {
        const matches = res.data.match(/tkk:\s?'(.+?)'/i);

        if (matches) {
          window.TKK = matches[1];
        }

        /**
         * Note: If the regex or the eval fail, there is no need to worry. The server will accept
         * relatively old seeds.
         */

        resolve();
      }).catch(err => {
        const e = new Error();
        e.code = 'BAD_NETWORK';
        e.message = err.message;
        reject(e);
      });
    }
  });
};

module.exports.get = (text, opts) => {
  return updateTKK(opts).then(() => {
    let tk = sM(text);
    tk = tk.replace('&tk=', '');
    return { name: 'tk', value: tk };
  }).catch(err => {
    throw err;
  });
};