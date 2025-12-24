const axios = require('axios');

const BASE_URL = 'https://hrm-backend-1939.onrender.com';

// Test tokens for different roles
const TOKENS = {
  hr: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJob2FudCIsImlhdCI6MTc2NjUwOTU3OCwiZXhwIjoxNzY2NTExMzc4fQ.YY6K8hXaBzX-jokpdnpW22JJUsCJqXjqW4UXnWe9k4o',
  admin: 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbiIsImF1dGgiOiJST0xFX0FETUlOIiwiZXhwIjoxNzY2NjYyNTUzfQ.EXAMPLE_ADMIN_TOKEN',
  manager: 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJtYW5hZ2VyMSIsImF1dGgiOiJST0xFX01BTkFHRVIiLCJleHAiOjE3NjY2NjI1NTN9.EXAMPLE_MANAGER_TOKEN',
  employee: 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJlbXBsb3llZTEiLCJhdXRoIjoiUk9MRV9VU0VSIiwiZXhwIjoxNzY2NjYyNTUzfQ.EXAMPLE_EMPLOYEE_TOKEN'
};

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(70));
  log(title, 'cyan');
  console.log('='.repeat(70));
}

// Step 1: Get list of leave requests to find an ID to delete
async function getLeaveRequests(token, role) {
  try {
    log(`\n📋 Getting leave requests as ${role.toUpperCase()}...`, 'blue');

    const response = await axios.get(`${BASE_URL}/api/leave`, {
      params: {
        page: 0,
        size: 10
      },
      headers: {
        'Authorization': `Bearer ${token}`,
        'accept': '*/*'
      }
    });

    if (response.data && response.data.content && response.data.content.length > 0) {
      log(`✅ Found ${response.data.content.length} leave requests`, 'green');

      // Display first few requests
      response.data.content.slice(0, 3).forEach((item, index) => {
        console.log(`  ${index + 1}. ID: ${item.id} | Employee: ${item.employeeName} | Type: ${item.type} | Status: ${item.status}`);
      });

      return response.data.content;
    } else {
      log('⚠️  No leave requests found', 'yellow');
      return [];
    }
  } catch (error) {
    log(`❌ Error getting leave requests: ${error.response?.data?.message || error.message}`, 'red');
    return [];
  }
}

// Step 2: Create a test leave request
async function createTestLeaveRequest(token) {
  try {
    log('\n➕ Creating test leave request...', 'blue');

    const testData = {
      employeeId: 1,
      type: 'ANNUAL',
      startDate: '2025-12-25T08:00:00',
      endDate: '2025-12-27T17:00:00',
      reason: 'Test leave request for deletion test - Created at ' + new Date().toLocaleString()
    };

    const response = await axios.post(`${BASE_URL}/api/leave`, testData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'accept': '*/*'
      }
    });

    if (response.data && response.data.id) {
      log(`✅ Created test leave request with ID: ${response.data.id}`, 'green');
      console.log(`   Employee ID: ${testData.employeeId}`);
      console.log(`   Type: ${testData.type}`);
      console.log(`   Dates: ${testData.startDate} to ${testData.endDate}`);
      return response.data.id;
    } else {
      log('⚠️  Created but no ID returned', 'yellow');
      return null;
    }
  } catch (error) {
    log(`❌ Error creating test leave request: ${error.response?.data?.message || error.message}`, 'red');
    if (error.response?.data) {
      console.log('Response data:', error.response.data);
    }
    return null;
  }
}

// Step 3: Test delete with specific role
async function testDeleteWithRole(leaveId, token, role) {
  try {
    log(`\n🗑️  Testing DELETE as ${role.toUpperCase()}...`, 'blue');
    console.log(`   URL: DELETE ${BASE_URL}/api/leave/hr/${leaveId}`);

    const response = await axios.delete(`${BASE_URL}/api/leave/hr/${leaveId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'accept': '*/*'
      }
    });

    log(`✅ SUCCESS - ${role.toUpperCase()} was able to delete leave request ${leaveId}`, 'green');
    console.log(`   Status: ${response.status}`);
    if (response.data) {
      console.log(`   Response:`, response.data);
    }
    return true;
  } catch (error) {
    if (error.response?.status === 403) {
      log(`🚫 FORBIDDEN - ${role.toUpperCase()} does NOT have permission to delete (Expected)`, 'yellow');
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Message: ${error.response.data?.message || 'Access Denied'}`);
    } else if (error.response?.status === 401) {
      log(`🔒 UNAUTHORIZED - ${role.toUpperCase()} token is invalid or expired`, 'red');
      console.log(`   Status: ${error.response.status}`);
    } else if (error.response?.status === 404) {
      log(`❓ NOT FOUND - Leave request ${leaveId} not found (may have been already deleted)`, 'yellow');
      console.log(`   Status: ${error.response.status}`);
    } else {
      log(`❌ ERROR - ${error.response?.status || error.message}`, 'red');
      if (error.response?.data) {
        console.log(`   Response:`, error.response.data);
      }
    }
    return false;
  }
}

