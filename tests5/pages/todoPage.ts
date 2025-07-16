import { Page, Locator } from '@playwright/test';

export class TodoPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async isAtInventoryPage() {
    await this.page.waitForURL('https://www.saucedemo.com/inventory.html');
  }

  async addItemToCart(index = 0) {
    const addToCartButtons = this.page.locator('button[data-test^="add-to-cart"]');
    await addToCartButtons.nth(index).click();
  }

  async removeItemFromCart(index = 0) {
    const removeButtons = this.page.locator('button[data-test^="remove"]');
    await removeButtons.nth(index).click();
  }

  async completeTaskSimulation(index = 0) {
    await this.addItemToCart(index);
    await this.removeItemFromCart(index);
  }

  async getCartCount(): Promise<number> {
    const cartBadge = this.page.locator('.shopping_cart_badge');
    if (await cartBadge.isVisible()) {
      return parseInt(await cartBadge.textContent() || '0', 10);
    }
    return 0;
  }

  async getItemName(index: number): Promise<string> {
    const itemName = this.page.locator('.inventory_item_name').nth(index);
    return await itemName.textContent();
  }
}