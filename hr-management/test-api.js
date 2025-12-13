// Test API Login trực tiếp
// Chạy file này bằng: node test-api.js

const https = require('https');

const testLogin = () => {
  const data = JSON.stringify({
    username: 'string',
    password: 'string'
  });

  const options = {
    hostname: 'hrm-backend-1939.onrender.com',
    port: 443,
    path: '/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length,
      'accept': '*/*'
    }
  };

  console.log('🔐 Testing Login API...');
  console.log('URL:', `https://${options.hostname}${options.path}`);
  console.log('Payload:', { username: 'string', password: '***' });

  const req = https.request(options, (res) => {
    console.log(`\n📊 Status Code: ${res.statusCode}`);
    console.log('📋 Headers:', res.headers);

    let responseData = '';

    res.on('data', (chunk) => {
      responseData += chunk;
    });

    res.on('end', () => {
      console.log('\n✅ Response Body:');
      try {
        const jsonResponse = JSON.parse(responseData);
        console.log(JSON.stringify(jsonResponse, null, 2));

        // Kiểm tra có token không
        if (jsonResponse.token || jsonResponse.accessToken || jsonResponse.access_token) {
          console.log('\n✅ SUCCESS! Token received from API');
        } else {
          console.log('\n⚠️  No token found in response');
        }
      } catch (e) {
        console.log(responseData);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Error:', error);
  });

  req.write(data);
  req.end();
};

const testRefreshToken = () => {
  const options = {
    hostname: 'hrm-backend-1939.onrender.com',
    port: 443,
    path: '/auth/refresh?refreshToken=test-token',
    method: 'POST',
    headers: {
      'accept': '*/*',
      'Content-Length': 0
    }
  };

  console.log('\n\n🔄 Testing Refresh Token API...');
  console.log('URL:', `https://${options.hostname}${options.path}`);

  const req = https.request(options, (res) => {
    console.log(`\n📊 Status Code: ${res.statusCode}`);

    let responseData = '';

    res.on('data', (chunk) => {
      responseData += chunk;
    });

    res.on('end', () => {
      console.log('\n✅ Response Body:');
      try {
        const jsonResponse = JSON.parse(responseData);
        console.log(JSON.stringify(jsonResponse, null, 2));
      } catch (e) {
        console.log(responseData);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Error:', error);
  });

  req.end();
};

// Chạy tests
testLogin();

// Test refresh token sau 3 giây
setTimeout(testRefreshToken, 3000);

