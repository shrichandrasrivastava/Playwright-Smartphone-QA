import { test, expect, APIRequestContext } from '@playwright/test';

const API_BASE_URL = process.env.API_BASE_URL || 'https://staging-api.qa-portal.example.com';

let apiContext: APIRequestContext;

test.beforeAll(async ({ playwright }) => {
  apiContext = await playwright.request.newContext({
    baseURL: API_BASE_URL,
    extraHTTPHeaders: {
      Authorization: `Bearer ${process.env.QA_API_TOKEN || ''}`,
      'Content-Type': 'application/json',
    },
  });
});

test.afterAll(async () => {
  await apiContext.dispose();
});

test.describe('Device & Build API Regression', () => {
  test('GET /devices returns 200 with an array payload', async () => {
    const response = await apiContext.get('/api/v1/devices');
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(Array.isArray(body.devices)).toBe(true);
  });

  test('GET /devices/:id returns expected device schema', async () => {
    const response = await apiContext.get('/api/v1/devices/RMX9999');
    expect(response.status()).toBe(200);

    const device = await response.json();
    expect(device).toMatchObject({
      model: expect.any(String),
      platform: expect.stringMatching(/MTK|Qualcomm/),
      status: expect.any(String),
    });
  });

  test('POST /builds creates a new build record', async () => {
    const response = await apiContext.post('/api/v1/builds', {
      data: {
        deviceModel: 'RMX9999',
        version: `TEST_BUILD_${Date.now()}`,
        platform: 'Qualcomm',
      },
    });
    expect(response.status()).toBe(201);

    const created = await response.json();
    expect(created.id).toBeTruthy();
    expect(created.status).toBe('Pending');
  });

  test('POST /builds rejects a request missing required fields', async () => {
    const response = await apiContext.post('/api/v1/builds', {
      data: { deviceModel: 'RMX9999' }, // missing version, platform
    });
    expect(response.status()).toBe(400);

    const error = await response.json();
    expect(error.message).toMatch(/required/i);
  });

  test('GET /defects/summary returns severity breakdown', async () => {
    const response = await apiContext.get('/api/v1/defects/summary');
    expect(response.status()).toBe(200);

    const summary = await response.json();
    expect(summary).toHaveProperty('critical');
    expect(summary).toHaveProperty('high');
    expect(summary).toHaveProperty('medium');
    expect(typeof summary.critical).toBe('number');
  });

  test('unauthenticated request is rejected with 401', async ({ playwright }) => {
    const unauthContext = await playwright.request.newContext({ baseURL: API_BASE_URL });
    const response = await unauthContext.get('/api/v1/devices');
    expect(response.status()).toBe(401);
    await unauthContext.dispose();
  });
});
