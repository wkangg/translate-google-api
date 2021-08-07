'use strict';
const JOIN_WITH = '[]';
Object.defineProperty(exports, '__esModule', { value: true });

exports.arrayStringify = data => {
  return data.join(`${JOIN_WITH}\n`);
};

exports.parseMultiple = list => {
  return list
    .map(item => item[0].trim())
    .join(' ')
    .split(JOIN_WITH)
    .map(item => item.trim());
};