"""
Analyze the master spreadsheet to identify missing data and close the gap to 1,868,147 sandwiches
"""
import pandas as pd
import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv

load_dotenv()

def connect_to_db():
    """Connect to PostgreSQL database"""
    return psycopg2.connect(
        host=os.getenv("PGHOST"),
        database=os.getenv("PGDATABASE"),
        user=os.getenv("PGUSER"),
        password=os.getenv("PGPASSWORD"),
        port=os.getenv("PGPORT")
    )

def get_current_database_totals():
    """Get current totals from database"""
    conn = connect_to_db()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    # Get raw database total
    cursor.execute("""
        SELECT 
            COUNT(*) as total_entries,
            SUM(individual_sandwiches) as raw_total,
            MIN(collection_date) as earliest_date,
            MAX(collection_date) as latest_date
        FROM sandwich_collections;
    """)
    raw_stats = cursor.fetchone()
    
    # Get all collections for group parsing analysis
    cursor.execute("""
        SELECT individual_sandwiches, group_collections 
        FROM sandwich_collections 
        WHERE individual_sandwiches IS NOT NULL;
    """)
    collections = cursor.fetchall()
    
    # Calculate total with group parsing (like the analytics page does)
    def parse_group_collections(group_data):
        if not group_data:
            return 0
        if isinstance(group_data, (int, float)):
            return group_data
        if isinstance(group_data, str):
            try:
                import json
                parsed = json.loads(group_data)
                if isinstance(parsed, list):
                    return sum(item.get('sandwiches', 0) if isinstance(item, dict) else 0 for item in parsed)
                elif isinstance(parsed, dict):
                    return parsed.get('sandwiches', 0)
                return 0
            except:
                return 0
        return 0
    
    analytics_total = 0
    for collection in collections:
        individual = collection['individual_sandwiches'] or 0
        group = parse_group_collections(collection['group_collections'])
        analytics_total += individual + group
    
    cursor.close()
    conn.close()
    
    return {
        'raw_total': raw_stats['raw_total'],
        'analytics_total': analytics_total,
        'entries': raw_stats['total_entries'],
        'date_range': f"{raw_stats['earliest_date']} to {raw_stats['latest_date']}"
    }

def analyze_master_spreadsheet():
    """Analyze the cleaned master spreadsheet"""
    try:
        # Try different sheet names and file formats
        file_path = "attached_assets/CLEANED UP Sandwich Totals (3)_1749876826872.xlsx"
        
        print(f"Analyzing master spreadsheet: {file_path}")
        
        # Read the Excel file
        excel_file = pd.ExcelFile(file_path)
        print(f"Available sheets: {excel_file.sheet_names}")
        
        # Try to read the main sheet
        df = pd.read_excel(file_path, sheet_name=0)  # Read first sheet
        print(f"Spreadsheet shape: {df.shape}")
        print(f"Columns: {list(df.columns)}")
        
        # Look for total sandwich columns
        sandwich_columns = [col for col in df.columns if 'sandwich' in str(col).lower() or 'total' in str(col).lower()]
        print(f"Potential sandwich columns: {sandwich_columns}")
        
        # Calculate totals from different columns
        for col in sandwich_columns:
            if df[col].dtype in ['int64', 'float64']:
                total = df[col].sum()
                non_null_count = df[col].count()
                print(f"Total from {col}: {total:,} (non-null entries: {non_null_count})")
        
        # Check the main total column more carefully
        total_col = 'Total # of Sandwiches'
        if total_col in df.columns:
            print(f"\n{total_col} analysis:")
            print(f"  Data type: {df[total_col].dtype}")
            print(f"  Non-null count: {df[total_col].count()}")
            
            # Clean and convert to numeric
            df[total_col] = pd.to_numeric(df[total_col], errors='coerce')
            valid_totals = df[total_col].dropna()
            print(f"  Valid numeric values: {len(valid_totals)}")
            print(f"  Sample values: {valid_totals.head().tolist()}")
            
            if len(valid_totals) > 0:
                total_sum = valid_totals.sum()
                print(f"  Sum: {total_sum:,}")
        
        # Check individual host columns for totals
        host_columns = [col for col in df.columns if any(location in col.upper() for location in 
                       ['ALPHARETTA', 'BUCKHEAD', 'DUNWOODY', 'COBB', 'ROSWELL', 'DECATUR', 
                        'CORNERS', 'UGA', 'SANDY', 'INTOWN', 'SNELLVILLE', 'GROUPS', 'FLOWERY'])]
        
        print(f"\nHost columns found: {len(host_columns)}")
        host_total = 0
        for col in host_columns:
            # Clean numeric data
            df[col] = pd.to_numeric(df[col], errors='coerce')
            col_sum = df[col].sum()
            if col_sum > 0:
                print(f"  {col}: {col_sum:,}")
                host_total += col_sum
        
        print(f"\nTotal from all host columns: {host_total:,}")
        
        # Compare the totals
        if total_col in df.columns and len(df[total_col].dropna()) > 0:
            spreadsheet_total = df[total_col].sum()
            print(f"\nSPREADSHEET ANALYSIS:")
            print(f"  Main total column: {spreadsheet_total:,}")
            print(f"  Sum of host columns: {host_total:,}")
            print(f"  Target total: 1,868,147")
            
            if abs(spreadsheet_total - 1868147) < abs(host_total - 1868147):
                print(f"  → Main total column is closer to target")
                return spreadsheet_total
            else:
                print(f"  → Host columns sum is closer to target")
                return host_total
        
        # Show sample data with key columns
        print("\nSample data (first 5 rows, key columns):")
        key_cols = ['Date', 'Total # of Sandwiches'] + host_columns[:5]  # Show first 5 host columns
        available_cols = [col for col in key_cols if col in df.columns]
        print(df[available_cols].head())
        
        return df
        
    except Exception as e:
        print(f"Error reading spreadsheet: {e}")
        return None

def compare_totals():
    """Compare database totals with master spreadsheet target"""
    target_total = 1868147
    db_totals = get_current_database_totals()
    
    print("=== TOTAL COMPARISON ===")
    print(f"Target (Master Spreadsheet): {target_total:,}")
    print(f"Database Raw Total: {db_totals['raw_total']:,}")
    print(f"Analytics Total (with groups): {db_totals['analytics_total']:,}")
    print(f"Database Entries: {db_totals['entries']:,}")
    print(f"Date Range: {db_totals['date_range']}")
    
    raw_gap = target_total - db_totals['raw_total']
    analytics_gap = target_total - db_totals['analytics_total']
    
    print(f"\nGAP ANALYSIS:")
    print(f"Raw Database Gap: {raw_gap:,} sandwiches")
    print(f"Analytics Gap: {analytics_gap:,} sandwiches")
    print(f"Analytics vs Raw Difference: {db_totals['analytics_total'] - db_totals['raw_total']:,}")

def main():
    print("Analyzing master spreadsheet data to identify missing entries...")
    
    # Compare current totals
    compare_totals()
    
    print("\n" + "="*50)
    
    # Analyze master spreadsheet
    df = analyze_master_spreadsheet()
    
    if df is not None:
        print(f"\nMaster spreadsheet successfully loaded with {len(df)} rows")
    else:
        print("\nUnable to load master spreadsheet for detailed analysis")

if __name__ == "__main__":
    main()