const https = require('https');

// Test configuration
const config = {
  hostname: 'hrm-backend-1939.onrender.com',
  // Replace with a valid Manager token from your login
  token: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJxdWFuZ2xtIiwiaWF0IjoxNzY2MjE5NDg2LCJleHAiOjE3NjYyMjEyODZ9.t1q2MmpZjaIsAIiYvB_tngGVxv77inwIqzto8B45zRQ'
};

// Test 1: Get all timekeeping explanations without filters
function testGetAllTimekeepingExplanations() {
  console.log('\n=== Test 1: Get all timekeeping explanations (page=0, size=10) ===');

  const options = {
    hostname: config.hostname,
    path: '/api/timekeeping-explanations?page=0&size=10',
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
        console.log('Response:', JSON.stringify(response, null, 2));
        console.log('\nTotal Elements:', response.totalElements);
        console.log('Total Pages:', response.totalPages);
        console.log('Items in current page:', response.content?.length || 0);
      } catch (error) {
        console.log('Response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Error:', error);
  });

  req.end();
}

// Test 2: Get with employeeCode filter
function testGetWithEmployeeCodeFilter() {
  console.log('\n=== Test 2: Filter by employeeCode ===');

  const options = {
    hostname: config.hostname,
    path: '/api/timekeeping-explanations?page=0&size=10&employeeCode=EMP001',
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
        console.log('Response:', JSON.stringify(response, null, 2));
      } catch (error) {
        console.log('Response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Error:', error);
  });

  req.end();
}

// Test 3: Get with department filter
function testGetWithDepartmentFilter() {
  console.log('\n=== Test 3: Filter by department ===');

  const options = {
    hostname: config.hostname,
    path: '/api/timekeeping-explanations?page=0&size=10&department=IT',
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
        console.log('Response:', JSON.stringify(response, null, 2));
      } catch (error) {
        console.log('Response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Error:', error);
  });

  req.end();
}

// Test 4: Get with date range filter
function testGetWithDateRangeFilter() {
  console.log('\n=== Test 4: Filter by date range ===');

  const options = {
    hostname: config.hostname,
    path: '/api/timekeeping-explanations?page=0&size=10&fromDate=2024-12-01&toDate=2024-12-31',
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
        console.log('Response:', JSON.stringify(response, null, 2));
      } catch (error) {
        console.log('Response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Error:', error);
  });

  req.end();
}

// Test 5: Get with status filter
function testGetWithStatusFilter() {
  console.log('\n=== Test 5: Filter by status (PENDING) ===');

  const options = {
    hostname: config.hostname,
    path: '/api/timekeeping-explanations?page=0&size=10&status=PENDING',
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
        console.log('Response:', JSON.stringify(response, null, 2));
      } catch (error) {
        console.log('Response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Error:', error);
  });

  req.end();
}

// Test 6: Get with multiple filters
function testGetWithMultipleFilters() {
  console.log('\n=== Test 6: Filter with multiple parameters ===');

  const options = {
    hostname: config.hostname,
    path: '/api/timekeeping-explanations?page=0&size=10&department=IT&status=PENDING&fromDate=2024-12-01&toDate=2024-12-31',
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
        console.log('Response:', JSON.stringify(response, null, 2));
      } catch (error) {
        console.log('Response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Error:', error);
  });

  req.end();
}

// Run all tests with delays
console.log('Starting Timekeeping Explanations API Tests...');
console.log('Note: This endpoint requires Manager or HR role');
console.log('='.repeat(60));

testGetAllTimekeepingExplanations();

setTimeout(() => {
  testGetWithEmployeeCodeFilter();
}, 2000);

setTimeout(() => {
  testGetWithDepartmentFilter();
}, 4000);

setTimeout(() => {
  testGetWithDateRangeFilter();
}, 6000);

setTimeout(() => {
  testGetWithStatusFilter();
}, 8000);

setTimeout(() => {
  testGetWithMultipleFilters();
}, 10000);

