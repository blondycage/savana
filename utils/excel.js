import * as XLSX from 'xlsx';

/**
 * Parse Excel buffer and return JSON data
 * @param {Buffer} buffer - Excel file buffer
 * @returns {Array} Array of row objects
 */
export const parseExcel = (buffer) => {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);
    return data;
  } catch (error) {
    throw new Error('Failed to parse Excel file: ' + error.message);
  }
};

/**
 * Generate Excel file from JSON data
 * @param {Array} data - Array of objects to export
 * @param {string} sheetName - Name of the worksheet
 * @returns {Buffer} Excel file buffer
 */
export const generateExcel = (data, sheetName = 'Sheet1') => {
  try {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    return buffer;
  } catch (error) {
    throw new Error('Failed to generate Excel file: ' + error.message);
  }
};

/**
 * Helper to safely get value from Excel row or return 'Not Assigned'
 */
const getValue = (row, possibleKeys, defaultValue = 'Not Assigned') => {
  for (const key of possibleKeys) {
    if (row[key] !== undefined && row[key] !== null && row[key] !== '') {
      return row[key].toString().trim();
    }
  }
  return defaultValue;
};

/**
 * Helper to safely get number value from Excel row
 */
const getNumberValue = (row, possibleKeys, defaultValue = 0) => {
  for (const key of possibleKeys) {
    if (row[key] !== undefined && row[key] !== null && row[key] !== '') {
      const num = parseFloat(row[key]);
      return isNaN(num) ? defaultValue : num;
    }
  }
  return defaultValue;
};

/**
 * Helper to safely get date value from Excel row as string
 */
const getDateValue = (row, possibleKeys) => {
  for (const key of possibleKeys) {
    if (row[key] !== undefined && row[key] !== null && row[key] !== '') {
      try {
        const date = new Date(row[key]);
        if (isNaN(date.getTime())) {
          return 'Not Assigned';
        }
        // Return as ISO date string (YYYY-MM-DD)
        return date.toISOString().split('T')[0];
      } catch {
        return 'Not Assigned';
      }
    }
  }
  return 'Not Assigned';
};

/**
 * Map Excel row to Booking data format
 * Handles various column name formats (with/without spaces)
 */
export const mapExcelToBooking = (row) => {
  return {
    eTicket: getValue(row, ['E-TICKET', ' E-TICKET ', 'E TICKET', 'eTicket']),
    bookingNumber: getValue(row, ['UK.NO', ' UK.NO ', 'UK NO', 'UKNO', 'ukNo']),
    surname: getValue(row, ['SURNAME', ' SURNAME ', 'surname']),
    firstName: getValue(row, ['FIRST NAME', ' FIRST NAME ', 'FIRST NAME ', ' FIRST NAME  ', 'firstName']),
    passport: getValue(row, ['PASSPORT', ' PASSPORT ', 'passport']),
    travelDate: getDateValue(row, ['TRAVEL DATE', ' TRAVEL DATE ', 'travelDate']),
    returnDate: getDateValue(row, ['RETURN DATE', ' RETURN DATE ', 'returnDate']),
    visa: getValue(row, ['VISA', ' VISA ', 'visa']),
    dateOfBirth: getDateValue(row, ['DOB', ' DOB ', 'dob', 'dateOfBirth']),
    nationality: getValue(row, ['NATIONALITY', ' NATIONALITY ', 'nationality']),
    packagePrice: getNumberValue(row, ['PACKAGE PRICE', ' PACKAGE PRICE ', 'packagePrice', 'price']),
    deposit: getNumberValue(row, ['DEPOSIT', ' DEPOSIT ', 'deposit']),
    remaining: getNumberValue(row, ['REMAINING', ' REMAINING ', ' REMAINING  ', 'remaining']),
    umraVisaFee: getNumberValue(row, ['UMRA VISA FEE', ' UMRA VISA FEE ', 'umraVisaFee']),
    privateRoom: getValue(row, ['PRIVATE ROOM', ' PRIVATE ROOM ', 'privateRoom']),
    status: 'Pending',
    notes: '',
    email: 'Not Assigned',
    phone: 'Not Assigned'
  };
};

/**
 * Generate company template Excel file with sample data
 */
export const generateCompanyTemplate = () => {
  const sampleData = [
    {
      'E-TICKET': 'YES',
      'UK.NO': 'UK001',
      'SURNAME': 'SMITH',
      'FIRST NAME': 'JOHN',
      'PASSPORT': 'AB123456',
      'TRAVEL DATE': '2025-03-01',
      'RETURN DATE': '2025-03-15',
      'VISA': 'Required',
      'DOB': '1990-01-15',
      'NATIONALITY': 'UK',
      'PACKAGE PRICE': 2500,
      'DEPOSIT': 500,
      'REMAINING': 2000,
      'UMRA VISA FEE': 100,
      'PRIVATE ROOM': 'Yes'
    },
    {
      'E-TICKET': 'YES',
      'UK.NO': 'UK002',
      'SURNAME': 'JONES',
      'FIRST NAME': 'MARY',
      'PASSPORT': 'CD789012',
      'TRAVEL DATE': '2025-03-01',
      'RETURN DATE': '2025-03-15',
      'VISA': 'Required',
      'DOB': '1985-05-20',
      'NATIONALITY': 'UK',
      'PACKAGE PRICE': 2500,
      'DEPOSIT': 1000,
      'REMAINING': 1500,
      'UMRA VISA FEE': 100,
      'PRIVATE ROOM': 'No'
    }
  ];

  return generateExcel(sampleData, 'CUMRA 2025');
};

/**
 * Map booking data to company Excel format for export
 */
export const mapBookingToExcelRow = (booking) => {
  return {
    'E-TICKET': booking.eTicket || 'Not Assigned',
    'UK.NO': booking.bookingNumber || 'Not Assigned',
    'SURNAME': booking.surname || 'Not Assigned',
    'FIRST NAME': booking.firstName || 'Not Assigned',
    'PASSPORT': booking.passport || 'Not Assigned',
    'TRAVEL DATE': booking.travelDate || 'Not Assigned',
    'RETURN DATE': booking.returnDate || 'Not Assigned',
    'VISA': booking.visa || 'Not Assigned',
    'DOB': booking.dateOfBirth || 'Not Assigned',
    'NATIONALITY': booking.nationality || 'Not Assigned',
    'PACKAGE PRICE': booking.packagePrice || 0,
    'DEPOSIT': booking.deposit || 0,
    'REMAINING': booking.remaining || 0,
    'UMRA VISA FEE': booking.umraVisaFee || 0,
    'PRIVATE ROOM': booking.privateRoom || 'Not Assigned'
  };
};
