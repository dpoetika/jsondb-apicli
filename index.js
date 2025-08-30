#!/usr/bin/env node
const inquirer = require('inquirer');
const db = require('./db');
const server = require('./server');

// Komut satırı argümanlarını işle
const args = process.argv.slice(2);
const command = args[0];

// Eğer komut verilmişse, doğrudan çalıştır
if (command) {
  switch (command) {
    case 'start':
    case 'server':
      console.log('🚀 Starting JSON Database API Server...');
      server.start();
      break;
    case 'cli':
    case 'interactive':
      runInteractiveCLI();
      break;
    case 'help':
    case '--help':
    case '-h':
      showHelp();
      break;
    default:
      console.log(`❌ Unknown command: ${command}`);
      showHelp();
      process.exit(1);
  }
} else {
  // Komut verilmemişse interaktif CLI'yi başlat
  runInteractiveCLI();
}

function showHelp() {
  console.log(`
📚 JSON Database CLI & API - Usage Guide

Commands:
  jsondb-apicli start     - Start the REST API server
  jsondb-apicli server    - Start the REST API server
  jsondb-apicli cli       - Run interactive CLI
  jsondb-apicli help      - Show this help message

Examples:
  jsondb-apicli start     # Start API server on port 3000
  jsondb-apicli cli       # Run interactive database operations

For more information, visit: https://github.com/dpoetika/jsondb-apicli
`);
}

