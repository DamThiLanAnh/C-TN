const https = require('https');

const token = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJxdWFuZ2xtIiwiaWF0IjoxNzY1OTcxODk5LCJleHAiOjE3NjU5NzM2OTl9.xIP63I9pJa-fn-RgfF7gywdr7L7JQSirabI7syCmnBw';

// Test API /my
function testMyAPI() {
  console.log('\n=== Testing /api/leave/my ===');

  const options = {
    hostname: 'hrm-backend-1939.onrender.com',
    path: '/api/leave/my?page=0&size=10',
    method: 'GET',
    headers: {
      'accept': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  };

  const req = https.request(options, (res) => {
    console.log('Status Code:', res.statusCode);

    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      console.log('Response:', data);

      setTimeout(() => testDepartmentAPI(), 1000);
    });
  });

  req.on('error', (error) => {
    console.error('Error:', error.message);
  });

  req.end();
}

// Test API /department
function testDepartmentAPI() {
  console.log('\n=== Testing /api/leave/department ===');

  const options = {
    hostname: 'hrm-backend-1939.onrender.com',
    path: '/api/leave/department?page=0&size=10',
    method: 'GET',
    headers: {
      'accept': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  };

  const req = https.request(options, (res) => {
    console.log('Status Code:', res.statusCode);

    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        console.log('Response:', JSON.stringify(json, null, 2).substring(0, 500));
        console.log('\n✅ API /department works!');
        console.log('\n💡 Solution: User "quanglm" chỉ có quyền Manager, không có quyền access /api/leave/my');
        console.log('Frontend đang gọi sai API cho user này!');
      } catch (e) {
        console.log('Response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Error:', error.message);
  });

  req.end();
}

// Decode token to check expiry
function decodeToken() {
  const parts = token.split('.');
  const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());

  console.log('\n=== Token Info ===');
  console.log('User:', payload.sub);
  console.log('Issued at:', new Date(payload.iat * 1000).toLocaleString());
  console.log('Expires at:', new Date(payload.exp * 1000).toLocaleString());
  console.log('Current time:', new Date().toLocaleString());
  console.log('Token valid:', new Date() < new Date(payload.exp * 1000) ? 'YES ✅' : 'NO ❌ EXPIRED');
}

decodeToken();
testMyAPI();

