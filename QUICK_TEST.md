# Quick Test Instructions

## 🚀 Fast Test (5 minutes)

### Step 1: Fix MongoDB (REQUIRED)
```
1. Go to https://cloud.mongodb.com/
2. Resume your cluster (if paused)
3. Add your IP to Network Access
4. Wait 2 minutes
```

### Step 2: Verify Server Running
```bash
# Check terminal where "npm run dev" is running
# Look for: "MongoDB connected successfully"
```

### Step 3: Test Downloads

**A. Template Download:**
1. Open http://localhost:3000/bookings
2. Click "📥 Download Template"
3. File should download: `CUMRA_2025_Template.xlsx`
4. Open it - should have 2 sample rows

**B. Export (if you have bookings):**
1. Click "📊 Export Excel"
2. File should download: `CUMRA_2025_Bookings_Export.xlsx`

### Step 4: Test Import

**Use the pre-made sample file:**
```bash
File location:
/Users/macbook/Documents/travel/nextjs-app/CUMRA_2025_Sample.xlsx
```

1. Click "📤 Import Excel"
2. Select `CUMRA_2025_Sample.xlsx`
3. Should see: "Import complete! 3 bookings created, 3 clients created"
4. Refresh page - see 3 new bookings

---

## Expected Results

✅ **Template Download**: File downloads, opens in Excel
✅ **Import**: 3 bookings + 3 clients created
✅ **Export**: File downloads with all bookings
✅ **Toast Messages**: Show success/errors clearly
✅ **Console Logs**: Show detailed progress (F12)

---

## If Something Fails

1. **MongoDB Error**
   → See `MONGODB_TROUBLESHOOTING.md`

2. **Download doesn't work**
   → Check browser console (F12)
   → Try different browser

3. **Import fails**
   → Check toast message for specific error
   → Check browser console for details
   → See `IMPORT_TROUBLESHOOTING.md`

---

## Sample File Contents

`CUMRA_2025_Sample.xlsx` has 3 ready-to-import bookings:
- UK100 - SARAH BROWN - £3200
- UK101 - JAMES WILSON - £2800
- UK102 - FATIMA AHMED - £3500

Total value: £9500
Total deposits: £2300
Creates: 3 clients, 3 bookings, 3 payments

---

**Everything working?** ✅
You're ready to import real company data!

**Still having issues?** ❌
See full docs: `TESTING_GUIDE.md`
