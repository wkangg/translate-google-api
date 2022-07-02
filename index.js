const translate = require('./src/translate');

module.exports = (value, options) => {
  const text = typeof value === 'string' ? [ value ] : value;
  return translate.default(text, options);
};