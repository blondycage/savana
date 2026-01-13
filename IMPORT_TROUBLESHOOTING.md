# Excel Import Troubleshooting Guide

## Updated Features

### ✅ Better Error Messages
- Real error messages now shown in toast notifications
- Errors display for 10 seconds (not 3)
- Shows first 3 errors with row numbers
- Multi-line toast support
- Console logs detailed import progress

### ✅ Detailed Console Logging
When importing, check browser console (F12) for:
- Total rows found in Excel
- Column names detected
- Each row processing status
- Success/failure for each row
- Final import summary

## How to Debug Import Issues

### Step 1: Open Browser Console
1. Press F12 in browser
2. Go to "Console" tab
3. Click "Import Excel" button
4. Watch for log messages

### Step 2: Check Error Messages
Look for these logs:
```
📊 Excel Import - Total rows: X
📋 Sample row columns: [" UK.NO ", " E-TICKET ", ...]
📝 Sample row data: {...}
🔄 Processing row 1: {...}
✅ Row 1 imported successfully
or
❌ Row 1 error: Missing required fields...
📈 Import Summary: X bookings created, Y clients created, Z errors
```

### Step 3: Common Errors & Fixes

#### Error: "Missing required fields"
**Cause**: Required columns are empty or missing

**Required Fields**:
- UK.NO (booking number)
- E-TICKET
- PASSPORT
- TRAVEL DATE
- PACKAGE PRICE

**For new clients, also need**:
- SURNAME
- FIRST NAME
- DOB

**Fix**: Fill in all required fields in Excel

---

#### Error: "Failed to parse Excel file"
**Cause**: File format issue

**Fix**:
1. Download fresh template
2. Copy data to new template
3. Save as .xlsx
4. Try import again

---

#### Error: "Booking XXX already exists"
**Cause**: Duplicate booking number or e-ticket

**Fix**:
1. Check if booking is already in system
2. Use different booking number
3. Or update existing booking manually

---

#### Error: "Client with passport XXX not found and missing required client details"
**Cause**: Client doesn't exist and Excel missing client info

**Fix**: Add these columns for the row:
- SURNAME
- FIRST NAME
- DOB
- NATIONALITY (optional)

---

#### Error: "Failed to import Excel file" (generic)
**Cause**: Server error or network issue

**Fix**:
1. Check MongoDB is connected
2. Check browser console for details
3. Check server logs for specific error

---

## Template Column Names (IMPORTANT!)

Your template MUST have these EXACT column names (including spaces):

```
 UK.NO
 E-TICKET
 SURNAME
 FIRST NAME
 PASSPORT
 TRAVEL DATE
 RETURN DATE
 VISA
 DOB
 PACKAGE PRICE
 DEPOSIT
 REMAINING
 PRIVATE ROOM
```

**Note**: Column names have spaces before/after! This matches your company's existing template.

## Testing with Template

### Good Test:
1. Download template (📥 Download Template)
2. File downloads as `CUMRA_2025_Template.xlsx`
3. Open in Excel
4. See 2 sample rows (UK001, UK002)
5. Modify UK001 row data
6. Save file
7. Import (📤 Import Excel)
8. Should see: "Import complete! 0 clients created, 1 bookings created"

### What Gets Created:
For each row in Excel:
1. **Client** (if passport doesn't exist)
   - Creates in `clients` collection
   - Links to booking

2. **Booking**
   - Creates in `bookings` collection
   - References client by ID
   - Stores all booking details

3. **Payment** (if deposit > 0)
   - Creates in `payments` collection
   - References booking by ID
   - Amount = deposit value from Excel

## MongoDB Connection Required

Import will FAIL if MongoDB is not connected.

**Check**:
1. Look at server console
2. Should see: "MongoDB connected successfully"
3. If not, see `MONGODB_TROUBLESHOOTING.md`

## Browser Console Example

### Successful Import:
```
📊 Excel Import - Total rows: 2
📋 Sample row columns: [" UK.NO ", " E-TICKET ", " SURNAME ", ...]
📝 Sample row data: { " UK.NO ": "UK001", " E-TICKET ": "12345678", ... }

🔄 Processing row 1: {
  bookingNumber: "UK001",
  passport: "AB123456",
  price: 2500
}
✅ Row 1 imported successfully

🔄 Processing row 2: {
  bookingNumber: "UK002",
  passport: "CD789012",
  price: 2500
}
✅ Row 2 imported successfully

📈 Import Summary: 2 bookings created, 2 clients created, 0 errors
```

### Failed Import (with errors):
```
📊 Excel Import - Total rows: 3
📋 Sample row columns: [" UK.NO ", " E-TICKET ", ...]

🔄 Processing row 1: {
  bookingNumber: "",
  passport: "",
  price: 0
}
❌ Row 1 error: Missing required fields (Booking Number, E-Ticket, Passport, Travel Date, Price)

🔄 Processing row 2: {
  bookingNumber: "UK001",
  passport: "AB123456",
  price: 2500
}
✅ Row 2 imported successfully

📈 Import Summary: 1 bookings created, 1 clients created, 1 errors
```

## Toast Notification Examples

### Success:
```
Import complete! 5 bookings created, 3 clients created
```
(Green toast, shows 5 seconds)

### With Warnings:
```
Import complete! 3 bookings created, 2 clients created

Errors (2):
Row 1: Missing required fields
Row 4: Booking UK001 already exists
```
(Yellow toast, shows 8 seconds)

### Error:
```
Failed to parse Excel file: Invalid file format
```
(Red toast, shows 10 seconds)

## Still Having Issues?

1. **Download fresh template** - always use latest
2. **Check column names** - must match exactly
3. **Check MongoDB connection** - must be connected
4. **Check browser console** - detailed error info
5. **Check server logs** - terminal where `npm run dev` runs
6. **Try sample data first** - import template as-is to test

## Example Valid Row

```excel
| UK.NO  | E-TICKET | SURNAME | FIRST NAME | PASSPORT | DOB        | TRAVEL DATE | PACKAGE PRICE | DEPOSIT |
|--------|----------|---------|------------|----------|------------|-------------|---------------|---------|
| UK003  | 99999999 | JONES   | EMMA       | XY789012 | 1992-03-10 | 2025-04-01  | 3000          | 800     |
```

This row will:
- ✅ Create client EMMA JONES (passport XY789012)
- ✅ Create booking UK003 for £3000
- ✅ Create payment for £800 deposit
- ✅ Show remaining balance £2200

---

**Updated**: January 9, 2026
**Status**: Error handling improved with detailed logging
