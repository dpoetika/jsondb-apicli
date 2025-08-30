const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

function getTablePath(tableName) {
  return path.join(dataDir, `${tableName}.json`);
}

async function createTable(tableName, columnName) {
  const tablePath = getTablePath(tableName);
  if (fs.existsSync(tablePath)) {
    console.log('This table already exists.');
    return;
  }
  try{
    // Parse columns
    const columns = columnName.split(',').map(col => {
      const [name, type] = col.trim().split(':');
      return { name: name.trim(), type: type.trim() };
    });
    
    // Store table structure
    const tableStructure = {
      columns: columns,
      data: []
    };
    
    fs.writeFileSync(tablePath, JSON.stringify(tableStructure, null, 2)); 
    console.log(`${tableName} table created.`);
  }catch(error){
    console.log('Error parsing columns:');
    return;
  }
}
async function deleteTable(tableName) {
  const tablePath = getTablePath(tableName);
  if (!fs.existsSync(tablePath)) {
    console.log('Table not found.');
    return;
  }
  fs.unlinkSync(tablePath);
  console.log(`${tableName} table deleted.`);
}

async function insertRecord(tableName, record) {
  const tablePath = getTablePath(tableName);
  if (!fs.existsSync(tablePath)) {
    console.log('Table not found.');
    return;
  }

  const tableData = JSON.parse(fs.readFileSync(tablePath));
  record.id = Date.now().toString(); // automatic ID
  tableData.data.push(record);
  fs.writeFileSync(tablePath, JSON.stringify(tableData, null, 2));
  console.log('Record added.');
}

async function deleteRecord(tableName, id) {
  const tablePath = getTablePath(tableName);
  if (!fs.existsSync(tablePath)) {
    console.log('Table not found.');
    return;
  }

  let tableData = JSON.parse(fs.readFileSync(tablePath));
  const initialLength = tableData.data.length;
  tableData.data = tableData.data.filter(item => item.id !== id);
  if (tableData.data.length === initialLength) {
    console.log('Record not found.');
    return;
  }
  fs.writeFileSync(tablePath, JSON.stringify(tableData, null, 2));
  console.log('Record deleted.');
}

async function updateRecord(tableName, id, newData) {
  const tablePath = getTablePath(tableName);
  if (!fs.existsSync(tablePath)) {
    console.log('Table not found.');
    return;
  }

  const tableData = JSON.parse(fs.readFileSync(tablePath));
  const index = tableData.data.findIndex(item => item.id === id);
  if (index === -1) {
    console.log('Record not found.');
    return;
  }

  tableData.data[index] = { ...tableData.data[index], ...newData, id }; // preserve id
  fs.writeFileSync(tablePath, JSON.stringify(tableData, null, 2));
  console.log('Record updated.');
}

async function listRecords(tableName, filters = null) {
  const tablePath = getTablePath(tableName);
  if (!fs.existsSync(tablePath)) {
    console.log('Table not found.');
    return;
  }

  const tableData = JSON.parse(fs.readFileSync(tablePath));
  let filteredData = tableData.data;

  // Apply filters if provided
  if (filters && filters.length > 0) {
    filteredData = tableData.data.filter(record => {
      return filters.every(filter => {
        const { field, operator, value } = filter;
        if (!record.hasOwnProperty(field)) {
          return false;
        }

        const recordValue = record[field];
        
        switch (operator) {
          case '==':
            return String(recordValue).toLowerCase() === String(value).toLowerCase();
          case '!=':
            return String(recordValue).toLowerCase() !== String(value).toLowerCase();
          case '>':
            return Number(recordValue) > Number(value);
          case '<':
            return Number(recordValue) < Number(value);
          case '>=':
            return Number(recordValue) >= Number(value);
          case '<=':
            return Number(recordValue) <= Number(value);
          case 'contains':
            return String(recordValue).toLowerCase().includes(String(value).toLowerCase());
          case 'startsWith':
            return String(recordValue).toLowerCase().startsWith(String(value).toLowerCase());
          case 'endsWith':
            return String(recordValue).toLowerCase().endsWith(String(value).toLowerCase());
          default:
            return true;
        }
      });
    });
  }

  console.log('Table Structure:');
  console.log(JSON.stringify(tableData.columns, null, 2));
  console.log('\nRecords:');
  console.log(JSON.stringify(filteredData, null, 2));
  return filteredData;
}

async function getTableColumns(tableName) {
  const tablePath = getTablePath(tableName);
  if (!fs.existsSync(tablePath)) {
    return null;
  }

  const tableData = JSON.parse(fs.readFileSync(tablePath));
  return tableData.columns;
}

module.exports = {
  createTable,
  deleteTable,
  insertRecord,
  deleteRecord,
  updateRecord,
  listRecords,
  getTableColumns
};
