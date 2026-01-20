import { Builder, By, Key, until } from 'selenium-webdriver';
import assert from 'assert';

describe('Search and Cart Functionality', function () {
    this.timeout(30000);
    let driver;

    before(async function () {
        driver = await new Builder().forBrowser('chrome').build();
    });

    after(async function () {
        if (driver) {
            await driver.quit();
        }
    });

    it('should search for a product', async function () {
        await driver.get('http://localhost:5173');

        // Click Search Icon
        // Targeting the search button by its position in the icons container
        const searchIcon = await driver.wait(
            until.elementLocated(By.xpath("//div[contains(@class, 'flex items-center gap-6') or contains(@class, 'md:gap-8')]//button[1]")),
            5000
        );
        await searchIcon.click();

        // Wait for input to appear
        const searchInput = await driver.wait(until.elementLocated(By.css('input[placeholder="Search..."]')), 5000);

        // Type query and hit Enter
        await searchInput.sendKeys('Sofa', Key.RETURN);

        // Verify URL changes to include search param
        await driver.wait(until.urlContains('search=Sofa'), 5000);
    });

    it('should add item to cart', async function () {
        // Mock Authentication
        await driver.get('http://localhost:5173');
        await driver.executeScript(function () {
            const now = new Date().getTime();
            const expiry = now + (24 * 60 * 60 * 1000);
            localStorage.setItem('auth_token', 'mock_token_for_test');
            localStorage.setItem('token_expiry', expiry.toString());
        });

        // Fetch a valid product ID from API to ensure we navigate to an existing product
        const response = await fetch('http://localhost:30011/api/products');
        const data = await response.json();

        assert.ok(data.products && data.products.length > 0, 'No products found in API');
        const productId = data.products[0]._id;

        // Navigate to product page directly
        await driver.get(`http://localhost:5173/product/${productId}`);

        // Wait for "Add to Cart" button
        const addToCartBtn = await driver.wait(
            until.elementLocated(By.xpath("//button[contains(., 'Add to Cart')]")),
            10000
        );

        await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", addToCartBtn);
        await driver.sleep(500);

        await addToCartBtn.click();

        // Verify Cart Sidebar opens (Look for "Your Cart" text)
        await driver.wait(until.elementLocated(By.xpath("//h2[contains(., 'Your Cart')]")), 5000);

        // Verify an item exists in the cart list
        await driver.wait(until.elementLocated(By.css('.fixed.inset-0 .overflow-y-auto > div.flex')), 5000);
    });
});
