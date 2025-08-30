const express = require('express');
const cors = require('cors');
const db = require('./db');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Tüm tabloları listele
app.get('/tables', async (req, res) => {
  try {
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
      return res.json([]);
    }
    
    const files = fs.readdirSync(dataDir);
    const tables = files
      .filter(file => file.endsWith('.json'))
      .map(file => file.replace('.json', ''));
    
    res.json(tables);
  } catch (error) {
    res.status(500).json({ error: 'Error listing tables' });
  }
});

// Yeni tablo oluştur
app.post('/tables', async (req, res) => {
  try {
    const { tableName, columns } = req.body;
    
    if (!tableName || !columns) {
      return res.status(400).json({ error: 'Table name and columns are required' });
    }
    
    // Convert columns to string format
    const columnString = columns.map(col => `${col.name}:${col.type}`).join(',');
    
    await db.createTable(tableName, columnString);
    res.json({ message: `${tableName} table created` });
  } catch (error) {
    res.status(500).json({ error: 'Error creating table' });
  }
});

// Tablo sil
app.delete('/tables/:tableName', async (req, res) => {
  try {
    const { tableName } = req.params;
    await db.deleteTable(tableName);
    res.json({ message: `${tableName} table deleted` });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting table' });
  }
});

// Tablo yapısını getir
app.get('/tables/:tableName', async (req, res) => {
  try {
    const { tableName } = req.params;
    const columns = await db.getTableColumns(tableName);
    const data = await db.listRecords(tableName);
    
    if (!columns) {
      return res.status(404).json({ error: 'Table not found' });
    }
    
    res.json({ tableName, columns, data });
  } catch (error) {
    res.status(500).json({ error: 'Error getting table information' });
  }
});

// Tablodaki tüm kayıtları getir
app.get('/tables/:tableName/records', async (req, res) => {
  try {
    const { tableName } = req.params;
    const { filter } = req.query;
    
    const tablePath = path.join(__dirname, 'data', `${tableName}.json`);
    
    if (!fs.existsSync(tablePath)) {
      return res.status(404).json({ error: 'Table not found' });
    }
    
    let filters = null;
    if (filter) {
      filters = filter.split(',').map(filterStr => {
        const parts = filterStr.trim().split(/(==|!=|>|<|>=|<=|:contains|:startsWith|:endsWith)/);
        console.log(parts);
        if (parts.length >= 3) {
          const field = parts[0].trim();
          const operator = parts[1];
          const value = parts.slice(2).join('').trim();
          return { field, operator, value };

        }
        return null;
      }).filter(f => f !== null);
    }
    console.log(filters)
    const records = await db.listRecords(tableName, filters);
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: 'Error getting records' });
  }
});

// Yeni kayıt ekle
app.post('/tables/:tableName/records', async (req, res) => {
  try {
    const { tableName } = req.params;
    const record = req.body;
    
    await db.insertRecord(tableName, record);
    res.json({ message: 'Record added' });
  } catch (error) {
    res.status(500).json({ error: 'Error adding record' });
  }
});

// Belirli bir kaydı getir
app.get('/tables/:tableName/records/:recordId', async (req, res) => {
  try {
    const { tableName, recordId } = req.params;
    const tablePath = path.join(__dirname, 'data', `${tableName}.json`);
    
    if (!fs.existsSync(tablePath)) {
      return res.status(404).json({ error: 'Table not found' });
    }
    
    const tableData = JSON.parse(fs.readFileSync(tablePath));
    const record = tableData.data.find(item => item.id === recordId);
    
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }
    
    res.json(record);
  } catch (error) {
    res.status(500).json({ error: 'Error getting record' });
  }
});

// Kayıt güncelle
app.put('/tables/:tableName/records/:recordId', async (req, res) => {
  try {
    const { tableName, recordId } = req.params;
    const newData = req.body;
    
    await db.updateRecord(tableName, recordId, newData);
    res.json({ message: 'Record updated' });
  } catch (error) {
    res.status(500).json({ error: 'Error updating record' });
  }
});

// Kayıt sil
app.delete('/tables/:tableName/records/:recordId', async (req, res) => {
  try {
    const { tableName, recordId } = req.params;
    
    await db.deleteRecord(tableName, recordId);
    res.json({ message: 'Record deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting record' });
  }
});

// Ana sayfa
app.get('/', (req, res) => {
  res.json({
    message: 'JSON Database API',
    endpoints: {
      'GET /tables': 'List all tables',
      'POST /tables': 'Create new table',
      'DELETE /tables/:tableName': 'Delete table',
      'GET /tables/:tableName': 'Get table structure',
      'GET /tables/:tableName/records': 'Get all records from table',
      'GET /tables/:tableName/records?filter={filter_key_name}{filter_operator}{filter_value}': 'Get filtered records from table',
      'POST /tables/:tableName/records': 'Add new record',
      'GET /tables/:tableName/records/:recordId': 'Get specific record',
      'PUT /tables/:tableName/records/:recordId': 'Update record',
      'DELETE /tables/:tableName/records/:recordId': 'Delete record'
    }
  });
});

async function startServer(port = PORT) {
  return new Promise((resolve, reject) => {
    const server = app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
      console.log(`📡 API: http://localhost:${port}`);
      console.log(`📋 Documentation: http://localhost:${port}/`);
      resolve(server);
    });
    
    server.on('error', (error) => {
      reject(error);
    });
  });
}

module.exports = {
  startServer,
  app,
  start: () => startServer()
};
