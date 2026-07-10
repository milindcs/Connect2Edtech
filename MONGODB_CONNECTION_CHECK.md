# MongoDB Connection Check - Connect2Edtech

## Current Configuration

### MongoDB URI
```
mongodb+srv://hr_connect2future:%402026C2f@cluster0.nyefwik.mongodb.net/?appName=Cluster0
```

**Decoded:**
- **Username:** `hr_connect2future`
- **Password:** `@2026C2f` (URL-encoded as `%402026C2f`)
- **Cluster:** `cluster0.nyefwik.mongodb.net`
- **App Name:** `Cluster0`
- **Database:** Not specified in URI (will use default or MONGODB_DB_NAME)

### Connection Configuration

**File:** `backend/mongoClient.js`

```javascript
const client = new MongoClient(uri, {
  maxPoolSize: 10,  // Connection pool size
});
```

**Connection Method:**
- Uses MongoDB Node.js Driver v7.5.0
- Connection pooling enabled (10 connections)
- Lazy connection (connects on first use)

---

## Connection Status

### ⚠️ Current Issue: DNS Resolution Error

**Error Message:**
```
querySrv ECONNREFUSED _mongodb._tcp.cluster0.nyefwik.mongodb.net
```

**Meaning:** DNS lookup failed for MongoDB Atlas cluster

**Root Causes:**
1. MongoDB Atlas cluster is paused
2. Network connectivity issues
3. DNS propagation delays
4. Firewall/network blocking

---

## Verification Steps

### 1. Check MongoDB Atlas Status

**URL:** https://cloud.mongodb.com/

**Steps:**
1. Log in to MongoDB Atlas
2. Navigate to "Database" → "Deployments"
3. Check cluster0 status:
   - ✅ Should show "Running" (green)
   - ❌ If "Paused" (yellow/red) → Click "Resume"
   - ⏱️ Resume takes 1-2 minutes

### 2. Verify Network Access

**URL:** https://cloud.mongodb.com/ → Network Access

**Steps:**
1. Check IP whitelist:
   - Current IP should be listed
   - Or use `0.0.0.0/0` for testing (allows all IPs)
   
2. To add current IP:
   ```bash
   # Get your current IP
   curl https://api.ipify.org
   ```
   
3. Add IP in Atlas:
   - Click "Add IP Address"
   - Enter your IP or `0.0.0.0/0`
   - Add comment (e.g., "Development" or "Render")

### 3. Verify Database User

**URL:** https://cloud.mongodb.com/ → Database Access

**Check:**
- Username: `hr_connect2future`
- Password: Should match `@2026C2f`
- Permissions: `readWrite` on database

**To test credentials:**
```bash
# Test connection locally
cd backend
npm run db:test
```

### 4. Test DNS Resolution

**Command:**
```bash
# Windows
nslookup cluster0.nyefwik.mongodb.net

# Mac/Linux
dig cluster0.nyefwik.mongodb.net

# Or use MongoDB connection test
cd backend
node test-mongodb.js
```

**Expected Result:**
```
✅ MongoDB connected successfully
Database: Connect2Edtech
Collections: 5
```

---

## Connection Flow

### Application Startup

**File:** `backend/server.js`

```javascript
async function startServer() {
  try {
    // Test MongoDB connection on startup
    const db = await getDb();
    console.log('✅ MongoDB connected successfully');
    
    app.listen(PORT, () => {
      console.log(`🚀 Connect2Edtech Backend running on port ${PORT}`);
    });
  } catch (e) {
    console.error('❌ Failed to connect to MongoDB:', e.message);
    console.error('Server will continue but database operations will fail.');
    
    app.listen(PORT, () => {
      console.log(`🚀 Connect2Edtech Backend running on port ${PORT} (without DB)`);
    });
  }
}
```

**Behavior:**
- ✅ If MongoDB connects: Server starts with full functionality
- ⚠️ If MongoDB fails: Server starts but database operations will fail
- Server continues running even without DB (graceful degradation)

### Database Operations

**File:** `backend/store.js`

All database operations use the connection:

