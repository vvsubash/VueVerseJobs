import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { chromium, type Browser, type Page } from "playwright";
import { db } from "../server/database/db";
import { user } from "../server/database/schema/user";
import { eq } from "drizzle-orm";

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

      // Clear Mailpit inbox before submitting
      await page.request.delete("http://localhost:8025/api/v1/messages");

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

      // Assert redirected to "Email Verified!" page and greets user
      await page.waitForSelector("text=Email Verified!", { timeout: 10000 });
      const welcomeElement = await page.waitForSelector("text=Welcome, Playwright User", { timeout: 10000 });
      expect(welcomeElement).not.toBeNull();

      // Click CTA to go to homepage
      await page.click("text=Go to Homepage / Dashboard");

      // Wait for the homepage greeting
      const greetingElement = await page.waitForSelector("text=Welcome back, Playwright User!", { timeout: 10000 });
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

      // Clear Mailpit inbox before submitting
      await page.request.delete("http://localhost:8025/api/v1/messages");

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

      // Sign out
      await page.click("text=Sign out");
      await page.waitForSelector("text=Sign in");
    } catch (err) {
      await page.screenshot({ path: "/Users/venkata_subash/.gemini/antigravity-cli/brain/01fd52ae-e8af-46cb-ab82-5826c9cd32e7/test_failure_magic_link.png" });
      throw err;
    }
  }, 40000);

  it("should support recruiter registration, company creation, pending verification, and admin approval", async () => {
    try {
      // 1. Sign up a recruiter
      await page.goto("http://localhost:3000/sign-in");
      await page.waitForSelector("#email-address");
      await page.waitForTimeout(1500);

      await page.click("text=Sign up now");
      await page.waitForSelector("#name", { timeout: 5000 });

      // Click the "Employer / Company" toggle
      await page.click("text=Employer / Company");

      // Verify email domain validation warning on public emails
      await page.fill("#name", "Recruiter User");
      await page.fill("#email-address", "recruiter@gmail.com");
      await page.fill("#password", "@RecruiterPass99");
      await page.click("button[type='submit']");
      
      // We expect the validation error to appear
      await page.waitForSelector("text=Employers must sign up using their official company email address");

      // Clear Mailpit inbox before submitting recruiter sign up
      await page.request.delete("http://localhost:8025/api/v1/messages");

      // Now fill official company email
      await page.fill("#email-address", "recruiter@vueverse.corp");
      await page.click("button[type='submit']");

      // Wait a moment for email verification dispatch
      await page.waitForTimeout(2000);

      // Verify recruiter email from Mailpit
      let messagesResponse = await page.request.get("http://localhost:8025/api/v1/messages");
      let messagesData = await messagesResponse.json();
      let latestMessage = messagesData.messages[0];
      
      let emailContentResponse = await page.request.get(`http://localhost:8025/api/v1/message/${latestMessage.ID}`);
      let emailData = await emailContentResponse.json();
      let linkMatch = emailData.HTML.match(/href="([^"]+)"/);
      if (!linkMatch) throw new Error("Verification link not found in email body.");
      let verificationUrl = linkMatch[1].replace(/&amp;/g, "&");

      // Navigate to verification URL
      await page.goto(verificationUrl);

      // Assert redirected to "Email Verified!" page and greets recruiter
      await page.waitForSelector("text=Email Verified!", { timeout: 10000 });
      await page.waitForSelector("text=Welcome, Recruiter User", { timeout: 10000 });

      // Click CTA to go to homepage/dashboard
      await page.click("text=Go to Homepage / Dashboard");

      // Assert redirected to "Create Company Profile"
      await page.waitForSelector("text=Create Company Profile", { timeout: 10000 });
      await page.fill('input[placeholder="Google India"]', "VueVerse Labs");
      await page.fill('input[placeholder="google-india"]', "vueverse-labs");
      await page.click("button:has-text('Register Company')");

      // Assert "Verification Pending" dashboard appears
      await page.waitForSelector("text=Verification Pending", { timeout: 10000 });

      // Sign out
      await page.click("text=Sign out");
      await page.waitForSelector("text=Sign in");

      // 3. Create/Register Admin User
      await page.goto("http://localhost:3000/sign-in");
      await page.waitForSelector("#email-address");
      await page.waitForTimeout(1000);
      await page.click("text=Sign up now");
      await page.fill("#name", "VueVerse Admin");
      await page.fill("#email-address", "admin@vueverse.in");
      await page.fill("#password", "@AdminPass99");

      // Clear Mailpit inbox before submitting admin sign up
      await page.request.delete("http://localhost:8025/api/v1/messages");

      await page.click("button[type='submit']");

      // Verify admin email
      await page.waitForTimeout(2000);
      messagesResponse = await page.request.get("http://localhost:8025/api/v1/messages");
      messagesData = await messagesResponse.json();
      latestMessage = messagesData.messages[0];
      
      emailContentResponse = await page.request.get(`http://localhost:8025/api/v1/message/${latestMessage.ID}`);
      emailData = await emailContentResponse.json();
      linkMatch = emailData.HTML.match(/href="([^"]+)"/);
      if (!linkMatch) throw new Error("Verification link not found in email body.");
      verificationUrl = linkMatch[1].replace(/&amp;/g, "&");
      await page.goto(verificationUrl);

      // Now run database query to escalate admin@vueverse.in to role = 'admin'
      await db.update(user).set({ role: "admin" }).where(eq(user.email, "admin@vueverse.in"));

      // Sign in as admin
      await page.goto("http://localhost:3000/sign-in");
      await page.fill("#email-address", "admin@vueverse.in");
      await page.fill("#password", "@AdminPass99");
      await page.click("button[type='submit']");

      // Assert redirected to Admin Control Panel
      await page.waitForSelector("text=Admin Control Panel", { timeout: 10000 });
      await page.waitForSelector("text=VueVerse Labs");

      // Approve the organization
      await page.click("button:has-text('Approve')");
      
      // Wait for it to disappear and show "No organizations pending verification"
      await page.waitForSelector("text=No organizations pending verification", { timeout: 10000 });

      // Sign out
      await page.click("text=Sign out");
      await page.waitForSelector("text=Sign in");

      // 4. Log in as Recruiter again and assert verified dashboard
      await page.goto("http://localhost:3000/sign-in");
      await page.fill("#email-address", "recruiter@vueverse.corp");
      await page.fill("#password", "@RecruiterPass99");
      await page.click("button[type='submit']");

      // We expect to see "VueVerse Labs Dashboard" and "Invite Recruiting Team"
      await page.waitForSelector("text=VueVerse Labs Dashboard", { timeout: 10000 });
      await page.waitForSelector("text=Invite Recruiting Team");

      // Sign out
      await page.click("text=Sign out");
      await page.waitForSelector("text=Sign in");
    } catch (err) {
      await page.screenshot({ path: "/Users/venkata_subash/.gemini/antigravity-cli/brain/01fd52ae-e8af-46cb-ab82-5826c9cd32e7/test_failure_orgs.png" });
      throw err;
    }
  }, 60000);
});
