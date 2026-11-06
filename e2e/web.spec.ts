// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-FileCopyrightText: 2026 Manoj Rollo (MRJonam91)

import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";


const URL_APP = new URL("../site/index.html", import.meta.url).href;

async function apri(page: Page): Promise<void> {
  const errori: string[] = [];
  page.on("pageerror", (e) => errori.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errori.push(m.text()));
  await page.goto(URL_APP);
  await expect(page.locator("#netto-mese")).not.toHaveText("–");
  expect(errori).toEqual([]);
}

test.describe("web app", () => {
  test("apre con l'esempio compilato e il caso di riferimento", async ({ page }) => {
    await apri(page);
    await expect(page.locator("#esempio")).toBeVisible();
    await expect(page.locator("#netto-mese")).toHaveText("2.503,44 €");
    await expect(page.locator("#f24-tot")).toHaveText("9.958,74 €");
    await expect(page.locator("#f24 .cod").first()).toHaveText("1790");
    await expect(page.locator("#f24-nota")).toContainText("30/07/2027");
    await expect(page.locator('meta[http-equiv="Content-Security-Policy"]')).toHaveAttribute("content", /default-src 'none'/);
  });

  test("nessuna richiesta di rete oltre al file", async ({ page }) => {
    const richieste: string[] = [];
    page.on("request", (r) => richieste.push(r.url()));
    await apri(page);
    await page.locator("#att-ric-0").fill("55.000");
    expect(richieste.filter((u) => !u.startsWith("file:") && !u.startsWith("data:") && !u.startsWith("blob:"))).toEqual([]);
  });

  test("commerciante con riduzione 35% e primo anno: rate fisse CF", async ({ page }) => {
    await apri(page);
    await page.locator("#att-code-0").fill("47.91");
    await page.getByText("Commercianti", { exact: true }).click();
    await page.locator("#riduzione").selectOption("forfettari");
    await page.locator("#primo-anno").check();
    await expect(page.locator("#esempio")).toBeHidden();
    await expect(page.locator("#f24 .cod", { hasText: "CF" })).toHaveCount(4);
    await expect(page.locator("#f24-nota")).toContainText("Primo anno");
  });

  test("codice ATECO errato: messaggio e campo segnalato", async ({ page }) => {
    await apri(page);
    await page.locator("#att-code-0").fill("00.00");
    await expect(page.locator("#att-hint-0")).toContainText("Codice non riconosciuto");
    await expect(page.locator("#att-code-0")).toHaveAttribute("aria-invalid", "true");
    await expect(page.locator("#errore")).toBeVisible();
  });

  test("settore al posto del codice e seconda attività", async ({ page }) => {
    await apri(page);
    await page.locator("#att-code-0").fill("");
    await page.locator("#att-set-0").selectOption("professioni");
    await expect(page.locator("#att-hint-0")).toContainText("78%");
    await page.locator("#add-att").click();
    await page.locator("#att-code-1").fill("47.91");
    await page.locator("#att-ric-1").fill("10.000");
    await expect(page.locator("#ledger")).toContainText("50.000,00 €");
  });

  test("lingua inglese e ritorno", async ({ page }) => {
    await apri(page);
    await page.locator("#lang-en").click();
    await expect(page.locator("h1")).toContainText("What you really keep");
    await expect(page.locator("#netto-mese")).toHaveText("€2,503.44");
    await page.locator("#lang-it").click();
    await expect(page.locator("h1")).toContainText("Quanto ti resta");
  });

  test("anno 2025: scadenze nel 2026 con le rate fisse 2026", async ({ page }) => {
    await apri(page);
    await page.locator("#anno").selectOption("2025");
    await page.getByText("Artigiani", { exact: true }).click();
    await expect(page.locator("#f24-anno")).toHaveText("2026");
    await expect(page.locator("#f24 tr", { hasText: "rata 1/4" })).toContainText("1.130,34 €");
  });

  test("i dati restano dopo il ricaricamento e Ricomincia li azzera", async ({ page }) => {
    await apri(page);
    await page.locator("#att-ric-0").fill("61.000");
    await page.reload();
    await expect(page.locator("#att-ric-0")).toHaveValue("61.000");
    await page.locator("#reset").click();
    await expect(page.locator("#att-ric-0")).toHaveValue("40.000");
    await expect(page.locator("#esempio")).toBeVisible();
  });

  test("calendario .ics scaricabile", async ({ page }) => {
    await apri(page);
    const [download] = await Promise.all([page.waitForEvent("download"), page.locator("#ics").click()]);
    expect(download.suggestedFilename()).toBe("scadenze-forfettario-2027.ics");
    const path = await download.path();
    const { readFileSync } = await import("node:fs");
    expect(readFileSync(path, "utf8")).toContain("BEGIN:VEVENT");
  });

  test("nessuno scroll orizzontale", async ({ page }) => {
    await apri(page);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test("accessibilità: nessuna violazione grave (axe)", async ({ page }) => {
    await apri(page);
    const res = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    const gravi = res.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(gravi.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
  });

  test("tema scuro: nessuna violazione di contrasto", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await apri(page);
    const res = await new AxeBuilder({ page }).withRules(["color-contrast"]).analyze();
    expect(res.violations.map((v) => v.nodes.map((n) => n.target.join(" ")).join(", "))).toEqual([]);
  });
});


