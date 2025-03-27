/**
 * Last update: 2016/06/26
 * https://translate.google.com/translate/releases/twsfe_w_20160620_RC00/r/js/desktop_module_main.js
 *
 * fork from https://github.com/vitalets/google-translate-token
 * for support brower
 */

const sM = a => {
    let b, yr;
    b = yr ?? ((yr = window.TKK || '') || '');
    const d = b.split('.');
    const c = '&tk=';
    b = Number(d[0]) || 0;
    for (var e = [], f = 0, g = 0; g < a.length; g++) {
        let l = a.codePointAt(g);
        l < 128
            ? e[f++] = l
            : (l < 2048
                ? e[f++] = l >> 6 | 192
                : ((l & 64_512) == 55_296 && g + 1 < a.length && (a.codePointAt(g + 1) & 64_512) == 56_320
                    ? (l = 65_536 + ((l & 1023) << 10) + (a.codePointAt(++g) & 1023),
                    e[f++] = l >> 18 | 240,
                    e[f++] = l >> 12 & 63 | 128)
                    : e[f++] = l >> 12 | 224,
                e[f++] = l >> 6 & 63 | 128),
            e[f++] = l & 63 | 128);
    }
    a = b;
    for (f = 0; f < e.length; f++)
        a += e[f],
        a = xr(a, '+-a^+6');
    a = xr(a, '+-3^+b+-f');
    a ^= Number(d[1]) || 0;
    a < 0 && (a = (a & 2_147_483_647) + 2_147_483_648);
    a %= 1e6;
    return c + (a.toString() + '.' + (a ^ b));
};

const xr = (a, b) => {
    for (let c = 0; c < b.length - 2; c += 3) {
        let d = b.charAt(c + 2);
        d = d >= 'a' ? d.codePointAt(0) - 87 : Number(d);
        d = b.charAt(c + 1) == '+' ? a >>> d : a << d;
        a = b.charAt(c) == '+' ? a + d & 4_294_967_295 : a ^ d;
    }
    return a;
};

const window = { TKK: '0' };

const updateTKK = opts => {
    opts = opts ?? { tld: 'com' };

    return new Promise((resolve, reject) => {
        const now = Math.floor(Date.now() / 3_600_000);

        if (Number(window.TKK.split('.')[0]) === now)
            resolve();
        else {
            fetch(`https://translate.google.${opts.tld}/`)
                .then(res => res.text())
                .then(res => {
                    const matches = res.match(/tkk:\s?'(.+?)'/i);

                    if (matches) window.TKK = matches[1];

                    /**
                      * Note: If the regex or the eval fail, there is no need to worry. The server will accept
                      * relatively old seeds.
                      */
                    resolve();
                }).catch(error => {
                    const e = new Error(error.message);
                    e.code = 'BAD_NETWORK';
                    reject(e);
                });
        }
    });
};

export const generateToken = (text, opts) => {
    return updateTKK(opts).then(() => {
        const tk = sM(text).replace('&tk=', '');
        return { name: 'tk', value: tk };
    });
};