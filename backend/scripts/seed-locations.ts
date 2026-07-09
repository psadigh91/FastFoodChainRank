#!/usr/bin/env ts-node

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import * as fs from 'fs';
import * as path from 'path';

const client = new DynamoDBClient({ region: 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);

const LOCATIONS_TABLE = 'ChainRank-Locations';

async function seedLocations() {
  console.log('🌱 Seeding ChainRank locations...\n');

  // Read seed data
  const seedDataPath = path.join(__dirname, 'seed-data.json');
  const seedData = JSON.parse(fs.readFileSync(seedDataPath, 'utf-8'));

  const { locations, menuItems } = seedData;

  console.log(`📍 Found ${locations.length} locations to seed`);
  console.log(`🍔 Found ${menuItems.length} menu items\n`);

  // Seed each location
  for (const location of locations) {
    try {
      // Initialize menu item ratings (all start at 0)
      const menuItemRatings: Record<string, { avgRating: number; count: number }> = {};
      menuItems.forEach((item: any) => {
        menuItemRatings[item.id] = { avgRating: 0, count: 0 };
      });

      const locationData = {
        ...location,
        averageRating: 0,
        reviewCount: 0,
        menuItems: menuItemRatings,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const command = new PutCommand({
        TableName: LOCATIONS_TABLE,
        Item: locationData,
      });

      await docClient.send(command);
      console.log(`✅ Seeded: ${location.name}`);
    } catch (error) {
      console.error(`❌ Failed to seed ${location.name}:`, error);
    }
  }

  console.log('\n🎉 Seeding complete!');
  console.log(`\n📊 Summary:`);
  console.log(`  - ${locations.length} locations added`);
  console.log(`  - ${menuItems.length} menu items configured per location`);
  console.log(`  - Table: ${LOCATIONS_TABLE}`);
}

// Run the seed script
seedLocations()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });
