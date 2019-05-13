const puppeteer = require("puppeteer");

let browser;
let page;

beforeEach(async () => {
  browser = await puppeteer.launch({
    headless: false
  });
  page = await browser.newPage();
  expect(page).toBeDefined();

  await page.goto("localhost:3000");
});

afterEach(async () => {
  await browser.close();
});

test("The header has the correct", async () => {
  const text = await page.$eval("a.brand-logo", el => el.innerHTML);

  expect(text).toEqual("Blogster");
});

test("The user can login through google login", async () => {
  await page.click(".right a");

  const url = await page.url();

  expect(url).toMatch(/accounts\.google\.com/);
});
