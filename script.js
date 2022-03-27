const Papa = require('papaparse');
const fs = require('fs');

const START_INDEX = 7036;

const data = fs.readFileSync('./data-utf8.csv', {
  encoding: 'utf8',
  flag: 'r',
});

const fileJson = Papa.parse(data);
const headers = fileJson.data[0];
const output = fileJson.data.slice(START_INDEX);

const result = output.map((trials) => {
  let res = {};
  trials.forEach((trial, trialIdx) => {
    res[headers[trialIdx]] = trial;
  });
  return res;
});

const filteredResult = result.filter(
  (elem) => !['mousedown', 'keydown', 'clicked'].includes(elem.eventName),
);

// console.log(filteredResult);

const parsedResult = filteredResult.map((elem) => {
  const { uid, eventName } = elem || {};
  const infoAttrs = JSON.parse(elem.info);

  return {
    uid,
    actionEventName: eventName,
    logEventName: infoAttrs.eventName,
    ...infoAttrs.info,
  };
});

parsedResult.forEach((elem) => {
  if (typeof elem.iv1_level === 'string' && !elem.iv1_level) {
    elem.iv1_level = 'fixed-sidebar';
  }
  delete elem.clicked;
  delete elem.interface;
  delete elem.input;
});

fs.writeFile('pg16.json', JSON.stringify(parsedResult), function (err) {
  if (err) throw err;
  console.log('complete');
});
