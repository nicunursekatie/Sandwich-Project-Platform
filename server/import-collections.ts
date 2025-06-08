import { readFileSync, existsSync } from 'fs';
import { parse } from 'csv-parse/sync';
import { db } from './db';
import { sandwichCollections } from '../shared/schema';

interface CSVRow {
  'Host Name': string;
  'Sandwich Count': string;
  'Date': string;
  'Logged By': string;
  'Notes': string;
  'Created At': string;
}

export async function importCollectionsFromCSV(filePath: string) {
  console.log(`Starting CSV import from: ${filePath}`);
  
  // Check if file exists
  if (!existsSync(filePath)) {
    throw new Error(`CSV file not found: ${filePath}`);
  }

  // Read and parse CSV
  const csvContent = readFileSync(filePath, 'utf-8');
  const records: CSVRow[] = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });

  console.log(`Found ${records.length} records in CSV`);

  let successCount = 0;
  let errorCount = 0;
  const errors: string[] = [];

  // Process each record
  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    
    try {
      // Validate required fields
      if (!record['Host Name'] || !record['Sandwich Count'] || !record['Date']) {
        throw new Error(`Missing required fields in row ${i + 1}`);
      }

      // Parse sandwich count as integer
      const sandwichCount = parseInt(record['Sandwich Count']);
      if (isNaN(sandwichCount)) {
        throw new Error(`Invalid sandwich count "${record['Sandwich Count']}" in row ${i + 1}`);
      }

      // Parse dates
      let collectionDate = record['Date'];
      let submittedAt = new Date();
      
      // Try to parse Created At if provided
      if (record['Created At']) {
        const parsedDate = new Date(record['Created At']);
        if (!isNaN(parsedDate.getTime())) {
          submittedAt = parsedDate;
        }
      }

      // Insert into database
      await db.insert(sandwichCollections).values({
        hostName: record['Host Name'].trim(),
        individualSandwiches: sandwichCount,
        collectionDate: collectionDate.trim(),
        groupCollections: '[]', // Default empty JSON array
        submittedAt: submittedAt
      });

      successCount++;
      
      // Log progress every 100 records
      if ((i + 1) % 100 === 0) {
        console.log(`Processed ${i + 1}/${records.length} records...`);
      }
      
    } catch (error) {
      errorCount++;
      const errorMsg = `Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`;
      errors.push(errorMsg);
      console.error(errorMsg);
    }
  }

  // Summary
  console.log('\n=== Import Summary ===');
  console.log(`Total records processed: ${records.length}`);
  console.log(`Successfully imported: ${successCount}`);
  console.log(`Errors: ${errorCount}`);
  
  if (errors.length > 0) {
    console.log('\nError details:');
    errors.slice(0, 10).forEach(error => console.log(`  ${error}`));
    if (errors.length > 10) {
      console.log(`  ... and ${errors.length - 10} more errors`);
    }
  }

  return {
    totalRecords: records.length,
    successCount,
    errorCount,
    errors: errors.slice(0, 10) // Return first 10 errors
  };
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const csvPath = process.argv[2];
  
  if (!csvPath) {
    console.error('Usage: tsx server/import-collections.ts <path-to-csv-file>');
    process.exit(1);
  }

  importCollectionsFromCSV(csvPath)
    .then((result) => {
      console.log(`\nImport completed: ${result.successCount}/${result.totalRecords} records imported`);
      process.exit(result.errorCount > 0 ? 1 : 0);
    })
    .catch((error) => {
      console.error('Import failed:', error);
      process.exit(1);
    });
}