// Main test flow
async function runTests() {
  logSection('🧪 TESTING DELETE LEAVE API - HR PERMISSION ONLY');

  console.log('\n📝 Test Scenario:');
  console.log('   1. Create a test leave request using HR token');
  console.log('   2. Test DELETE with different roles:');
  console.log('      - HR (Should SUCCESS ✅)');
  console.log('      - Admin (Should FAIL 🚫)');
  console.log('      - Manager (Should FAIL 🚫)');
  console.log('      - Employee (Should FAIL 🚫)');

  // Test 1: Get existing leave requests to verify HR access
  logSection('TEST 1: Verify HR can access leave requests');
  const existingLeaves = await getLeaveRequests(TOKENS.hr, 'hr');

  // Test 2: Create a test leave request with HR
  logSection('TEST 2: Create test leave request as HR');
  const testLeaveId1 = await createTestLeaveRequest(TOKENS.hr);

  if (!testLeaveId1) {
    log('\n⚠️  Cannot proceed without a test leave request. Stopping tests.', 'yellow');
    return;
  }

  // Wait a bit for the server to process
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test 3: Try deleting with HR (should succeed)
  logSection('TEST 3: Delete with HR role (Expected: SUCCESS ✅)');
  const hrDeleteSuccess = await testDeleteWithRole(testLeaveId1, TOKENS.hr, 'hr');

  if (!hrDeleteSuccess) {
    log('\n⚠️  HR delete failed! This is unexpected. Backend may need to check permissions.', 'red');
  }

  // Test 4: Create another test leave request for other role tests
  logSection('TEST 4: Create another test leave request for permission tests');
  const testLeaveId2 = await createTestLeaveRequest(TOKENS.hr);

  if (!testLeaveId2) {
    log('\n⚠️  Cannot create second test request. Skipping other role tests.', 'yellow');
  } else {
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 5: Try deleting with Admin (should fail based on requirements)
    logSection('TEST 5: Delete with ADMIN role (Expected: FORBIDDEN 🚫)');
    log('⚠️  Using example token - may not be valid', 'yellow');
    await testDeleteWithRole(testLeaveId2, TOKENS.admin, 'admin');
  }

  // Test 6: Create another test leave request for manager test
  logSection('TEST 6: Create another test leave request for manager test');
  const testLeaveId3 = await createTestLeaveRequest(TOKENS.hr);

  if (testLeaveId3) {
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 7: Try deleting with Manager (should fail)
    logSection('TEST 7: Delete with MANAGER role (Expected: FORBIDDEN 🚫)');
    log('⚠️  Using example token - may not be valid', 'yellow');
    await testDeleteWithRole(testLeaveId3, TOKENS.manager, 'manager');
  }

  // Summary
  logSection('📊 TEST SUMMARY');
  log('\n✅ Expected Behavior:', 'green');
  log('   • HR role: CAN delete leave requests', 'green');
  log('   • Admin role: CANNOT delete leave requests', 'yellow');
  log('   • Manager role: CANNOT delete leave requests', 'yellow');
  log('   • Employee role: CANNOT delete leave requests', 'yellow');

  log('\n💡 Notes:', 'cyan');
  log('   • Frontend already restricts delete button to HR only', 'cyan');
  log('   • Backend should also validate HR role for DELETE /api/leave/admin/{id}', 'cyan');
  log('   • API endpoint has "admin" in path but should be HR-only', 'cyan');

  log('\n🔧 To test with real tokens:', 'magenta');
  log('   1. Login as Admin/Manager/Employee to get their tokens', 'magenta');
  log('   2. Update TOKENS object in this script', 'magenta');
  log('   3. Run the test again', 'magenta');
}

// Run the tests
runTests().catch(error => {
  log(`\n💥 Fatal error: ${error.message}`, 'red');
  console.error(error);
});

