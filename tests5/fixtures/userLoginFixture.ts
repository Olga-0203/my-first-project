// fixtures/userLoginFixture.ts

import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/loginPage';
import { USERS } from '../data/users';

type UserFixtures = {
  loginAs: (user: keyof typeof USERS) => Promise<void>;
};

export const test = base.extend<UserFixtures>({
  loginAs: async ({ page }, use) => {
    const loginPage = new LoginPage(page);

    await use(async (user = 'STANDARD') => {
      const credentials = USERS[user];
      await loginPage.goto();
      await loginPage.login(credentials.username, credentials.password);
    });
  }
});

export const expect = test.expect;