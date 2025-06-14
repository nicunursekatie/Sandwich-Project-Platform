#!/usr/bin/env python3
"""
Comprehensive parser to extract all 1,278 entries from the RTF log
"""

import re
import psycopg2
import os
from datetime import datetime
from collections import defaultdict

def parse_complete_rtf_log(filename):
    """Parse the complete RTF file to extract all collection entries"""
    with open(filename, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    collections = []
    
    # More comprehensive regex to catch all week entries with dates and counts
    # This should catch the format: Week XXX (MM/DD/YYYY): number sandwiches
    week_pattern = r'Week\s+(\d+)\s*\([^\)]*(\d{1,2}\/\d{1,2}\/\d{4})[^\)]*\):\s*([0-9,]+)\s*sandwiches'
    matches = re.findall(week_pattern, content, re.IGNORECASE)
    
    print(f"Found {len(matches)} week entries with complete date/count info")
    
    # Also try alternative patterns for entries that might be formatted differently
    alt_pattern = r'Week\s+(\d+).*?(\d{1,2}\/\d{1,2}\/\d{4}).*?([0-9,]+)\s*sandwiches'
    alt_matches = re.findall(alt_pattern, content, re.IGNORECASE)
    
    print(f"Found {len(alt_matches)} entries with alternative pattern")
    
    # Combine and deduplicate
    all_matches = list(set(matches + alt_matches))
    print(f"Total unique entries: {len(all_matches)}")
    
    for week_num, date_str, count_str in all_matches:
        try:
            # Clean up the count
            count = int(count_str.replace(',', ''))
            
            # Parse date
            date_obj = datetime.strptime(date_str, '%m/%d/%Y')
            iso_date = date_obj.strftime('%Y-%m-%d')
            
            collections.append({
                'week': int(week_num),
                'date': iso_date,
                'count': count,
                'original_date': date_str,
                'raw_count': count_str
            })
        except (ValueError, IndexError) as e:
            print(f"Could not parse: Week {week_num}, {date_str}, {count_str} - {e}")
    
    # If we still don't have enough entries, try a more general approach
    if len(collections) < 1000:
        print("Trying broader pattern matching...")
        
        # Look for any line with Week followed by numbers and sandwich counts
        lines = content.split('\n')
        for line in lines:
            if 'week' in line.lower() and 'sandwich' in line.lower():
                # Extract week number
                week_match = re.search(r'week\s+(\d+)', line, re.IGNORECASE)
                # Extract date
                date_match = re.search(r'(\d{1,2}\/\d{1,2}\/\d{4})', line)
                # Extract count
                count_match = re.search(r'([0-9,]+)\s*sandwiches', line, re.IGNORECASE)
                
                if week_match and date_match and count_match:
                    try:
                        week_num = int(week_match.group(1))
                        date_str = date_match.group(1)
                        count = int(count_match.group(1).replace(',', ''))
                        
                        date_obj = datetime.strptime(date_str, '%m/%d/%Y')
                        iso_date = date_obj.strftime('%Y-%m-%d')
                        
                        # Check if this entry already exists
                        key = f"{week_num}_{iso_date}"
                        if not any(f"{c['week']}_{c['date']}" == key for c in collections):
                            collections.append({
                                'week': week_num,
                                'date': iso_date,
                                'count': count,
                                'original_date': date_str,
                                'raw_count': count_match.group(1)
                            })
                    except (ValueError, IndexError):
                        continue
    
    return collections

def analyze_rtf_totals():
    """Analyze the complete RTF log"""
    print("Parsing complete RTF log...")
    collections = parse_complete_rtf_log('attached_assets/full sandwich log_1749878586531.rtf')
    
    print(f"\nParsed {len(collections)} collection entries")
    
    if collections:
        # Calculate total
        total_sandwiches = sum(c['count'] for c in collections)
        print(f"Total sandwiches from RTF: {total_sandwiches:,}")
        
        # Show date range
        dates = [c['date'] for c in collections]
        print(f"Date range: {min(dates)} to {max(dates)}")
        
        # Show some sample entries
        print(f"\nSample entries:")
        sorted_collections = sorted(collections, key=lambda x: x['date'])
        for i, c in enumerate(sorted_collections[:10]):
            print(f"{i+1:2d}. Week {c['week']:3d} ({c['original_date']}): {c['count']:,} sandwiches")
        
        print("...")
        for i, c in enumerate(sorted_collections[-10:], len(sorted_collections)-9):
            print(f"{i:2d}. Week {c['week']:3d} ({c['original_date']}): {c['count']:,} sandwiches")
        
        # Show highest counts
        print(f"\nHighest collection weeks:")
        highest = sorted(collections, key=lambda x: x['count'], reverse=True)
        for i, c in enumerate(highest[:10]):
            print(f"{i+1:2d}. Week {c['week']:3d} ({c['original_date']}): {c['count']:,} sandwiches")
    
    return collections

if __name__ == "__main__":
    analyze_rtf_totals()