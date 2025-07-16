import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/loginPage';
import { InventoryPage } from '../pages/inventoryPage';
import { CartPage } from '../pages/cartPage';

test.describe('Тесты магазина Swag Labs', () => {
  let loginPage: LoginPage;
  let inventoryPage: InventoryPage;
  let cartPage: CartPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    cartPage = new CartPage(page);
    await loginPage.navigate();
    await loginPage.authenticate('standard_user', 'secret_sauce');
    await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');
  });

  // 1. Проверка данных товаров
  test('Проверка корректности данных товаров', async () => {
    const expectedItems = [
      { name: 'Sauce Labs Backpack', price: '$29.99' },
      { name: 'Sauce Labs Bike Light', price: '$9.99' },
      { name: 'Sauce Labs Bolt T-Shirt', price: '$15.99' },
      { name: 'Sauce Labs Fleece Jacket', price: '$49.99' },
      { name: 'Sauce Labs Onesie', price: '$7.99' },
      { name: 'Test.allTheThings() T-Shirt (Red)', price: '$15.99' },
    ];

    const actualCount = await inventoryPage.getItemsCount();
    const actualNames = await inventoryPage.getItemNames();
    const actualPrices = await inventoryPage.getItemPrices();

    expect(actualCount).toBe(expectedItems.length);
    
    for (let i = 0; i < expectedItems.length; i++) {
      expect(actualNames[i]).toBe(expectedItems[i].name);
      expect(actualPrices[i]).toBe(expectedItems[i].price);
    }
  });

  // 2. Работа с корзиной
  test('Работа с корзиной: добавление и удаление товара', async () => {
    await inventoryPage.addItemToCart('Sauce Labs Backpack');
    expect(await inventoryPage.getCartBadgeCount()).toBe(1);
    
    await inventoryPage.goToCart();
    await expect(cartPage.page).toHaveURL('https://www.saucedemo.com/cart.html');
    
    const cartItems = await cartPage.getItemNames();
    expect(cartItems).toEqual(['Sauce Labs Backpack']);
    
    await cartPage.removeItem('Sauce Labs Backpack');
    expect(await cartPage.getCartItemsCount()).toBe(0);
    
    await cartPage.continueShoppingBtn.click();
    await expect(inventoryPage.page).toHaveURL('https://www.saucedemo.com/inventory.html');
  });

  // 3. Выход из системы
  test('Выход из системы', async () => {
    // Открываем бургер-меню
    await inventoryPage.page.locator('#react-burger-menu-btn').click();
    
    // Кликаем Logout
    await inventoryPage.page.locator('#logout_sidebar_link').click();
    
    // Проверяем, что вернулись на страницу логина
    await expect(loginPage.page).toHaveURL('https://www.saucedemo.com/');
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
  });

  // 4. Просмотр деталей товара
  test('Просмотр деталей товара', async () => {
    // Кликаем на первый товар
    const firstItem = inventoryPage.itemNames.first();
    const itemName = await firstItem.textContent();
    await firstItem.click();
    
    // Проверяем переход на страницу товара
    await expect(inventoryPage.page).toHaveURL(/inventory-item.html/);
    
    // Проверяем элементы страницы товара
    await expect(inventoryPage.page.locator('.inventory_details_name')).toHaveText(itemName!);
    await expect(inventoryPage.page.locator('.inventory_details_price')).toBeVisible();
    await expect(inventoryPage.page.locator('.inventory_details_desc')).toBeVisible();
    await expect(inventoryPage.page.locator('button:has-text("Add to cart")')).toBeVisible();
    
    // Возвращаемся на главную
    await inventoryPage.page.locator('[data-test="back-to-products"]').click();
    await expect(inventoryPage.page).toHaveURL('https://www.saucedemo.com/inventory.html');
  });

  // 5. Оформление заказа
  test('Оформление заказа', async () => {
    // Добавляем товар
    await inventoryPage.addItemToCart('Sauce Labs Backpack');
    
    // Переходим в корзину
    await inventoryPage.goToCart();
    
    // Начинаем оформление
    await cartPage.checkoutBtn.click();
    await expect(cartPage.page).toHaveURL('https://www.saucedemo.com/checkout-step-one.html');
    
    // Заполняем информацию
    await cartPage.page.locator('[data-test="firstName"]').fill('John');
    await cartPage.page.locator('[data-test="lastName"]').fill('Doe');
    await cartPage.page.locator('[data-test="postalCode"]').fill('12345');
    await cartPage.page.locator('[data-test="continue"]').click();
    
    // Проверяем страницу подтверждения
    await expect(cartPage.page).toHaveURL('https://www.saucedemo.com/checkout-step-two.html');
    await expect(cartPage.page.locator('.summary_subtotal_label')).toContainText('29.99');
    
    // Завершаем заказ
    await cartPage.page.locator('[data-test="finish"]').click();
    
    // Проверяем успешное оформление
    await expect(cartPage.page).toHaveURL('https://www.saucedemo.com/checkout-complete.html');
    await expect(cartPage.page.locator('.complete-header')).toHaveText('Thank you for your order!');
    
    // Возвращаемся на главную
    await cartPage.page.locator('[data-test="back-to-products"]').click();
    await expect(inventoryPage.page).toHaveURL('https://www.saucedemo.com/inventory.html');
  });

  // 6. Добавление всех товаров в корзину
  test('Добавление всех товаров в корзину', async () => {
  const itemsCount = await inventoryPage.getItemsCount();
  
  // Добавляем все товары
  const itemNames = await inventoryPage.getItemNames();
  for (const itemName of itemNames) {
    await inventoryPage.addItemToCart(itemName);
  }
  
  // Проверяем количество в корзине
  expect(await inventoryPage.getCartBadgeCount()).toBe(itemsCount);
  
  // Переходим в корзину
  await inventoryPage.goToCart();
  
  // Ожидаем загрузки корзины
  await cartPage.page.waitForSelector('.cart_item', { state: 'attached' });
  
  // Проверяем количество товаров в корзине
  expect(await cartPage.getCartItemsCount()).toBe(itemsCount);
  
  // Очищаем корзину с использованием стабильного метода
  const itemsInCart = await cartPage.getItemNames();
  for (const itemName of itemsInCart) {
    await cartPage.removeItem(itemName);
    // Ждем исчезновения элемента
    await cartPage.page.waitForSelector(`.cart_item:has-text("${itemName}")`, { state: 'detached' });
  }
  
  // Проверяем, что корзина пуста
  await expect(cartPage.cartItems).toHaveCount(0);
});

  // 7. Работа бокового меню
  test('Работа бокового меню', async () => {
    // Открываем меню
    await inventoryPage.page.locator('#react-burger-menu-btn').click();
    
    // Проверяем элементы меню
    await expect(inventoryPage.page.locator('#inventory_sidebar_link')).toBeVisible();
    await expect(inventoryPage.page.locator('#about_sidebar_link')).toBeVisible();
    await expect(inventoryPage.page.locator('#logout_sidebar_link')).toBeVisible();
    await expect(inventoryPage.page.locator('#reset_sidebar_link')).toBeVisible();
    
    // Закрываем меню
    await inventoryPage.page.locator('#react-burger-cross-btn').click();
    await expect(inventoryPage.page.locator('#inventory_sidebar_link')).not.toBeVisible();
  });

  // 8. Сброс состояния приложения
  test('Сброс состояния приложения', async () => {
    // Добавляем товар
    await inventoryPage.addItemToCart('Sauce Labs Backpack');
    expect(await inventoryPage.getCartBadgeCount()).toBe(1);
    
    // Открываем меню
    await inventoryPage.page.locator('#react-burger-menu-btn').click();
    
    // Сбрасываем состояние
    await inventoryPage.page.locator('#reset_sidebar_link').click();
    
    // Закрываем меню
    await inventoryPage.page.locator('#react-burger-cross-btn').click();
    
    // Проверяем, что корзина пуста
    expect(await inventoryPage.getCartBadgeCount()).toBe(0);
  });

  // 9. Проверка элементов футера
  test('Проверка элементов футера', async () => {
  // Прокручиваем вниз
  await inventoryPage.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  
  // Проверяем элементы
  await expect(inventoryPage.page.locator('.social_twitter')).toBeVisible();
  await expect(inventoryPage.page.locator('.social_facebook')).toBeVisible();
  await expect(inventoryPage.page.locator('.social_linkedin')).toBeVisible();
  
  // ОБНОВЛЕННАЯ ПРОВЕРКА (вариант 2)
  await expect(inventoryPage.page.locator('.footer_copy')).toContainText(
    'Sauce Labs. All Rights Reserved'
  );
  
  // Проверяем ссылки
  await expect(inventoryPage.page.locator('.social_twitter a')).toHaveAttribute('href', 'https://twitter.com/saucelabs');
  await expect(inventoryPage.page.locator('.social_facebook a')).toHaveAttribute('href', 'https://www.facebook.com/saucelabs');
  });

  // 10. Поведение для проблемного пользователя
  test('Поведение для проблемного пользователя', async () => {
  // Выходим из текущей сессии
  await inventoryPage.page.locator('#react-burger-menu-btn').click();
  await inventoryPage.page.locator('#logout_sidebar_link').click();
  
  // Логинимся как problem_user
  await loginPage.authenticate('problem_user', 'secret_sauce');
  await expect(inventoryPage.page).toHaveURL('https://www.saucedemo.com/inventory.html');
  
  // Проверяем наличие некорректных изображений (ожидаемо для этого пользователя)
  const images = await inventoryPage.page.locator('.inventory_item_img img').all();
  let brokenImagesCount = 0;
  
  for (const img of images) {
    const src = await img.getAttribute('src');
    if (src?.includes('sl-404')) {
      brokenImagesCount++;
    }
  }
  
  // Ожидаем, что все изображения "битые"
  expect(brokenImagesCount).toBe(6);
  
  // Пробуем добавить товар
  await inventoryPage.addItemToCart('Sauce Labs Backpack');
  expect(await inventoryPage.getCartBadgeCount()).toBe(1);

  // Ожидаем, что все 6 изображений будут битыми
  expect(brokenImagesCount).toBe(6);
    
    // Пробуем добавить товар
    await inventoryPage.addItemToCart('Sauce Labs Backpack');
    expect(await inventoryPage.getCartBadgeCount()).toBe(1);
  });
});