async function runInteractiveCLI() {
  const { operation } = await inquirer.default.prompt([
    {
      type: 'list',
      name: 'operation',
      message: 'Select an operation:',
      pageSize: 10,
      choices: [
        'Create Table',
        'Delete Table',
        'Insert Record',
        'Delete Record',
        'Update Record',
        'List Records',
        'Start Server',
        'Exit'
      ]
    }
  ]);

  switch (operation) {
    case 'Create Table':
      const { tableName } = await inquirer.default.prompt({
        type: 'input',
        name: 'tableName',
        message: 'Enter table name:',
      });

      const { columnName } = await inquirer.default.prompt({
        type: 'input',
        name: 'columnName',
        message: 'Enter column names and data types (e.g., "name:string,age:number"):'
        //Data types: string, number, boolean, array, date, null
      });
      await db.createTable(tableName, columnName);

      break;

    case 'Delete Table':
      const { tableToDelete } = await inquirer.default.prompt({
        type: 'input',
        name: 'tableToDelete',
        message: 'Table name to delete:'
      });
      await db.deleteTable(tableToDelete);
      break;

    case 'Insert Record':
      const { insertTable } = await inquirer.default.prompt({
        type: 'input',
        name: 'insertTable',
        message: 'Table name to add data to:'
      });
      
      // Get table columns
      const columns = await db.getTableColumns(insertTable);
      if (!columns) {
        console.log('Table not found.');
        break;
      }
      
      // Get value for each column
      const record = {};
      for (const column of columns) {
        const { value } = await inquirer.default.prompt({
          type: 'input',
          name: 'value',
          message: `Enter value for ${column.name} (${column.type}):`
        });
        
        // Convert based on data type
        switch (column.type) {
          case 'number':
            record[column.name] = parseFloat(value) || 0;
            break;
          case 'boolean':
            record[column.name] = value.toLowerCase() === 'true';
            break;
          case 'array':
            try {
              record[column.name] = JSON.parse(value);
            } catch {
              record[column.name] = value.split(',').map(item => item.trim());
            }
            break;
          case 'date':
            record[column.name] = new Date(value).toISOString();
            break;
          case 'null':
            record[column.name] = value === 'null' ? null : value;
            break;
          default: // string
            record[column.name] = value;
        }
      }
      
      await db.insertRecord(insertTable, record);
      break;

    case 'Delete Record':
      const { deleteTable, idToDelete } = await inquirer.default.prompt([
        {
          type: 'input',
          name: 'deleteTable',
          message: 'Table name to delete record from:'
        },
        {
          type: 'input',
          name: 'idToDelete',
          message: 'Record ID to delete:'
        }
      ]);
      await db.deleteRecord(deleteTable, idToDelete);
      break;

    case 'Update Record':
      const { updateTable, idToUpdate } = await inquirer.default.prompt([
        {
          type: 'input',
          name: 'updateTable',
          message: 'Table name to update record in:'
        },
        {
          type: 'input',
          name: 'idToUpdate',
          message: 'Record ID to update:'
        }
      ]);
      
      // Get table columns
      const updateColumns = await db.getTableColumns(updateTable);
      if (!updateColumns) {
        console.log('Table not found.');
        break;
      }
      
      // Get new value for each column
      const updatedRecord = {};
      for (const column of updateColumns) {
        const { value } = await inquirer.default.prompt({
          type: 'input',
          name: 'value',
          message: `Enter new value for ${column.name} (${column.type}) (leave empty to skip):`
        });
        
        if (value !== '') {
          // Convert based on data type
          switch (column.type) {
            case 'number':
              updatedRecord[column.name] = parseFloat(value) || 0;
              break;
            case 'boolean':
              updatedRecord[column.name] = value.toLowerCase() === 'true';
              break;
            case 'array':
              try {
                updatedRecord[column.name] = JSON.parse(value);
              } catch {
                updatedRecord[column.name] = value.split(',').map(item => item.trim());
              }
              break;
            case 'date':
              updatedRecord[column.name] = new Date(value).toISOString();
              break;
            case 'null':
              updatedRecord[column.name] = value === 'null' ? null : value;
              break;
            default: // string
              updatedRecord[column.name] = value;
          }
        }
      }
      
      await db.updateRecord(updateTable, idToUpdate, updatedRecord);
      break;

    case 'List Records':
      const { listTable } = await inquirer.default.prompt({
        type: 'input',
        name: 'listTable',
        message: 'Table name to list records:'
      });
      
      const { useFilters } = await inquirer.default.prompt({
        type: 'confirm',
        name: 'useFilters',
        message: 'Do you want to apply filters?',
        default: false
      });
      
      let filters = null;
      if (useFilters) {
        const { filterString } = await inquirer.default.prompt({
          type: 'input',
          name: 'filterString',
          message: 'Enter filters (e.g., "name==yunus,age>25,email:contains:gmail"):',
          default: ''
        });
        
        if (filterString.trim()) {
          filters = filterString.split(',').map(filter => {
            const parts = filter.trim().split(/(==|!=|>|<|>=|<=|:contains|:startsWith|:endsWith)/);
            if (parts.length >= 3) {
              const field = parts[0].trim();
              const operator = parts[1].replace(':', '');
              const value = parts.slice(2).join('').trim().replace(':', '');
              return { field, operator, value };
            }
            return null;
          }).filter(f => f !== null);
        }
       }
       await db.listRecords(listTable, filters);
      break;
    case 'Start Server':      
      console.log('Starting server...');
      const serverInstance = await server.startServer();
      
      // Show server status and options
      while (true) {
        const { serverAction } = await inquirer.default.prompt([
          {
            type: 'list',
            name: 'serverAction',
            message: 'Server is running. What would you like to do?',
            pageSize: 5,
            choices: [
              'Stop Server',
              'Show Server Status'
            ]
          }
        ]);
        
        switch (serverAction) {
          case 'Stop Server':
            await serverInstance.close();
            console.log('Server stopped.');
            return runInteractiveCLI(); // Return to main menu
            
          case 'Show Server Status':
            const port = serverInstance.address().port;
            if(port){
            console.log(`Server is running on port ${port}`);
              console.log(`API: http://localhost:${port}`);
              console.log(`Documentation: http://localhost:${port}/`);
            }else{
              console.log('Server is not running.');
            }
            break;
        }
      }
    case 'Exit':
      console.log('Exiting...');
      process.exit(0);
  }

  runInteractiveCLI(); // return to start
}
