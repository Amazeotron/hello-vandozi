import { synthesizeText } from "@src/utils/synthesize-text.js";
import type { Request, Response } from "express";
// import { Impit } from "impit";
// import fetch from "node-fetch";
import { newInjectedContext } from "fingerprint-injector";
import { chromium } from "playwright";

type SurfDataType = {
  data: { conditions: { observation: string }[] };
};

const pageUrl =
  "https://www.surfline.com/surf-report/linda-mar-north/5cbf8d85e7b15800014909e8";
const url =
  "https://services.surfline.com/kbyg/regions/forecasts/conditions?subregionId=5cc73566c30e4c0001096989&days=1&accesstoken=b892cc4f756bdbce41c7abfd05f96cae384664fd";

const endpoint = "https://production-sfo.browserless.io/chromium/bql";
const token = "2TOpaSCtaEcRez7717502587ee2a117f0f2d859baba3ec452";

export async function fetchBrowserQL() {
  const response = await fetch(`${endpoint}?token=${token}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `
      mutation GetSurfReport($url: String!) {
        goto(url: $url, waitUntil: networkIdle) {
          status
        }
        response(url: "https://services.surfline.com/kbyg/regions/forecasts/conditions/**", type: [xhr, fetch]) {
          url
          status
          headers {
            name
            value
          }
          body
        }
      }`,
      variables: {
        url: pageUrl,
      },
    }),
  });

  const data = await response.text();
  return {
    type: "text",
    body: data,
  };
}

// const fetchViaPlaywright = async () => {
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
//         latitude: 37.8044853,
//         longitude: -122.4590763,
//       },
//       userAgent:
//         "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
//     },
//   });
//   const page = await context.newPage();
//   await page.goto(url);
//   const jsonData = await page.evaluate(() => {
//     return JSON.parse(document.body.textContent);
//   });

//   await browser.close();

//   return {
//     type: "text",
//     body: jsonData.data.conditions[0].observation,
//   };
// };

const fetchSurfReport = async () => {
  return await fetchBrowserQL();

  // if (!response.ok) {
  //   return {
  //     type: "html",
  //     body: `<h1>Error fetching surf report: ${response.status} ${
  //       response.statusText
  //     }, ${response.body ? JSON.stringify(response.body) : ""}</h1>`,
  //   };
  // }

  // // Test to see if the repsonse is html or json
  // const responseText = await response.text();
  // if (responseText.startsWith("<")) {
  //   return {
  //     type: "html",
  //     body: responseText,
  //   };
  // } else {
  //   const json = (await response.json()) as SurfDataType;
  //   const { observation } = json.data.conditions[0];
  //   // remove any <br> tags or \n characters
  //   const cleanedObservation = observation
  //     .replace(/<br\s*\/?>/gi, " ")
  //     .replace(/\n+/g, " ")
  //     .trim();
  //   return {
  //     type: "text",
  //     body: cleanedObservation,
  //   };
  // }
};

export const surfConditions = async (req: Request, res: Response) => {
  try {
    console.log("Fetching surf report...");
    const surfData = await fetchBrowserQL();
    console.log("Surfdata:", surfData.body);
    if (surfData.type === "html") {
      // send the html response as is
      res.status(200).send(surfData.body);
      return;
    }

    const maybeAudioFilePath = await synthesizeText(surfData.body);

    if (
      maybeAudioFilePath &&
      typeof maybeAudioFilePath === "object" &&
      "error" in maybeAudioFilePath
    ) {
      res.status(500).send(maybeAudioFilePath.error);
    } else if (typeof maybeAudioFilePath === "string") {
      res.setHeader("Content-Type", "audio/mpeg");
      res.sendFile(maybeAudioFilePath, (err) => {
        if (err) {
          res.status(500).send(err);
        }
      });
    } else {
      res.status(500).send("Unexpected error occurred.");
    }
  } catch (err) {
    const errErr = err as Error;
    console.log("Caught error in surfConditions:", errErr);
    res
      .status(500)
      .send("message" in errErr ? errErr.message : "Unknown error");
    console.error(errErr.stack);
  }
};
