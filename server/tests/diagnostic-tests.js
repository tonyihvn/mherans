/**
 * NHERAMS API Endpoint Testing Suite - DETAILED DIAGNOSTICS
 * Enhanced version with error reporting and diagnostics
 */

const BASE_URL = 'http://localhost:5000/api';

class DetailedTestRunner {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      tests: [],
      issues: []
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
      const text = await response.text();
      let data = null;
      try {
        data = JSON.parse(text);
      } catch (e) {
        data = text;
      }

      const isSuccess = response.status === expectedStatus || response.status === 201 || response.status === 200;
      const status = isSuccess ? '✅ PASS' : '❌ FAIL';

      this.results.tests.push({
        name,
        method,
        endpoint,
        status: response.status,
        expectedStatus,
        passed: isSuccess,
        response: data
      });

      console.log(`${status} | ${method.padEnd(6)} ${endpoint.padEnd(45)} | Status: ${response.status}`);

      if (!isSuccess) {
        this.results.failed++;
        console.log(`     ⚠️  Expected ${expectedStatus}, got ${response.status}`);
        if (data?.error) console.log(`     Error: ${data.error}`);
        if (data?.message) console.log(`     Message: ${data.message}`);
        this.results.issues.push({
          endpoint,
          method,
          status: response.status,
          error: data?.error || data?.message || 'Unknown error'
        });
      } else {
        this.results.passed++;
      }

