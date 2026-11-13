import { test, expect } from "@playwright/test";

test.describe("Luxe Haven Cloud Hotel PMS - End-to-End Suite", () => {
  test("01 · Loads PMS Homepage & Displays Navigation & Brand", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Luxe Haven/i);
    await expect(page.locator("text=LUXE HAVEN")).toBeVisible();
    await expect(page.locator("text=Cloud Hotel PMS")).toBeVisible();
  });

  test("02 · 1-Click RBAC Role Switcher works seamlessly", async ({ page }) => {
    await page.goto("/");

    // Click Admin demo role
    const adminBtn = page.locator("button:has-text('Admin')").first();
    await adminBtn.click();
    await expect(page.locator("text=ADMIN")).toBeVisible();
    await expect(page.locator("text=Executive Analytics")).toBeVisible();

    // Click Receptionist demo role
    const receptionBtn = page.locator("button:has-text('Receptionist')").first();
    await receptionBtn.click();
    await expect(page.locator("text=RECEPTIONIST")).toBeVisible();
    await expect(page.locator("text=Front Desk & Housekeeping Operations")).toBeVisible();
  });

  test("03 · Real-Time Rooms Availability & Filters", async ({ page }) => {
    await page.goto("/");
    const roomsTab = page.locator("button:has-text('Rooms & Availability')");
    await roomsTab.click();

    await expect(page.locator("text=Luxury Rooms & Real-Time Availability")).toBeVisible();
    await expect(page.locator("text=Room #101")).toBeVisible();
  });

  test("04 · Automated Billing & Tax Invoices Table", async ({ page }) => {
    await page.goto("/");
    const invoicesTab = page.locator("button:has-text('Invoices & Billing')");
    await invoicesTab.click();

    await expect(page.locator("text=Automated Billing & Sequential Tax Invoices")).toBeVisible();
    await expect(page.locator("text=INV-2026-0001")).toBeVisible();
  });
});
