/**
 * FLEETFLOW ERP & Travel Platform - Comprehensive End-to-End QA Integration Test Suite
 * Validates the complete chained business lifecycle:
 * Customer Search -> Live Quote -> Booking -> Tracking Initial State ->
 * Admin Assignment -> Chauffeur Assigned Tracking -> Trip Start -> Trip Expense ->
 * Trip Completion -> Final Tracking State -> Vehicle Loan Creation ->
 * EMI Schedule & Reminders -> EMI Accounting Split Payment ->
 * Multi-Vehicle Convoy -> Analytics KPIs -> Admin Route Management CRUD.
 */

const API_BASE = process.env.API_BASE || 'http://localhost:5001/api/v1';
const FRONTEND_BASE = process.env.FRONTEND_BASE || 'http://localhost:3000';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures = [];

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ PASS: ${message}`);
  } else {
    failedTests++;
    console.error(`  ❌ FAIL: ${message}`);
    failures.push(message);
  }
}

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, data };
}

async function runQA() {
  console.log('\n======================================================');
  console.log('  🧪 FLEETFLOW ERP - END-TO-END QA TEST SUITE');
  console.log('======================================================\n');

  // -----------------------------------------------------------
  // 1. FRONTEND AVAILABILITY TESTS
  // -----------------------------------------------------------
  console.log('▶ [GROUP 1] Frontend View Routes & SSR Verification');
  try {
    const pages = ['/', '/admin', '/driver', '/track', '/login'];
    for (const p of pages) {
      const res = await fetch(`${FRONTEND_BASE}${p}`);
      assert(res.status === 200, `Frontend page ${p} returns HTTP 200 OK`);
    }
  } catch (err) {
    assert(false, `Frontend server running at ${FRONTEND_BASE} (${err.message})`);
  }

  // -----------------------------------------------------------
  // 2. PRICING & ROUTE DISCOVERY SCENARIOS
  // -----------------------------------------------------------
  console.log('\n▶ [GROUP 2] Route Search, Intermediate Stops & Dynamic Quotes');

  // Scenario 2.1: Direct Route Search (Bangalore -> Mysore)
  const directRes = await request('/pricing/search-route?pickup=Bangalore&drop=Mysore');
  assert(directRes.status === 200, 'Search route endpoint responds HTTP 200');
  assert(directRes.data?.found === true, 'Direct corridor Bangalore -> Mysore is found');
  assert(directRes.data?.data?.is_intermediate === false, 'Direct corridor is not flagged as intermediate');
  assert(directRes.data?.data?.available_vehicles?.length >= 2, 'At least 2 vehicle options returned for corridor');

  // Scenario 2.2: Intermediate Stop Search (Bangalore -> Mandya)
  const interRes = await request('/pricing/search-route?pickup=Bangalore&drop=Mandya');
  assert(interRes.status === 200, 'Intermediate search responds HTTP 200');
  assert(interRes.data?.found === true, 'Intermediate stop Mandya is found on corridor');
  assert(interRes.data?.data?.is_intermediate === true, 'Flagged correctly as intermediate stop');
  assert(interRes.data?.data?.matched_stop?.toLowerCase() === 'mandya', 'Matched stop correctly identifies Mandya');

  // Scenario 2.3: Unserviced Route
  const emptyRes = await request('/pricing/search-route?pickup=Shimla&drop=Manali');
  assert(emptyRes.status === 200, 'Unserviced search responds HTTP 200');
  assert(emptyRes.data?.found === false, 'Unserviced route correctly returns found=false');
  assert(emptyRes.data?.data === null, 'Unserviced route returns null data (triggers empty state)');

  // Scenario 2.4: Dynamic Pricing Quote Calculation
  const quoteRes = await request('/pricing/quote', {
    method: 'POST',
    body: JSON.stringify({
      pickup_location: 'Bangalore',
      drop_location: 'Mysore',
      vehicle_type: 'SEDAN',
    }),
  });
  assert(quoteRes.status === 200, 'Quote calculation endpoint responds HTTP 200');
  assert(quoteRes.data?.data?.total_estimated_price > 0, 'Computed live price is greater than 0');

  // -----------------------------------------------------------
  // 3. COMPLETE CUSTOMER-TO-DISPATCH-TO-COMPLETION LIFECYCLE
  // -----------------------------------------------------------
  console.log('\n▶ [GROUP 3] End-to-End Customer Booking, Tracking & Admin Assignment');

  // Scenario 3.1: Customer Creates Booking
  const customerBookingRes = await request('/bookings', {
    method: 'POST',
    body: JSON.stringify({
      guest_name: 'E2E Test Passenger',
      guest_phone: '+91 98888 77777',
      guest_email: 'e2e.passenger@fleetflow.test',
      pickup_location: 'Indiranagar 100ft Road',
      drop_location: 'Bangalore Kempegowda Airport',
      pickup_date: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
      pickup_time: '09:00 AM',
      passenger_count: 2,
      vehicle_type: 'SEDAN',
      estimated_price: 1650,
      notes: 'Urgent flight connection. Needs placard at gate.',
    }),
  });
  assert(customerBookingRes.status === 201, 'Customer booking created with HTTP 201 Created');
  const bkg = customerBookingRes.data?.data;
  assert(bkg?.booking_code?.startsWith('BKG-'), `Booking code generated with valid prefix: ${bkg?.booking_code}`);

  // Scenario 3.2: Customer Tracks Ride Initially (Stage: WAITING_ASSIGNMENT)
  const initialTrackRes = await request(`/bookings/track/${bkg?.booking_code}`);
  assert(initialTrackRes.status === 200, 'Initial tracking endpoint responds HTTP 200');
  assert(initialTrackRes.data?.data?.booking_code === bkg?.booking_code, 'Tracking returns exact booking code');
  assert(initialTrackRes.data?.current_stage === 'WAITING_ASSIGNMENT', 'Initial tracking stage is WAITING_ASSIGNMENT');

  // Fetch Drivers and Vehicles for Admin Assignment
  const drvListRes = await request('/drivers');
  const drivers = drvListRes.data?.data || [];
  assert(drivers.length > 0, `Fleet drivers available for assignment (found ${drivers.length})`);
  const activeDriver = drivers.find((d) => d.status === 'AVAILABLE' && !d.is_license_expired) || drivers.find((d) => !d.is_license_expired) || drivers[0];

  const vehListRes = await request('/vehicles');
  const vehicles = vehListRes.data?.data || [];
  assert(vehicles.length > 0, `Fleet vehicles available for assignment (found ${vehicles.length})`);
  const activeVehicle = vehicles.find((v) => v.status !== 'MAINTENANCE') || vehicles[0];

  // Scenario 3.3: Admin Assigns Booking to Vehicle & Driver (POST /api/v1/bookings/:id/assign)
  const assignBookingRes = await request(`/bookings/${bkg?.id}/assign`, {
    method: 'POST',
    body: JSON.stringify({
      vehicle_id: activeVehicle?.id,
      driver_id: activeDriver?.id,
      trip_price: 1650,
      notes: 'Assigned via E2E test workflow',
    }),
  });
  assert(assignBookingRes.status === 201, 'Admin assigned booking to vehicle & chauffeur with HTTP 201');
  const assignedTrip = assignBookingRes.data?.data;
  assert(assignedTrip?.trip_code?.startsWith('TRP-'), `Confirmed Trip created: ${assignedTrip?.trip_code}`);

  // Scenario 3.4: Customer Tracks Ride Again (Stage: ASSIGNED with Chauffeur & Vehicle)
  const assignedTrackRes = await request(`/bookings/track/${bkg?.booking_code}`);
  assert(assignedTrackRes.status === 200, 'Assigned tracking endpoint responds HTTP 200');
  assert(assignedTrackRes.data?.current_stage === 'ASSIGNED', 'Tracking stage updated to ASSIGNED');
  assert(assignedTrackRes.data?.booking?.trip?.driver?.name === activeDriver?.name, `Tracker shows assigned chauffeur: ${activeDriver?.name}`);
  assert(assignedTrackRes.data?.booking?.trip?.vehicle?.registration_number === activeVehicle?.registration_number, `Tracker shows assigned vehicle: ${activeVehicle?.registration_number}`);

  // Scenario 3.5: Chauffeur / Admin Starts Trip
  const startOdo = activeVehicle?.current_odometer || 12000;
  const startRes = await request(`/trips/${assignedTrip?.id}/start`, {
    method: 'POST',
    body: JSON.stringify({ start_odometer: startOdo }),
  });
  assert(startRes.status === 200, 'Chauffeur started trip with HTTP 200');

  // Scenario 3.6: Customer Tracks Ride While in Progress (Stage: STARTED / En Route)
  const startedTrackRes = await request(`/bookings/track/${bkg?.booking_code}`);
  assert(startedTrackRes.data?.current_stage === 'STARTED', 'Tracking stage updated to STARTED (Driver En Route)');

  // Scenario 3.7: Add Trip Expense (Toll / Fuel during transit)
  const expRes = await request(`/trips/${assignedTrip?.id}/expenses`, {
    method: 'POST',
    body: JSON.stringify({
      category: 'TOLL',
      amount: 140,
      notes: 'Airport Trumpet Expressway Toll',
    }),
  });
  assert(expRes.status === 201, 'Trip expense (Toll) added with HTTP 201');

  // Scenario 3.8: Chauffeur / Admin Completes Trip with Settlement
  const completeRes = await request(`/trips/${assignedTrip?.id}/complete`, {
    method: 'POST',
    body: JSON.stringify({
      end_odometer: startOdo + 48,
      payment_method: 'UPI',
    }),
  });
  assert(completeRes.status === 200, 'Chauffeur completed trip with HTTP 200');

  // Scenario 3.9: Customer Tracks Ride Upon Arrival (Stage: COMPLETED)
  const completedTrackRes = await request(`/bookings/track/${bkg?.booking_code}`);
  assert(completedTrackRes.data?.current_stage === 'COMPLETED', 'Tracking stage updated to COMPLETED (Safely Arrived)');

  // Scenario 3.10: Admin Rejects an Unserviceable Booking (Do Not Assign) & Verifies In-App / Tracking Rejection
  const rejectTestBooking = await request('/bookings', {
    method: 'POST',
    body: JSON.stringify({
      guest_name: 'Reject Test Passenger',
      pickup_location: 'Remote Border Checkpost',
      drop_location: 'Inaccessible Valley',
      pickup_date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      pickup_time: '14:00',
      vehicle_type: 'SUV',
      estimated_price: 4500,
    }),
  });
  assert(rejectTestBooking.status === 201, 'Test booking for rejection scenario created');
  const rejectBkg = rejectTestBooking.data?.data;

  const rejectRes = await request(`/bookings/${rejectBkg.id}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason: 'Corridor closed for monsoon roadwork' }),
  });
  assert(rejectRes.status === 200, 'Admin successfully rejected booking with HTTP 200 (Do Not Assign)');
  assert(rejectRes.data?.data?.booking_status === 'REJECTED', 'Booking status updated to REJECTED');

  const rejectTrackRes = await request(`/bookings/track/${rejectBkg.booking_code}`);
  assert(rejectTrackRes.status === 200, 'Tracking endpoint responds for rejected booking');
  assert(rejectTrackRes.data?.current_stage === 'REJECTED', 'Tracking stage correctly identifies REJECTED');

  // -----------------------------------------------------------
  // 4. MULTI-VEHICLE CONVOY & DISPATCH QUEUE
  // -----------------------------------------------------------
  console.log('\n▶ [GROUP 4] Multi-Vehicle Convoy & Queue Verification');

  // Scenario 4.1: Multi-Vehicle Convoy Booking
  const convoyRes = await request('/bookings/multi-vehicle', {
    method: 'POST',
    body: JSON.stringify({
      guest_name: 'Tech Summit Delegation',
      guest_phone: '+91 98888 12345',
      guest_email: 'summit@techdelegation.com',
      pickup_location: 'ITC Gardenia, Bangalore',
      drop_location: 'Bangalore Airport',
      pickup_date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      pickup_time: '02:00 PM',
      notes: 'VIP Summit Convoy QA',
      vehicle_requests: [
        { vehicle_type: 'INNOVA', quantity: 2, unit_price: 4500 },
        { vehicle_type: 'SEDAN', quantity: 1, unit_price: 3000 },
      ],
    }),
  });
  assert(convoyRes.status === 201, 'Multi-vehicle convoy created with HTTP 201');
  assert(convoyRes.data?.data?.sub_bookings?.length === 3, 'Created exactly 3 sub-bookings for convoy (2 Innovas + 1 Sedan)');

  // Scenario 4.2: Unassigned Queue Verification
  const unassignedRes = await request('/trips/unassigned-queue');
  assert(unassignedRes.status === 200, 'Unassigned trip queue responds HTTP 200');

  // Scenario 4.3: Time-Aware Driver Availability Check
  const timeAwareRes = await request('/trips/time-aware-drivers?date=' + encodeURIComponent(new Date().toISOString().split('T')[0]));
  assert(timeAwareRes.status === 200, 'Time-aware drivers endpoint responds HTTP 200');
  assert(Array.isArray(timeAwareRes.data?.data), 'Time-aware driver availability returns array');

  // -----------------------------------------------------------
  // 5. FINANCE, VEHICLE LOANS, EMI REMINDERS & ACCOUNTING
  // -----------------------------------------------------------
  console.log('\n▶ [GROUP 5] Vehicle Loans, EMI Reminders & Accounting Split');

  // Scenario 5.1: Create Driver Advance
  const advanceRes = await request('/finance/advances', {
    method: 'POST',
    body: JSON.stringify({
      driver_id: activeDriver?.id,
      amount: 1500,
      reason: 'Outstation Fuel & Food Advance',
    }),
  });
  assert(advanceRes.status === 201, 'Driver advance recorded with HTTP 201');

  // Scenario 5.2: Admin Creates New Vehicle Loan (POST /api/v1/finance/loans)
  const newLoanRes = await request('/finance/loans', {
    method: 'POST',
    body: JSON.stringify({
      vehicle_id: activeVehicle?.id,
      bank_name: 'HDFC Commercial Vehicle Finance',
      account_number: `LON-HDFC-${Date.now().toString().slice(-6)}`,
      original_loan_amount: 600000,
      interest_rate: 9.5,
      tenure_months: 36,
      loan_start_date: new Date().toISOString().split('T')[0],
    }),
  });
  assert(newLoanRes.status === 201, 'Admin created new Vehicle Loan with HTTP 201');
  const createdLoan = newLoanRes.data?.data;
  assert(createdLoan?.monthly_emi > 0, `Monthly EMI auto-calculated: ₹${Math.round(createdLoan?.monthly_emi)}/mo`);
  assert(createdLoan?.next_emi_date !== null, `Upcoming EMI reminder set: ${createdLoan?.next_emi_date?.slice(0, 10)}`);
  assert(createdLoan?.outstanding_principal === 600000, 'Initial outstanding principal is ₹600,000');

  // Scenario 5.3: Verify Loans List Includes New Loan
  const loansRes = await request('/finance/loans');
  assert(loansRes.status === 200, 'Loans list responds HTTP 200');
  const loans = loansRes.data?.data || [];
  const foundLoan = loans.find((l) => l.id === createdLoan?.id);
  assert(!!foundLoan, 'Newly created loan appears in fleet loans inventory');

  // Scenario 5.4: Record EMI Payment on Loan with Explicit Principal & Interest Split
  const emiPaymentAmount = Math.round(createdLoan?.monthly_emi || 19222);
  const principalSplit = Math.round(emiPaymentAmount * 0.75);
  const interestSplit = emiPaymentAmount - principalSplit;

  const emiRes = await request('/finance/loans/payment', {
    method: 'POST',
    body: JSON.stringify({
      loan_id: createdLoan?.id,
      payment_date: new Date().toISOString().split('T')[0],
      emi_amount: emiPaymentAmount,
      principal_component: principalSplit,
      interest_component: interestSplit,
      payment_method: 'AUTO_DEBIT',
      reference_number: `TXN-EMI-${Date.now().toString().slice(-6)}`,
    }),
  });
  assert(emiRes.status === 201 || emiRes.status === 200, 'Loan EMI payment recorded successfully');

  // Scenario 5.5: Verify Outstanding Principal Decreased & Equity Increased
  const updatedLoansRes = await request('/finance/loans');
  const updatedLoans = updatedLoansRes.data?.data || [];
  const updatedLoan = updatedLoans.find((l) => l.id === createdLoan?.id);
  assert(updatedLoan?.principal_paid >= principalSplit, `Principal paid increased by ₹${principalSplit}`);
  assert(updatedLoan?.outstanding_principal < 600000, `Outstanding principal reduced to ₹${Math.round(updatedLoan?.outstanding_principal)}`);

  // -----------------------------------------------------------
  // 6. ANALYTICS, KPIS & SYSTEM ALERTS
  // -----------------------------------------------------------
  console.log('\n▶ [GROUP 6] Analytics, KPIs & Alerts Verification');

  const kpisRes = await request('/analytics/kpis');
  assert(kpisRes.status === 200, 'Dashboard KPIs endpoint responds HTTP 200');
  assert(kpisRes.data?.data?.total_revenue !== undefined, 'KPI includes total_revenue');
  assert(kpisRes.data?.data?.total_trips !== undefined, 'KPI includes total_trips');

  const alertsRes = await request('/alerts');
  assert(alertsRes.status === 200, 'Active alerts endpoint responds HTTP 200');

  // -----------------------------------------------------------
  // 7. ROUTE MANAGEMENT CRUD & INTERMEDIATE STOPS
  // -----------------------------------------------------------
  console.log('\n▶ [GROUP 7] Admin Route Management CRUD Scenarios');

  // Scenario 7.1: Create New Corridor with Intermediate Stops
  const newRouteRes = await request('/pricing/routes', {
    method: 'POST',
    body: JSON.stringify({
      origin_name: 'Chennai Central',
      destination_name: 'Pondicherry Rock Beach',
      distance_km: 155,
      estimated_duration_hours: 3.5,
      toll_cost_estimate: 210,
      intermediate_stops: 'Mahabalipuram, Kalpakkam, Marakkanam',
      is_active: true,
      vehicle_pricing: [
        { vehicle_type: 'SEDAN', base_price: 3200, per_km_rate: 14 },
        { vehicle_type: 'INNOVA', base_price: 4800, per_km_rate: 20 },
      ],
    }),
  });
  assert(newRouteRes.status === 201, 'Admin created new corridor with intermediate stops (HTTP 201)');
  const createdRoute = newRouteRes.data?.data;

  // Scenario 7.2: Verify Search works on the newly created intermediate stop (Mahabalipuram)
  const newInterSearch = await request('/pricing/search-route?pickup=Chennai+Central&drop=Mahabalipuram');
  assert(newInterSearch.status === 200, 'Search for newly created intermediate stop responds HTTP 200');
  assert(newInterSearch.data?.found === true, 'Newly created intermediate stop Mahabalipuram matched successfully');
  assert(newInterSearch.data?.data?.matched_stop?.toLowerCase() === 'mahabalipuram', 'Matched stop correctly identified Mahabalipuram');

  // Scenario 7.3: Clean up test corridor
  if (createdRoute?.id) {
    const delRouteRes = await request(`/pricing/routes/${createdRoute.id}`, { method: 'DELETE' });
    assert(delRouteRes.status === 200, 'Admin deleted test corridor successfully (HTTP 200)');
  }

  // -----------------------------------------------------------
  // [GROUP 8] Admin & Customer Role Authentication & Privilege Separation
  // -----------------------------------------------------------
  console.log('\n▶ [GROUP 8] Admin & Customer Role Authentication & Privilege Separation');

  // Scenario 8.1: Admin Login with credentials returns JWT and Role ADMIN
  const adminLoginRes = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'admin@fleet.com',
      password: 'admin123',
    }),
  });
  assert(adminLoginRes.status === 200, 'Admin login endpoint responds HTTP 200');
  assert(adminLoginRes.data?.success === true, 'Admin login succeeds with valid credentials');
  assert(!!adminLoginRes.data?.token, 'Admin login issues valid JWT bearer token');
  assert(adminLoginRes.data?.user?.role === 'ADMIN', 'Admin user explicitly possesses ADMIN role');

  // Scenario 8.2: Passenger Login returns JWT and Role CUSTOMER
  const custLoginRes = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'sandeep.kumar@gmail.com',
      password: 'password123',
    }),
  });
  assert(custLoginRes.status === 200, 'Passenger login endpoint responds HTTP 200');
  assert(custLoginRes.data?.success === true, 'Passenger login succeeds with valid credentials');
  assert(custLoginRes.data?.user?.role === 'CUSTOMER', 'Passenger user explicitly possesses CUSTOMER role');
  assert(custLoginRes.data?.user?.role !== 'ADMIN', 'Passenger user is strictly denied ADMIN role privileges');

  // Scenario 8.3: Driver Login with credentials returns JWT and Role DRIVER
  const driverLoginRes = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'ramesh@fleet.com',
      password: 'password123',
    }),
  });
  assert(driverLoginRes.status === 200, 'Driver login endpoint responds HTTP 200');
  assert(driverLoginRes.data?.success === true, 'Driver login succeeds with valid credentials');
  assert(driverLoginRes.data?.user?.role === 'DRIVER', 'Driver user explicitly possesses DRIVER role');
  assert(driverLoginRes.data?.user?.role !== 'ADMIN', 'Driver user is strictly denied ADMIN role privileges');

  // Scenario 8.4: Driver Portal My-Trips & Credentials Verification
  const myTripsRes = await request('/drivers/my-trips', {
    headers: {
      'X-Demo-Role': 'DRIVER',
    },
  });
  assert(myTripsRes.status === 200, 'Driver my-trips endpoint responds HTTP 200');
  assert(!!myTripsRes.data?.driver?.license_number, 'Driver profile contains registered license number');
  assert(!!myTripsRes.data?.driver?.payment_model, 'Driver profile contains configured compensation structure');

  // -----------------------------------------------------------
  // FINAL SUMMARY
  // -----------------------------------------------------------
  console.log('\n======================================================');
  console.log('  📊 QA RESULTS SUMMARY:');
  console.log(`  Total Scenarios Tested: ${totalTests}`);
  console.log(`  Passed:                 ${passedTests} ✅`);
  console.log(`  Failed:                 ${failedTests} ❌`);
  console.log('======================================================\n');

  if (failedTests > 0) {
    console.error('List of Failures:');
    failures.forEach((f, idx) => console.error(`  ${idx + 1}. ${f}`));
    process.exit(1);
  } else {
    console.log('🎉 ALL END-TO-END QA SCENARIOS PASSED WITH ZERO ERRORS!\n');
    process.exit(0);
  }
}

runQA().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
