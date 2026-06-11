const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/loans/refresh',
  method: 'POST',
  headers: {
    'Content-Length': 0
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', chunk => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('Response received');
  });
});

req.on('error', (error) => {
  console.error('Error:', error.message);
});

req.end();
console.log('Refresh request sent...');
