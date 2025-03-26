import path from 'path';

import { expect, test } from '@playwright/test';
import cs from 'convert-stream';

import {
  createDoc,
  goToGridDoc,
  mockedDocument,
  verifyDocName,
} from './common';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test.describe('Doc Editor', () => {
  test('it checks default toolbar buttons are displayed', async ({
    page,
    browserName,
  }) => {
    await createDoc(page, 'doc-toolbar', browserName, 1);

    const editor = page.locator('.ProseMirror');
    await editor.click();
    await editor.fill('test content');

    await editor.getByText('test content').dblclick();

    const toolbar = page.locator('.bn-formatting-toolbar');
    await expect(toolbar.locator('button[data-test="bold"]')).toBeVisible();
    await expect(toolbar.locator('button[data-test="italic"]')).toBeVisible();
    await expect(
      toolbar.locator('button[data-test="underline"]'),
    ).toBeVisible();
    await expect(toolbar.locator('button[data-test="strike"]')).toBeVisible();
    await expect(
      toolbar.locator('button[data-test="alignTextLeft"]'),
    ).toBeVisible();
    await expect(
      toolbar.locator('button[data-test="alignTextCenter"]'),
    ).toBeVisible();
    await expect(
      toolbar.locator('button[data-test="alignTextRight"]'),
    ).toBeVisible();
    await expect(toolbar.locator('button[data-test="colors"]')).toBeVisible();
    await expect(
      toolbar.locator('button[data-test="unnestBlock"]'),
    ).toBeVisible();
    await expect(
      toolbar.locator('button[data-test="createLink"]'),
    ).toBeVisible();
  });

  /**
   * We check:
   *  - connection to the collaborative server
   *  - signal of the backend to the collaborative server (connection should close)
   *  - reconnection to the collaborative server
   */
  test('checks the connection with collaborative server', async ({
    page,
    browserName,
  }) => {
    let webSocketPromise = page.waitForEvent('websocket', (webSocket) => {
      return webSocket
        .url()
        .includes('ws://localhost:4444/collaboration/ws/?room=');
    });

    const randomDoc = await createDoc(page, 'doc-editor', browserName, 1);
    await verifyDocName(page, randomDoc[0]);

    let webSocket = await webSocketPromise;
    expect(webSocket.url()).toContain(
      'ws://localhost:4444/collaboration/ws/?room=',
    );

    // Is connected
    let framesentPromise = webSocket.waitForEvent('framesent');

    await page.locator('.ProseMirror.bn-editor').click();
    await page.locator('.ProseMirror.bn-editor').fill('Hello World');

    let framesent = await framesentPromise;
    expect(framesent.payload).not.toBeNull();

    await page.getByRole('button', { name: 'Share' }).click();

    const selectVisibility = page.getByLabel('Visibility', { exact: true });

    // When the visibility is changed, the ws should closed the connection (backend signal)
    const wsClosePromise = webSocket.waitForEvent('close');

    await selectVisibility.click();
    await page.getByLabel('Connected').click();

    // Assert that the doc reconnects to the ws
    const wsClose = await wsClosePromise;
    expect(wsClose.isClosed()).toBeTruthy();

    // Checkt the ws is connected again
    webSocketPromise = page.waitForEvent('websocket', (webSocket) => {
      return webSocket
        .url()
        .includes('ws://localhost:4444/collaboration/ws/?room=');
    });

    webSocket = await webSocketPromise;
    framesentPromise = webSocket.waitForEvent('framesent');
    framesent = await framesentPromise;
    expect(framesent.payload).not.toBeNull();
  });

  test('markdown button converts from markdown to the editor syntax json', async ({
    page,
    browserName,
  }) => {
    const randomDoc = await createDoc(page, 'doc-markdown', browserName, 1);

    await verifyDocName(page, randomDoc[0]);

    const editor = page.locator('.ProseMirror');
    await editor.click();
    await editor.fill('[test markdown](http://test-markdown.html)');

    await expect(editor.getByText('[test markdown]')).toBeVisible();

    await editor.getByText('[test markdown]').dblclick();
    await page.locator('button[data-test="convertMarkdown"]').click();

    await expect(editor.getByText('[test markdown]')).toBeHidden();
    await expect(
      editor.getByRole('link', {
        name: 'test markdown',
      }),
    ).toHaveAttribute('href', 'http://test-markdown.html');
  });

  test('it renders correctly when we switch from one doc to another', async ({
    page,
    browserName,
  }) => {
    // Check the first doc
    const [firstDoc] = await createDoc(page, 'doc-switch-1', browserName, 1);
    await verifyDocName(page, firstDoc);

    const editor = page.locator('.ProseMirror');
    await editor.click();
    await editor.fill('Hello World Doc 1');
    await expect(editor.getByText('Hello World Doc 1')).toBeVisible();

    // Check the second doc
    const [secondDoc] = await createDoc(page, 'doc-switch-2', browserName, 1);
    await verifyDocName(page, secondDoc);

    await expect(editor.getByText('Hello World Doc 1')).toBeHidden();
    await editor.click();
    await editor.fill('Hello World Doc 2');
    await expect(editor.getByText('Hello World Doc 2')).toBeVisible();

    // Check the first doc again
    await goToGridDoc(page, {
      title: firstDoc,
    });
    await verifyDocName(page, firstDoc);
    await expect(editor.getByText('Hello World Doc 2')).toBeHidden();
    await expect(editor.getByText('Hello World Doc 1')).toBeVisible();

    await page
      .getByRole('button', {
        name: 'New doc',
      })
      .click();

    await expect(editor.getByText('Hello World Doc 1')).toBeHidden();
    await expect(editor.getByText('Hello World Doc 2')).toBeHidden();
  });

  test('it saves the doc when we change pages', async ({
    page,
    browserName,
  }) => {
    // Check the first doc
    const [doc] = await createDoc(page, 'doc-saves-change', browserName);
    await verifyDocName(page, doc);

    const editor = page.locator('.ProseMirror');
    await editor.click();
    await editor.fill('Hello World Doc persisted 1');
    await expect(editor.getByText('Hello World Doc persisted 1')).toBeVisible();

    const [secondDoc] = await createDoc(
      page,
      'doc-saves-change-other',
      browserName,
    );

    await verifyDocName(page, secondDoc);

    await goToGridDoc(page, {
      title: doc,
    });

    await verifyDocName(page, doc);
    await expect(editor.getByText('Hello World Doc persisted 1')).toBeVisible();
  });

  test('it saves the doc when we quit pages', async ({ page, browserName }) => {
    // eslint-disable-next-line playwright/no-skipped-test
    test.skip(browserName === 'webkit', 'This test is very flaky with webkit');

    // Check the first doc
    const [doc] = await createDoc(page, 'doc-quit-1', browserName, 1);
    await verifyDocName(page, doc);

    const editor = page.locator('.ProseMirror');
    await editor.click();
    await editor.fill('Hello World Doc persisted 2');
    await expect(editor.getByText('Hello World Doc persisted 2')).toBeVisible();

    await page.goto('/');

    await goToGridDoc(page, {
      title: doc,
    });

    await expect(editor.getByText('Hello World Doc persisted 2')).toBeVisible();
  });

  test('it cannot edit if viewer', async ({ page }) => {
    await mockedDocument(page, {
      abilities: {
        destroy: false, // Means not owner
        link_configuration: false,
        versions_destroy: false,
        versions_list: true,
        versions_retrieve: true,
        accesses_manage: false, // Means not admin
        update: false,
        partial_update: false, // Means not editor
        retrieve: true,
      },
    });

    await goToGridDoc(page);

    const card = page.getByLabel('It is the card information');
    await expect(card).toBeVisible();

    await expect(card.getByText('Reader')).toBeVisible();
  });

  test('it adds an image to the doc editor', async ({ page, browserName }) => {
    await createDoc(page, 'doc-image', browserName, 1);

    const fileChooserPromise = page.waitForEvent('filechooser');

    await page.locator('.bn-block-outer').last().fill('Hello World');

    await page.keyboard.press('Enter');
    await page.locator('.bn-block-outer').last().fill('/');
    await page.getByText('Resizable image with caption').click();
    await page.getByText('Upload image').click();

    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(
      path.join(__dirname, 'assets/logo-suite-numerique.png'),
    );

    const image = page.getByRole('img', { name: 'logo-suite-numerique.png' });

    await expect(image).toBeVisible();

    // Check src of image
    expect(await image.getAttribute('src')).toMatch(
      /http:\/\/localhost:8083\/media\/.*\/attachments\/.*.png/,
    );
  });

  test('it checks the AI buttons', async ({ page, browserName }) => {
    await page.route(/.*\/ai-translate\//, async (route) => {
      const request = route.request();
      if (request.method().includes('POST')) {
        await route.fulfill({
          json: {
            answer: 'Bonjour le monde',
          },
        });
      } else {
        await route.continue();
      }
    });

    await createDoc(page, 'doc-ai', browserName, 1);

    await page.locator('.bn-block-outer').last().fill('Hello World');

    const editor = page.locator('.ProseMirror');
    await editor.getByText('Hello').dblclick();

    await page.getByRole('button', { name: 'AI' }).click();

    await expect(
      page.getByRole('menuitem', { name: 'Use as prompt' }),
    ).toBeVisible();
    await expect(
      page.getByRole('menuitem', { name: 'Rephrase' }),
    ).toBeVisible();
    await expect(
      page.getByRole('menuitem', { name: 'Summarize' }),
    ).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'Correct' })).toBeVisible();
    await expect(
      page.getByRole('menuitem', { name: 'Language' }),
    ).toBeVisible();

    await page.getByRole('menuitem', { name: 'Language' }).hover();
    await expect(
      page.getByRole('menuitem', { name: 'English', exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole('menuitem', { name: 'French', exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole('menuitem', { name: 'German', exact: true }),
    ).toBeVisible();

    await page.getByRole('menuitem', { name: 'English', exact: true }).click();

    await expect(editor.getByText('Bonjour le monde')).toBeVisible();
  });

  [
    { ai_transform: false, ai_translate: false },
    { ai_transform: true, ai_translate: false },
    { ai_transform: false, ai_translate: true },
  ].forEach(({ ai_transform, ai_translate }) => {
    test(`it checks AI buttons when can transform is at "${ai_transform}" and can translate is at "${ai_translate}"`, async ({
      page,
    }) => {
      await mockedDocument(page, {
        accesses: [
          {
            id: 'b0df4343-c8bd-4c20-9ff6-fbf94fc94egg',
            role: 'owner',
            user: {
              email: 'super@owner.com',
              full_name: 'Super Owner',
            },
          },
        ],
        abilities: {
          destroy: true, // Means owner
          link_configuration: true,
          ai_transform,
          ai_translate,
          accesses_manage: true,
          accesses_view: true,
          update: true,
          partial_update: true,
          retrieve: true,
        },
        link_reach: 'public',
        link_role: 'editor',
        created_at: '2021-09-01T09:00:00Z',
      });

      await goToGridDoc(page);

      await verifyDocName(page, 'Mocked document');

      await page.locator('.bn-block-outer').last().fill('Hello World');

      const editor = page.locator('.ProseMirror');
      await editor.getByText('Hello').dblclick();

      /* eslint-disable playwright/no-conditional-expect */
      /* eslint-disable playwright/no-conditional-in-test */
      if (!ai_transform && !ai_translate) {
        await expect(page.getByRole('button', { name: 'AI' })).toBeHidden();
        return;
      }

      await page.getByRole('button', { name: 'AI' }).click();

      if (ai_transform) {
        await expect(
          page.getByRole('menuitem', { name: 'Use as prompt' }),
        ).toBeVisible();
      } else {
        await expect(
          page.getByRole('menuitem', { name: 'Use as prompt' }),
        ).toBeHidden();
      }

      if (ai_translate) {
        await expect(
          page.getByRole('menuitem', { name: 'Language' }),
        ).toBeVisible();
      } else {
        await expect(
          page.getByRole('menuitem', { name: 'Language' }),
        ).toBeHidden();
      }
      /* eslint-enable playwright/no-conditional-expect */
      /* eslint-enable playwright/no-conditional-in-test */
    });
  });

  test('it downloads unsafe files', async ({ page, browserName }) => {
    const [randomDoc] = await createDoc(page, 'doc-editor', browserName, 1);

    const fileChooserPromise = page.waitForEvent('filechooser');
    const downloadPromise = page.waitForEvent('download', (download) => {
      return download.suggestedFilename().includes(`html`);
    });

    await verifyDocName(page, randomDoc);

    await page.locator('.ProseMirror.bn-editor').click();
    await page.locator('.ProseMirror.bn-editor').fill('Hello World');

    await page.keyboard.press('Enter');
    await page.locator('.bn-block-outer').last().fill('/');
    await page.getByText('Embedded file').click();
    await page.getByText('Upload file').click();

    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(path.join(__dirname, 'assets/test.html'));

    await page.locator('.bn-block-content[data-name="test.html"]').click();
    await page.getByRole('button', { name: 'Download file' }).click();

    await expect(
      page.getByText('This file is flagged as unsafe.'),
    ).toBeVisible();

    await page.getByRole('button', { name: 'Download' }).click();

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain(`-unsafe.html`);

    const svgBuffer = await cs.toBuffer(await download.createReadStream());
    expect(svgBuffer.toString()).toContain('Hello svg');
  });
});
