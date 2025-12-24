// ===================================================================
// BROWSER CONSOLE TEST SCRIPT
// Mở browser console (F12) khi đã login vào app để test
// ===================================================================

console.log('🧪 Starting Delete Leave API Test...\n');

// Get auth token from localStorage
const token = localStorage.getItem('token');
console.log('Token:', token ? '✅ Found' : '❌ Not found');

if (!token) {
  console.error('❌ Please login first!');
} else {
  // Decode token to check role
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('User:', payload.sub);
    console.log('Role:', payload.auth);
    console.log('Expires:', new Date(payload.exp * 1000).toLocaleString());

    const isHR = payload.auth === 'ROLE_HR' || payload.auth === 'HR';
    console.log('\n🔍 Is HR?', isHR ? '✅ YES' : '❌ NO');

    if (!isHR) {
      console.warn('⚠️  You are not HR. Delete should be disabled.');
    }
  } catch (e) {
    console.error('Error decoding token:', e);
  }
}

// Test function to call delete API
async function testDeleteLeave(leaveId) {
  const token = localStorage.getItem('token');
  const baseUrl = 'https://hrm-backend-1939.onrender.com'; // Production API

  console.log(`\n🗑️  Testing DELETE /api/leave/hr/${leaveId}`);

  try {
    const response = await fetch(`${baseUrl}/api/leave/hr/${leaveId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'accept': '*/*'
      }
    });

    console.log('Response Status:', response.status);

    if (response.ok) {
      console.log('✅ DELETE SUCCESS - Leave request deleted');
      const data = await response.text();
      if (data) console.log('Response:', data);
    } else if (response.status === 403) {
      console.log('🚫 FORBIDDEN - You do not have permission to delete');
      const error = await response.json();
      console.log('Error:', error);
    } else if (response.status === 401) {
      console.log('🔒 UNAUTHORIZED - Token invalid or expired');
    } else if (response.status === 404) {
      console.log('❓ NOT FOUND - Leave request not found');
    } else {
      console.log('❌ ERROR:', response.statusText);
      const error = await response.text();
      console.log('Details:', error);
    }
  } catch (error) {
    console.error('❌ Network Error:', error.message);
  }
}

// Instructions
console.log('\n📝 HOW TO USE:');
console.log('1. Make sure you are logged in');
console.log('2. Check the role above (should be ROLE_HR for delete permission)');
console.log('3. Find a leave request ID from the list');
console.log('4. Run: testDeleteLeave(123)  // Replace 123 with actual ID');
console.log('\nExample: testDeleteLeave(5)');

// Make function available globally
window.testDeleteLeave = testDeleteLeave;

