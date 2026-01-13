# Excel Import/Export Testing Guide

## ✅ Download & Export Now Working!

Fixed issues:
- File downloads now trigger automatically
- Proper filename extraction from headers
- Success messages show filename

---

## Sample File Available

**Location**: `/Users/macbook/Documents/travel/nextjs-app/CUMRA_2025_Sample.xlsx`

**Contains**: 3 sample bookings ready to import
- UK100 - SARAH BROWN
- UK101 - JAMES WILSON
- UK102 - FATIMA AHMED

---

## Testing Steps

### ⚠️ Prerequisites

**You MUST fix MongoDB connection first!**

See `MONGODB_TROUBLESHOOTING.md` for solutions:
1. Resume MongoDB Atlas cluster (if paused)
2. Add your IP to Network Access whitelist
3. Verify connection in server logs

Without MongoDB, all tests will fail with "Failed to import".

---

### Test 1: Download Template

1. Go to http://localhost:3000/bookings
2. Click **"📥 Download Template"** button
3. **Expected**:
   - File downloads automatically
   - Named: `CUMRA_2025_Template.xlsx`
   - Toast shows: "Template downloaded: CUMRA_2025_Template.xlsx"
   - Opens in Excel with 2 sample rows

**If it doesn't work**:
- Check browser console (F12) for errors
- Check browser download settings
- Try different browser

---

### Test 2: Import Sample File

**Option A: Use Pre-created Sample**
```bash
# File location:
/Users/macbook/Documents/travel/nextjs-app/CUMRA_2025_Sample.xlsx
```

**Option B: Use Downloaded Template**
1. Download template (Test 1)
2. Modify the sample data if desired

**Steps**:
1. Go to http://localhost:3000/bookings
2. Click **"📤 Import Excel"** button
3. Select `CUMRA_2025_Sample.xlsx`
4. Wait for upload...

**Expected Success**:
```
Toast (Green):
"Import complete! 3 bookings created, 3 clients created"
```

**Console Shows**:
```
📦 Request body type: object
📦 Data type: string
📊 Excel Import - Total rows: 3
📋 Sample row columns: [" UK.NO ", " E-TICKET ", ...]
🔄 Processing row 1: { bookingNumber: "UK100", ... }
✅ Row 1 imported successfully
✅ Row 2 imported successfully
✅ Row 3 imported successfully
📈 Import Summary: 3 bookings created, 3 clients created, 0 errors
```

**Database Check**:
- 3 new clients created (BROWN, WILSON, AHMED)
- 3 new bookings created (UK100, UK101, UK102)
- 3 new payments created (deposits)

**If it fails**:
- Check error message in toast
- Check browser console for detailed error
- Most common: MongoDB not connected

---

### Test 3: Verify Import

1. Refresh bookings page
2. **Expected**: See 3 new bookings:
   - UK100 - SARAH BROWN - £3200 (£2400 remaining)
   - UK101 - JAMES WILSON - £2800 (£1800 remaining)
   - UK102 - FATIMA AHMED - £3500 (£3000 remaining)

3. Click "View Payments" on any booking
4. **Expected**: See initial deposit payment with:
   - Method: "Import"
   - Reference: "Initial deposit from Excel import"

---

### Test 4: Export Bookings

1. Go to http://localhost:3000/bookings
2. Click **"📊 Export Excel"** button
3. **Expected**:
   - File downloads automatically
   - Named: `CUMRA_2025_Bookings_Export.xlsx`
   - Toast shows: "Bookings exported: CUMRA_2025_Bookings_Export.xlsx"

4. Open exported file in Excel
5. **Expected**: See all current bookings in company format with columns:
   - UK.NO
   - E-TICKET
   - SURNAME
   - FIRST NAME
   - PASSPORT
   - TRAVEL DATE
   - RETURN DATE
   - VISA
   - DOB
   - PACKAGE PRICE
   - DEPOSIT
   - REMAINING
   - PRIVATE ROOM

---

### Test 5: Import with Errors

**Create a test file with intentional errors**:

