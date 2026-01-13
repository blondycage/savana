# Excel Import/Export Feature - Company Template

## Overview
The Excel import/export functionality has been implemented to match your company's existing template format (CUMRA 2025).

## Column Mapping

Your company template uses these columns, which map to the database as follows:

| Company Column | Database Field | Notes |
|---------------|----------------|-------|
| **UK.NO** | `bookingNumber` | Main booking reference |
| **E-TICKET** | `eTicket` | E-ticket number |
| **SURNAME** | `client.surname` | Client last name |
| **FIRST NAME** | `client.firstName` | Client first name |
| **PASSPORT** | `client.passport` | Unique identifier for clients |
| **DOB** | `client.dateOfBirth` | Client date of birth |
| **TRAVEL DATE** | `travelDate` | Departure date |
| **RETURN DATE** | `returnDate` | Return date (optional) |
| **VISA** | `visa` | Visa status/requirement |
| **PACKAGE PRICE** | `price` | Total booking price |
| **DEPOSIT** | Creates initial payment | Amount paid upfront |
| **REMAINING** | `remaining` | Auto-calculated (Price - Deposits) |
| **PRIVATE ROOM** | `notes` | Stored as "Private Room: Yes/No" |
| **UMRA VISA FEE** | N/A | Included in package price |

## Features

### 1. Download Template (📥 Download Template)
- **Button Location**: Bookings page, top right
- **File Name**: `CUMRA_2025_Template.xlsx`
- **Contains**: Sample data with 2 example bookings
- **Column Headers**: Match your company's exact format (including spaces)

### 2. Import from Excel (📤 Import Excel)
- **Button Location**: Bookings page, top right
- **Accepted Files**: `.xlsx`, `.xls`
- **Process**:
  1. Reads Excel file
  2. For each row:
     - Checks if client exists (by passport number)
     - Creates new client if not found
     - Creates booking with all details
     - Creates initial payment record if deposit > 0
  3. Returns summary: X bookings created, Y clients created, Z errors

**Smart Client Matching**:
- Uses PASSPORT as unique identifier
- If client exists → reuses existing client record
- If client doesn't exist → creates new client with data from Excel

**Validation**:
- Required fields: UK.NO, E-TICKET, PASSPORT, TRAVEL DATE, PACKAGE PRICE
- For new clients: SURNAME, FIRST NAME, DOB also required
- Skips duplicate bookings (same booking number or e-ticket)

### 3. Export to Excel (📊 Export Excel)
- **Button Location**: Bookings page, top right
- **File Name**: `CUMRA_2025_Bookings_Export.xlsx`
- **Contents**: All current bookings in company format
- **Use Case**: Download current data, update in Excel, re-import

## Usage Workflow

### Importing New Bookings

1. **Download Template**
   ```
   Click "📥 Download Template" button
   ```

2. **Fill in Excel**
   - Open downloaded `CUMRA_2025_Template.xlsx`
   - Delete sample rows
   - Add your booking data
   - Fill all required columns:
     - UK.NO (booking number)
     - E-TICKET
     - SURNAME
     - FIRST NAME
     - PASSPORT
     - DOB
     - TRAVEL DATE
     - PACKAGE PRICE
     - DEPOSIT

3. **Import File**
   ```
   Click "📤 Import Excel" button
   Select your filled Excel file
   Wait for success message
   ```

4. **Review Results**
   - Success toast shows: "X clients created, Y bookings created"
   - Check bookings list for imported data
   - Any errors will be displayed

### Exporting Existing Data

1. **Export Bookings**
   ```
   Click "📊 Export Excel" button
   ```

2. **Receive File**
   - Downloads as `CUMRA_2025_Bookings_Export.xlsx`
   - Contains ALL current bookings
   - In company template format

3. **Use Cases**:
   - Backup your data
   - Share with team
   - Update multiple bookings offline
   - Re-import after changes

## Important Notes

### Private Room
- Stored in booking notes field
- Format: "Private Room: Yes" or "Private Room: No"
- Can be any text value from Excel

### Deposits
- When importing, deposit amount creates an initial payment record
- Payment method set to "Import"
- Payment date set to import date
- Reference: "Initial deposit from Excel import"

### Remaining Balance
- Auto-calculated as: `Price - Total Payments`
- Don't need to fill in Excel (ignored on import)
- Calculated correctly on export

### Duplicate Prevention
- System checks for existing bookings by:
  - Booking Number (UK.NO)
  - E-Ticket Number
- Won't create duplicates
- Error message returned if duplicate found

### Client Matching
- Matches clients by PASSPORT number
- Passport matching is case-insensitive
- If found → links booking to existing client
- If not found → creates new client with Excel data

## Example Data

Here's what a valid row looks like:

```
UK.NO    : UK001
E-TICKET : 12345678
SURNAME  : SMITH
FIRST NAME: JOHN
PASSPORT : AB123456
DOB      : 1990-01-15
TRAVEL DATE: 2025-03-01
RETURN DATE: 2025-03-15
VISA     : Required
PACKAGE PRICE: 2500
DEPOSIT  : 500
PRIVATE ROOM: Yes
```

This will create:
- Client: JOHN SMITH (if doesn't exist)
- Booking: UK001 for £2500
- Payment: £500 deposit
- Remaining: £2000

## Troubleshooting

### "Missing required fields" Error
**Solution**: Ensure these columns are filled:
- UK.NO
- E-TICKET
- PASSPORT
- TRAVEL DATE
- PACKAGE PRICE
- For new clients: SURNAME, FIRST NAME, DOB

### "Client not found and missing details" Error
**Solution**: Client doesn't exist and Excel is missing client info. Add:
- SURNAME
- FIRST NAME
- DOB
- NATIONALITY (optional but recommended)

### "Booking already exists" Error
**Solution**: A booking with that UK.NO or E-TICKET already exists
- Change the booking number
- Or update existing booking manually

### Column Names Don't Match
**Solution**: Use the downloaded template
- Headers must match exactly (including spaces)
- Download fresh template if unsure

### Excel File Won't Upload
**Solution**: Check file format
- Must be .xlsx or .xls
- Not .csv or .numbers
- File size < 10MB

## Testing

To test the functionality:

1. **Test Template Download**:
   - Click "📥 Download Template"
   - Verify file downloads
   - Open in Excel - should see 2 sample rows

2. **Test Import**:
   - Use downloaded template
   - Modify one sample row
   - Import the file
   - Check booking appears in list

3. **Test Export**:
   - Click "📊 Export Excel"
   - Open exported file
   - Verify data matches what's in system

## Technical Details

### File Locations
```
UI Component:
  app/bookings/page.jsx (buttons and handlers)

API Routes:
  app/api/bookings/template/route.js (download template)
  app/api/bookings/import/route.js (import Excel)
  app/api/bookings/export/route.js (export Excel)

Utilities:
  utils/excel.js (parsing, mapping, generation)
```

### Libraries Used
- `xlsx` - Excel file parsing and generation
- Built-in Next.js file handling

### Performance
- Imports process rows sequentially
- ~100 rows in ~5-10 seconds
- For large files (1000+ rows), import may take 30-60 seconds

## Future Enhancements

Potential improvements:
- [ ] Progress bar for large imports
- [ ] Preview before import
- [ ] Import validation report (before saving)
- [ ] Batch operations (update existing bookings)
- [ ] Email field in template
- [ ] Phone field in template

---

**Status**: ✅ Fully Implemented
**Last Updated**: January 9, 2026
