// tests/integration.test.js

const axios = require("axios");
const cheerio = require("cheerio");
const { exec } = require("child_process");
const { promisify } = require("util");
const execAsync = promisify(exec);
const { sampleHtmlWithYale } = require("./test-utils");
const nock = require("nock");
const fs = require("fs").promises; // Import Node.js File System module

// Set a different port for testing to avoid conflict with the main app
const TEST_PORT = 3099;
let server;

describe("Integration Tests", () => {
  // Modify the app to use a test port
  beforeAll(async () => {
    // This nock setup is for the axios.post call in THIS file
    nock.disableNetConnect();
    nock.enableNetConnect(/(localhost|127\.0\.0\.1)/);

    // --- Fix: Inject nock into the spawned server ---

    // 1. Read the original app.js code
    let appCode = await fs.readFile("app.js", "utf8");

    // 2. Change the port
    appCode = appCode.replace("const PORT = 3001", `const PORT = ${TEST_PORT}`);

    // 3. Define the mock code to prepend
    const mockCodeToInject = `
const nock = require("nock");
const { sampleHtmlWithYale } = require("./tests/test-utils");

console.log("[app.test.js] Injecting nock mock for example.com...");

// This mock will run INSIDE the child process
nock("https://example.com")
  .persist() // Keep the mock active for all calls
  .get("/")
  .reply(200, sampleHtmlWithYale);

// Ensure nock is active in the child process
nock.disableNetConnect();
nock.enableNetConnect(/(localhost|127\.0\.0\.1|example\.com)/);
`;

    // 4. Write the new, modified code to app.test.js
    await fs.writeFile("app.test.js", mockCodeToInject + appCode);

    // 5. Start the test server
    server = require("child_process").spawn("node", ["app.test.js"], {
      detached: true,
      stdio: "ignore", // You can change to 'pipe' for debugging
    });

    // --- End of Fix ---

    // Give the server time to start
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }, 10000); // Increase timeout for server startup

  afterAll(async () => {
    // Kill the test server and clean up
    if (server && server.pid) {
      process.kill(-server.pid);
    }
    // Use fs.unlink (the modern way to rm)
    await fs.unlink("app.test.js");
    nock.cleanAll();
    nock.enableNetConnect();
  });

  test("Should replace Yale with Fale in fetched content", async () => {
    // Note: We NO LONGER define the nock here.
    // It's running in the child process.

    // Make a request to our proxy app
    const response = await axios.post(`http://localhost:${TEST_PORT}/fetch`, {
      url: "https://example.com/",
    });

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);

    // Verify Yale has been replaced with Fale in text
    const $ = cheerio.load(response.data.content);

    // This assertion should now pass
    expect($("title").text()).toBe("Fale University Test Page");
    expect($("h1").text()).toBe("Welcome to Fale University");
    expect($("p").first().text()).toContain("Fale University is a private");

    // Verify URLs remain unchanged
    const links = $("a");
    let hasYaleUrl = false;
    links.each((i, link) => {
      const href = $(link).attr("href");
      if (href && href.includes("yale.edu")) {
        hasYaleUrl = true;
      }
    });
    expect(hasYaleUrl).toBe(true);

    // Verify link text is changed
    expect($("a").first().text()).toBe("About Fale");
  }, 10000); // Increase timeout for this test

  test("Should handle invalid URLs", async () => {
    try {
      await axios.post(`http://localhost:${TEST_PORT}/fetch`, {
        url: "not-a-valid-url",
      });
      // Should not reach here
      expect(true).toBe(false);
    } catch (error) {
      const { status } = error.response;
      expect(status).toBe(500);
    }
  });

  test("Should handle missing URL parameter", async () => {
    try {
      await axios.post(`http://localhost:${TEST_PORT}/fetch`, {});
      // Should not reach here
      expect(true).toBe(false);
    } catch (error) {
      const { status, data } = error.response;
      expect(status).toBe(400);
      expect(data.error).toBe("URL is required");
    }
  });
});
