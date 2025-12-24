const https = require('https');

// Test configuration
const config = {
  hostname: 'hrm-backend-1939.onrender.com',
  // Replace with a valid token
  token: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsImlhdCI6MTc2NjQ3NTY0MiwiZXhwIjoxNzY2NDc3NDQyfQ.Su3MX4xnSj7Uu94ghOcyCfjrMOPPBmpLzz2-yVXfLac'
};

// Test: Search special schedules (list with pagination)
function testSearchSpecialSchedules(body = {}, params = { page: 0, size: 10 }) {
  console.log('\n=== Test: Search Special Schedules ===');
  console.log('Request Body:', JSON.stringify(body, null, 2));
  console.log('Query Params:', params);

  const queryString = Object.keys(params)
    .map(key => `${key}=${params[key]}`)
    .join('&');

  const postData = JSON.stringify(body);

  const options = {
    hostname: config.hostname,
    path: `/special-schedules/search?${queryString}`,
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

      try {
        const response = JSON.parse(data);
        console.log('Response:', JSON.stringify(response, null, 2));

        if (res.statusCode === 200) {
          const content = response?.data?.content || [];
          console.log('\n✅ Success! Summary:');
          console.log(`- Total Elements: ${response?.data?.totalElements || 0}`);
          console.log(`- Total Pages: ${response?.data?.totalPages || 0}`);
          console.log(`- Current Page Size: ${content.length}`);

          if (content.length > 0) {
            console.log('\nFirst Item:');
            console.log(`- ID: ${content[0].id}`);
            console.log(`- Employee: ${content[0].employeeName} (${content[0].employeeCode})`);
            console.log(`- Type: ${content[0].type}`);
            console.log(`- Status: ${content[0].status}`);
            console.log(`- Period: ${content[0].startDate} to ${content[0].endDate}`);
          }
        } else {
          console.log('❌ Error: Request failed');
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

  req.write(postData);
  req.end();
}

// Test with different pagination
function testPagination() {
  console.log('\n' + '='.repeat(60));
  console.log('Testing Pagination...');
  console.log('='.repeat(60));

  // Page 1
  setTimeout(() => {
    console.log('\n--- Test Page 1 (size: 10) ---');
    testSearchSpecialSchedules({}, { page: 0, size: 10 });
  }, 0);

  // Page 2
  setTimeout(() => {
    console.log('\n--- Test Page 2 (size: 10) ---');
    testSearchSpecialSchedules({}, { page: 1, size: 10 });
  }, 3000);

  // Different page size
  setTimeout(() => {
    console.log('\n--- Test Page 1 (size: 5) ---');
    testSearchSpecialSchedules({}, { page: 0, size: 5 });
  }, 6000);
}

// Test with filters
function testWithFilters() {
  console.log('\n' + '='.repeat(60));
  console.log('Testing with Filters...');
  console.log('='.repeat(60));

  // Filter by status
  setTimeout(() => {
    console.log('\n--- Filter by Status: PENDING ---');
    testSearchSpecialSchedules({ status: 'PENDING' }, { page: 0, size: 10 });
  }, 9000);

  // Filter by employee name
  setTimeout(() => {
    console.log('\n--- Filter by Employee Name ---');
    testSearchSpecialSchedules({ fullName: 'Nguyen' }, { page: 0, size: 10 });
  }, 12000);

  // Filter by employee code
  setTimeout(() => {
    console.log('\n--- Filter by Employee Code ---');
    testSearchSpecialSchedules({ userName: 'EMP' }, { page: 0, size: 10 });
  }, 15000);

  // Filter by type
  setTimeout(() => {
    console.log('\n--- Filter by Schedule Type ---');
    testSearchSpecialSchedules({ scheduleType: 'MATERNITY' }, { page: 0, size: 10 });
  }, 18000);

  // Multiple filters
  setTimeout(() => {
    console.log('\n--- Multiple Filters (Status + Type) ---');
    testSearchSpecialSchedules(
      { status: 'PENDING', scheduleType: 'MATERNITY' },
      { page: 0, size: 10 }
    );
  }, 21000);
}

// Test sorting
function testSorting() {
  console.log('\n' + '='.repeat(60));
  console.log('Testing Sorting...');
  console.log('='.repeat(60));

  // Sort by created date DESC
  setTimeout(() => {
    console.log('\n--- Sort by Created Date DESC ---');
    testSearchSpecialSchedules({}, { page: 0, size: 10, sortBy: 'createdDate', sortDirection: 'DESC' });
  }, 24000);

  // Sort by employee name ASC
  setTimeout(() => {
    console.log('\n--- Sort by Employee Name ASC ---');
    testSearchSpecialSchedules({}, { page: 0, size: 10, sortBy: 'employeeName', sortDirection: 'ASC' });
  }, 27000);

  // Sort by start date DESC
  setTimeout(() => {
    console.log('\n--- Sort by Start Date DESC ---');
    testSearchSpecialSchedules({}, { page: 0, size: 10, sortBy: 'startDate', sortDirection: 'DESC' });
  }, 30000);
}

// Test date range filter
function testDateRangeFilter() {
  console.log('\n' + '='.repeat(60));
  console.log('Testing Date Range Filter...');
  console.log('='.repeat(60));

  setTimeout(() => {
    console.log('\n--- Filter by Date Range ---');
    testSearchSpecialSchedules(
      {
        beginDate: '2025-12-01',
        endDate: '2025-12-31'
      },
      { page: 0, size: 10 }
    );
  }, 33000);
}

// Test error cases
function testErrorCases() {
  console.log('\n' + '='.repeat(60));
  console.log('Testing Error Cases...');
  console.log('='.repeat(60));

  // Without authorization
  setTimeout(() => {
    console.log('\n--- Without Authorization (should return 401) ---');

    const options = {
      hostname: config.hostname,
      path: '/special-schedules/search?page=0&size=10',
      method: 'POST',
      headers: {
        'accept': '*/*',
        'Content-Type': 'application/json',
        'Content-Length': 2
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        console.log('Status Code:', res.statusCode);
        console.log('Expected: 401 Unauthorized');
        if (res.statusCode === 401) {
          console.log('✅ Correctly returns 401 without auth token');
        }
      });
    });

    req.on('error', (error) => {
      console.error('Error:', error);
    });

    req.write('{}');
    req.end();
  }, 36000);

  // Invalid page number
  setTimeout(() => {
    console.log('\n--- Invalid Page Number ---');
    testSearchSpecialSchedules({}, { page: -1, size: 10 });
  }, 39000);

  // Invalid page size
  setTimeout(() => {
    console.log('\n--- Invalid Page Size (too large) ---');
    testSearchSpecialSchedules({}, { page: 0, size: 1000 });
  }, 42000);
}

// Run all tests
console.log('Starting Special Schedule Search API Tests...');
console.log('='.repeat(60));

// Basic search
testSearchSpecialSchedules({}, { page: 0, size: 10 });

// Run other tests
testPagination();
testWithFilters();
testSorting();
testDateRangeFilter();
testErrorCases();

console.log('\n' + '='.repeat(60));
console.log('All tests scheduled. Please wait...');
console.log('='.repeat(60));

