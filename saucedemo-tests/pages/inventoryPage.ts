import { Locator, Page } from '@playwright/test';

export class InventoryPage {
  readonly page: Page;
  readonly inventoryItems: Locator;
  readonly itemNames: Locator;
  readonly itemPrices: Locator;
  readonly cartBadge: Locator;
  readonly cartLink: Locator;
  readonly removeButtons: Locator;

  constructor(page: Page) {
    this.page = page;
    this.inventoryItems = page.locator('.inventory_item');
    this.itemNames = page.locator('.inventory_item_name');
    this.itemPrices = page.locator('.inventory_item_price');
    this.cartBadge = page.locator('.shopping_cart_badge');
    this.cartLink = page.locator('.shopping_cart_link');
  }

   // Метод для получения кнопки "Add to cart" по имени товара
  getAddToCartButton(itemName: string) {
    return this.page.locator(`xpath=//div[text()='${itemName}']/ancestor::div[@class='inventory_item_description']//button`);
  }

  async addItemToCart(itemName: string) {
    const button = this.getAddToCartButton(itemName);
    await button.waitFor({ state: 'visible' });
    await button.click();
    await this.page.waitForTimeout(300); // Небольшая пауза
  }
  async getItemNames(): Promise<string[]> {
    return this.itemNames.allTextContents();
  }

  async getItemPrices(): Promise<string[]> {
    return this.itemPrices.allTextContents();
  }

  async getItemsCount(): Promise<number> {
    return this.itemNames.count();
  }

  async addItemToCart(itemName: string) {
    const item = this.inventoryItems.filter({ hasText: itemName });
    await item.locator('button').click();
  }

  async getCartBadgeCount(): Promise<number> {
    if (await this.cartBadge.isVisible()) {
      const text = await this.cartBadge.textContent();
      return text ? parseInt(text) : 0;
    }
    return 0;
  }

  async goToCart() {
    await this.cartLink.click();
  }

}