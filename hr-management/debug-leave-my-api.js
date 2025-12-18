const https = require('https');

const token = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJxdWFuZ2xtIiwiaWF0IjoxNzY1OTcxODk5LCJleHAiOjE3NjU5NzM2OTl9.xIP63I9pJa-fn-RgfF7gywdr7L7JQSirabI7syCmnBw';

const options = {
  hostname: 'hrm-backend-1939.onrender.com',
  path: '/api/leave/my?page=0&size=10',
  method: 'GET',
  headers: {
    'accept': 'application/json, text/plain, */*',
    'Authorization': `Bearer ${token}`
  }
};

console.log('Testing API: /api/leave/my');
console.log('Token:', token.substring(0, 20) + '...');

const req = https.request(options, (res) => {
  console.log('\n📊 Status Code:', res.statusCode);
  console.log('📊 Headers:', JSON.stringify(res.headers, null, 2));

  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('\n📦 Response Body:');
    try {
      const jsonData = JSON.parse(data);
      console.log(JSON.stringify(jsonData, null, 2));

      if (res.statusCode === 200) {
        console.log('\n✅ SUCCESS');
        console.log('Total items:', jsonData.totalElements || jsonData.length);
      } else {
        console.log('\n❌ ERROR');
        console.log('Error message:', jsonData.message || jsonData.error);
      }
    } catch (error) {
      console.log('Raw response:', data);
      console.log('\n❌ Parse error:', error.message);
    }
  });
});

req.on('error', (error) => {
  console.error('\n❌ Request Error:', error.message);
});

req.end();

