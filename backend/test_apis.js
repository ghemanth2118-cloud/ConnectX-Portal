

async function testAll() {
  const BASE_URL = 'http://localhost:8000/api';
  console.log('Testing APIs...');

  try {
    const resAuth = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Setup User',
        email: `test${Date.now()}@example.com`,
        password: 'password123',
        role: 'employer'
      })
    });

    const authData = await resAuth.json();
    console.log('Register Response:', authData);

    const token = authData.token;
    if (!token) throw new Error('Failed to get token');

    const resJobs = await fetch(`${BASE_URL}/jobs`, {
      method: 'GET',
    });
    console.log('Jobs GET Status:', resJobs.status);

    const resPostJob = await fetch(`${BASE_URL}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        title: 'Test Job',
        description: 'Test Description',
        requirements: ['React'],
        location: 'Remote',
        category: 'Development',
        type: 'Full-time',
        salaryMin: 50000,
        salaryMax: 100000
      })
    });
    const jobData = await resPostJob.json();
    console.log('Post Job Response:', jobData);

    if (jobData._id) {
      const resAnalytics = await fetch(`${BASE_URL}/analytics/overview`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('Analytics response status:', resAnalytics.status);
    }

  } catch (err) {
    console.error('Test Execution Error:', err);
  }
}

testAll();
