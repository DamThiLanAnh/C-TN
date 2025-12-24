const https = require('https');

// Test configuration
const config = {
  hostname: 'hrm-backend-1939.onrender.com',
  // Replace with a valid token
  token: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsImlhdCI6MTc2NjQ3NTY0MiwiZXhwIjoxNzY2NDc3NDQyfQ.Su3MX4xnSj7Uu94ghOcyCfjrMOPPBmpLzz2-yVXfLac'
};

// Test: Get special schedule detail by ID
function testGetSpecialScheduleDetail(id) {
  console.log(`\n=== Test: Get Special Schedule Detail (ID: ${id}) ===`);

  const options = {
    hostname: config.hostname,
    path: `/special-schedules/${id}`,
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
      console.log('Request Path:', options.path);

      try {
        const response = JSON.parse(data);
        console.log('Response:', JSON.stringify(response, null, 2));

        if (res.statusCode === 200) {
          console.log('\n✅ Success! Details:');
          console.log(`- Employee: ${response.employeeName} (${response.employeeCode})`);
          console.log(`- Department: ${response.departmentName}`);
          console.log(`- Type: ${response.type}`);
          console.log(`- Period: ${response.startDate} to ${response.endDate}`);
          console.log(`- Status: ${response.status}`);
          console.log(`- Reason: ${response.reason}`);

          if (response.morningStart || response.afternoonStart) {
            console.log('- Time slots:');
            if (response.morningStart) {
              console.log(`  Morning: ${response.morningStart} - ${response.morningEnd}`);
            }
            if (response.afternoonStart) {
              console.log(`  Afternoon: ${response.afternoonStart} - ${response.afternoonEnd}`);
            }
          }
        } else {
          console.log('❌ Error: Failed to get detail');
        }
      } catch (error) {
        console.log('Response:', data);
        console.error('Parse error:', error.message);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Request Error:', error);
  });

  req.end();
}

// Test with multiple IDs
function testMultipleIds() {
  const testIds = [1, 2, 3, 4, 5];

  testIds.forEach((id, index) => {
    setTimeout(() => {
      testGetSpecialScheduleDetail(id);
    }, index * 2000);
  });
}

// Test non-existent ID (should return 404)
function testNonExistentId() {
  console.log('\n=== Test: Non-existent ID (should return 404) ===');

  const options = {
    hostname: config.hostname,
    path: '/special-schedules/99999',
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
      console.log('Expected: 404 Not Found');

      if (res.statusCode === 404) {
        console.log('✅ Correctly returns 404 for non-existent ID');
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

// Test without authorization (should return 401)
function testWithoutAuth() {
  console.log('\n=== Test: Without Authorization (should return 401) ===');

  const options = {
    hostname: config.hostname,
    path: '/special-schedules/4',
    method: 'GET',
    headers: {
      'accept': '*/*'
      // No Authorization header
    }
  };

  const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('Status Code:', res.statusCode);
      console.log('Expected: 401 Unauthorized');

      if (res.statusCode === 401) {
        console.log('✅ Correctly returns 401 without auth token');
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

// Run all tests
console.log('Starting Special Schedule Detail API Tests...');
console.log('='.repeat(60));

// Test specific ID (from your example)
testGetSpecialScheduleDetail(4);

// Test multiple IDs after 3 seconds
setTimeout(() => {
  console.log('\n' + '='.repeat(60));
  console.log('Testing multiple IDs...');
  console.log('='.repeat(60));
  testMultipleIds();
}, 3000);

// Test error cases after 15 seconds
setTimeout(() => {
  console.log('\n' + '='.repeat(60));
  console.log('Testing error cases...');
  console.log('='.repeat(60));
  testNonExistentId();
}, 15000);

setTimeout(() => {
  testWithoutAuth();
}, 17000);

