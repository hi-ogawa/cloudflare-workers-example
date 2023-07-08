import { type Page, expect, test } from "@playwright/test";

// prettier-ignore
test("basic", async ({ page, request }) => {
  await page.goto("/");
  await waitForHydration(page);

  // increment counter
  await page.getByText('Counter KV = 0').click();
  await page.getByTestId('Counter KV').getByRole('button', { name: '+1' }).click();
  await page.getByText('Counter KV = 1').click();

  await page.getByText('Counter D1 = 0').click();
  await page.getByTestId('Counter D1').getByRole('button', { name: '+1' }).click();
  await page.getByText('Counter D1 = 1').click();
  await page.getByTestId('Counter D1').getByRole('button', { name: '+1' }).click();
  await page.getByText('Counter D1 = 2').click();

  // check SSR
  const res = await request.get("/");
  const text = await res.text();
  expect(text).toContain(`<span>Counter KV<!-- --> = <!-- -->1</span>`);
  expect(text).toContain(`<span>Counter D1<!-- --> = <!-- -->2</span>`);

  // reload
  await page.reload();
  await waitForHydration(page);

  // decrement
  await page.getByText('Counter KV = 1').click();
  await page.getByTestId('Counter KV').getByRole('button', { name: '-1' }).click();
  await page.getByText('Counter KV = 0').click();

  await page.getByText('Counter D1 = 2').click();
  await page.getByTestId('Counter D1').getByRole('button', { name: '-1' }).click();
  await page.getByText('Counter D1 = 1').click();
  await page.getByTestId('Counter D1').getByRole('button', { name: '-1' }).click();
  await page.getByText('Counter D1 = 0').click();
});

async function waitForHydration(page: Page) {
  await page.getByTestId("hydrated").waitFor({ state: "attached" });
}
