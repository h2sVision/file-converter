// Utility functions for handling file format conversions (JSON, XML, CSV, TSV)

const { parseCSV, parseTSV, parseXML } = require('./fileParser');

// Main function to convert data to a specific format
const convertToFormat = (data, outputFormat) => {

  if (!Array.isArray(data) || data.length === 0 || typeof data[0] !== 'object') {
    throw new Error('Invalid data for conversion');
  }

  switch (outputFormat) {
    case 'json':
      return JSON.stringify(data, null, 2); // Pretty print JSON
    case 'csv':
      return convertToCSV(data);
    case 'tsv':
      return convertToTSV(data);
    case 'xml':
      return convertToXML(data);
    default:
      throw new Error('Unsupported output format');
  }
};

// Implementation for converting data to CSV
const convertToCSV = (data) => {
  if (!data || data.length === 0) return '';

  const headers = Object.keys(data[0]);

  const rows = data.map(item => 
    headers.map(header => 
      `"${(item[header] || '').toString().replace(/"/g, '""')}"`
    ).join(',')
  );

  return [headers.join(','), ...rows].join('\n');
};

// Implementation for converting data to TSV
const convertToTSV = (data) => {
  if (!data || data.length === 0) return '';

  const headers = Object.keys(data[0]);

  const rows = data.map(item => 
    headers.map(header => 
      `${(item[header] || '').toString().replace(/\t/g, ' ').replace(/\n/g, ' ')}`
    ).join('\t')
  );

  return [headers.join('\t'), ...rows].join('\n');
};

// Implementation for converting data to XML
const convertToXML = (data) => {
  if (!data || data.length === 0) return '<root></root>';

  let xml = '<root>';
  data.forEach(item => {
    xml += '<item>';
    for (const [key, value] of Object.entries(item)) {
      xml += `<${key}>${escapeXML(value)}</${key}>`;
    }
    xml += '</item>';
  });
  xml += '</root>';
  return xml;
};

// Helper function to escape special XML characters
const escapeXML = (str) => {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&apos;')
    .replace(/"/g, '&quot;');
};

module.exports = { convertToFormat };
