const { defineConfig, devices } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests",
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["list"]],
  use: {
    baseURL: "http://127.0.0.1:4173",
    headless: true,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        browserName: "chromium",
      },
    },
  ],
  webServer: {
    command: "python3 -m http.server 4173",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});








int width = startDateField.getSize().getWidth();
            int height = startDateField.getSize().getHeight();

            // Step 3: Calculate offset (move to right side where icon exists)
            int xOffset = (width / 2) - 5;   // move near right edge
            int yOffset = 0;                 // center vertically

            // Step 4: Perform click using Actions
            Actions actions = new Actions(driver);
            actions.moveToElement(startDateField, xOffset, yOffset)
                   .click()
                   .build()
                   .perform();

            System.out.println("Clicked on calendar icon using offset");
