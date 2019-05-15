const Page = require("./helpers/page");

let page;

beforeEach(async () => {
  jest.setTimeout(30000);

  page = await Page.build();
  expect(page).toBeDefined();

  await page.goto("localhost:3000");
});

afterEach(async () => {
  await page.close();
});

test("The header has the correct text", async () => {
  const text = await page.$eval("a.brand-logo", el => el.innerHTML);

  expect(text).toEqual("Blogster");
});

test("The user can login through google login", async () => {
  await page.click(".right a");

  const url = await page.url();

  expect(url).toMatch(/accounts\.google\.com/);
});

test("When signed in, shows logout button", async () => {
  // uses custom page login function
  await page.login();

  //pupeteer will wait for the element to render
  await page.waitFor("a[href='/auth/logout']");

  //gets element
  const logoutText = await page.getContentsOf("a[href='/auth/logout']");

  expect(logoutText).toEqual("Logout");
});
