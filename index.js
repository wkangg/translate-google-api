const translate = require('./src/translate');
const language = require('./src/language');

module.exports = (value, options) => {
  const text = typeof value === 'string' ? [ value ] : value;
  return translate(text, options);
};

module.exports.language = language;