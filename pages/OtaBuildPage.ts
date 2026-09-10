import { Page, Locator, expect } from '@playwright/test';
import path from 'path';

/**
 * Page Object for the OTA build upload / release-candidate qualification
 * workflow — mirrors validating firmware builds and OTA packages before
 * they're promoted to a commercial release.
 */
export class OtaBuildPage {
  readonly page: Page;
  readonly uploadInput: Locator;
  readonly buildVersionInput: Locator;
  readonly platformSelect: Locator;
  readonly submitButton: Locator;
  readonly uploadProgress: Locator;
  readonly successToast: Locator;
  readonly qualificationStatus: Locator;

  constructor(page: Page) {
    this.page = page;
    this.uploadInput = page.locator('input[type="file"]');
    this.buildVersionInput = page.getByLabel('Build version');
    this.platformSelect = page.getByRole('combobox', { name: 'Platform' });
    this.submitButton = page.getByRole('button', { name: 'Submit build' });
    this.uploadProgress = page.getByTestId('upload-progress');
    this.successToast = page.getByRole('alert').filter({ hasText: 'uploaded successfully' });
    this.qualificationStatus = page.getByTestId('qualification-status');
  }

  async goto(): Promise<void> {
    await this.page.goto('/ota/builds/new');
  }

  async uploadBuild(fixtureFileName: string, buildVersion: string, platform: 'MTK' | 'Qualcomm'): Promise<void> {
    const filePath = path.join(__dirname, '..', 'fixtures', 'files', fixtureFileName);
    await this.uploadInput.setInputFiles(filePath);
    await this.buildVersionInput.fill(buildVersion);
    await this.platformSelect.selectOption(platform);
    await this.submitButton.click();
  }

  async expectUploadSucceeds(): Promise<void> {
    await expect(this.successToast).toBeVisible({ timeout: 15_000 });
  }

  async waitForQualificationResult(): Promise<string> {
    await expect(this.qualificationStatus).not.toHaveText('Pending', { timeout: 60_000 });
    return this.qualificationStatus.innerText();
  }
}
