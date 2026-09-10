import { test, expect } from '../fixtures/test-fixtures';

test.describe('OTA Build Upload & Qualification', () => {
  test.beforeEach(async ({ page, loginPage }) => {
    await loginPage.goto();
    await loginPage.loginAs(
      process.env.QA_USERNAME || 'qa.engineer@example.com',
      process.env.QA_PASSWORD || 'test-password'
    );
  });

  test('uploads a valid OTA build package and it qualifies', async ({ otaBuildPage }) => {
    await otaBuildPage.goto();
    await otaBuildPage.uploadBuild('sample-ota-package.zip', 'RMX9999_OTA_2026_09_10', 'Qualcomm');
    await otaBuildPage.expectUploadSucceeds();

    const result = await otaBuildPage.waitForQualificationResult();
    expect(['Qualified', 'Needs Review']).toContain(result);
  });

  test('rejects an OTA package with an invalid extension', async ({ otaBuildPage, page }) => {
    await otaBuildPage.goto();
    await otaBuildPage.uploadBuild('invalid-package.txt', 'RMX9999_OTA_BAD', 'MTK');
    await expect(page.getByText('Unsupported file type')).toBeVisible();
  });

  test('requires a build version before submission', async ({ otaBuildPage, page }) => {
    await otaBuildPage.goto();
    await otaBuildPage.uploadInput.setInputFiles(
      require('path').join(__dirname, '..', 'fixtures', 'files', 'sample-ota-package.zip')
    );
    await otaBuildPage.submitButton.click();
    await expect(page.getByText('Build version is required')).toBeVisible();
  });
});
