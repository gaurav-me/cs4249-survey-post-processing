const Papa = require('papaparse');
const fs = require('fs');

const START_INDEX = 7036;

const data = fs.readFileSync('./data3-utf8.csv', {
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

const parsedResult = filteredResult.map((elem) => {
  const { uid, eventName } = elem || {};
  const infoAttrs = JSON.parse(elem.info);
  const { DV2, DV3 } = infoAttrs.info || {};
  const DV1 = (parseInt(DV2) || 0) + (parseInt(DV3) || 0);

  return {
    uid,
    actionEventName: eventName,
    logEventName: infoAttrs.eventName,
    ...infoAttrs.info,
    ...(DV1 && { DV1 }),
    ...(DV2 && { DV2: parseInt(DV2) }),
    ...(DV3 && { DV3: parseInt(DV3) }),
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

console.log(parsedResult);

fs.writeFile('pg16.json', JSON.stringify(parsedResult), function (err) {
  if (err) throw err;
  console.log('complete');
});
