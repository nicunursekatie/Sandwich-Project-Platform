// Quick password reset script
import { spawn } from 'child_process';

// Login as admin and get session cookie
const loginCmd = spawn('curl', [
  '-s', '-c', '/tmp/cookies.txt',
  '-X', 'POST',
  'http://localhost:5000/api/auth/login',
  '-H', 'Content-Type: application/json',
  '-d', JSON.stringify({
    email: "admin@sandwich.project",
    password: "admin123"
  })
]);

loginCmd.on('close', (code) => {
  if (code === 0) {
    console.log('Admin logged in successfully');
    
    // Now reset the password
    const resetCmd = spawn('curl', [
      '-s',
      '-b', '/tmp/cookies.txt',
      '-X', 'PUT',
      'http://localhost:5000/api/auth/admin/reset-password',
      '-H', 'Content-Type: application/json',
      '-d', JSON.stringify({
        userEmail: "mdlouza@gmail.com",
        newPassword: "newpass123"
      })
    ]);
    
    resetCmd.stdout.on('data', (data) => {
      console.log('Password reset response:', data.toString());
    });
    
    resetCmd.stderr.on('data', (data) => {
      console.error('Error:', data.toString());
    });
    
    resetCmd.on('close', (code) => {
      console.log(`Password reset completed with code: ${code}`);
      // Clean up
      import('fs').then(fs => fs.unlinkSync('/tmp/cookies.txt'));
    });
  } else {
    console.error('Failed to login as admin');
  }
});