1. Download template
2. Open in Excel
3. Modify sample rows:
   - Row 1: Delete UK.NO (booking number)
   - Row 2: Delete PASSPORT
   - Row 3: Keep valid

4. Save and import

**Expected**:
```
Toast (Yellow warning):
"Import complete! 1 bookings created, 1 clients created

Errors (2):
Row 1: Missing required fields (Booking Number, E-Ticket, Passport, Travel Date, Price)
Row 2: Missing required fields (Booking Number, E-Ticket, Passport, Travel Date, Price)"
```

**Console Shows**:
```
❌ Row 1 error: Missing required fields...
❌ Row 2 error: Missing required fields...
✅ Row 3 imported successfully
📈 Import Summary: 1 bookings created, 1 clients created, 2 errors
```

---

### Test 6: Duplicate Detection

1. Import `CUMRA_2025_Sample.xlsx` again (same file)
2. **Expected**:
```
Toast (Yellow):
"Import complete! 0 bookings created, 0 clients created

Errors (3):
Row 1: Booking UK100 already exists
Row 2: Booking UK101 already exists
Row 3: Booking UK102 already exists"
```

This proves duplicate prevention is working!

---

### Test 7: Client Matching

**Test existing client reuse**:

1. Import sample file (creates 3 clients)
2. Download template
3. Create new booking with SAME passport as existing client:
   ```
   UK.NO: UK200
   E-TICKET: 123456789
   PASSPORT: GB999888  (same as SARAH BROWN)
   ... other fields
   ```
4. Import

**Expected**:
```
Toast: "Import complete! 1 bookings created, 0 clients created"
```

**Verify**:
- New booking UK200 linked to existing SARAH BROWN client
- No duplicate client created

---

## Troubleshooting

### "Failed to import Excel file"
**Check**: Browser console for real error
**Common causes**:
- MongoDB not connected
- Invalid Excel file format
- File too large (>10MB)

### Download doesn't start
**Solutions**:
- Check browser download settings
- Try different browser
- Check browser console for errors

### Template has wrong columns
**Solution**:
- Re-download fresh template
- Don't modify column headers
- Use exact format provided

### Import shows 0 rows
**Causes**:
- Empty Excel file
- Wrong sheet selected
- Headers only, no data rows

---

## Sample Data Reference

### UK100 - SARAH BROWN
```
UK.NO: UK100
E-TICKET: 111222333
PASSPORT: GB999888
DOB: 1988-03-20
TRAVEL: 2025-05-15 to 2025-05-30
PRICE: £3200, DEPOSIT: £800
PRIVATE ROOM: Yes
```

### UK101 - JAMES WILSON
```
UK.NO: UK101
E-TICKET: 444555666
PASSPORT: GB777666
DOB: 1975-11-10
TRAVEL: 2025-06-01 to 2025-06-15
PRICE: £2800, DEPOSIT: £1000
PRIVATE ROOM: No
```

### UK102 - FATIMA AHMED
```
UK.NO: UK102
E-TICKET: 777888999
PASSPORT: GB555444
DOB: 1992-08-05
TRAVEL: 2025-07-10 to 2025-07-25
PRICE: £3500, DEPOSIT: £500
PRIVATE ROOM: Yes
```

---

## Success Checklist

- [ ] MongoDB connected successfully
- [ ] Template downloads automatically
- [ ] Template opens with 2 sample rows
- [ ] Sample file imports successfully
- [ ] 3 bookings visible in list
- [ ] 3 clients created in database
- [ ] Payments created for deposits
- [ ] Export downloads automatically
- [ ] Exported file opens in Excel
- [ ] Re-importing shows duplicate errors
- [ ] Error messages display in toast
- [ ] Console shows detailed logs

---

## Next Steps

Once all tests pass:
1. Try importing your actual company data
2. Verify all fields map correctly
3. Check private room info in notes
4. Verify payment calculations
5. Export and verify format matches expectations

---

**Last Updated**: January 9, 2026
**Status**: Download/Export fixed, ready for testing
