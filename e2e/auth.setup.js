import { expect, test as setup } from "@playwright/test";
import { ADMIN, AUTH_STATE } from "./support/env.js";

// Signs in once through the real form; every other spec starts from this
// session (playwright.config.js, `storageState`).
setup("sign in as the e2e admin", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill(ADMIN.email);
  await page.getByLabel("Password").fill(ADMIN.password);
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/\/admin\/dashboard$/);
  await page.context().storageState({ path: AUTH_STATE });
});
