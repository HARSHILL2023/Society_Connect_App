const http = require('http');
require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

// Helper to make local HTTP requests using built-in http module
const request = (port, options, postData) => {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port,
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            const json = body ? JSON.parse(body) : {};
            resolve({ status: res.statusCode, headers: res.headers, data: json });
          } catch (e) {
            resolve({ status: res.statusCode, headers: res.headers, raw: body });
          }
        });
      }
    );
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
};

const runApiTests = async () => {
  console.log('🧪 Starting Society Connect API Test Suite...\n');
  await connectDB();

  const testPort = 5055;
  const server = app.listen(testPort);

  let passed = 0;
  let failed = 0;

  const assert = (condition, name, details = '') => {
    if (condition) {
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${name} ${details ? '-> ' + details : ''}`);
      failed++;
    }
  };

  try {
    // 1. Health Check
    const health = await request(testPort, { path: '/api/health', method: 'GET' });
    assert(health.status === 200 && health.data.success === true, 'GET /api/health');

    // 2. Member Login
    const memberLogin = await request(
      testPort,
      { path: '/api/auth/login', method: 'POST' },
      { email: 'john@societyconnect.com', password: 'Password123!' }
    );
    assert(
      memberLogin.status === 200 && memberLogin.data.data.token,
      'POST /api/auth/login (Member)',
      JSON.stringify(memberLogin.data)
    );
    const memberToken = memberLogin.data.data?.token;

    // 3. Manager Login
    const managerLogin = await request(
      testPort,
      { path: '/api/auth/login', method: 'POST' },
      { email: 'manager@societyconnect.com', password: 'Password123!' }
    );
    assert(
      managerLogin.status === 200 && managerLogin.data.data.user.role === 'Manager',
      'POST /api/auth/login (Manager)'
    );
    const managerToken = managerLogin.data.data?.token;

    // 4. Admin Login
    const adminLogin = await request(
      testPort,
      { path: '/api/auth/login', method: 'POST' },
      { email: 'admin@societyconnect.com', password: 'Password123!' }
    );
    assert(
      adminLogin.status === 200 && adminLogin.data.data.user.role === 'Admin',
      'POST /api/auth/login (Admin)'
    );
    const adminToken = adminLogin.data.data?.token;

    // 5. Registration (New Member)
    const randomEmail = `resident_${Date.now()}@societyconnect.com`;
    const registerRes = await request(
      testPort,
      { path: '/api/auth/register', method: 'POST' },
      {
        name: 'Alice Cooper',
        email: randomEmail,
        password: 'Password123!',
        flatNumber: 'Tower C - 304',
        phone: '+1 555-9988',
      }
    );
    assert(
      registerRes.status === 201 && registerRes.data.data.token,
      'POST /api/auth/register (New Member)'
    );

    // 6. Auth /me
    const meRes = await request(testPort, {
      path: '/api/auth/me',
      method: 'GET',
      headers: { Authorization: `Bearer ${memberToken}` },
    });
    assert(meRes.status === 200 && meRes.data.data.email === 'john@societyconnect.com', 'GET /api/auth/me');

    // 7. Member: Create Ticket
    const createTicketRes = await request(
      testPort,
      {
        path: '/api/tickets',
        method: 'POST',
        headers: { Authorization: `Bearer ${memberToken}` },
      },
      {
        title: 'Balcony Door Latch Broken',
        description: 'The sliding door latch in the main balcony has come loose.',
        category: 'Carpentry',
        priority: 'Medium',
      }
    );
    assert(
      createTicketRes.status === 201 && createTicketRes.data.data.title === 'Balcony Door Latch Broken',
      'POST /api/tickets (Member Create Ticket)'
    );
    const newTicketId = createTicketRes.data.data?.id;

    // 8. Member: Get My Tickets
    const myTicketsRes = await request(testPort, {
      path: '/api/tickets/my',
      method: 'GET',
      headers: { Authorization: `Bearer ${memberToken}` },
    });
    assert(
      myTicketsRes.status === 200 && Array.isArray(myTicketsRes.data.data) && myTicketsRes.data.data.length > 0,
      'GET /api/tickets/my (Member)'
    );

    // 9. Manager: Get All Tickets
    const allTicketsRes = await request(testPort, {
      path: '/api/tickets',
      method: 'GET',
      headers: { Authorization: `Bearer ${managerToken}` },
    });
    assert(
      allTicketsRes.status === 200 && Array.isArray(allTicketsRes.data.data),
      'GET /api/tickets (Manager view all)'
    );

    // 10. Manager: Update Ticket Status
    if (newTicketId) {
      const updateStatusRes = await request(
        testPort,
        {
          path: `/api/tickets/${newTicketId}/status`,
          method: 'PATCH',
          headers: { Authorization: `Bearer ${managerToken}` },
        },
        {
          status: 'In Progress',
          statusNote: 'Assigned carpenter Mr. Smith for Friday morning.',
        }
      );
      assert(
        updateStatusRes.status === 200 && updateStatusRes.data.data.status === 'In Progress',
        'PATCH /api/tickets/:id/status (Manager update status)'
      );
    }

    // 11. Role Guard Security: Member cannot access /api/users
    const forbiddenRes = await request(testPort, {
      path: '/api/users',
      method: 'GET',
      headers: { Authorization: `Bearer ${memberToken}` },
    });
    assert(forbiddenRes.status === 403, 'Role Guard: Member blocked from Admin /api/users');

    // 12. Admin: Get Metrics
    const metricsRes = await request(testPort, {
      path: '/api/admin/metrics',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(
      metricsRes.status === 200 && typeof metricsRes.data.data.totalTickets === 'number',
      'GET /api/admin/metrics (Admin stats)'
    );

    // 13. Admin: Get Users
    const usersRes = await request(testPort, {
      path: '/api/users',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(
      usersRes.status === 200 && Array.isArray(usersRes.data.data),
      'GET /api/users (Admin list users)'
    );

    // 14. Admin: Create Manager User
    const testManagerEmail = `temp_mgr_${Date.now()}@societyconnect.com`;
    const createMgrRes = await request(
      testPort,
      {
        path: '/api/users',
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
      },
      {
        name: 'Temporary Manager',
        email: testManagerEmail,
        password: 'Password123!',
        role: 'Manager',
        phone: '+1 555-8833',
      }
    );
    assert(
      createMgrRes.status === 201 && createMgrRes.data.data.role === 'Manager',
      'POST /api/users (Admin create Manager)'
    );
    const createdUserId = createMgrRes.data.data?.id;

    // 15. Admin: Update User
    if (createdUserId) {
      const updateMgrRes = await request(
        testPort,
        {
          path: `/api/users/${createdUserId}`,
          method: 'PUT',
          headers: { Authorization: `Bearer ${adminToken}` },
        },
        {
          name: 'Updated Manager Name',
        }
      );
      assert(
        updateMgrRes.status === 200 && updateMgrRes.data.data.name === 'Updated Manager Name',
        'PUT /api/users/:id (Admin update user)'
      );

      // 16. Admin: Delete User
      const deleteUserRes = await request(testPort, {
        path: `/api/users/${createdUserId}`,
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert(deleteUserRes.status === 200, 'DELETE /api/users/:id (Admin delete user)');
    }

    console.log(`\n========================================`);
    console.log(`  Test Results: ${passed} Passed, ${failed} Failed`);
    console.log(`========================================\n`);
  } catch (error) {
    console.error('Test runner execution error:', error);
  } finally {
    server.close();
    process.exit(failed > 0 ? 1 : 0);
  }
};

runApiTests();
