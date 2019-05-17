const Page = require("./helpers/page");

let page;

beforeEach(async () => {
  page = await Page.build();
  await page.goto("http://localhost:3000");
});

afterEach(async () => {
  await page.close();
});

afterAll(async () => {
  await page.close();
});
describe("When logged in", async () => {
  beforeEach(async () => {
    await page.login();
    await page.click("a.btn-floating"); //goes to blog page
  });

  test("Can see blog create form", async () => {
    const label = await page.getContentsOf("form label");

    expect(label).toEqual("Blog Title");
  });

  describe("And using valid inputs", async () => {
    beforeEach(async () => {
      await page.type(".title input", "My Title");
      await page.type(".content input", "My Content");
      await page.click("form button");
    });
    test("Submitting takes user to review screen", async () => {
      const content = await page.getContentsOf("h5");
      expect(content).toEqual("Please confirm your entries");
    });

    test("Submitting then saving adds blog to index page", async () => {
      await page.click("button.green");
      await page.waitFor("a.btn-floating");
      const title = await page.getContentsOf(".card-title");
      const content = await page.getContentsOf("p");

      expect(title).toEqual("My Title");
      expect(content).toEqual("My Content");
    });
  });

  describe("And using invalid inputs", async () => {
    beforeEach(async () => {
      await page.click("form button");
    });
    test("The test form shows an error message", async () => {
      const titleError = await page.getContentsOf(".title .red-text");
      const contentError = await page.getContentsOf(".content .red-text");

      expect(titleError).toEqual("You must provide a value");
      expect(contentError).toEqual("You must provide a value");
    });
  });
});

// describe("When not logged in", async () => {
//   test("User cannot create blog posts", async () => {
//     //creates a post request and evaluates the result
//     const result = await page.post("/api/blogs", {
//       title: "My Title",
//       content: "My Content"
//     });

//     expect(result).toEqual({ error: "You must log in!" });
//   });

//   test("User cannot get a list of posts", async () => {
//     const result = await page.get("/api/blogs");

//     expect(result).toEqual({ error: "You must log in!" });
//   });
// });
