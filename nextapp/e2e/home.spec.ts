import { expect, test } from "@playwright/test";

test.describe("home page", () => {
    test("renders the landing content", async ({ page }) => {
        const response = await page.goto("/");

        expect(response?.status()).toBe(200);
        await expect(page).toHaveTitle(/Create Next App/);
        await expect(page.getByText("Get started by editing")).toBeVisible();
        await expect(page.getByRole("heading", { name: /Docs/ })).toBeVisible();
        await expect(page.getByRole("img", { name: "Next.js Logo" })).toBeVisible();
    });

    test("exposes the documented outbound links", async ({ page }) => {
        await page.goto("/");

        for (const name of [/Docs/, /Learn/, /Templates/, /Deploy/]) {
            const link = page.getByRole("link").filter({ has: page.getByRole("heading", { name }) });
            await expect(link).toHaveAttribute("href", /^https:\/\//);
            await expect(link).toHaveAttribute("rel", /noopener/);
        }
    });

    test("logs no console errors or failed requests", async ({ page }) => {
        const problems: string[] = [];

        page.on("console", (message) => {
            if (message.type() === "error") problems.push(`console: ${message.text()}`);
        });
        page.on("pageerror", (error) => problems.push(`pageerror: ${error.message}`));
        page.on("requestfailed", (request) => {
            problems.push(`requestfailed: ${request.url()} ${request.failure()?.errorText ?? ""}`);
        });

        await page.goto("/", { waitUntil: "load" });
        await expect(page.getByText("Get started by editing")).toBeVisible();

        expect(problems).toEqual([]);
    });

    test("is usable on a narrow viewport", async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto("/");

        await expect(page.getByText("Get started by editing")).toBeVisible();

        const overflow = await page.evaluate(
            () => document.documentElement.scrollWidth - document.documentElement.clientWidth
        );
        expect(overflow).toBeLessThanOrEqual(1);
    });
});
