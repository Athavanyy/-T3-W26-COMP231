const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testEndpoints() {
  console.log('Starting API Tests...\n');

  try {
    // 1. Login as Admin
    console.log('Logging in as Admin...');
    const adminLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@college.ca',
      password: 'password123'
    });
    const adminToken = adminLogin.data.token;
    console.log('Admin logged in');

    // 2. Login as Student
    console.log('Logging in as Student...');
    const studentLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'student@college.ca',
      password: 'password123'
    });
    const studentToken = studentLogin.data.token;
    console.log('Student logged in');

    // 3. Login as Executive
    console.log('Logging in as Executive...');
    const execLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'executive@college.ca',
      password: 'password123'
    });
    const execToken = execLogin.data.token;
    console.log('Executive logged in\n');

    // 4. Test Student Endpoints
    console.log('📡 Testing Student Endpoints...');
    const clubs = await axios.get(`${BASE_URL}/student/clubs`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    console.log(`GET /student/clubs: ${clubs.data.data.length} clubs`);

    const events = await axios.get(`${BASE_URL}/student/events`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    console.log(`GET /student/events: ${events.data.data.length} events`);

    const announcements = await axios.get(`${BASE_URL}/student/announcements`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    console.log(`GET /student/announcements: ${announcements.data.data.length} announcements`);

    // 5. Test Admin Endpoints
    console.log('\n Testing Admin Endpoints...');
    const users = await axios.get(`${BASE_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`GET /admin/users: ${users.data.data.length} users`);

    const allClubs = await axios.get(`${BASE_URL}/admin/clubs`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`GET /admin/clubs: ${allClubs.data.data.length} clubs`);

    // 6. Test Executive Endpoints
    console.log('\n📡 Testing Executive Endpoints...');
    const execClub = await axios.get(`${BASE_URL}/executive/club`, {
      headers: { Authorization: `Bearer ${execToken}` }
    });
    const execClubs = Array.isArray(execClub.data.data) ? execClub.data.data : [execClub.data.data]; console.log(`GET /executive/club: ${execClubs.map((c) => c.club_name).join(', ')}`);

    const execMembers = await axios.get(`${BASE_URL}/executive/members`, {
      headers: { Authorization: `Bearer ${execToken}` }
    });
    console.log(`GET /executive/members: ${execMembers.data.data.length} members`);

    const pendingRequests = await axios.get(`${BASE_URL}/executive/members/requests`, {
      headers: { Authorization: `Bearer ${execToken}` }
    });
    console.log(`GET /executive/members/requests: ${pendingRequests.data.data.length} pending requests`);

    console.log('\n All tests passed!');
    console.log('Summary:');
    console.log(`   - ${clubs.data.data.length} clubs available`);
    console.log(`   - ${events.data.data.length} events available`);
    console.log(`   - ${users.data.data.length} users registered`);
    console.log(`   - ${execMembers.data.data.length} members in your club`);

  } catch (error) {
    console.error('\n Test failed!');
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Message: ${error.response.data.message || 'Unknown error'}`);
      console.error(`   URL: ${error.config.url}`);
    } else if (error.request) {
      console.error('   No response received. Is the server running?');
      console.error('   Make sure: npm run dev');
    } else {
      console.error(`   Error: ${error.message}`);
    }
    process.exit(1);
  }
}

// Run the tests
testEndpoints();