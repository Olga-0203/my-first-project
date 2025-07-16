import { test, expect } from '../fixtures/userLoginFixture';
import { TodoPage } from '../pages/todoPage';
import { CartPage } from '../pages/cartPage';

test.describe('Тесты: Товары и Корзина', () => {

  let todoPage: TodoPage;
  let cartPage: CartPage;

  test.beforeEach(async ({ loginAs, page }) => {
    await loginAs('STANDARD');
    todoPage = new TodoPage(page);
    cartPage = new CartPage(page);
  });

  // ====== Ваши предыдущие тесты (из todo.spec.ts) ======

  test('Авторизация стандартного пользователя', async ({ page }) => {
  const todoPage = new TodoPage(page); 
  await todoPage.isAtInventoryPage();

  });

  test('Добавление товара в корзину', async () => {
    await todoPage.addItemToCart(0);
    expect(await todoPage.getCartCount()).toBe(1);
  });

  test('Удаление товара из корзины', async () => {
    await todoPage.addItemToCart(0);
    await todoPage.removeItemFromCart(0);
    expect(await todoPage.getCartCount()).toBe(0);
  });

  test('Эмуляция выполнения задачи (добавить и удалить)', async () => {
    await todoPage.completeTaskSimulation(0);
    expect(await todoPage.getCartCount()).toBe(0);
  });

  test('Проверка входа заблокированного пользователя', async ({ loginAs, page }) => {
    await loginAs('LOCKED_OUT');
    await expect(page.locator('[data-test="error"]')).toBeVisible();
  });

  // ====== Новые тесты для корзины ======

  test('Открытие корзины и проверка количества товаров', async () => {
    await todoPage.addItemToCart(0);
    await cartPage.openCart();
    expect(await cartPage.getCartItemCount()).toBe(1);
  });

  test('Удаление товара из корзины через страницу корзины', async () => {
    await todoPage.addItemToCart(0);
    await cartPage.openCart();
    await cartPage.removeButtons.first().click();
    expect(await cartPage.getCartItemCount()).toBe(0);
  });

  test('Соответствие названия товара в корзине', async () => {
    const itemName = await todoPage.getItemName(0);
    await todoPage.addItemToCart(0);
    await cartPage.openCart();
    const cartItemName = await cartPage.getItemName(0);
    expect(cartItemName).toBe(itemName);
  });

  test('Очистка корзины после добавления нескольких товаров', async () => {
    await todoPage.addItemToCart(0);
    await todoPage.addItemToCart(1);
    await cartPage.openCart();
    await cartPage.removeAllItems();
    expect(await cartPage.getCartItemCount()).toBe(0);
  });

  test('Наличие кнопки "Продолжить покупки"', async () => {
    await todoPage.addItemToCart(0);
    await cartPage.openCart();
    expect(await cartPage.isContinueShoppingButtonVisible()).toBe(true);
  });
});