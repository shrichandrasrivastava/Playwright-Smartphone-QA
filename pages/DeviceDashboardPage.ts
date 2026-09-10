import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object for the device/test-run dashboard — the landing page after
 * login, listing active regression runs, device prototypes under test,
 * and open defect counts.
 */
export class DeviceDashboardPage {
  readonly page: Page;
  readonly pageHeading: Locator;
  readonly deviceRows: Locator;
  readonly defectCountBadge: Locator;
  readonly searchInput: Locator;
  readonly statusFilter: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageHeading = page.getByRole('heading', { name: 'Device Dashboard' });
    this.deviceRows = page.getByTestId('device-row');
    this.defectCountBadge = page.getByTestId('open-defect-count');
    this.searchInput = page.getByPlaceholder('Search device or build...');
    this.statusFilter = page.getByRole('combobox', { name: 'Status filter' });
  }

  async waitUntilLoaded(): Promise<void> {
    await expect(this.pageHeading).toBeVisible();
    await expect(this.deviceRows.first()).toBeVisible({ timeout: 10_000 });
  }

  async searchDevice(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.searchInput.press('Enter');
  }

  async filterByStatus(status: 'All' | 'Passing' | 'Failing' | 'Blocked'): Promise<void> {
    await this.statusFilter.selectOption(status);
  }

  async getVisibleDeviceCount(): Promise<number> {
    return this.deviceRows.count();
  }

  async openDevice(deviceName: string): Promise<void> {
    await this.page.getByRole('link', { name: deviceName }).click();
  }

  async getOpenDefectCount(): Promise<number> {
    const text = await this.defectCountBadge.innerText();
    return parseInt(text.replace(/\D/g, ''), 10);
  }
}
