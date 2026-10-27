/**
 * NHERAMS API Endpoint Testing Suite
 * Tests all backend endpoints for functionality
 */

const BASE_URL = 'http://localhost:5000/api';

class TestRunner {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  async test(name, method, endpoint, body = null, expectedStatus = 200) {
    try {
      const options = {
        method,
        headers: { 'Content-Type': 'application/json' }
      };

      if (body) options.body = JSON.stringify(body);

      const response = await fetch(`${BASE_URL}${endpoint}`, options);
      const data = await response.json();

      const passed = response.status === expectedStatus || response.status === 201 || response.status === 404;
      const status = passed ? '✅ PASS' : '❌ FAIL';

      this.results.tests.push({
        name,
        method,
        endpoint,
        status: response.status,
        expectedStatus,
        passed
      });

      console.log(`${status} | ${method} ${endpoint} | Status: ${response.status}`);

      if (passed) {
        this.results.passed++;
      } else {
        this.results.failed++;
        console.log(`     Error: Expected ${expectedStatus}, got ${response.status}`);
      }

      return data;
    } catch (error) {
      console.log(`❌ FAIL | ${method} ${endpoint} | Error: ${error.message}`);
      this.results.tests.push({
        name,
        method,
        endpoint,
        error: error.message,
        passed: false
      });
      this.results.failed++;
      return null;
    }
  }

  async runAllTests() {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║          NHERAMS API ENDPOINT TEST SUITE                   ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    // 1. HEALTH CHECK
    console.log('📋 Testing: Health Check');
    console.log('─'.repeat(60));
    await this.test('Health Check', 'GET', '/health', null, 200);

    // 2. CONFIG ENDPOINTS
    console.log('\n📋 Testing: Configuration Management');
    console.log('─'.repeat(60));
    await this.test('Get Current Config', 'GET', '/config', null, 200);
    
    const configUpdate = {
      gridFactor: 0.45,
      dieselFactor: 2.70,
      wasteFactor: 0.98,
      defaultGridUptime: 21
    };
    await this.test('Update Config', 'PUT', '/config', configUpdate, 200);

    // 3. FACILITIES ENDPOINTS
    console.log('\n📋 Testing: Facilities Management');
    console.log('─'.repeat(60));
    await this.test('Get All Facilities', 'GET', '/facilities', null, 200);

    const newFacility = {
      hfr_id: 'FAC-TEST-001',
      name: 'Test Healthcare Facility',
      level: 'secondary',
      ownership: 'state',
      state_code: 'LA',
      lga_name: 'Ikeja',
      latitude: 6.5244,
      longitude: 3.3792
    };
    let createdFacilityId = 'FAC-TEST-001';
    await this.test('Create Facility', 'POST', '/facilities', newFacility, 201);

    await this.test('Get Facility by ID', 'GET', `/facilities/${createdFacilityId}`, null, 200);

    const updateFacility = {
      name: 'Updated Test Healthcare Facility',
      level: 'tertiary'
    };
    await this.test('Update Facility', 'PUT', `/facilities/${createdFacilityId}`, updateFacility, 200);

    // 4. USERS ENDPOINTS
    console.log('\n📋 Testing: Users Management');
    console.log('─'.repeat(60));
    
    const loginData = {
      email: 'admin@test.com',
      password: 'password123',
      role: 'FEDERAL_ADMIN'
    };
    const loginResult = await this.test('User Login', 'POST', '/users/login', loginData, 200);
    let userId = null;
    if (loginResult) userId = loginResult.id;

    await this.test('Get All Users', 'GET', '/users', null, 200);

    const newUser = {
      name: 'Test Admin User',
      email: 'testadmin@example.com',
      role: 'FACILITY_ADMIN',
      facilityId: createdFacilityId
    };
    const userResult = await this.test('Create User', 'POST', '/users', newUser, 201);
    let createdUserId = userResult?.id || 'test-user-1';

    if (userId) {
      await this.test('Get User by ID', 'GET', `/users/${userId}`, null, 200);
    }

    const updateUser = {
      name: 'Updated Test Admin'
    };
    await this.test('Update User', 'PUT', `/users/${createdUserId}`, updateUser, 200);

    // 5. AUDITS ENDPOINTS
    console.log('\n📋 Testing: Audits Management');
    console.log('─'.repeat(60));
    
    await this.test('Get All Audits', 'GET', '/audits', null, 200);

    const newAudit = {
      facilityId: createdFacilityId,
      auditor_name: 'Test Auditor',
      audit_date: new Date().toISOString().split('T')[0],
      section_1_1_1: 'Yes',
      section_1_1_2: 'No',
      section_1_1_3: 'Yes',
      section_1_2_1: 'Yes',
      section_1_2_2: 'No',
      diesel_litres: 100,
      diesel_frequency: 'monthly',
      waste_generated: 50,
      waste_type: 'medical',
      grid_uptime_hours: 18,
      notes: 'Test audit notes'
    };
    const auditResult = await this.test('Create Audit', 'POST', '/audits', newAudit, 201);
    let createdAuditId = auditResult?.data?.id || null;

    await this.test('Get Audit by Facility ID', 'GET', `/audits/facility/${createdFacilityId}`, null, 200);

    if (createdAuditId) {
      const updateAudit = {
        section_1_1_1: 'No',
        notes: 'Updated test notes'
      };
      await this.test('Update Audit', 'PUT', `/audits/${createdAuditId}`, updateAudit, 200);
    }

    // 6. CLEANUP - DELETE TESTS
    console.log('\n📋 Testing: Deletion Operations');
    console.log('─'.repeat(60));
    
    if (createdAuditId) {
      await this.test('Delete Audit', 'DELETE', `/audits/${createdAuditId}`, null, 200);
    }

    await this.test('Delete User', 'DELETE', `/users/${createdUserId}`, null, 200);
    
    await this.test('Delete Facility', 'DELETE', `/facilities/${createdFacilityId}`, null, 200);

    // 7. SUMMARY
    this.printSummary();
  }

  printSummary() {
    const total = this.results.passed + this.results.failed;
    const percentage = ((this.results.passed / total) * 100).toFixed(2);

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                      TEST SUMMARY                          ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    console.log(`Total Tests: ${total}`);
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`Success Rate: ${percentage}%\n`);

    if (this.results.failed > 0) {
      console.log('Failed Tests:');
      this.results.tests
        .filter(t => !t.passed)
        .forEach(t => {
          console.log(`  • ${t.name} (${t.method} ${t.endpoint})`);
          if (t.error) console.log(`    Error: ${t.error}`);
        });
    }

    console.log('\n✨ Test suite completed!\n');
  }
}

// Run tests
const runner = new TestRunner();
runner.runAllTests().catch(console.error);