      return data;
    } catch (error) {
      console.log(`❌ FAIL | ${method.padEnd(6)} ${endpoint.padEnd(45)} | ${error.message}`);
      this.results.tests.push({
        name,
        method,
        endpoint,
        error: error.message,
        passed: false
      });
      this.results.failed++;
      this.results.issues.push({
        endpoint,
        method,
        status: 'NETWORK_ERROR',
        error: error.message
      });
      return null;
    }
  }

  async runAllTests() {
    console.log('\n╔════════════════════════════════════════════════════════════════════╗');
    console.log('║    NHERAMS API ENDPOINT TEST SUITE - DETAILED DIAGNOSTICS          ║');
    console.log('╚════════════════════════════════════════════════════════════════════╝\n');

    // 1. HEALTH CHECK
    console.log('📋 Testing: Health Check');
    console.log('─'.repeat(70));
    await this.test('Health Check', 'GET', '/health', null, 200);

    // 2. CONFIG ENDPOINTS
    console.log('\n📋 Testing: Configuration Management');
    console.log('─'.repeat(70));
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
    console.log('─'.repeat(70));
    await this.test('GET All Facilities', 'GET', '/facilities', null, 200);

    const newFacility = {
      hfr_id: `FAC-${Date.now()}`,
      name: 'Test Healthcare Facility',
      level: 'secondary',
      ownership: 'state',
      state_code: 'LA',
      lga_name: 'Ikeja',
      latitude: 6.5244,
      longitude: 3.3792
    };
    createdFacilityId = newFacility.hfr_id;
    
    const facilityRes = await this.test('CREATE Facility', 'POST', '/facilities', newFacility, 201);
    if (!facilityRes) {
      this.results.issues.push({
        section: 'FACILITIES',
        issue: 'Failed to create facility - models may need ID generation',
        recommendation: 'Check facility model - needs to generate UUIDs for id field'
      });
    }

    await this.test('GET Facility by ID', 'GET', `/facilities/${createdFacilityId}`, null, 200);

    const updateFacility = {
      name: 'Updated Test Healthcare Facility',
      level: 'tertiary'
    };
    await this.test('UPDATE Facility', 'PUT', `/facilities/${createdFacilityId}`, updateFacility, 200);

    // 4. USERS ENDPOINTS
    console.log('\n📋 Testing: Users Management');
    console.log('─'.repeat(70));
    
    const loginData = {
      email: 'admin@test.com',
      password: 'password123',
      role: 'FEDERAL_ADMIN'
    };
    const loginResult = await this.test('USER Login', 'POST', '/users/login', loginData, 200);
    let userId = null;
    if (loginResult) userId = loginResult.id;

    await this.test('GET All Users', 'GET', '/users', null, 200);

    const newUser = {
      name: 'Test Admin User',
      email: 'testadmin@example.com',
      role: 'FACILITY_ADMIN',
      facilityId: createdFacilityId
    };
    const userResult = await this.test('CREATE User', 'POST', '/users', newUser, 201);
    let createdUserId = userResult?.id || null;

    if (!userResult) {
      this.results.issues.push({
        section: 'USERS',
        issue: 'Failed to create user - models may need ID generation',
        recommendation: 'Check user model - needs to generate UUIDs for id field'
      });
    }

    if (userId) {
      await this.test('GET User by ID', 'GET', `/users/${userId}`, null, 200);
    }

    if (createdUserId) {
      const updateUser = {
        name: 'Updated Test Admin'
      };
      await this.test('UPDATE User', 'PUT', `/users/${createdUserId}`, updateUser, 200);
    }

    // 5. AUDITS ENDPOINTS
    console.log('\n📋 Testing: Audits Management');
    console.log('─'.repeat(70));
    
    await this.test('GET All Audits', 'GET', '/audits', null, 200);

    const newAudit = {
      facilityId: createdFacilityId,
      auditor_name: 'Test Auditor',
      audit_date: new Date().toISOString().split('T')[0],
      section_1_1_1: 'Yes',
      section_1_1_2: 'No',
      diesel_litres: 100,
      waste_generated: 50,
      grid_uptime_hours: 18,
      notes: 'Test audit notes'
    };
    const auditResult = await this.test('CREATE Audit', 'POST', '/audits', newAudit, 201);
    let createdAuditId = auditResult?.data?.id || null;

    if (!auditResult) {
      this.results.issues.push({
        section: 'AUDITS',
        issue: 'Failed to create audit - may need ID generation and column name fixes',
        recommendation: 'Verify: (1) facility_id column exists, (2) ID generation logic'
      });
    }

    if (createdFacilityId) {
      await this.test('GET Audit by Facility', 'GET', `/audits/facility/${createdFacilityId}`, null, 200);
    }

    if (createdAuditId) {
      const updateAudit = {
        section_1_1_1: 'No',
        notes: 'Updated test notes'
      };
      await this.test('UPDATE Audit', 'PUT', `/audits/${createdAuditId}`, updateAudit, 200);
    }

    // 6. CLEANUP - DELETE TESTS
    console.log('\n📋 Testing: Deletion Operations');
    console.log('─'.repeat(70));
    
    if (createdAuditId) {
      await this.test('DELETE Audit', 'DELETE', `/audits/${createdAuditId}`, null, 200);
    }

    if (createdUserId) {
      await this.test('DELETE User', 'DELETE', `/users/${createdUserId}`, null, 200);
    }

    if (createdFacilityId) {
      await this.test('DELETE Facility', 'DELETE', `/facilities/${createdFacilityId}`, null, 200);
    }

    // 7. SUMMARY
    this.printSummary();
  }

  printSummary() {
    const total = this.results.passed + this.results.failed;
    const percentage = ((this.results.passed / total) * 100).toFixed(2);

    console.log('\n╔════════════════════════════════════════════════════════════════════╗');
    console.log('║                         TEST SUMMARY                             ║');
    console.log('╚════════════════════════════════════════════════════════════════════╝\n');
    console.log(`Total Tests: ${total}`);
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`Success Rate: ${percentage}%\n`);

    if (this.results.issues.length > 0) {
      console.log('🔍 IDENTIFIED ISSUES & RECOMMENDATIONS:\n');
      this.results.issues.forEach((issue, idx) => {
        if (issue.section) {
          console.log(`${idx + 1}. [${issue.section}] ${issue.issue}`);
          console.log(`   💡 Recommendation: ${issue.recommendation}\n`);
        } else {
          console.log(`${idx + 1}. ${issue.endpoint} (${issue.method})`);
          console.log(`   Status: ${issue.status} | Error: ${issue.error}\n`);
        }
      });
    }

    console.log('📊 ENDPOINT STATUS OVERVIEW:\n');
    const byMethod = {};
    this.results.tests.forEach(t => {
      if (!byMethod[t.method]) byMethod[t.method] = { total: 0, passed: 0 };
      byMethod[t.method].total++;
      if (t.passed) byMethod[t.method].passed++;
    });

    Object.entries(byMethod).forEach(([method, stats]) => {
      const rate = ((stats.passed / stats.total) * 100).toFixed(0);
      console.log(`${method.padEnd(8)} ${stats.passed}/${stats.total} passed (${rate}%)`);
    });

    console.log('\n✨ Test suite completed!\n');
  }
}

// Run tests
let createdFacilityId = null;
const runner = new DetailedTestRunner();
runner.runAllTests().catch(console.error);
