import { Builder, By, Key, until } from 'selenium-webdriver';
import assert from 'assert';

// NOTE: Ensure your local server is running on http://localhost:5173 before running this test.
// You can run it with `npm run dev` in a separate terminal.

describe('SHUKRA LIVING E2E Tests', function () {
    this.timeout(30000); // Extended timeout for browser startup
    let driver;

    before(async function () {
        driver = await new Builder().forBrowser('chrome').build();
    });

    after(async function () {
        if (driver) {
            await driver.quit();
        }
    });

    it('should load the homepage and check the title', async function () {
        await driver.get('http://localhost:5173');

        // Wait for the body to be present to ensure page load
        await driver.wait(until.elementLocated(By.css('body')), 10000);

        const title = await driver.getTitle();
        // Assuming the title is 'Vite + React + TS' or similar default, or whatever the app sets.
        // Let's just log it for now or assert it's not empty.
        assert.ok(title.length > 0, 'Page title should not be empty');

        // Example: Check for a specific element unique to Shukra Living
        // await driver.wait(until.elementLocated(By.css('h1')), 5000);
    });
});
