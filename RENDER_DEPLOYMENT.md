# Render Deployment Guide

## Overview
This guide provides step-by-step instructions for deploying the Connect2Edtech application to Render.

## Prerequisites

### Accounts Required
1. **Render Account** - Sign up at https://render.com
2. **MongoDB Atlas Account** - Already configured (https://cloud.mongodb.com)
3. **GitHub Repository** - Code pushed to https://github.com/milindcs/Connect2Edtech

### Before You Begin
- Ensure MongoDB Atlas cluster is running
- Whitelist Render IP addresses in MongoDB Atlas (or use 0.0.0.0/0)
- Have all environment variables ready

---

## Deployment Configuration

### render.yaml
The project includes a `render.yaml` file with the following configuration:

```yaml
services:
  - type: web
    name: connect2edtech
    runtime: node
    plan: free
    buildCommand: cd frontend && npm install && npm run build && cd ../backend && npm install
    startCommand: cd backend && node server.js
    envVars:
      - key: MONGODB_URI
        sync: false
      - key: JWT_SECRET
        sync: false
      - key: NODE_ENV
        value: production
      - key: VERCEL
        value: "0"
    healthCheckPath: /health
```

### What This Does
- **Service Type:** Web service (Node.js)
- **Plan:** Free tier
- **Build:** Installs frontend dependencies, builds frontend, installs backend dependencies
- **Start:** Runs the backend server (which serves both API and frontend)
- **Health Check:** Monitors `/health` endpoint

---

## Step-by-Step Deployment

### Method 1: Deploy via Render Dashboard (Recommended)

#### 1. Connect GitHub Repository
1. Go to https://dashboard.render.com
2. Click "New" → "Web Service"
3. Connect your GitHub account
4. Select repository: `milindcs/Connect2Edtech`
5. Select branch: `blackboxai/mongodb-auth` (or your preferred branch)

#### 2. Configure Service
- **Name:** `connect2edtech`
- **Runtime:** Node.js
- **Plan:** Free
- **Region:** Choose closest to your users (e.g., Frankfurt, Singapore)

#### 3. Build & Deploy Settings
- **Build Command:** 
  ```bash
  cd frontend && npm install && npm run build && cd ../backend && npm install
  ```
- **Start Command:**
  ```bash
  cd backend && node server.js
  ```
- **Health Check Path:** `/health`

#### 4. Environment Variables
Click "Advanced" → "Add Environment Variable" and add:

**Required:**
```
MONGODB_URI=mongodb+srv://hr_connect2future:%402026C2f@cluster0.nyefwik.mongodb.net/?appName=Cluster0
JWT_SECRET=change-me-to-a-strong-secret-in-production
NODE_ENV=production
VERCEL=0
```

**Email (SMTP):**
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=hr@connect2future.com
SMTP_PASS=@2026C2f
MAIL_FROM=hr@connect2future.com
```

**Admin Bootstrap:**
```
ADMIN_BOOTSTRAP_SECRET=c2f-bootstrap-9f3a7b21e8d4a6c0b5e1f79a2d34c68
```

**Optional (CORS):**
```
CORS_ORIGINS=https://connect2edtech.onrender.com,http://localhost:5173
```

#### 5. Deploy
1. Click "Create Web Service"
2. Wait for build to complete (5-10 minutes)
3. Monitor logs for any errors
4. Once deployed, you'll get a URL like: `https://connect2edtech.onrender.com`

---

### Method 2: Deploy via render.yaml (Blue/Green)

#### 1. Ensure render.yaml is in Root
The `render.yaml` file should be in the root of your repository.

#### 2. Deploy via Render CLI
```bash
# Install Render CLI
npm install -g @render/cli

# Login to Render
render login

# Deploy
render deploy
```

#### 3. Or Use Render API
```bash
curl -X POST https://api.render.com/v1/services \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d @render.yaml
```

---

## Post-Deployment

### 1. Verify Deployment
1. Visit your Render URL: `https://connect2edtech.onrender.com`
2. Check health endpoint: `https://connect2edtech.onrender.com/health`
3. Should return: `{"ok": true}`

### 2. Test Features
- ✅ Homepage loads
- ✅ Courses page loads
- ✅ User registration works
- ✅ Email verification works
- ✅ User login works
- ✅ Cart operations work
- ✅ Contact form works
- ✅ Admin dashboard accessible (with admin credentials)

### 3. Create Admin User
Use the bootstrap endpoint to create an admin user:

```bash
curl -X POST https://connect2edtech.onrender.com/api/admin/bootstrap \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "c2f-bootstrap-9f3a7b21e8d4a6c0b5e1f79a2d34c68",
    "email": "admin@connect2future.com",
    "name": "Admin User",
    "phone": "7019436720",
    "password": "YourSecurePassword123"
  }'
```

### 4. Configure MongoDB Atlas
1. Go to https://cloud.mongodb.com/
2. Navigate to Network Access
3. Add Render IP addresses or use 0.0.0.0/0 for testing
4. Verify database user has readWrite permissions

---

## Environment Variables Reference

### Backend (.env)
All environment variables should be set in Render dashboard:

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `MONGODB_URI` | MongoDB Atlas connection string | Yes | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `JWT_SECRET` | Secret for JWT token signing | Yes | `your-secret-key-here` |
| `NODE_ENV` | Environment mode | Yes | `production` |
| `VERCEL` | Disable Vercel-specific code | Yes | `0` |
| `SMTP_HOST` | Email SMTP host | Yes | `smtp.gmail.com` |
| `SMTP_PORT` | Email SMTP port | Yes | `587` |
| `SMTP_USER` | Email username | Yes | `hr@connect2future.com` |
| `SMTP_PASS` | Email password | Yes | `your-app-password` |
| `MAIL_FROM` | From email address | Yes | `hr@connect2future.com` |
| `ADMIN_BOOTSTRAP_SECRET` | Secret for admin creation | Yes | `your-bootstrap-secret` |
| `CORS_ORIGINS` | Allowed CORS origins | No | `https://yourdomain.com` |
| `PORT` | Server port | No | `10000` (Render sets this) |

### Frontend (.env)
Frontend environment variables are baked in at build time:

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://connect2edtech.onrender.com` |

**Note:** Update `frontend/.env` before building if your backend URL is different.

---

## Build Process

### What Happens During Build

1. **Frontend Build**
   ```bash
   cd frontend
   npm install
   npm run build
   ```
   - Installs frontend dependencies
   - Creates optimized production build in `frontend/dist/`

2. **Backend Install**
   ```bash
   cd backend
   npm install
   ```
   - Installs backend dependencies

3. **Start Server**
   ```bash
   cd backend
   node server.js
   ```
   - Starts Express server on port 10000
   - Connects to MongoDB
   - Serves frontend from `frontend/dist/`
   - API routes available at `/api/*`

---

## Troubleshooting

### Build Failures

#### Issue: "npm install failed"
**Solution:**
- Check package.json for dependency conflicts
- Ensure Node.js version is 20.x (specified in frontend/package.json)
- Check build logs for specific errors

#### Issue: "Frontend build failed"
**Solution:**
- Check Vite configuration
- Ensure all imports are correct
- Check for missing assets

### Runtime Errors

#### Issue: "Cannot connect to MongoDB"
**Solution:**
1. Verify MONGODB_URI is correct
2. Check MongoDB Atlas cluster is running
3. Whitelist Render IPs in MongoDB Atlas
4. Verify database user credentials

#### Issue: "Server won't start"
**Solution:**
1. Check logs in Render dashboard
2. Verify PORT environment variable
3. Ensure startCommand is correct
4. Check for syntax errors in server.js

#### Issue: "Frontend not loading"
**Solution:**
1. Verify frontend build completed successfully
2. Check that `frontend/dist/` exists
3. Verify static file serving in server.js
4. Check file paths in server.js

### Performance Issues

#### Issue: "Slow response times"
**Solution:**
1. Upgrade to paid plan (free tier has cold starts)
2. Optimize database queries
3. Add caching layer
4. Use CDN for static assets

#### Issue: "App going to sleep"
**Solution:**
- Free tier apps sleep after 15 minutes of inactivity
- Upgrade to paid plan for always-on
- Or use a service like UptimeRobot to ping every 10 minutes

---

## Monitoring

### Render Dashboard
- **Logs:** View real-time application logs
- **Metrics:** CPU, memory, network usage
- **Events:** Deployments, crashes, restarts
- **Health:** Monitor `/health` endpoint

### MongoDB Atlas
- **Metrics:** Connection count, operations, query time
- **Alerts:** Set up alerts for high CPU, low disk space
- **Performance:** Use Performance Advisor for query optimization

---

## Custom Domain (Optional)

### 1. Add Custom Domain
1. Go to Render dashboard
2. Select your service
3. Click "Settings" → "Custom Domains"
4. Add your domain (e.g., `connect2edtech.com`)

### 2. Configure DNS
Add these records to your domain registrar:
```
Type: CNAME
Name: www
Value: connect2edtech.onrender.com

Type: A
Name: @
Value: [Render's IP address]
```

### 3. Enable HTTPS
- Render automatically provisions SSL certificate
- HTTPS is enabled by default for custom domains

---

## CI/CD (Continuous Deployment)

### Automatic Deployments
Render automatically deploys when you push to GitHub:

1. Push to `blackboxai/mongodb-auth` branch
2. Render detects changes
3. Builds and deploys automatically
4. You get notified via email

### Manual Deployments
1. Go to Render dashboard
2. Select your service
3. Click "Manual Deploy" → "Deploy latest commit"

---

## Scaling

### Free Tier Limitations
- 512 MB RAM
- Shared CPU
- Sleeps after 15 minutes inactivity
- 100 GB bandwidth/month

### Upgrade Options
1. **Starter Plan ($7/month)**
   - 512 MB RAM
   - Always on
   - No sleep

2. **Standard Plan ($25/month)**
   - 1 GB RAM
   - Dedicated CPU
   - Better performance

3. **Pro Plan ($85/month)**
   - 4 GB RAM
   - Multiple instances
   - Load balancing

---

## Security Checklist

### Pre-Deployment
- ✅ Change JWT_SECRET to strong random value
- ✅ Use strong MongoDB password
- ✅ Enable MongoDB Atlas IP whitelisting
- ✅ Enable HTTPS (automatic on Render)
- ✅ Set CORS_ORIGINS to your domain
- ✅ Use environment variables (not hardcoded)
- ✅ Enable Render's automatic security patches

### Post-Deployment
- ✅ Monitor logs for suspicious activity
- ✅ Set up MongoDB Atlas alerts
- ✅ Regular security audits
- ✅ Keep dependencies updated
- ✅ Use Render's DDoS protection

---

## Backup Strategy

### Database Backups
- MongoDB Atlas provides automated backups
- Configure backup schedule in Atlas dashboard
- Retention: 7 days (free tier) to 2 years (paid)

### Code Backups
- GitHub repository is your code backup
- Enable branch protection
- Use tags for releases

---

## Cost Estimation

### Render Free Tier
- **Cost:** $0/month
- **Limitations:** Sleep after 15 min, shared resources
- **Best for:** Development, testing, low-traffic sites

### Render Starter
- **Cost:** $7/month
- **Benefits:** Always on, no sleep
- **Best for:** Production, small traffic

### MongoDB Atlas Free Tier
- **Cost:** $0/month
- **Limitations:** 512 MB storage, shared cluster
- **Best for:** Development, testing

### Total Cost
- **Development:** $0/month (Render Free + Atlas Free)
- **Production:** $7/month (Render Starter + Atlas Free)
- **Production (with backups):** $7-50/month

---

## Support

### Render Support
- Documentation: https://render.com/docs
- Status: https://status.render.com
- Support: support@render.com

### MongoDB Atlas Support
- Documentation: https://docs.atlas.mongodb.com
- Status: https://status.mongodb.com
- Support: https://support.mongodb.com

---

## Quick Deployment Checklist

- [ ] MongoDB Atlas cluster is running
- [ ] MongoDB Atlas IP whitelist configured
- [ ] GitHub repository is up to date
- [ ] render.yaml is in root directory
- [ ] All environment variables are ready
- [ ] Render account is created
- [ ] GitHub is connected to Render
- [ ] Service is created in Render
- [ ] Environment variables are set in Render
- [ ] Build completes successfully
- [ ] Health check passes
- [ ] Application is accessible via URL
- [ ] Admin user is created via bootstrap
- [ ] All features are tested
- [ ] Custom domain is configured (optional)
- [ ] Monitoring is set up

---

## Next Steps After Deployment

1. **Test All Features**
   - User registration
   - Email verification
   - User login
   - Course browsing
   - Cart operations
   - Contact form
   - Admin dashboard

2. **Monitor Performance**
   - Check Render logs
   - Monitor MongoDB Atlas metrics
   - Set up alerts

3. **Optimize**
   - Enable caching
   - Optimize images
   - Minify assets
   - Use CDN

4. **Scale**
   - Upgrade plan if needed
   - Add more resources
   - Implement load balancing

---

**Last Updated:** 2026-07-10
**Version:** 1.0.0
**Status:** Ready for Deployment