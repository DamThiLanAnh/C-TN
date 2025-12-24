const https = require('https');

// Test configuration
const config = {
  hostname: 'hrm-backend-1939.onrender.com',
  // Replace with a valid token from your login
  token: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJob2FudCIsImlhdCI6MTc2NjExODc1OCwiZXhwIjoxNzY2MTIwNTU4fQ.DyWpUighX54woI4KQW7JKJXRLbnWZJnP-PT8MlX010M'
};

// Test 1: Get all leave requests without filters
function testGetAllLeave() {
  console.log('\n=== Test 1: Get all leave requests (page=0, size=10) ===');

  const options = {
    hostname: config.hostname,
    path: '/api/leave?page=0&size=10',
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
      console.log('Response:', JSON.stringify(JSON.parse(data), null, 2));
    });
  });

  req.on('error', (error) => {
    console.error('Error:', error);
  });

  req.end();
}

// Test 2: Get leave requests with employeeName filter
function testGetLeaveByEmployeeName() {
  console.log('\n=== Test 2: Get leave requests filtered by employeeName ===');

  const options = {
    hostname: config.hostname,
    path: '/api/leave?page=0&size=10&employeeName=Nguyen',
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
      console.log('Response:', JSON.stringify(JSON.parse(data), null, 2));
    });
  });

  req.on('error', (error) => {
    console.error('Error:', error);
  });

  req.end();
}

// Test 3: Get leave requests with department filter
function testGetLeaveByDepartment() {
  console.log('\n=== Test 3: Get leave requests filtered by department ===');

  const options = {
    hostname: config.hostname,
    path: '/api/leave?page=0&size=10&department=IT',
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
      console.log('Response:', JSON.stringify(JSON.parse(data), null, 2));
    });
  });

  req.on('error', (error) => {
    console.error('Error:', error);
  });

  req.end();
}

// Test 4: Get leave requests with status filter
function testGetLeaveByStatus() {
  console.log('\n=== Test 4: Get leave requests filtered by status ===');

  const options = {
    hostname: config.hostname,
    path: '/api/leave?page=0&size=10&status=PENDING',
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
      console.log('Response:', JSON.stringify(JSON.parse(data), null, 2));
    });
  });

  req.on('error', (error) => {
    console.error('Error:', error);
  });

  req.end();
}

// Test 5: Get leave requests with type filter
function testGetLeaveByType() {
  console.log('\n=== Test 5: Get leave requests filtered by type ===');

  const options = {
    hostname: config.hostname,
    path: '/api/leave?page=0&size=10&type=ANNUAL',
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
      console.log('Response:', JSON.stringify(JSON.parse(data), null, 2));
    });
  });

  req.on('error', (error) => {
    console.error('Error:', error);
  });

  req.end();
}

// Test 6: Get leave requests with multiple filters
function testGetLeaveWithMultipleFilters() {
  console.log('\n=== Test 6: Get leave requests with multiple filters ===');

  const options = {
    hostname: config.hostname,
    path: '/api/leave?page=0&size=10&employeeName=Nguyen&status=PENDING&type=ANNUAL',
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
      console.log('Response:', JSON.stringify(JSON.parse(data), null, 2));
    });
  });

  req.on('error', (error) => {
    console.error('Error:', error);
  });

  req.end();
}

// Run all tests with delays
console.log('Starting API Tests for /api/leave endpoint...');
console.log('Note: This endpoint requires HR or Admin role');
console.log('='.repeat(60));

testGetAllLeave();

setTimeout(() => {
  testGetLeaveByEmployeeName();
}, 2000);

setTimeout(() => {
  testGetLeaveByDepartment();
}, 4000);

setTimeout(() => {
  testGetLeaveByStatus();
}, 6000);

setTimeout(() => {
  testGetLeaveByType();
}, 8000);

setTimeout(() => {
  testGetLeaveWithMultipleFilters();
}, 10000);