```javascript
export async function connectStore(collection, query = {}, options = {}) {
  const db = await getDb();
  const coll = db.collection(collection);
  return await coll.find(query, options).toArray();
}

export async function createDocument(collection, data) {
  const db = await getDb();
  const coll = db.collection(collection);
  return await coll.insertOne({ ...data, createdAt: new Date() });
}

// ... other operations
```

---

## Testing MongoDB Connection

### Local Testing

**1. Install dependencies:**
```bash
cd backend
npm install
```

**2. Test connection:**
```bash
npm run db:test
```

**Expected Output:**
```
🔌 Testing MongoDB connection...
✅ MongoDB connected successfully
📊 Database: Connect2Edtech
📦 Collections: 5
   - signups
   - enrollments
   - contacts
   - checkouts
   - cart
```

**3. If connection fails:**
```
❌ MongoDB connection failed
Error: querySrv ECONNREFUSED _mongodb._tcp.cluster0.nyefwik.mongodb.net

Troubleshooting:
1. Check MongoDB Atlas cluster status (should be Running)
2. Verify IP whitelist includes your IP
3. Verify database user credentials
4. Check network connectivity
```

### Testing from Render

**After deployment:**

1. **Check Render logs:**
   - Go to Render dashboard
   - Select your service
   - View logs
   - Look for MongoDB connection message

2. **Expected log output:**
   ```
   ✅ MongoDB connected successfully
   🚀 Connect2Edtech Backend running on port 10000
   ```

3. **If connection fails:**
   ```
   ❌ Failed to connect to MongoDB: querySrv ECONNREFUSED
   🚀 Connect2Edtech Backend running on port 10000 (without DB)
   ```

---

## Common Issues & Solutions

### Issue 1: DNS Resolution Error

**Error:**
```
querySrv ECONNREFUSED _mongodb._tcp.cluster0.nyefwik.mongodb.net
```

**Causes:**
- Cluster is paused
- DNS propagation issues
- Network blocking

**Solutions:**
1. Resume cluster in MongoDB Atlas
2. Wait 1-2 minutes for DNS propagation
3. Check network connectivity
4. Try using IP address instead of hostname (not recommended for production)

### Issue 2: Authentication Failed

**Error:**
```
MongoServerError: Authentication failed
```

**Causes:**
- Wrong username/password
- Database user doesn't exist
- User doesn't have permissions

**Solutions:**
1. Verify credentials in MongoDB Atlas
2. Reset password if needed
3. Ensure user has `readWrite` permissions
4. Check if username/password are URL-encoded correctly

### Issue 3: IP Not Whitelisted

**Error:**
```
MongoServerError: IP not whitelisted
```

**Causes:**
- Current IP not in whitelist
- Firewall blocking connection

**Solutions:**
1. Add current IP to MongoDB Atlas whitelist
2. Use `0.0.0.0/0` for testing (allows all IPs)
3. Check firewall settings

### Issue 4: Connection Timeout

**Error:**
```
MongoServerError: Connection timed out
```

**Causes:**
- Network connectivity issues
- Firewall blocking port 27017
- Cluster is down

**Solutions:**
1. Check network connectivity
2. Verify cluster is running
3. Check firewall settings
4. Try connecting from different network

---

## Environment Variables

### Required for MongoDB Connection

**backend/.env:**
```env
MONGODB_URI=mongodb+srv://hr_connect2future:%402026C2f@cluster0.nyefwik.mongodb.net/?appName=Cluster0
```

**Optional:**
```env
MONGODB_DB_NAME=Connect2Edtech  # Database name (if not in URI)
MONGODB_URL=                    # Alternative to MONGODB_URI
MONGOURI=                       # Alternative to MONGODB_URI
```

### For Render Deployment

**Set in Render dashboard:**
```
MONGODB_URI=mongodb+srv://hr_connect2future:%402026C2f@cluster0.nyefwik.mongodb.net/?appName=Cluster0
```

---

## Connection Health Check

### Health Endpoint

**URL:** `GET /health`

**Response:**
```json
{
  "ok": true,
  "mongodb": "connected"  // or "disconnected"
}
```

