const https = require('https');

const BASE_URL = 'https://hrm-backend-1939.onrender.com';

// Helper function to make HTTP requests
function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data,
            json: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data,
            json: null
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (postData) {
      req.write(postData);
    }

    req.end();
  });
}

async function testQuangLMApi() {
  console.log('=== Testing quanglm account ===\n');

  // Step 1: Login
  console.log('Step 1: Login as quanglm...');
  const loginOptions = {
    hostname: 'hrm-backend-1939.onrender.com',
    path: '/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'accept': '*/*'
    }
  };

  const loginData = JSON.stringify({
    username: 'quanglm',
    password: '1'
  });

  try {
    const loginResponse = await makeRequest(loginOptions, loginData);
    console.log('Login Status:', loginResponse.statusCode);
    console.log('Login Response:', JSON.stringify(loginResponse.json, null, 2));

    if (loginResponse.statusCode !== 200 || (!loginResponse.json?.token && !loginResponse.json?.accessToken)) {
      console.log('❌ Login failed!');
      return;
    }

    const token = loginResponse.json.token || loginResponse.json.accessToken;
    console.log('✅ Login successful! Token:', token.substring(0, 20) + '...\n');

    // Step 2: Try /api/leave/my
    console.log('Step 2: Calling /api/leave/my...');
    const myOptions = {
      hostname: 'hrm-backend-1939.onrender.com',
      path: '/api/leave/my?page=0&size=10',
      method: 'GET',
      headers: {
        'accept': '*/*',
        'Authorization': `Bearer ${token}`
      }
    };

    const myResponse = await makeRequest(myOptions);
    console.log('Status:', myResponse.statusCode);
    console.log('Response:', myResponse.body.substring(0, 500));
    console.log();

    // Step 3: Try /api/leave/department
    console.log('Step 3: Calling /api/leave/department...');
    const deptOptions = {
      hostname: 'hrm-backend-1939.onrender.com',
      path: '/api/leave/department?page=0&size=10',
      method: 'GET',
      headers: {
        'accept': '*/*',
        'Authorization': `Bearer ${token}`
      }
    };

    const deptResponse = await makeRequest(deptOptions);
    console.log('Status:', deptResponse.statusCode);
    if (deptResponse.json) {
      console.log('Response:', JSON.stringify(deptResponse.json, null, 2));
    } else {
      console.log('Response:', deptResponse.body);
    }

    // Step 4: Get user info
    console.log('\nStep 4: Checking user info from token...');
    const parts = token.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      console.log('Token Payload:', JSON.stringify(payload, null, 2));
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testQuangLMApi();

