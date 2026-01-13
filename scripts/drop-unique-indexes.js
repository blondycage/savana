/**
 * Script to drop unique indexes on eTicket and bookingNumber
 * Run this once to fix duplicate key errors during import
 *
 * Usage: node scripts/drop-unique-indexes.js
 */

const mongoose = require('mongoose');

async function dropUniqueIndexes() {
  try {
    // Load environment variables
    require('dotenv').config({ path: '.env.local' });

    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/test';
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);

    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const bookingsCollection = db.collection('bookings');

    // Get all indexes
    const indexes = await bookingsCollection.indexes();
    console.log('\n📋 Current indexes:');
    indexes.forEach(index => {
      console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
    });

    // Drop eTicket_1 index if it exists
    try {
      await bookingsCollection.dropIndex('eTicket_1');
      console.log('\n✅ Dropped eTicket_1 index');
    } catch (error) {
      if (error.code === 27) {
        console.log('\n⚠️  eTicket_1 index does not exist');
      } else {
        console.log('\n❌ Error dropping eTicket_1:', error.message);
      }
    }

    // Drop bookingNumber_1 index if it exists
    try {
      await bookingsCollection.dropIndex('bookingNumber_1');
      console.log('✅ Dropped bookingNumber_1 index');
    } catch (error) {
      if (error.code === 27) {
        console.log('⚠️  bookingNumber_1 index does not exist');
      } else {
        console.log('❌ Error dropping bookingNumber_1:', error.message);
      }
    }

    // Create non-unique indexes for searching
    await bookingsCollection.createIndex({ eTicket: 1 });
    console.log('✅ Created non-unique eTicket index');

    await bookingsCollection.createIndex({ bookingNumber: 1 });
    console.log('✅ Created non-unique bookingNumber index');

    console.log('\n✅ Migration complete!');
    console.log('\n📋 Updated indexes:');
    const updatedIndexes = await bookingsCollection.indexes();
    updatedIndexes.forEach(index => {
      console.log(`  - ${index.name}: ${JSON.stringify(index.key)} ${index.unique ? '(unique)' : ''}`);
    });

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

dropUniqueIndexes();