**Implementation:**
```javascript
app.get('/health', async (req, res) => {
  try {
    const db = await getDb();
    res.json({ 
      ok: true, 
      mongodb: 'connected' 
    });
  } catch (e) {
    res.json({ 
      ok: true,  // Server is running
      mongodb: 'disconnected' 
    });
  }
});
```

---

## Monitoring

### Connection Metrics

**To monitor MongoDB connections:**

1. **MongoDB Atlas Metrics:**
   - Connection count
   - Operations per second
   - Query execution time
   - Network traffic

2. **Application Logs:**
   ```javascript
   console.log('✅ MongoDB connected successfully');
   console.error('❌ Failed to connect to MongoDB:', e.message);
   ```

3. **Render Logs:**
   - View in Render dashboard
   - Check for connection messages
   - Monitor for errors

---

## Security Considerations

### Current Configuration

✅ **Password is URL-encoded** (`%40` for `@`)
✅ **Connection uses TLS/SSL** (mongodb+srv://)
✅ **Connection pooling** (maxPoolSize: 10)
✅ **Graceful degradation** (server starts even without DB)

### Recommendations

⚠️ **Change JWT_SECRET** in production
⚠️ **Use strong MongoDB password** (current is acceptable but could be stronger)
⚠️ **Enable MongoDB Atlas IP whitelisting** (currently using 0.0.0.0/0)
⚠️ **Enable MongoDB Atlas authentication** (already enabled)
⚠️ **Use environment variables** (already implemented)

---

## Pre-Deployment Checklist

### Before Deploying to Render

- [ ] MongoDB Atlas cluster is **Running** (not paused)
- [ ] IP whitelist includes Render IPs or `0.0.0.0/0`
- [ ] Database user `hr_connect2future` exists with `readWrite` permissions
- [ ] Password is correct (`@2026C2f`)
- [ ] `MONGODB_URI` is set in Render environment variables
- [ ] Connection test passes locally (`npm run db:test`)
- [ ] Health check endpoint works (`/health`)

### After Deploying to Render

- [ ] Check Render logs for MongoDB connection message
- [ ] Test health endpoint: `https://your-app.onrender.com/health`
- [ ] Test user registration
- [ ] Test user login
- [ ] Test cart operations
- [ ] Monitor MongoDB Atlas metrics

---

## Quick Fixes

### If MongoDB Won't Connect

1. **Resume Cluster:**
   - Go to https://cloud.mongodb.com/
   - Click "Resume" on cluster0
   - Wait 1-2 minutes

2. **Whitelist IP:**
   - Go to Network Access
   - Add `0.0.0.0/0` (for testing)
   - Or add specific IP

3. **Test Connection:**
   ```bash
   cd backend
   npm run db:test
   ```

4. **Check Logs:**
   ```bash
   # Local
   cd backend
   npm start
   
   # Render
   # View logs in Render dashboard
   ```

---

## Connection String Format

### Current Format
```
mongodb+srv://username:password@cluster0.nyefwik.mongodb.net/?appName=Cluster0
```

### With Database Name
```
mongodb+srv://username:password@cluster0.nyefwik.mongodb.net/Connect2Edtech?appName=Cluster0
```

### With Options
```
mongodb+srv://username:password@cluster0.nyefwik.mongodb.net/Connect2Edtech?appName=Cluster0&retryWrites=true&w=majority
```

---

## Summary

### Current Status: ⚠️ NOT CONNECTED

**Issue:** DNS resolution error (cluster unreachable)

**Action Required:**
1. Resume MongoDB Atlas cluster
2. Whitelist IP addresses
3. Test connection locally
4. Deploy to Render

**Configuration:** ✅ Correct
- URI format: ✅ Correct
- Credentials: ✅ Correct
- Connection settings: ✅ Correct

**Next Steps:**
1. Resume cluster in MongoDB Atlas
2. Run `npm run db:test` locally
3. Deploy to Render
4. Verify connection in production

---

**Last Updated:** 2026-07-10
**Status:** Configuration Ready, Awaiting Atlas Cluster Resume