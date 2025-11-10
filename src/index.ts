import { surfConditions } from "@src/routes/surf-conditions.js";
import express from "express";
// import { Impit } from "impit";
import { newInjectedContext } from "fingerprint-injector";
import { chromium } from "playwright";
// import { test, expect } from 'playwright/test';

const url =
  "https://services.surfline.com/kbyg/regions/forecasts/conditions?subregionId=5cc73566c30e4c0001096989&days=1&accesstoken=b892cc4f756bdbce41c7abfd05f96cae384664fd";
const pageUrl =
  "https://www.surfline.com/surf-report/linda-mar-north/5cbf8d85e7b15800014909e8";

// (async () => {
//   const browser = await chromium.launch({ headless: true });
//   const context = await newInjectedContext(browser, {
//     // Constraints for the generated fingerprint (optional)
//     fingerprintOptions: {
//       devices: ["desktop"],
//       operatingSystems: ["macos"],
//     },
//     // Playwright's newContext() options (optional, random example for illustration)
//     newContextOptions: {
//       geolocation: {
//         latitude: -37.50853,
//         longitude: 121.12574,
//       },
//     },
//   });
//   const page = await context.newPage();
//   await page.goto(url);
//   const jsonData = await page.evaluate(() => {
//     return JSON.parse(document.body.textContent);
//   });

//   console.log(jsonData);
//   await browser.close();
// })();

const app = express();

// app.get("/", async (req, res) => {
//   const impit = new Impit({
//     browser: "chrome", // or "firefox"
//     proxyUrl: "http://localhost:8080",
//     ignoreTlsErrors: true,
//   });
//   const url =
//     "https://services.surfline.com/kbyg/regions/forecasts/conditions?subregionId=5cc73566c30e4c0001096989&days=1&accesstoken=b892cc4f756bdbce41c7abfd05f96cae384664fd";
//   const response = await impit.fetch(url);
//   console.log(response);
//   res.send("Hello Vandozi!");
// });

app.get("/surf-conditions", surfConditions);

const port = parseInt(process.env.PORT || "8080", 10);
app.listen(port, () => {
  console.log(`Vandozi: listening on port ${port}`);
});
