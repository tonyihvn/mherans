/**
 * Debug Script - Check if API returns facilities with coordinates
 */

const API_URL = 'http://localhost:5000/api/facilities';

const testFacilitiesAPI = async () => {
  console.log('🔍 Testing Facilities API...\n');
  console.log(`📍 URL: ${API_URL}\n`);

  try {
    const response = await fetch(API_URL);
    
    if (!response.ok) {
      console.error(`❌ API Error: ${response.status} ${response.statusText}`);
      console.error('Make sure the server is running on port 5000');
      process.exit(1);
    }

    const facilities = await response.json();
    
    if (!Array.isArray(facilities)) {
      console.error('❌ API did not return an array');
      console.error('Response:', facilities);
      process.exit(1);
    }

    console.log(`✅ Received ${facilities.length} facilities from API\n`);

    if (facilities.length === 0) {
      console.warn('⚠️  No facilities found in database');
      process.exit(0);
    }

    // Check first 3 facilities
    const facilitiesWithCoords = facilities.filter(f => f.latitude && f.longitude);
    console.log(`📊 Facilities with coordinates: ${facilitiesWithCoords.length}/${facilities.length}\n`);

    console.log('📋 Sample Facilities Structure:\n');
    facilities.slice(0, 3).forEach((facility, idx) => {
      console.log(`Facility ${idx + 1}: ${facility.name}`);
      console.log(`  ID: ${facility.id}`);
      console.log(`  HFR ID: ${facility.hfr_id}`);
      console.log(`  Latitude: ${facility.latitude}`);
      console.log(`  Longitude: ${facility.longitude}`);
      console.log(`  Location.Latitude: ${facility.location?.latitude}`);
      console.log(`  Location.Longitude: ${facility.location?.longitude}`);
      console.log(`  Location.Coordinates: ${JSON.stringify(facility.location?.coordinates)}`);
      console.log(`  State: ${facility.state || facility.location?.state_code}`);
      console.log(`  Level: ${facility.level}`);
      console.log('');
    });

    // Count facilities with coordinates in different formats
    const withDirectCoords = facilities.filter(f => f.latitude && f.longitude).length;
    const withLocationCoords = facilities.filter(f => f.location?.latitude && f.location?.longitude).length;
    const withLocationNested = facilities.filter(f => f.location?.coordinates?.lat && f.location?.coordinates?.lng).length;

    console.log('📈 Coordinate Detection Summary:');
    console.log(`  ✅ Direct (facility.latitude/longitude): ${withDirectCoords}`);
    console.log(`  ✅ Location nested (location.latitude/longitude): ${withLocationCoords}`);
    console.log(`  ✅ Location.coordinates (coordinates.lat/lng): ${withLocationNested}`);

    if (withDirectCoords === 0 && withLocationCoords === 0 && withLocationNested === 0) {
      console.log('\n❌ ERROR: No facilities have usable coordinates!');
      process.exit(1);
    } else {
      console.log('\n✅ API is returning facilities with coordinates correctly!');
      console.log('✅ MapDashboard should display markers on the map.');
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Failed to connect to API:');
    console.error(`  Error: ${error.message}`);
    console.error('\n⚠️  Make sure the server is running:');
    console.error('  cd server');
    console.error('  node server.js');
    process.exit(1);
  }
};

testFacilitiesAPI();
