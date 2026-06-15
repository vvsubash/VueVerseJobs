import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { chromium, type Browser, type Page } from "playwright";

describe("Auth Sign-Up Flow via Browser", () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = await chromium.launch({ headless: true });
    page = await browser.newPage();
    page.on("console", (msg) => console.log("BROWSER LOG:", msg.text()));
    page.on("pageerror", (err) => console.error("BROWSER ERROR:", err.message));
    page.on("request", (req) => console.log("REQ:", req.method(), req.url()));
    page.on("response", async (res) => {
      console.log("RES:", res.status(), res.url());
      if (res.url().includes("get-session")) {
        try {
          console.log("GET-SESSION BODY:", await res.text());
        } catch (e) {}
      }
    });
  });

  afterAll(async () => {
    await browser.close();
  });

  it("should navigate to sign-up, create an account, and log in", async () => {
    try {
      // Navigate to local sign-in page
      await page.goto("http://localhost:3000/sign-in");

      // Wait for the Nuxt app to hydrate so event listeners are attached
      await page.waitForSelector("#email-address");
      await page.waitForTimeout(1500);

      // Click on "Sign up now" toggle link
      await page.click("text=Sign up now");

      // Wait for the Name field to appear
      await page.waitForSelector("#name", { timeout: 5000 });

      // Fill registration details
      await page.fill("#name", "Playwright User");
      await page.fill("#email-address", "playwrightuser@example.com");
      await page.fill("#password", "@BrowserPass99");

      // Submit the form
      await page.click("button[type='submit']");

      // Wait a moment for the email to be processed and dispatched to Mailpit
      await page.waitForTimeout(2000);

      // Fetch the email messages from Mailpit API
      const messagesResponse = await page.request.get("http://localhost:8025/api/v1/messages");
      expect(messagesResponse.ok()).toBe(true);
      const messagesData = await messagesResponse.json();
      const latestMessage = messagesData.messages[0];
      expect(latestMessage).toBeDefined();

      // Fetch the HTML body of the latest message
      const emailContentResponse = await page.request.get(`http://localhost:8025/api/v1/message/${latestMessage.ID}`);
      expect(emailContentResponse.ok()).toBe(true);
      const emailData = await emailContentResponse.json();
      const htmlBody = emailData.HTML;

      // Parse out the verification link
      const linkMatch = htmlBody.match(/href="([^"]+)"/);
      if (!linkMatch) throw new Error("Verification link not found in email body.");
      let verificationUrl = linkMatch[1];
      verificationUrl = verificationUrl.replace(/&amp;/g, "&");

      // Navigate to the verification URL to verify the account
      await page.goto(verificationUrl);

      // Navigate back to sign-in page to log in with verified account
      await page.goto("http://localhost:3000/sign-in");

      // Fill in verified credentials
      await page.fill("#email-address", "playwrightuser@example.com");
      await page.fill("#password", "@BrowserPass99");

      // Submit the form
      await page.click("button[type='submit']");

      // Wait for the asynchronous session fetch to complete and greet the user
      const greetingElement = await page.waitForSelector("text=Hello, Playwright User", { timeout: 10000 });
      expect(greetingElement).not.toBeNull();

      // Sign out to clean up session before the next test
      await page.click("text=Sign out");
      await page.waitForSelector("text=Sign in");
    } catch (err) {
      await page.screenshot({ path: "/Users/venkata_subash/.gemini/antigravity-cli/brain/01fd52ae-e8af-46cb-ab82-5826c9cd32e7/test_failure.png" });
      throw err;
    }
  }, 40000);

  it("should support magic link authentication flow", async () => {
    try {
      // Navigate to local sign-in page
      await page.goto("http://localhost:3000/sign-in");

      // Wait for the Nuxt app to hydrate
      await page.waitForSelector("#email-address");
      await page.waitForTimeout(1500);

      // Toggle Magic Link option
      await page.click("#toggle-magic-link");

      // Wait for password field to disappear and button text to change
      await page.waitForSelector("button[type='submit'] >> text=Send Magic Link");

      // Fill in existing user email
      await page.fill("#email-address", "playwrightuser@example.com");

      // Submit form
      await page.click("button[type='submit']");

      // Verify success message is visible
      await page.waitForSelector("text=A magic link has been sent to your email address!");

      // Wait for the email to be processed and dispatched to Mailpit
      await page.waitForTimeout(2000);

      // Fetch the email messages from Mailpit API
      const messagesResponse = await page.request.get("http://localhost:8025/api/v1/messages");
      expect(messagesResponse.ok()).toBe(true);
      const messagesData = await messagesResponse.json();
      const latestMessage = messagesData.messages[0];
      expect(latestMessage).toBeDefined();
      expect(latestMessage.Subject).toContain("Your Magic Link to Sign In");

      // Fetch the HTML body of the latest message
      const emailContentResponse = await page.request.get(`http://localhost:8025/api/v1/message/${latestMessage.ID}`);
      expect(emailContentResponse.ok()).toBe(true);
      const emailData = await emailContentResponse.json();
      const htmlBody = emailData.HTML;

      // Parse out the magic link URL
      const linkMatch = htmlBody.match(/href="([^"]+)"/);
      if (!linkMatch) throw new Error("Magic link not found in email body.");
      let magicLinkUrl = linkMatch[1];
      magicLinkUrl = magicLinkUrl.replace(/&amp;/g, "&");

      // Navigate to the magic link URL to sign in
      await page.goto(magicLinkUrl);

      // Wait for redirection and greeting
      const greetingElement = await page.waitForSelector("text=Hello, Playwright User", { timeout: 10000 });
      expect(greetingElement).not.toBeNull();
    } catch (err) {
      await page.screenshot({ path: "/Users/venkata_subash/.gemini/antigravity-cli/brain/01fd52ae-e8af-46cb-ab82-5826c9cd32e7/test_failure_magic_link.png" });
      throw err;
    }
  }, 40000);
});
