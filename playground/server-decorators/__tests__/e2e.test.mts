import { poll, setupPlaygroundEnvironment, testDevAndDeploy } from "rwsdk/e2e";
import { expect } from "vitest";

setupPlaygroundEnvironment(import.meta.url);

testDevAndDeploy("renders decorator demo page", async ({ page, url }) => {
  await page.goto(url);

  const getPageContent = () => page.content();

  await poll(async () => {
    const content = await getPageContent();
    expect(content).toContain("Server Decorators Demo");
    expect(content).toContain("@Transform()");
    expect(content).toContain("@TransformParam()");
    return true;
  });
});

testDevAndDeploy("server action with decorators works", async ({ page, url }) => {
  await page.goto(url);

  // Wait for page to be interactive
  await page.waitForFunction(() => document.readyState === "complete");

  // Wait for the input field to appear
  const nameInput = await page.waitForSelector("#name-input");
  await nameInput?.type("alice");

  // Click the greet button
  const greetButton = await page.waitForSelector("#greet-button");
  await greetButton?.click();

  // Wait for the result to appear with the decorated prefix
  await poll(async () => {
    const resultElement = await page.$("#decorator-result");
    const resultText = resultElement
      ? await page.evaluate((el) => el?.textContent, resultElement)
      : null;

    expect(resultText).toBeTruthy();
    // The decorator transforms the parameter (uppercases first letter and adds prefix)
    // and transforms the result (adds [Decorated] prefix)
    expect(resultText).toContain("[Decorated]");
    expect(resultText).toContain("[Transformed] Alice");
    expect(resultText).toContain("Hello");
    return true;
  });
});
