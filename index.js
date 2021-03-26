
const trans = require('./src/translate');

function translate(value, options) {
  let text;
  if (typeof value === 'string')
    text = [value];
  else
    text = value;
  return trans.default(text, options);
}

module.exports = translate;