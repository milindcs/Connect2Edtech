# MongoDB Scripts

Utility scripts for MongoDB setup, optimization, and maintenance.

## Available Scripts

### 1. Test Connection
```bash
node backend/test-mongodb.js
```
**Purpose:** Tests MongoDB connection and performs basic CRUD operations.

**What it does:**
- Connects to MongoDB Atlas
- Tests write and read operations
- Lists all collections
- Shows document counts for each collection
- Displays connection details

**Use when:**
- Verifying MongoDB connection
- Checking if database is accessible
- Testing after configuration changes

---

### 2. Create Indexes
```bash
node backend/scripts/create-indexes.js
```
**Purpose:** Creates optimized indexes for all collections.

**What it does:**
- Creates unique indexes for email fields
- Creates compound indexes for common query patterns
- Creates sorting indexes for createdAt fields
- Reports on existing and new indexes

**Indexes created:**
- **signups:** email (unique), verified+createdAt, role+createdAt, createdAt
- **enrollments:** email+createdAt, courseKey+createdAt, createdAt
- **contacts:** email, createdAt, replied+createdAt
- **checkouts:** email+createdAt, sessionId+createdAt, createdAt
- **cart:** sessionId+courseKey (unique), sessionId+addedAt

**Use when:**
- Setting up a new database
- After deploying to production
- When adding new query patterns

---

### 3. Analyze Queries
```bash
node backend/scripts/optimize-queries.js
```
**Purpose:** Analyzes collections and provides optimization recommendations.

**What it does:**
- Shows collection statistics (size, document count)
- Lists all current indexes
- Analyzes query patterns
- Provides performance recommendations

**Use when:**
- Reviewing database performance
- Planning index additions
- Troubleshooting slow queries

---

### 4. Full Setup
```bash
node backend/setup-mongodb.js
```
**Purpose:** Complete MongoDB setup in one command.

**What it does:**
- Tests connection
- Creates all indexes
- Shows collection statistics
- Verifies setup

**Use when:**
- Initial project setup
- After MongoDB Atlas migration
- Complete database initialization

---

## Quick Start

### First Time Setup
```bash
# 1. Ensure .env file is configured
# Check backend/.env has correct MONGODB_URI

# 2. Run full setup
node backend/setup-mongodb.js

# 3. Start the server
npm start
```

### Adding Indexes to Existing Database
```bash
node backend/scripts/create-indexes.js
```

### Performance Analysis
```bash
node backend/scripts/optimize-queries.js
```

---

## Troubleshooting

### Connection Errors

**Error: `querySrv ECONNREFUSED`**
```bash
# Solutions:
# 1. Check MongoDB Atlas cluster is running
# 2. Verify MONGODB_URI in backend/.env
# 3. Whitelist your IP in MongoDB Atlas
# 4. Check network connectivity
```

**Error: `Authentication failed`**
```bash
# Solutions:
# 1. Verify username/password in MONGODB_URI
# 2. Check database user exists in Atlas
# 3. Ensure password is URL-encoded
```

**Error: `Missing MONGODB_URI`**
```bash
# Solutions:
# 1. Ensure .env file exists in backend/
# 2. Check file is named .env (not .env.txt)
# 3. Verify dotenv is loading correctly
```

---

## MongoDB Atlas Setup

### 1. Create Cluster
1. Sign up at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster (free tier available)
3. Wait for cluster to be ready (~5 minutes)

### 2. Configure Network Access
1. Go to Network Access tab
2. Click "Add IP Address"
3. Add your IP or use 0.0.0.0/0 for development
4. Click "Confirm"

### 3. Create Database User
1. Go to Database Access tab
2. Click "Add New Database User"
3. Username: `hr_connect2future`
4. Password: `@2026C2f`
5. Grant `readWrite` permissions
6. Click "Add User"

### 4. Get Connection String
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your password (URL-encoded)
5. Replace `<dbname>` with your database name

### 5. Update .env
```env
MONGODB_URI=mongodb+srv://hr_connect2future:%402026C2f@cluster0.nyefwik.mongodb.net/?appName=Cluster0
```

---

## Performance Tips

### Indexes
- All indexes use `background: true` for non-blocking creation
- Compound indexes optimize multi-field queries
- Unique indexes prevent duplicate data

### Queries
- Always use indexed fields in WHERE clauses
- Use projection to limit returned fields
- Implement pagination for large datasets
- Monitor slow queries in Atlas

### Connection Pooling
- Current pool size: 10 connections
- Adjust based on your load
- Monitor in Atlas Dashboard

---

## Additional Commands

### Manual MongoDB Operations
```bash
# Connect to MongoDB shell
mongosh "mongodb+srv://cluster0.nyefwik.mongodb.net/"

# Export database
mongodump --uri="mongodb+srv://hr_connect2future:@2026C2f@cluster0.nyefwik.mongodb.net/"

# Import database
mongorestore --uri="mongodb+srv://hr_connect2future:@2026C2f@cluster0.nyefwik.mongodb.net/" dump/
```

### Useful MongoDB Queries
```javascript
// Show all indexes
db.signups.getIndexes()

// Drop an index
db.signups.dropIndex("index_name")

// Analyze query performance
db.signups.find({ email: "test@example.com" }).explain("executionStats")

// Show database stats
db.stats()

// Show collection stats
db.signups.stats()
```

---

## Support

For issues:
1. Check MongoDB Atlas status page
2. Review error messages in console
3. Consult MONGODB_SETUP.md for detailed documentation
4. Verify network connectivity

---

**Last Updated:** 2026-07-10
**Version:** 1.0.0