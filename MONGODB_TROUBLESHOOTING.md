# MongoDB Connection Troubleshooting

## Current Issue
❌ **Error**: `querySrv ENOTFOUND _mongodb._tcp.cluster0.noayymc.mongodb.net`

This indicates a DNS resolution failure when trying to connect to MongoDB Atlas.

## Possible Causes & Solutions

### 1. Network Connectivity
**Cause**: No internet connection or DNS issues

**Check**:
```bash
# Test DNS resolution
nslookup cluster0.noayymc.mongodb.net

# Test internet connectivity
ping 8.8.8.8
```

**Solution**: Ensure you have a stable internet connection

---

### 2. MongoDB Atlas Cluster Paused/Stopped
**Cause**: Free-tier MongoDB Atlas clusters pause after 60 days of inactivity

**Check**:
1. Log in to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Navigate to your cluster
3. Check if it shows "Paused" or "Stopped"

**Solution**:
1. Click "Resume" button in MongoDB Atlas dashboard
2. Wait for cluster to start (usually 1-2 minutes)
3. Test connection again

---

### 3. IP Whitelist Restriction
**Cause**: Your current IP address is not whitelisted in MongoDB Atlas

**Check**:
1. Log in to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Go to Network Access
3. Check if your current IP is listed

**Solution**:
1. Go to Network Access → Add IP Address
2. Either:
   - Click "Add Current IP Address"
   - Or add `0.0.0.0/0` to allow all IPs (less secure, for development only)
3. Save changes
4. Wait 1-2 minutes for changes to propagate

---

### 4. Connection String Issue
**Cause**: Invalid MongoDB URI format

**Check**:
Your current connection string in `.env.local`:
```
MONGODB_URI=mongodb+srv://yakson500_db_user:SPghUQJzufpNkfjY@cluster0.noayymc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
```

**Solution**:
1. Get a fresh connection string from MongoDB Atlas:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
2. Replace the URI in `.env.local`
3. Ensure username and password are correct

---

### 5. DNS Configuration Issue
**Cause**: Local DNS cannot resolve `mongodb+srv://` protocol

**Temporary Workaround**:
Use standard connection string instead of SRV:

```env
# Instead of mongodb+srv://
MONGODB_URI=mongodb://yakson500_db_user:SPghUQJzufpNkfjY@cluster0-shard-00-00.noayymc.mongodb.net:27017,cluster0-shard-00-01.noayymc.mongodb.net:27017,cluster0-shard-00-02.noayymc.mongodb.net:27017/?ssl=true&replicaSet=atlas-xxx&authSource=admin&retryWrites=true&w=majority
```

Get the standard connection string from MongoDB Atlas → Connect → Drivers.

---

## Quick Test

After applying any fix, test the connection:

```bash
cd /Users/macbook/Documents/travel/nextjs-app
node -e "const mongoose = require('mongoose'); const dotenv = require('dotenv'); dotenv.config({ path: '.env.local' }); mongoose.connect(process.env.MONGODB_URI).then(() => { console.log('✓ MongoDB connected!'); process.exit(0); }).catch(err => { console.error('✗ Error:', err.message); process.exit(1); });"
```

If successful, restart the Next.js server:
```bash
# Stop the current server (Ctrl+C)
npm run dev
```

---

## Most Likely Fix

Based on the error, the most common causes are:

1. **MongoDB Atlas cluster is paused** (for free tier)
   - Solution: Resume cluster in Atlas dashboard

2. **IP not whitelisted**
   - Solution: Add your IP to Network Access

3. **Network/DNS issue**
   - Solution: Check internet connection or try different network

---

## After Fixing

Once MongoDB connects successfully:
1. You should see "MongoDB connected successfully" in the server logs
2. The login API will return 200 instead of 500
3. All other API endpoints will work

---

## Need More Help?

Check MongoDB Atlas status: https://status.mongodb.com/
Contact MongoDB support: https://www.mongodb.com/support
