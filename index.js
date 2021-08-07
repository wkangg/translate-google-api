const trans = require('./src/translate');

module.exports = (value, options) => {
  let text;
  if (typeof value === 'string')
    text = [value];
  else
    text = value;
  return trans.default(text, options);
};