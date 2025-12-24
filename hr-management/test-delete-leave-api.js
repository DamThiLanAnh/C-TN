const https = require('https');

// Test configuration
const config = {
  hostname: 'hrm-backend-1939.onrender.com',
  // Replace with a valid HR or Admin token from your login
  token: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsImlhdCI6MTc2NjE1NjQyMSwiZXhwIjoxNzY2MTU4MjIxfQ.BDyydtS-dZ1P5VB1JVgHVa48bY6hF_LYldkJLDik8jk'
};

// Test: Delete a leave request by ID
function testDeleteLeaveRequest(leaveId) {
  console.log(`\n=== Test: Delete leave request ID ${leaveId} ===`);

  const options = {
    hostname: config.hostname,
    path: `/api/leave/admin/${leaveId}`,
    method: 'DELETE',
    headers: {
      'accept': '*/*',
      'Authorization': `Bearer ${config.token}`
    }
  };

  const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('Status Code:', res.statusCode);

      if (res.statusCode === 200 || res.statusCode === 204) {
        console.log('✅ Successfully deleted leave request');
      } else if (res.statusCode === 403) {
        console.log('❌ Access denied - Only HR and Admin can delete');
      } else if (res.statusCode === 404) {
        console.log('❌ Leave request not found');
      } else {
        console.log('Response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Error:', error);
  });

  req.end();
}

// Test: First get all leave requests to find valid IDs
function getAllLeaveRequests() {
  console.log('\n=== Getting all leave requests to find valid IDs ===');

  const options = {
    hostname: config.hostname,
    path: '/api/leave?page=0&size=5',
    method: 'GET',
    headers: {
      'accept': '*/*',
      'Authorization': `Bearer ${config.token}`
    }
  };

  const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('Status Code:', res.statusCode);

      try {
        const response = JSON.parse(data);
        if (response.content && response.content.length > 0) {
          console.log('\nAvailable leave request IDs:');
          response.content.forEach((item, index) => {
            console.log(`  ${index + 1}. ID: ${item.id}, Employee: ${item.employeeName || item.employee?.name || 'N/A'}, Status: ${item.status}`);
          });

          console.log('\n⚠️  Note: To test delete, replace the leaveId in the test function with one of the IDs above');
        } else {
          console.log('No leave requests found');
        }
      } catch (error) {
        console.error('Error parsing response:', error);
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Error:', error);
  });

  req.end();
}

// Run tests
console.log('Starting Delete Leave Request API Tests...');
console.log('Note: This endpoint requires HR or Admin role');
console.log('='.repeat(60));

// First, get all leave requests to see available IDs
getAllLeaveRequests();

// Wait 2 seconds then test delete
// IMPORTANT: Replace '6' with a valid leave request ID from your system
setTimeout(() => {
  console.log('\n' + '='.repeat(60));
  console.log('⚠️  TESTING DELETE - Replace ID 6 with a valid test ID');
  console.log('='.repeat(60));
  testDeleteLeaveRequest(6);
}, 2000);

