/**
 * Test API: Get Leave Requests by Department (For Manager)
 * Endpoint: GET /api/leave/department
 * Purpose: Test API lấy danh sách nghỉ phép theo phòng ban cho quản lý
 */

const https = require('https');

// Configuration
const API_CONFIG = {
  host: 'hrm-backend-1939.onrender.com',
  path: '/api/leave/department',
  method: 'GET',
  // Thay token này bằng token thực của bạn
  token: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJxdWFuZ2xtIiwiaWF0IjoxNzY1OTcwMjgxLCJleHAiOjE3NjU5NzIwODF9.zB6vh2kXzzeLdIuCP1ixtXJF_W63eZRCJ79dIPmmEiE'
};

/**
 * Test 1: Get first page with default size
 */
function testGetFirstPage() {
  console.log('\n=== TEST 1: Get First Page (page=0, size=10) ===');

  const options = {
    hostname: API_CONFIG.host,
    path: `${API_CONFIG.path}?page=0&size=10`,
    method: API_CONFIG.method,
    headers: {
      'accept': '*/*',
      'Authorization': `Bearer ${API_CONFIG.token}`
    }
  };

  makeRequest(options, (data) => {
    console.log('✅ Success!');
    console.log('Total Elements:', data.totalElements);
    console.log('Page Size:', data.pageSize);
    console.log('Current Page:', data.pageNumber || data.pageIndex || 0);
    console.log('Number of Items:', data.content?.length || 0);

    if (data.content && data.content.length > 0) {
      console.log('\n📋 First Item:');
      console.log(JSON.stringify(data.content[0], null, 2));
    }
  });
}

/**
 * Test 2: Get second page
 */
function testGetSecondPage() {
  console.log('\n=== TEST 2: Get Second Page (page=1, size=10) ===');

  const options = {
    hostname: API_CONFIG.host,
    path: `${API_CONFIG.path}?page=1&size=10`,
    method: API_CONFIG.method,
    headers: {
      'accept': '*/*',
      'Authorization': `Bearer ${API_CONFIG.token}`
    }
  };

  makeRequest(options, (data) => {
    console.log('✅ Success!');
    console.log('Current Page:', data.pageNumber || data.pageIndex || 1);
    console.log('Number of Items:', data.content?.length || 0);
  });
}

/**
 * Test 3: Get with larger page size
 */
function testLargePageSize() {
  console.log('\n=== TEST 3: Get with Larger Page Size (page=0, size=20) ===');

  const options = {
    hostname: API_CONFIG.host,
    path: `${API_CONFIG.path}?page=0&size=20`,
    method: API_CONFIG.method,
    headers: {
      'accept': '*/*',
      'Authorization': `Bearer ${API_CONFIG.token}`
    }
  };

  makeRequest(options, (data) => {
    console.log('✅ Success!');
    console.log('Page Size:', data.pageSize);
    console.log('Number of Items:', data.content?.length || 0);
  });
}

/**
 * Test 4: Test without token (should fail)
 */
function testWithoutToken() {
  console.log('\n=== TEST 4: Test Without Token (Should Fail) ===');

  const options = {
    hostname: API_CONFIG.host,
    path: `${API_CONFIG.path}?page=0&size=10`,
    method: API_CONFIG.method,
    headers: {
      'accept': '*/*'
    }
  };

  makeRequest(options, (data) => {
    console.log('❌ Unexpected success!');
  }, (error) => {
    console.log('✅ Expected failure:', error.message);
  });
}

/**
 * Test 5: Compare with /api/leave/my endpoint
 */
