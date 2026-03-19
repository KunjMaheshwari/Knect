const { test, expect } = require("@playwright/test");

async function resetDashboard(page) {
  await page.goto("/knect_production_dashboard/code.html");
  await page.evaluate(() => {
    localStorage.clear();
  });
  await page.reload({ waitUntil: "domcontentloaded" });
}

test.describe("production reminder dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await resetDashboard(page);
  });

  test("supports reminder CRUD, search, complete, and persistence", async ({
    page,
  }) => {
    const consoleErrors = [];
    const pageErrors = [];
    const timestamp = Date.now();
    const reminderTitle = `Playwright reminder ${timestamp}`;
    const updatedTitle = `Updated reminder ${timestamp}`;

    page.on("console", (message) => {
      if (message.type() === "error") {
        consoleErrors.push(message.text());
      }
    });

    page.on("pageerror", (error) => {
      pageErrors.push(String(error));
    });

    const searchInput = page.locator('input[placeholder="Quick find task..."]');
    const addButton = page.locator('button:has([data-icon="add"])').first();
    const titleInput = page.locator('[x-model="form.title"]');
    const timeInput = page.locator('input[type="time"]');
    const prioritySelect = page.locator("select");

    await expect(searchInput).toBeVisible();
    await expect(page.getByText("Quarterly review presentation")).toBeVisible();

    await addButton.click();
    await page.locator('button:has-text("Initialize Task")').click();
    await expect(page.getByText("Task title is required")).toBeVisible();

    await titleInput.fill(reminderTitle);
    await timeInput.fill("00:00");
    await prioritySelect.selectOption("High");
    await page.locator('button:has-text("Initialize Task")').click();

    const addedCard = page
      .locator(".glass-card-bright")
      .filter({ has: page.getByText(reminderTitle) })
      .first();
    await expect(addedCard).toBeVisible();

    const storedAfterAdd = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("knect_prod_reminders") || "[]"),
    );
    expect(
      storedAfterAdd.some((reminder) => reminder.title === reminderTitle),
    ).toBeTruthy();

    await searchInput.fill(reminderTitle);
    await expect(addedCard).toBeVisible();
    await searchInput.fill("");

    await addedCard.hover();
    await addedCard.locator('button:has-text("Edit")').click();
    await titleInput.fill(updatedTitle);
    await timeInput.fill("00:30");
    await prioritySelect.selectOption("Medium");
    await page.locator('button:has-text("Confirm Update")').click();

    const editedCard = page
      .locator(".glass-card-bright")
      .filter({ has: page.getByText(updatedTitle) })
      .first();
    await expect(editedCard).toBeVisible();
    await expect(page.getByText(reminderTitle)).toHaveCount(0);

    await editedCard.locator("label").first().click();
    await page.getByRole("button", { name: "Completed" }).click();
    await expect(page.getByText(updatedTitle)).toBeVisible();

    const storedAfterComplete = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("knect_prod_reminders") || "[]"),
    );
    expect(
      storedAfterComplete.some(
        (reminder) =>
          reminder.title === updatedTitle && reminder.completed === true,
      ),
    ).toBeTruthy();

    await page.reload({ waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: "Completed" }).click();

    const persistedCard = page
      .locator(".glass-card-bright")
      .filter({ has: page.getByText(updatedTitle) })
      .first();
    await expect(persistedCard).toBeVisible();

    await persistedCard.hover();
    await persistedCard.locator('button:has-text("Delete")').click();
    await expect(page.getByText(updatedTitle)).toHaveCount(0);

    const storedAfterDelete = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("knect_prod_reminders") || "[]"),
    );
    expect(
      storedAfterDelete.some((reminder) => reminder.title === updatedTitle),
    ).toBeFalsy();

    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
  });

  test("recovers from invalid saved reminder data", async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem("knect_prod_reminders", "{invalid");
    });

    await page.reload({ waitUntil: "domcontentloaded" });

    await expect(page.getByText("Quarterly review presentation")).toBeVisible();

    const restoredData = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("knect_prod_reminders") || "[]"),
    );
    expect(Array.isArray(restoredData)).toBeTruthy();
    expect(restoredData.length).toBeGreaterThan(0);
  });
});
