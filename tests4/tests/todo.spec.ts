import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/loginPage';
import { TodoPage } from '../pages/todoPage';
import { USERS } from '../data/users';

test.describe('Todo workflow (simulated via inventory)', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(USERS.STANDARD.username, USERS.STANDARD.password);
  });

  test('Авторизация standard_user', async ({ page }) => {
    const todoPage = new TodoPage(page);
    await todoPage.isAtInventoryPage();
  });

  test('Добавление новой задачи (товара в корзину)', async ({ page }) => {
    const todoPage = new TodoPage(page);
    await todoPage.addItemToCart(0);
    expect(await todoPage.getCartCount()).toBe(1);
  });

  test('Выполнение задачи (эмуляция: добавить и удалить товар)', async ({ page }) => {
    const todoPage = new TodoPage(page);
    await todoPage.completeTaskSimulation(0);
    expect(await todoPage.getCartCount()).toBe(0);
  });

  test('Удаление задачи (удаление товара из корзины)', async ({ page }) => {
    const todoPage = new TodoPage(page);
    await todoPage.addItemToCart(0);
    await todoPage.removeItemFromCart(0);
    expect(await todoPage.getCartCount()).toBe(0);
  });
});