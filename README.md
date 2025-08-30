# JSON Database CLI & API

A lightweight, file-based JSON database with both CLI interface and REST API capabilities. Built with Node.js, this project provides a simple yet powerful way to manage data using JSON files.

## 🚀 Features

### Core Database Features
- **Table Management**: Create and delete tables with custom column definitions
- **Data Types Support**: string, number, boolean, array, date, null
- **CRUD Operations**: Create, Read, Update, Delete records
- **Automatic ID Generation**: Each record gets a unique timestamp-based ID
- **Data Validation**: Type conversion and validation based on column definitions

### CLI Interface
- **Interactive Menu**: User-friendly command-line interface
- **Smart Prompts**: Dynamic prompts based on table structure
- **Server Management**: Start/stop server with status monitoring

### REST API
- **Full CRUD API**: Complete REST endpoints for all operations
- **CORS Support**: Cross-origin requests enabled
- **JSON Responses**: Consistent JSON API responses
- **Error Handling**: Comprehensive error handling and status codes

## 📦 Installation

### Global Installation (Recommended)
```bash
npm install -g jsondb-apicli
```

### Local Installation
1. **Clone the repository:**
```bash
git clone https://github.com/dpoetika/jsondb-apicli
cd jsondb-apicli
```

2. **Install dependencies:**
```bash
npm install
```

## 🛠️ Usage

### Global Installation Usage
```bash
# Start REST API server
jsondb-apicli start

# Run interactive CLI
jsondb-apicli cli

# Show help
jsondb-apicli help
```

### Local Installation Usage
```bash
# Start REST API server
npm start

# Run interactive CLI
npm run cli

# Start server directly
node server.js

# Run CLI directly
node index.js
```

## 📋 Usage

### CLI Interface

Run the application:
```bash
node index.js
```

#### Available Operations:

1. **Create Table**
   - Enter table name
   - Define columns with data types (e.g., `name:string,age:number,active:boolean`)

2. **Delete Table**
   - Remove entire table and all its data

3. **Insert Record**
   - Select table
   - Enter values for each column (type conversion handled automatically)

4. **Delete Record**
   - Specify table and record ID

5. **Update Record**
   - Modify existing records with new values
   - Leave fields empty to skip updates

6. **List Records**
   - View table structure and all records
   - Apply filters to search records (e.g., `name==yunus,age>25`)

7. **Start Server**
   - Launch REST API server
   - Monitor server status
   - Stop server when needed

### Data Types

| Type | Description | Example Input | Stored As |
|------|-------------|---------------|-----------|
| `string` | Text data | `"John Doe"` | `"John Doe"` |
| `number` | Numeric data | `25` | `25` |
| `boolean` | True/false | `true` or `false` | `true` |
| `array` | List of values | `"apple,banana,orange"` | `["apple", "banana", "orange"]` |
| `date` | Date/time | `"2024-01-15"` | `"2024-01-15T00:00:00.000Z"` |
| `null` | Null value | `null` | `null` |

### Filtering Operators

When listing records, you can apply filters using the following operators:

| Operator | Description | Example |
|----------|-------------|---------|
| `==` | Equal to (matches the full value) | `name==yunus emre` |
| `!=` | Not equal to | `age!=25` |
| `>` | Greater than | `age>25` |
| `<` | Less than | `age<30` |
| `>=` | Greater than or equal | `age>=25` |
| `<=` | Less than or equal | `age<=30` |
| `:contains` | Contains text (case-insensitive, partial match) | `email:contains:gmail` |
| `:startsWith` | Starts with text (case-insensitive) | `name:startsWith:yu` |
| `:endsWith` | Ends with text (case-insensitive) | `email:endsWith:.com` |

**Multiple filters can be combined with commas:**
- CLI: `name==yunus emre,age>25,email:contains:gmail`
- API: `?filter=name==yunus emre,age>25,email:contains:gmail`

### REST API

#### Base URL
```
http://localhost:3000
```

#### Endpoints

##### Table Management
- `GET /tables` - List all tables
- `POST /tables` - Create new table
- `DELETE /tables/:tableName` - Delete table
- `GET /tables/:tableName` - Get table structure and data

##### Record Operations
- `GET /tables/:tableName/records` - Get all records from table
- `GET /tables/:tableName/records?filter=name==yunus emre,age>25` - Get filtered records
- `POST /tables/:tableName/records` - Add new record
- `GET /tables/:tableName/records/:recordId` - Get specific record
- `PUT /tables/:tableName/records/:recordId` - Update record
- `DELETE /tables/:tableName/records/:recordId` - Delete record

#### API Examples

**Create Table:**
```bash
curl -X POST http://localhost:3000/tables \
  -H "Content-Type: application/json" \
  -d '{
    "tableName": "users",
    "columns": [
      {"name": "name", "type": "string"},
      {"name": "age", "type": "number"},
      {"name": "email", "type": "string"},
      {"name": "active", "type": "boolean"}
    ]
  }'
```

**Add Record:**
```bash
curl -X POST http://localhost:3000/tables/users/records \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "age": 30,
    "email": "john@example.com",
    "active": true
  }'
```

**Get All Records:**
```bash
curl http://localhost:3000/tables/users/records
```

**Get Filtered Records:**
```bash
# Full value match
curl "http://localhost:3000/tables/users/records?filter=name==yunus%20emre"

# Partial match
curl "http://localhost:3000/tables/users/records?filter=name:contains:yunus"

# Multiple filters
curl "http://localhost:3000/tables/users/records?filter=name:contains:yunus,age>10"
```

**Update Record:**
```bash
curl -X PUT http://localhost:3000/tables/users/records/{id} \
  -H "Content-Type: application/json" \
  -d '{
    "age": 31,
    "active": false
  }'
```

**Delete Record:**
```bash
curl -X DELETE http://localhost:3000/tables/users/records/{id}
```

## 📁 File Structure

```
jsondb/
├── index.js          # Main CLI application
├── db.js            # Database operations
├── server.js        # REST API server
├── package.json     # Dependencies and scripts
├── README.md        # This file
└── data/           # Database files (auto-created)
    ├── users.json
    ├── products.json
    └── ...
```

## 🔧 Database File Format

Each table is stored as a JSON file with the following structure:

```json
{
  "columns": [
    {"name": "name", "type": "string"},
    {"name": "age", "type": "number"},
    {"name": "active", "type": "boolean"}
  ],
  "data": [
    {
      "id": "1703123456789",
      "name": "John Doe",
      "age": 30,
      "active": true
    }
  ]
}
```

## 🚨 Error Handling

The application includes comprehensive error handling:

- **Table not found** - When accessing non-existent tables
- **Record not found** - When accessing non-existent records
- **Invalid data types** - Automatic type conversion with fallbacks
- **API errors** - Proper HTTP status codes and error messages
- **File system errors** - Graceful handling of file operations

## 🔒 Security Considerations

- **File-based storage** - Data is stored in local JSON files
- **No authentication** - API is open by default (add authentication for production)
- **CORS enabled** - Cross-origin requests allowed
- **Input validation** - Basic validation on data types and formats

## 🚀 Production Deployment

For production use, consider:

1. **Add authentication** to the REST API
2. **Use HTTPS** for secure communication
3. **Implement rate limiting** to prevent abuse
4. **Add logging** for monitoring and debugging
5. **Use environment variables** for configuration
6. **Implement backup strategies** for data files

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request


## 🆘 Support

For issues, questions, or contributions:
- Create an issue on GitHub
- Check the documentation at `http://localhost:3000/` when server is running
- Review the API endpoints and examples above

---

**Built with ❤️ using Node.js, Express, and Inquirer**
