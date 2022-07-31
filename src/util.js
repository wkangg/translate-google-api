const JOIN_WITH = '[]';

exports.arrayStringify = data => data.join(`${JOIN_WITH}\n`);

exports.parseMultiple = list => 
  list
    .map(item => item[0].trim())
    .join(' ')
    .split(JOIN_WITH)
    .map(item => item.trim());