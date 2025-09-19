const { test, expect } = require('@playwright/test');

test.describe('Next.js (App Router) Companies API', () => {

  // -------------------------
  // GET /api/companies
  // -------------------------
  test('GET /api/companies returns a list', async ({ request }) => {
    const res = await request.get('/api/companies');
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body).toHaveProperty('count');
    expect(body).toHaveProperty('items');
    expect(Array.isArray(body.items)).toBeTruthy();
    expect(body.count).toBeGreaterThan(0);
  });

  // -------------------------
  // GET /api/companies/search?name=
  // -------------------------
  test('GET /api/companies/search?name=Microsoft returns Microsoft', async ({ request }) => {
    const res = await request.get('/api/companies/search?name=Microsoft');
    expect(res.status()).toBe(200);

    const { count, items } = await res.json();
    expect(count).toBeGreaterThan(0);

    const found = items.find(item => item.name?.toLowerCase().includes('microsoft'));
    expect(found).toBeTruthy();
  });

  // -------------------------
  // GET /api/companies/:id
  // -------------------------
  test('GET /api/companies/:id returns the company document', async ({ request }) => {
    const listRes = await request.get('/api/companies?limit=1');
    expect(listRes.status()).toBe(200);

    const listBody = await listRes.json();
    expect(listBody.items.length).toBeGreaterThan(0);

    const id = listBody.items[0]._id;
    const singleRes = await request.get(`/api/companies/${id}`);
    expect(singleRes.status()).toBe(200);

    const doc = await singleRes.json();
    expect(doc).toHaveProperty('_id', id);
    expect(doc).toHaveProperty('name');
  });

  test('GET /api/companies/:id with invalid id returns 400', async ({ request }) => {
    const res = await request.get('/api/companies/invalid-id');
    expect(res.status()).toBe(400);

    const body = await res.json();
    expect(body).toHaveProperty('error');
  });

  // -------------------------
  // GET /api/companies/search by location
  // -------------------------
  test('GET /api/companies/search?location=UnknownCity returns empty list', async ({ request }) => {
    const res = await request.get('/api/companies/search?location=UnknownCity');
    expect(res.status()).toBe(200);

    const { items } = await res.json();
    expect(items.length).toBe(0);
  });

  // -------------------------
  // GET /api/companies/by-skill/:skill
  // -------------------------
  test('GET /api/companies/by-skill/:skill returns companies requiring DSA skill', async ({ request }) => {
    const res = await request.get('/api/companies/by-skill/DSA');
    expect(res.status()).toBe(200);

    const { items } = await res.json();
    expect(items.length).toBeGreaterThan(0);

    items.forEach(company => {
      const skills = company.hiringCriteria.skills.map(s => s.toLowerCase());
      expect(skills).toContain('dsa');
    });
  });

  // -------------------------
  // GET /api/companies/by-location/:location
  // -------------------------
  test('GET /api/companies/by-location/:location returns companies in Hyderabad', async ({ request }) => {
    const res = await request.get('/api/companies/by-location/Hyderabad');
    expect(res.status()).toBe(200);

    const { items } = await res.json();
    expect(items.length).toBeGreaterThan(0);

    items.forEach(company => {
      expect(company.location.toLowerCase()).toBe('hyderabad');
    });
  });

  // -------------------------
  // GET /api/companies/benefit/:benefit
  // -------------------------
  test('GET /api/companies/benefit/:benefit returns companies with that benefit', async ({ request }) => {
    const res = await request.get('/api/companies/benefit/Health Insurance');
    expect(res.status()).toBe(200);

    const { items } = await res.json();
    expect(items.length).toBeGreaterThan(0);

    items.forEach(company => {
      const benefits = company.benefits.map(b => b.toLowerCase());
      expect(benefits).toContain('health insurance');
    });
  });

  // -------------------------
  // GET /api/companies/count
  // -------------------------
  test('GET /api/companies/count returns count of companies', async ({ request }) => {
    const res = await request.get('/api/companies/count');
    expect(res.status()).toBe(200);

    const { total } = await res.json();
    expect(total).toBeGreaterThan(0);
  });

  // -------------------------
  // GET /api/companies/headcount-range
  // -------------------------
  test('GET /api/companies/headcount-range returns companies within the range', async ({ request }) => {
    const res = await request.get('/api/companies/headcount-range?min=50&max=200');
    expect(res.status()).toBe(200);

    const data = await res.json();
    const items = Array.isArray(data) ? data : data.items;
    expect(items.length).toBeGreaterThan(0);

    items.forEach(company => {
      expect(company.headcount).toBeGreaterThanOrEqual(50);
      expect(company.headcount).toBeLessThanOrEqual(200);
    });
  });

  // -------------------------
  // GET /api/companies/top-api
  // -------------------------
  test('GET /api/companies/top-paid returns top paid companies', async ({ request }) => {
    const res = await request.get('/api/companies/top-paid?limit=10');
    expect(res.status()).toBe(200);

    const data = await res.json();
    const items = Array.isArray(data) ? data : data.items;
    expect(items.length).toBeGreaterThan(0);
    expect(items.length).toBeLessThanOrEqual(10);

    let lastSalary = Infinity;
    items.forEach(company => {
      expect(company.baseSalary).toBeLessThanOrEqual(lastSalary);
      lastSalary = company.baseSalary;
    });
  });

  // -------------------------
  // POST /api/companies/bulk
  // -------------------------
  test('POST /api/companies/bulk inserts multiple companies', async ({ request }) => {
    const newCompanies = [
      { name: 'TestCompany1', location: 'Delhi', headcount: 120, benefits: ['Gym'] },
      { name: 'TestCompany2', location: 'Mumbai', headcount: 80, benefits: ['Cafeteria'] },
    ];

    const res = await request.post('/api/companies/bulk', { data: newCompanies });
    expect(res.status()).toBe(201);

    const { insertedCount } = await res.json();
    expect(insertedCount).toBe(newCompanies.length);
  });

  // -------------------------
  // POST /api/companies/:id/add-benefit
  // -------------------------
  test('POST /api/companies/:id/add-benefit adds a new benefit', async ({ request }) => {
    const listRes = await request.get('/api/companies?limit=1');
    const { items } = await listRes.json();
    const id = items[0]._id;

    const res = await request.post(`/api/companies/${id}/add-benefit`, {
      data: { benefit: 'Free Snacks' },
    });
    expect(res.status()).toBe(200);

    const updated = await res.json();
    expect(updated.benefits.map(b => b.toLowerCase())).toContain('free snacks');
  });

  // -------------------------
  // POST /api/companies/:id/push-round
  // -------------------------
  test('POST /api/companies/:id/push-round adds a new round', async ({ request }) => {
    const listRes = await request.get('/api/companies?limit=1');
    const { items } = await listRes.json();
    const id = items[0]._id;

    const res = await request.post(`/api/companies/${id}/push-round`, {
      data: { round: { name: 'Technical Interview', duration: '45 mins' } },
    });
    expect(res.status()).toBe(200);

    const updated = await res.json();
    expect(updated.rounds.some(r => r.name === 'Technical Interview')).toBeTruthy();
  });

  // -------------------------
  // GET /api/companies/paginate
  // -------------------------
  test('GET /api/companies/paginate returns paginated companies', async ({ request }) => {
    const res = await request.get('/api/companies/paginate?page=1&limit=2');
    expect(res.status()).toBe(200);

    const { items, page, totalPages } = await res.json();
    expect(Array.isArray(items)).toBeTruthy();
    expect(items.length).toBeLessThanOrEqual(2);
    expect(page).toBe(1);
    expect(totalPages).toBeGreaterThan(0);
  });

  // -------------------------
  // GET /api/companies/text-search
  // -------------------------
  test('GET /api/companies/text-search finds companies by keyword', async ({ request }) => {
    const res = await request.get('/api/companies/text-search?q=TestCompany1');
    expect(res.status()).toBe(200);

    const { items } = await res.json();
    expect(items.some(c => c.name.toLowerCase().includes('testcompany1'))).toBeTruthy();
  });

});
