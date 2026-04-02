const http = require('http');

const runTest = async () => {
  const credentials = new URLSearchParams({ username: 'Doc1', password: 'Testing123' });
  
  const req = http.request({
    hostname: 'localhost', port: 3000, path: '/doctor/login', method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(credentials.toString())
    }
  }, (res) => {
    console.log(`[Login Resp] Status: ${res.statusCode}`);
    console.log(`[Login Resp] Location: ${res.headers.location}`);
    
    const cookies = res.headers['set-cookie'];
    if (!cookies) return console.log("No cookie set!");
    const sessionCookie = cookies[0].split(';')[0];
    
    // Now request /doctor/dashboard
    const dashReq = http.request({
      hostname: 'localhost', port: 3000, path: '/doctor/dashboard', method: 'GET',
      headers: { 'Cookie': sessionCookie }
    }, (dashRes) => {
      console.log(`\n[Dash Resp] Status: ${dashRes.statusCode}`);
      console.log(`[Dash Resp] Location: ${dashRes.headers.location}`);
    });
    dashReq.end();
  });
  req.write(credentials.toString()); req.end();
};
runTest();
