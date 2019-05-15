const puppeteer = require("puppeteer");
const sessionFactory = require("./factories/sessionFactories");
const userFactory = require("./factories/userFactory");
let browser;
let page;

beforeEach(async () => {
  jest.setTimeout(30000);
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
  // const id = "5cd6eb7533a4c7466aff5940";
  const user = await userFactory();
  const { session, sig } = sessionFactory(user);

  await page.setCookie({ name: "session", value: session });
  await page.setCookie({ name: "session.sig", value: sig });
  await page.goto("localhost:3000");

  //pupeteer will wait for the element to render
  await page.waitFor("a[href='/auth/logout']");

  //gets element
  const logoutText = await page.$eval(
    "a[href='/auth/logout']",
    el => el.innerHTML
  );

  expect(logoutText).toEqual("Logout");
});
