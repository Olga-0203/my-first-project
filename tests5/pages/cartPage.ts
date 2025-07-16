import { Page, Locator } from '@playwright/test';

export class CartPage {
  readonly page: Page;
  readonly cartIcon: Locator;
  readonly cartItems: Locator;
  readonly removeButtons: Locator;
  readonly continueShoppingButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartIcon = page.locator('.shopping_cart_link');
    this.cartItems = page.locator('.cart_item');
    this.removeButtons = page.locator('button[data-test^="remove"]');
    this.continueShoppingButton = page.locator('[data-test="continue-shopping"]');
  }

  async openCart() {
    await this.cartIcon.waitFor({ state: 'visible' });
    await this.cartIcon.click();
    await this.page.waitForURL('https://www.saucedemo.com/cart.html');
  }

  async getCartItemCount(): Promise<number> {
    return await this.cartItems.count();
  }

  async removeAllItems() {
    const count = await this.getCartItemCount();
    for (let i = 0; i < count; i++) {
      await this.removeButtons.first().click();
    }
  }

  async isContinueShoppingButtonVisible(): Promise<boolean> {
    return await this.continueShoppingButton.isVisible();
  }

  async getItemName(index: number): Promise<string> {
    return await this.cartItems.nth(index).locator('.inventory_item_name').textContent();
  }
}