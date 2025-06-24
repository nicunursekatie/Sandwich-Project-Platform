#!/usr/bin/env python3
"""
Import driver contact information from Excel spreadsheet to database
"""

import pandas as pd
import psycopg2
import os
from datetime import datetime

def connect_to_db():
    """Connect to PostgreSQL database"""
    return psycopg2.connect(os.environ['DATABASE_URL'])

def clean_phone_number(phone):
    """Clean and format phone numbers"""
    if pd.isna(phone) or phone == '':
        return None
    
    # Convert to string and remove all non-digit characters except +
    phone_str = str(phone).strip()
    if phone_str.lower() in ['nan', 'none', '']:
        return None
    
    # Remove common formatting characters
    import re
    clean_phone = re.sub(r'[^\d+()-\s]', '', phone_str)
    clean_phone = re.sub(r'\s+', ' ', clean_phone).strip()
    
    return clean_phone if clean_phone else None

def clean_email(email):
    """Clean and validate email addresses"""
    if pd.isna(email) or email == '':
        return None
    
    email_str = str(email).strip().lower()
    if email_str in ['nan', 'none', '']:
        return None
    
    # Basic email validation
    import re
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if re.match(email_pattern, email_str):
        return email_str
    
    return None

def import_drivers():
    """Import drivers from Excel spreadsheet"""
    try:
        # Read the Excel file
        df = pd.read_excel('attached_assets/TSP DRIVER CONTACT LIST Jan2025_1750728035990.xlsx')
        
        # Connect to database
        conn = connect_to_db()
        cursor = conn.cursor()
        
        # Get existing drivers to avoid duplicates
        cursor.execute("SELECT name, phone FROM drivers")
        existing_drivers = {(row[0], row[1]) for row in cursor.fetchall()}
        
        imported_count = 0
        skipped_count = 0
        
        for index, row in df.iterrows():
            # Skip rows with no name information
            first_name = row.get('First Name', '')
            last_name = row.get('Last Name', '')
            
            if pd.isna(first_name) and pd.isna(last_name):
                continue
            
            # Clean and format data
            first_name = str(first_name).strip() if not pd.isna(first_name) else ''
            last_name = str(last_name).strip() if not pd.isna(last_name) else ''
            
            # Skip if both names are empty or 'nan'
            if first_name.lower() == 'nan':
                first_name = ''
            if last_name.lower() == 'nan':
                last_name = ''
                
            if not first_name and not last_name:
                continue
            
            # Combine names
            name_parts = [part for part in [first_name, last_name] if part]
            full_name = ' '.join(name_parts)
            
            if not full_name or len(full_name.strip()) < 2:
                continue
            
            # Clean contact information
            phone = clean_phone_number(row.get('Phone', ''))
            email = clean_email(row.get('Email', ''))
            
            # Additional fields
            area = str(row.get('Area', '')).strip() if not pd.isna(row.get('Area', '')) else ''
            if area.lower() == 'nan':
                area = ''
            
            address = str(row.get('Home Address', '')).strip() if not pd.isna(row.get('Home Address', '')) else ''
            if address.lower() == 'nan':
                address = ''
            
            notes = str(row.get('Notes', '')).strip() if not pd.isna(row.get('Notes', '')) else ''
            if notes.lower() == 'nan':
                notes = ''
            
            # Check activity status
            active_status = str(row.get('Active', '')).strip().lower() if not pd.isna(row.get('Active', '')) else ''
            is_active = active_status in ['yes', 'y', 'active', 'true', '1']
            
            # Van driving capability
            van_approved = str(row.get('approved to drive van', '')).strip().lower() if not pd.isna(row.get('approved to drive van', '')) else ''
            van_willing = str(row.get('Willing to drive the van', '')).strip().lower() if not pd.isna(row.get('Willing to drive the van', '')) else ''
            
            can_drive_van = (van_approved in ['yes', 'y', 'true', '1'] or 
                           van_willing in ['yes', 'y', 'true', '1'])
            
            # Agreement status
            agreement_status = str(row.get('Signed Agreement', '')).strip().lower() if not pd.isna(row.get('Signed Agreement', '')) else ''
            agreement_signed = agreement_status in ['yes', 'y', 'signed', 'true', '1']
            
            # Skip if this driver already exists (by name and phone)
            if (full_name, phone) in existing_drivers:
                skipped_count += 1
                continue
            
            # Prepare notes with additional info
            additional_notes = []
            if area:
                additional_notes.append(f"Area: {area}")
            if van_approved and van_approved not in ['nan', '']:
                additional_notes.append(f"Van approved: {van_approved}")
            if van_willing and van_willing not in ['nan', '']:
                additional_notes.append(f"Van willing: {van_willing}")
            if agreement_status and agreement_status not in ['nan', '']:
                additional_notes.append(f"Agreement: {agreement_status}")
            if notes:
                additional_notes.append(f"Notes: {notes}")
            
            combined_notes = '; '.join(additional_notes) if additional_notes else None
            
            # Insert into database
            cursor.execute("""
                INSERT INTO drivers (name, phone, email, address, notes, is_active, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                full_name,
                phone,
                email,
                address if address else None,
                combined_notes,
                is_active,
                datetime.now(),
                datetime.now()
            ))
            
            imported_count += 1
            
            if imported_count % 50 == 0:
                print(f"Imported {imported_count} drivers...")
        
        # Commit changes
        conn.commit()
        cursor.close()
        conn.close()
        
        print(f"\nImport completed!")
        print(f"Drivers imported: {imported_count}")
        print(f"Drivers skipped (duplicates): {skipped_count}")
        print(f"Total rows processed: {len(df)}")
        
        return True
        
    except Exception as e:
        print(f"Error importing drivers: {e}")
        if 'conn' in locals():
            conn.rollback()
            conn.close()
        return False

def verify_import():
    """Verify the import results"""
    try:
        conn = connect_to_db()
        cursor = conn.cursor()
        
        cursor.execute("SELECT COUNT(*) FROM drivers")
        total_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM drivers WHERE is_active = true")
        active_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM drivers WHERE phone IS NOT NULL")
        with_phone = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM drivers WHERE email IS NOT NULL")
        with_email = cursor.fetchone()[0]
        
        print(f"\nDatabase verification:")
        print(f"Total drivers: {total_count}")
        print(f"Active drivers: {active_count}")
        print(f"Drivers with phone: {with_phone}")
        print(f"Drivers with email: {with_email}")
        
        # Show sample of imported drivers
        cursor.execute("SELECT name, phone, email FROM drivers ORDER BY created_at DESC LIMIT 5")
        recent_drivers = cursor.fetchall()
        
        if recent_drivers:
            print(f"\nRecent imports:")
            for driver in recent_drivers:
                print(f"  {driver[0]} - {driver[1] or 'No phone'} - {driver[2] or 'No email'}")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"Error verifying import: {e}")

if __name__ == "__main__":
    print("Starting driver import from Excel spreadsheet...")
    if import_drivers():
        verify_import()
    else:
        print("Import failed!")