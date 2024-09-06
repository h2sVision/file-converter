const { parse: csvParse } = require('csv-parse/sync');
const xml2js = require('xml2js');
const fs = require('fs');
const { parse: papaparse } = require('papaparse');

// Function to parse CSV files using papaparse
const parseCSV = async (filePath) => {
  const fileContent = await fs.promises.readFile(filePath, 'utf8');
  return papaparse(fileContent, { header: true }).data;
};

// Function to parse TSV files using csv-parse
const parseTSV = async (filePath) => {
  const fileContent = await fs.promises.readFile(filePath, 'utf8');
  return csvParse(fileContent, { delimiter: '\t', columns: true });
};

const parseXML = async (filePath) => {
  const fileContent = await fs.promises.readFile(filePath, 'utf8');
  const parsedData = await xml2js.parseStringPromise(fileContent);
  
  // Ensure that the XML structure is normalized to an array of objects
  //const normalizedData = normalizeXMLData(parsedData);
  const normalizedData = flattenXML(parsedData);
  return normalizedData;
};

// Function to flatten a complex XML structure into an array of objects
const flattenXML = (node, parentKey = '', result = []) => {
  const obj = {};
  for (let key in node) {
    if (typeof node[key] === 'object' && node[key] !== null) {
      if (Array.isArray(node[key])) {
        node[key].forEach((item) => flattenXML(item, key, result));
      } else {
        flattenXML(node[key], key, result);
      }
    } else {
      obj[parentKey ? `${parentKey}_${key}` : key] = node[key];
    }
  }
  if (Object.keys(obj).length) {
    result.push(obj);
  }
  return result;
};

// Function to parse JSON files
const parseJSON = async (filePath) => {
  const fileContent = await fs.promises.readFile(filePath, 'utf8');
  const jsonData = JSON.parse(fileContent);

  // Ensure that JSON is normalized to an array of objects
  return Array.isArray(jsonData) ? jsonData : [jsonData];
};

module.exports = { parseCSV, parseTSV, parseXML, parseJSON };
