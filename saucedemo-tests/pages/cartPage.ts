import { Locator, Page } from '@playwright/test';

export class CartPage {
  readonly page: Page;
  readonly cartItems: Locator;
  readonly itemNames: Locator;
  readonly continueShoppingBtn: Locator;
  readonly checkoutBtn: Locator;
  readonly removeButtons: Locator;
  readonly removeButtons: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartItems = page.locator('.cart_item');
    this.itemNames = page.locator('.inventory_item_name');
    this.continueShoppingBtn = page.locator('[data-test="continue-shopping"]');
    this.checkoutBtn = page.locator('[data-test="checkout"]');
    this.removeButton = (itemName: string) => 
  page.locator(`xpath=//div[text()='${itemName}']/ancestor::div[@class='cart_item']//button`);
  }

  async getCartItemsCount(): Promise<number> {
    return this.cartItems.count();
  }

  async getItemNames(): Promise<string[]> {
    return this.itemNames.allTextContents();
  }

  async removeItem(itemName: string) {
  const item = this.cartItems.filter({ hasText: itemName });
  const removeButton = item.locator('button:has-text("Remove")');
  
  // Дожидаемся, что кнопка видима и активна
  await removeButton.waitFor({ state: 'visible' });
  await removeButton.click();
  
  // Ждем, пока элемент исчезнет
  await item.waitFor({ state: 'detached' });
}
  async addItemToCart(itemName: string) {
  const item = this.inventoryItems.filter({ hasText: itemName });
  const button = item.locator('button');
  
  await button.waitFor({ state: 'visible' });
  await button.click();
  
  // Ждем обновления бейджа
  await this.page.waitForTimeout(500);
}
  async goToCart() {
     await this.cartLink.click();
     await this.page.waitForURL('**/cart.html');
}
}