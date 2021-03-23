'use strict';
const JOIN_WITH = '[]';
Object.defineProperty(exports, '__esModule', { value: true });
function arrayStringify(data) {
  return data.join(`${JOIN_WITH}\n`);
}

exports.arrayStringify = arrayStringify;
function parseMultiple(list) {
  const translateMap = list.map(function(item) {
    return item[0].trim();
  });
  return translateMap.join(' ').split(JOIN_WITH).map(item => item.trim());
}
exports.parseMultiple = parseMultiple;
