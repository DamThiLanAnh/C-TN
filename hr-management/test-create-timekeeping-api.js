const https = require('https');

// Test configuration
const config = {
  hostname: 'hrm-backend-1939.onrender.com',
  // Replace with a valid Employee token from your login
  token: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhbnR2IiwiaWF0IjoxNzY2MjIzNzU5LCJleHAiOjE3NjYyMjU1NTl9.FS-xakx_OuYmGa4anxFqRZLEy1zFFHehLhVAQnoQ27A'
};

// Test: Create timekeeping explanation (Employee only)
function testCreateTimekeepingExplanation() {
  console.log('\n=== Test: Create Timekeeping Explanation (Employee only) ===');

  const requestBody = {
    workDate: '2025-12-20',
    proposedCheckIn: '08:00',
    proposedCheckOut: '17:30',
    reason: 'Máy chấm công bị hỏng, không thể chấm công đúng giờ'
  };

  const postData = JSON.stringify(requestBody);

  const options = {
    hostname: config.hostname,
    path: '/api/timekeeping-explanations',
    method: 'POST',
    headers: {
      'accept': '*/*',
      'Content-Type': 'application/json',
      'Content-Length': postData.length,
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
      console.log('Request Body:', requestBody);
      try {
        const response = JSON.parse(data);
        console.log('Response:', JSON.stringify(response, null, 2));

        if (res.statusCode === 200 || res.statusCode === 201) {
          console.log('✅ Success: Timekeeping explanation created successfully!');
        } else {
          console.log('❌ Error: Failed to create timekeeping explanation');
        }
      } catch (error) {
        console.log('Response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Error:', error);
  });

  req.write(postData);
  req.end();
}

// Test with different scenarios
function testCreateWithDifferentData() {
  console.log('\n=== Test: Create with different time scenarios ===');

  const scenarios = [
    {
      name: 'Normal working hours',
      data: {
        workDate: '2025-12-21',
        proposedCheckIn: '08:30',
        proposedCheckOut: '17:30',
        reason: 'Quên chấm công buổi sáng'
      }
    },
    {
      name: 'Early check-in',
      data: {
        workDate: '2025-12-22',
        proposedCheckIn: '07:45',
        proposedCheckOut: '17:00',
        reason: 'Đến sớm nhưng quên chấm công'
      }
    },
    {
      name: 'Late check-out',
      data: {
        workDate: '2025-12-23',
        proposedCheckIn: '08:00',
        proposedCheckOut: '19:00',
        reason: 'Làm thêm giờ, thiết bị hỏng'
      }
    }
  ];

  scenarios.forEach((scenario, index) => {
    setTimeout(() => {
      console.log(`\n--- Scenario ${index + 1}: ${scenario.name} ---`);

      const postData = JSON.stringify(scenario.data);

      const options = {
        hostname: config.hostname,
        path: '/api/timekeeping-explanations',
        method: 'POST',
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json',
          'Content-Length': postData.length,
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
          console.log('Request:', scenario.data);
          try {
            const response = JSON.parse(data);
            console.log('Response:', JSON.stringify(response, null, 2));
          } catch (error) {
            console.log('Response:', data);
          }
        });
      });

      req.on('error', (error) => {
        console.error('Error:', error);
      });

      req.write(postData);
      req.end();
    }, index * 2000);
  });
}

// Test validation errors
function testValidationErrors() {
  console.log('\n=== Test: Validation Errors ===');

  const invalidScenarios = [
    {
      name: 'Missing workDate',
      data: {
        proposedCheckIn: '08:00',
        proposedCheckOut: '17:30',
        reason: 'Test'
      }
    },
    {
      name: 'Missing proposedCheckIn',
      data: {
        workDate: '2025-12-20',
        proposedCheckOut: '17:30',
        reason: 'Test'
      }
    },
    {
      name: 'Missing reason',
      data: {
        workDate: '2025-12-20',
        proposedCheckIn: '08:00',
        proposedCheckOut: '17:30'
      }
    }
  ];

  invalidScenarios.forEach((scenario, index) => {
    setTimeout(() => {
      console.log(`\n--- Invalid Test ${index + 1}: ${scenario.name} ---`);

      const postData = JSON.stringify(scenario.data);

      const options = {
        hostname: config.hostname,
        path: '/api/timekeeping-explanations',
        method: 'POST',
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json',
          'Content-Length': postData.length,
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
          console.log('Expected: 400 Bad Request');
          try {
            const response = JSON.parse(data);
            console.log('Response:', JSON.stringify(response, null, 2));
          } catch (error) {
            console.log('Response:', data);
          }
        });
      });

      req.on('error', (error) => {
        console.error('Error:', error);
      });

      req.write(postData);
      req.end();
    }, 6000 + (index * 2000));
  });
}

// Run all tests
console.log('Starting Timekeeping Explanation CREATE API Tests...');
console.log('Note: This endpoint requires Employee role');
console.log('='.repeat(60));

testCreateTimekeepingExplanation();

setTimeout(() => {
  testCreateWithDifferentData();
}, 3000);

setTimeout(() => {
  testValidationErrors();
}, 10000);

