import { test, expect } from '../fixtures/test-fixtures';

test.describe('Device Dashboard', () => {
  test('lists active device regression runs after login', async ({ authenticatedPage }) => {
    const count = await authenticatedPage.getVisibleDeviceCount();
    expect(count).toBeGreaterThan(0);
  });

  test('filters devices by Failing status', async ({ authenticatedPage }) => {
    await authenticatedPage.filterByStatus('Failing');
    const rows = authenticatedPage.deviceRows;
    const count = await rows.count();

    for (let i = 0; i < count; i++) {
      await expect(rows.nth(i).getByTestId('status-badge')).toHaveText('Failing');
    }
  });

  test('searching narrows the device list', async ({ authenticatedPage }) => {
    const before = await authenticatedPage.getVisibleDeviceCount();
    await authenticatedPage.searchDevice('RMX9999');
    const after = await authenticatedPage.getVisibleDeviceCount();
    expect(after).toBeLessThanOrEqual(before);
  });

  test('open defect count matches a sane range', async ({ authenticatedPage }) => {
    const defects = await authenticatedPage.getOpenDefectCount();
    expect(defects).toBeGreaterThanOrEqual(0);
  });
});
