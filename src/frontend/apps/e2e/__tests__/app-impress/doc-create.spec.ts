import { expect, test } from '@playwright/test';

import {
  createDoc,
  goToGridDoc,
  keyCloakSignIn,
  randomName,
  verifyDocName,
} from './utils-common';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test.describe('Doc Create', () => {
  test('it creates a doc', async ({ page, browserName }) => {
    const [docTitle] = await createDoc(page, 'my-new-doc', browserName, 1);

    await page.waitForFunction(
      () => document.title.match(/my-new-doc - Docs/),
      { timeout: 5000 },
    );

    const header = page.locator('header').first();
    await header.locator('h2').getByText('Docs').click();

    const docsGrid = page.getByTestId('docs-grid');
    await expect(docsGrid).toBeVisible();
    await expect(page.getByTestId('grid-loader')).toBeHidden();
    await expect(docsGrid.getByText(docTitle)).toBeVisible();
  });
});

test.describe('Doc Create: Not logged', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('it creates a doc server way', async ({
    page,
    browserName,
    request,
  }) => {
    const SERVER_TO_SERVER_API_TOKENS = 'server-api-token';
    const markdown = `This is a normal text\n\n# And this is a large heading`;
    const [title] = randomName('My server way doc create', browserName, 1);
    const data = {
      title,
      content: markdown,
      sub: `user@${browserName}.test`,
      email: `user@${browserName}.test`,
    };

    const newDoc = await request.post(
      `http://localhost:8071/api/v1.0/documents/create-for-owner/`,
      {
        data,
        headers: {
          Authorization: `Bearer ${SERVER_TO_SERVER_API_TOKENS}`,
          format: 'json',
        },
      },
    );

    expect(newDoc.ok()).toBeTruthy();

    await keyCloakSignIn(page, browserName);

    await goToGridDoc(page, { title });

    await verifyDocName(page, title);

    const editor = page.locator('.ProseMirror');
    await expect(editor.getByText('This is a normal text')).toBeVisible();
    await expect(
      editor.locator('h1').getByText('And this is a large heading'),
    ).toBeVisible();
  });
});