function testCompareEndpoints() {
  console.log('\n=== TEST 5: Compare Department vs My Endpoints ===');

  // Test department endpoint
  const departmentOptions = {
    hostname: API_CONFIG.host,
    path: '/api/leave/department?page=0&size=5',
    method: API_CONFIG.method,
    headers: {
      'accept': '*/*',
      'Authorization': `Bearer ${API_CONFIG.token}`
    }
  };

  makeRequest(departmentOptions, (departmentData) => {
    console.log('\n📊 Department Endpoint:');
    console.log('Total Items:', departmentData.totalElements);
    console.log('Items in Response:', departmentData.content?.length || 0);

    if (departmentData.content && departmentData.content.length > 0) {
      console.log('Departments found:', [...new Set(departmentData.content.map(item => item.department))]);
    }

    // Test my endpoint
    const myOptions = {
      hostname: API_CONFIG.host,
      path: '/api/leave/my?page=0&size=5',
      method: API_CONFIG.method,
      headers: {
        'accept': '*/*',
        'Authorization': `Bearer ${API_CONFIG.token}`
      }
    };

    setTimeout(() => {
      makeRequest(myOptions, (myData) => {
        console.log('\n📊 My Endpoint:');
        console.log('Total Items:', myData.totalElements);
        console.log('Items in Response:', myData.content?.length || 0);

        console.log('\n🔍 Comparison:');
        console.log('Department endpoint should show more items (all department employees)');
        console.log('My endpoint should show fewer items (only current user)');
      });
    }, 1000);
  });
}

/**
 * Test 6: Analyze response structure
 */
function testAnalyzeResponse() {
  console.log('\n=== TEST 6: Analyze Response Structure ===');

  const options = {
    hostname: API_CONFIG.host,
    path: `${API_CONFIG.path}?page=0&size=3`,
    method: API_CONFIG.method,
    headers: {
      'accept': '*/*',
      'Authorization': `Bearer ${API_CONFIG.token}`
    }
  };

  makeRequest(options, (data) => {
    console.log('✅ Response Structure:');
    console.log('\n📦 Top Level Keys:');
    console.log(Object.keys(data));

    if (data.content && data.content.length > 0) {
      console.log('\n📦 Item Keys:');
      console.log(Object.keys(data.content[0]));

      console.log('\n📋 Sample Items:');
      data.content.forEach((item, index) => {
        console.log(`\nItem ${index + 1}:`);
        console.log(`  ID: ${item.id}`);
        console.log(`  Employee: ${item.employeeName} (${item.employeeId})`);
        console.log(`  Department: ${item.department}`);
        console.log(`  Type: ${item.type}`);
        console.log(`  Status: ${item.status}`);
        console.log(`  Dates: ${item.startDate} to ${item.endDate}`);
        console.log(`  Reason: ${item.reason}`);
      });
    }
  });
}

/**
 * Helper function to make HTTPS request
 */
function makeRequest(options, onSuccess, onError) {
  const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const jsonData = JSON.parse(data);

        if (res.statusCode === 200) {
          if (onSuccess) onSuccess(jsonData);
        } else {
          console.error(`❌ Error: Status ${res.statusCode}`);
          console.error('Response:', jsonData);
          if (onError) onError(new Error(`Status ${res.statusCode}`));
        }
      } catch (error) {
        console.error('❌ Parse Error:', error.message);
        console.error('Raw Response:', data);
        if (onError) onError(error);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Request Error:', error.message);
    if (onError) onError(error);
  });

  req.end();
}

/**
 * Run all tests
 */
function runAllTests() {
  console.log('🚀 Starting API Tests for /api/leave/department');
  console.log('='.repeat(60));

  testGetFirstPage();

  setTimeout(() => testGetSecondPage(), 2000);
  setTimeout(() => testLargePageSize(), 4000);
  setTimeout(() => testWithoutToken(), 6000);
  setTimeout(() => testCompareEndpoints(), 8000);
  setTimeout(() => testAnalyzeResponse(), 11000);

  setTimeout(() => {
    console.log('\n' + '='.repeat(60));
    console.log('✅ All tests completed!');
    console.log('\n💡 Tips:');
    console.log('1. Make sure your token is valid (not expired)');
    console.log('2. User must have MANAGER role to access this endpoint');
    console.log('3. Response includes all leave requests in manager\'s department');
    console.log('4. Use pagination for better performance with large datasets');
  }, 13000);
}

// Run tests
runAllTests();

// Export for use in other scripts
module.exports = {
  testGetFirstPage,
  testGetSecondPage,
  testLargePageSize,
  testWithoutToken,
  testCompareEndpoints,
  testAnalyzeResponse
};

