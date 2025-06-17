# Analytics Fix Report

## Issue Identified
The average of 1110 sandwiches per collection is caused by historical "OG Sandwich Project" bulk imports that represent weekly totals (ranging from 290 to 10,085 sandwiches) rather than individual collection events.

## Data Analysis
- Total collections: 1,666
- Collections with "OG Sandwich Project": 73 entries
- OG Project average: 3,361 sandwiches per entry
- Location-based collections average: 784 sandwiches per entry

## Solution
The analytics should provide separate views:
1. **All Data**: Including historical bulk imports (current view)
2. **Location-Based Only**: Excluding OG Project bulk imports for realistic averages
3. **Data Quality Indicators**: Clearly marking which entries are bulk imports vs individual collections

This gives users context about why the average is high and provides more meaningful insights for operational planning.