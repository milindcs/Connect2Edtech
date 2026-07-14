import http from 'http';

const options = {
  hostname: 'localhost',
  port: 10000,
  path: '/api/admin/bootstrap',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  }
};

const data = JSON.stringify({
  secret: 'c2f-bootstrap-9f3a7b21e8d4a6c0b5e1f79a2d34c68',
  email: 'hr@connect2future.com',
  password: '@2026C2f',
  name: 'HR Admin',
  phone: '7019426720'
});

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', body);
  });
});

req.on('error', (e) => {
  console.error('Error:', e.message);
});

req.write(data);
req.end();
