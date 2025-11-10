import { synthesizeText } from "../utils/synthesize-text.js";
// import { Impit } from "impit";
// import fetch from "node-fetch";
import { newInjectedContext } from "fingerprint-injector";
import { chromium } from "playwright";
const url = "https://services.surfline.com/kbyg/regions/forecasts/conditions?subregionId=5cc73566c30e4c0001096989&days=1&accesstoken=b892cc4f756bdbce41c7abfd05f96cae384664fd";
const fetchSurfReport = async () => {
    const browser = await chromium.launch({ headless: true });
    const context = await newInjectedContext(browser, {
        // Constraints for the generated fingerprint (optional)
        fingerprintOptions: {
            devices: ["desktop"],
            operatingSystems: ["macos"],
        },
        // Playwright's newContext() options (optional, random example for illustration)
        newContextOptions: {
            geolocation: {
                latitude: 37.8044853,
                longitude: -122.4590763,
            },
            userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
        },
    });
    const page = await context.newPage();
    await page.goto(url);
    const jsonData = await page.evaluate(() => {
        return JSON.parse(document.body.textContent);
    });
    await browser.close();
    return {
        type: "text",
        body: jsonData.data.conditions[0].observation,
    };
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
export const surfConditions = async (req, res) => {
    try {
        const surfData = await fetchSurfReport();
        if (surfData.type === "html") {
            // send the html response as is
            res.status(200).send(surfData.body);
            return;
        }
        const maybeAudioFilePath = await synthesizeText(surfData.body);
        if (maybeAudioFilePath &&
            typeof maybeAudioFilePath === "object" &&
            "error" in maybeAudioFilePath) {
            res.status(500).send(maybeAudioFilePath.error);
        }
        else if (typeof maybeAudioFilePath === "string") {
            res.setHeader("Content-Type", "audio/mpeg");
            res.sendFile(maybeAudioFilePath, (err) => {
                if (err) {
                    res.status(500).send(err);
                }
            });
        }
        else {
            res.status(500).send("Unexpected error occurred.");
        }
    }
    catch (err) {
        const errErr = err;
        console.log("Caught error in surfConditions:", errErr);
        res
            .status(500)
            .send("message" in errErr ? errErr.message : "Unknown error");
        console.error(errErr.stack);
    }
};
