import { expect, test } from "@playwright/test";

test.describe("webapi", () => {
    test.skip(({ browserName }) => browserName !== "chromium", "browser-agnostic checks");

    test("GET /api/v1/healthz reports up", async ({ request }) => {
        const response = await request.get("/api/v1/healthz");

        expect(response.status()).toBe(200);
        expect(await response.json()).toEqual({ up: true });
    });

    test("POST /api/v1/healthz reports up", async ({ request }) => {
        const response = await request.post("/api/v1/healthz");

        expect(response.status()).toBe(200);
        expect(await response.json()).toEqual({ up: true });
    });

    test("healthz answers CORS preflight", async ({ request }) => {
        const response = await request.fetch("/api/v1/healthz", {
            method: "OPTIONS",
            headers: {
                Origin: "https://example.com",
                "Access-Control-Request-Method": "POST",
            },
        });

        expect(response.status()).toBeLessThan(300);
        expect(response.headers()["access-control-allow-origin"]).toBeTruthy();
    });
});
