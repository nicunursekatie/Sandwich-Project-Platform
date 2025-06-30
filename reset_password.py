#!/usr/bin/env python3
import requests
import sys

def reset_password():
    # First login as admin
    login_url = "http://localhost:5000/api/auth/login"
    login_data = {
        "email": "admin@sandwich.project",
        "password": "admin123"
    }
    
    session = requests.Session()
    
    try:
        # Login
        login_response = session.post(login_url, json=login_data)
        print(f"Login response: {login_response.status_code}")
        
        if login_response.status_code == 200:
            print("Admin login successful")
            
            # Reset password
            reset_url = "http://localhost:5000/api/auth/admin/reset-password"
            reset_data = {
                "userEmail": "mdlouza@gmail.com", 
                "newPassword": "newpass123"
            }
            
            reset_response = session.put(reset_url, json=reset_data)
            print(f"Reset response: {reset_response.status_code}")
            print(f"Reset result: {reset_response.text}")
            
            if reset_response.status_code == 200:
                print("\n🎉 Password reset successful!")
                print("New credentials for mdlouza@gmail.com:")
                print("Email: mdlouza@gmail.com")
                print("Password: newpass123")
            else:
                print(f"❌ Password reset failed: {reset_response.text}")
        else:
            print(f"❌ Admin login failed: {login_response.text}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    reset_password()