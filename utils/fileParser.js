// const { parse: csvParse } = require('csv-parse/sync');  // Updated import
// const xml2js = require('xml2js');
// const fs = require('fs');
// const { parse: papaparse } = require('papaparse');

// // Function to parse CSV files using papaparse
// const parseCSV = async (filePath) => {
//   const fileContent = await fs.promises.readFile(filePath, 'utf8');
//   return papaparse(fileContent, { header: true }).data;
// };

// // Function to parse TSV files using csv-parse
// const parseTSV = async (filePath) => {
//   const fileContent = await fs.promises.readFile(filePath, 'utf8');
//   return csvParse(fileContent, { delimiter: '\t', columns: true });
// };

// // Function to parse XML files using xml2js
// const parseXML = async (filePath) => {
//   const fileContent = await fs.promises.readFile(filePath, 'utf8');
//   return new Promise((resolve, reject) => {
//     xml2js.parseString(fileContent, (err, result) => {
//       if (err) reject(err);
//       else resolve(result);
//     });
//   });
// };

// module.exports = { parseCSV, parseTSV, parseXML };


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

// Function to parse XML files using xml2js
// const parseXML = async (filePath) => {
//   const fileContent = await fs.promises.readFile(filePath, 'utf8');
//   return xml2js.parseStringPromise(fileContent);
// };

const parseXML = async (filePath) => {
  const fileContent = await fs.promises.readFile(filePath, 'utf8');
  const parsedData = await xml2js.parseStringPromise(fileContent);
  
  // Ensure that the XML structure is normalized to an array of objects
  //const normalizedData = normalizeXMLData(parsedData);
  const normalizedData = flattenXML(parsedData);
  return normalizedData;
};

// Function to normalize XML data to an array of objects
// const normalizeXMLData = (xmlData) => {
//   const normalized = [];
//   // This is a simple implementation for flattening the XML data.
//   // Adjust the logic based on your XML structure.
  
//   const items = xmlData.root?.person || [] || xmlData.root?.item ;
//   items.forEach(item => {
//     const obj = {};
//     for (const key in item) {
//       obj[key] = item[key][0]; // xml2js converts values to arrays, so take the first element
//     }
//     normalized.push(obj);
//   });

//   return normalized;
// };

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
// const parseJSON = async (filePath) => {
//   const fileContent = await fs.promises.readFile(filePath, 'utf8');
//   return JSON.parse(fileContent);
// };

// const parseJSON = async (filePath) => {
//   const fileContent = await fs.promises.readFile(filePath, 'utf8');
//   const jsonData = JSON.parse(fileContent);

//   // Ensure that JSON is an array of objects
//   if (!Array.isArray(jsonData)) {
//     throw new Error('JSON data should be an array of objects');
//   }

//   return jsonData;
// };

const parseJSON = async (filePath) => {
  const fileContent = await fs.promises.readFile(filePath, 'utf8');
  const jsonData = JSON.parse(fileContent);

  // Ensure that JSON is normalized to an array of objects
  return Array.isArray(jsonData) ? jsonData : [jsonData];
};

module.exports = { parseCSV, parseTSV, parseXML, parseJSON };
