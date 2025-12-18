const https = require('https');

// Test GET leave API with pagination
const options = {
  hostname: 'hrm-backend-1939.onrender.com',
  port: 443,
  path: '/api/leave/my?page=0&size=10',
  method: 'GET',
  headers: {
    'accept': '*/*',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJiZW52IiwiaWF0IjoxNzY1ODU1NTA5LCJleHAiOjE3NjU4NTczMDl9.na_cgiun4St59H-YWihcPE61ffQQQZNX9I3twnXmYyM'
  }
};

console.log('Testing GET Leave API with pagination...');
console.log(`URL: https://${options.hostname}${options.path}`);

const req = https.request(options, (res) => {
  console.log(`\nStatus Code: ${res.statusCode}`);
  console.log('Response Headers:', JSON.stringify(res.headers, null, 2));

  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    console.log('\n=== Response Body ===');
    try {
      const jsonResponse = JSON.parse(responseData);
      console.log(JSON.stringify(jsonResponse, null, 2));

      // Display summary
      console.log('\n=== Summary ===');
      if (jsonResponse.content) {
        console.log(`Total Elements: ${jsonResponse.totalElements || 'N/A'}`);
        console.log(`Total Pages: ${jsonResponse.totalPages || 'N/A'}`);
        console.log(`Current Page: ${jsonResponse.number || 0}`);
        console.log(`Page Size: ${jsonResponse.size || 'N/A'}`);
        console.log(`Items in this page: ${jsonResponse.content.length}`);

        if (jsonResponse.content.length > 0) {
          console.log('\n=== First Item ===');
          console.log(JSON.stringify(jsonResponse.content[0], null, 2));
        }
      } else if (Array.isArray(jsonResponse)) {
        console.log(`Total items: ${jsonResponse.length}`);
        if (jsonResponse.length > 0) {
          console.log('\n=== First Item ===');
          console.log(JSON.stringify(jsonResponse[0], null, 2));
        }
      }
    } catch (e) {
      console.log('Raw Response:', responseData);
      console.log('Error parsing JSON:', e.message);
    }
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.end();

