# MongoDB Setup and Configuration

## Overview
This document provides comprehensive information about the MongoDB setup for Connect2Edtech backend.

## Connection Configuration

### Environment Variables
The MongoDB connection is configured in `backend/.env`:

```env
MONGODB_URI=mongodb+srv://hr_connect2future:%402026C2f@cluster0.nyefwik.mongodb.net/?appName=Cluster0
```

**Note:** The password `@2026C2f` is URL-encoded as `%402026C2f` where `@` becomes `%40`.

### Connection Details
- **Database:** MongoDB Atlas (Cloud)
- **Cluster:** cluster0.nyefwik.mongodb.net
- **Connection Pool Size:** 10 connections
- **Driver:** mongodb v7.5.0

## Database Structure

### Collections

#### 1. signups
User accounts and authentication data.
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  phone: String,
  whatsappNumber: String,
  passwordHash: String,
  role: String (user/hr/admin),
  verified: Boolean,
  otp: String,
  otpExpiry: Date,
  createdAt: Date
}
```

#### 2. enrollments
Course enrollment records.
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  phone: String,
  college: String,
  message: String,
  courseKey: String,
  courseTitle: String,
  hostname: String,
  ip: String,
  createdAt: Date
}
```

#### 3. contacts
Contact form submissions.
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  phone: String,
  message: String,
  courses: String,
  hostname: String,
  ip: String,
  replies: Array,
  replied: Boolean,
  createdAt: Date
}
```

#### 4. dashboard
Persisted snapshots of admin dashboard statistics (one document per `type`).
```javascript
{
  _id: ObjectId,
  type: String (unique),   // e.g. "overview"
  stats: {
    students: Number,
    hrUsers: Number,
    courses: Number,
    enrollments: Number,
    contacts: Number
  },
  updatedAt: Date
}
```

## Next Steps
  courseKey: String,
  title: String,
  price: Number,
  image: String,
  addedAt: Date
}
```

## Database Indexes

### Index Strategy
All indexes are created with `background: true` to avoid blocking operations.

### signups Collection
- `email_unique`: Unique index on email (for signup/signin)
- `verified_created_idx`: Compound index on (verified, createdAt)
- `role_created_idx`: Compound index on (role, createdAt)
- `created_at_desc_idx`: Index on createdAt descending

### enrollments Collection
- `email_created_idx`: Compound index on (email, createdAt)
- `course_created_idx`: Compound index on (courseKey, createdAt)
- `created_at_desc_idx`: Index on createdAt descending

### contacts Collection
- `email_idx`: Index on email
- `created_at_desc_idx`: Index on createdAt descending
- `replied_created_idx`: Compound index on (replied, createdAt)

### dashboard Collection
- `type_unique`: Unique index on type (one snapshot document per type)
- `updated_at_desc_idx`: Index on updatedAt descending

## Setup Scripts

### 1. Test Connection
```bash
node backend/test-mongodb.js
```
Tests MongoDB connection, performs CRUD operations, and checks collections.

### 2. Create Indexes
```bash
node backend/scripts/create-indexes.js
```
Creates all necessary indexes for optimal query performance.

### 3. Analyze Queries
```bash
node backend/scripts/optimize-queries.js
```
Analyzes collections and provides optimization recommendations.

### 4. Full Setup
```bash
node backend/setup-mongodb.js
```
Complete setup including connection test and index creation.

## MongoDB Atlas Configuration

### Network Access
1. Go to MongoDB Atlas Dashboard
2. Navigate to Network Access
3. Add your IP address or allow access from anywhere (0.0.0.0/0) for development
4. Click "Confirm"

### Database User
1. Go to Database Access
2. Ensure user `hr_connect2future` exists with password `@2026C2f`
3. User should have at least `readWrite` permissions on the database

### Cluster Status
- Ensure cluster0 is running (not paused)
- Check cluster health in Atlas Dashboard
- Monitor resource usage

## Troubleshooting

### Connection Issues

#### Error: `querySrv ECONNREFUSED`
**Cause:** DNS resolution failure or network connectivity issue.

**Solutions:**
1. Verify MongoDB Atlas cluster is running
2. Check your internet connection
3. Try using a different DNS server (8.8.8.8)
4. Check firewall/antivirus settings
5. Verify IP whitelist in MongoDB Atlas

#### Error: `Authentication failed`
**Cause:** Invalid credentials.

**Solutions:**
1. Verify username and password in MONGODB_URI
2. Check database user exists in MongoDB Atlas
3. Ensure password is URL-encoded if it contains special characters

#### Error: `Missing MONGODB_URI`
**Cause:** Environment variable not loaded.

**Solutions:**
1. Ensure `.env` file exists in `backend/` directory
2. Check file is named exactly `.env` (not `.env.txt`)
3. Verify dotenv is loading correctly

### Performance Issues

#### Slow Queries
1. Use MongoDB Atlas Performance Advisor
2. Check query execution plans with `.explain("executionStats")`
3. Ensure indexes are being used
4. Consider adding compound indexes

#### High Connection Count
1. Current pool size: 10 (adjust if needed)
2. Monitor connections in Atlas Dashboard
3. Implement connection pooling best practices
4. Consider using a connection manager

## Best Practices

### Security
1. Never commit `.env` file to version control
2. Use strong passwords for database users
3. Enable IP whitelisting in production
4. Rotate credentials regularly
5. Use environment variables for sensitive data

### Performance
1. Always use indexes for frequently queried fields
2. Limit result sets with pagination
3. Use projection to return only needed fields
4. Avoid large document sizes (keep under 16MB)
5. Monitor slow queries regularly

### Data Management
1. Implement data validation at application level
2. Use appropriate data types
3. Archive old data periodically
4. Backup database regularly
5. Use transactions for multi-document operations

## Monitoring

### MongoDB Atlas Metrics
- Connection count
- Operation count
- Query execution time
- Index usage
- Disk usage
- Memory usage

### Application Metrics
- API response times
- Database query times
- Error rates
- User activity

## Backup and Recovery

### Automated Backups
MongoDB Atlas provides automated backups:
1. Go to Backup tab in Atlas
2. Configure backup schedule
3. Set retention period
4. Download backups when needed

### Manual Backup
```bash
# Export database
mongodump --uri="mongodb+srv://hr_connect2future:@2026C2f@cluster0.nyefwik.mongodb.net/"

# Import database
mongorestore --uri="mongodb+srv://hr_connect2future:@2026C2f@cluster0.nyefwik.mongodb.net/" dump/
```

## Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Node.js MongoDB Driver](https://mongodb.github.io/node-mongodb-native/)
- [MongoDB University](https://university.mongodb.com/)

## Support

For issues with:
- **MongoDB Atlas:** Check Atlas status page and support
- **Application code:** Review server logs and error messages
- **Connection issues:** Verify network and credentials

---

**Last Updated:** 2026-07-10
**Version:** 1.0.0