// MongoDB Database Inspector
// This script connects to your MongoDB and retrieves actual schema information

const mongoose = require('mongoose');
require('dotenv').config();

async function inspectDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.DB_URL);
    console.log('✅ Connected to MongoDB Atlas\n');

    const db = mongoose.connection.db;
    const dbName = db.databaseName;
    console.log(`📦 Database: ${dbName}\n`);

    // Get all collections
    const collections = await db.listCollections().toArray();
    console.log(`📊 Total Collections: ${collections.length}\n`);
    console.log('=' .repeat(80));

    // Inspect each collection
    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name;
      const collection = db.collection(collectionName);
      
      console.log(`\n📁 Collection: ${collectionName}`);
      console.log('-'.repeat(80));
      
      // Get document count
      const count = await collection.countDocuments();
      console.log(`📈 Document Count: ${count}`);
      
      // Get indexes
      const indexes = await collection.indexes();
      console.log(`\n🔍 Indexes:`);
      indexes.forEach(index => {
        console.log(`   - ${JSON.stringify(index.key)} ${index.unique ? '(UNIQUE)' : ''}`);
      });
      
      // Get sample documents
      const sampleDocs = await collection.find().limit(2).toArray();
      
      if (sampleDocs.length > 0) {
        console.log(`\n📄 Sample Document Schema:`);
        const firstDoc = sampleDocs[0];
        
        // Show field structure
        Object.keys(firstDoc).forEach(key => {
          const value = firstDoc[key];
          const type = Array.isArray(value) ? 'Array' : typeof value;
          const isObjectId = value && value.constructor && value.constructor.name === 'ObjectId';
          const actualType = isObjectId ? 'ObjectId' : type;
          
          if (type === 'object' && !isObjectId && !Array.isArray(value)) {
            console.log(`   ${key}: Object {`);
            Object.keys(value).forEach(subKey => {
              const subValue = value[subKey];
              const subType = typeof subValue;
              console.log(`      ${subKey}: ${subType}`);
            });
            console.log(`   }`);
          } else if (Array.isArray(value) && value.length > 0) {
            const firstItem = value[0];
            const itemType = typeof firstItem === 'object' ? 'Object' : typeof firstItem;
            console.log(`   ${key}: Array<${itemType}> (${value.length} items)`);
            if (typeof firstItem === 'object' && firstItem !== null) {
              console.log(`      Sample item keys: ${Object.keys(firstItem).join(', ')}`);
            }
          } else {
            console.log(`   ${key}: ${actualType}`);
          }
        });
        
        console.log(`\n📋 Sample Document (First):`);
        console.log(JSON.stringify(firstDoc, null, 2));
        
        if (sampleDocs.length > 1) {
          console.log(`\n📋 Sample Document (Second):`);
          console.log(JSON.stringify(sampleDocs[1], null, 2));
        }
      } else {
        console.log(`\n⚠️  Collection is empty`);
      }
      
      console.log('\n' + '='.repeat(80));
    }

    // Database statistics
    console.log(`\n📊 Database Statistics:`);
    const stats = await db.stats();
    console.log(`   Total Size: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Storage Size: ${(stats.storageSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Number of Collections: ${stats.collections}`);
    console.log(`   Number of Objects: ${stats.objects}`);
    console.log(`   Average Object Size: ${(stats.avgObjSize / 1024).toFixed(2)} KB`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Disconnected from MongoDB');
    process.exit(0);
  }
}

inspectDatabase();
