import { synthesizeText } from "@src/utils/synthesize-text.js";
import type { Request, Response } from "express";

type SurfDataType = {
  data: { conditions: { observation: string }[] };
};

const pageUrl =
  "https://www.surfline.com/surf-report/linda-mar-north/5cbf8d85e7b15800014909e8";
const url =
  "https://services.surfline.com/kbyg/regions/forecasts/conditions?subregionId=5cc73566c30e4c0001096989&days=1&accesstoken=b892cc4f756bdbce41c7abfd05f96cae384664fd";

const endpoint = "https://production-sfo.browserless.io/chromium/bql";
const token = "2TOpaSCtaEcRez7717502587ee2a117f0f2d859baba3ec452";

export async function fetchSurfReport() {
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
        selector: text(selector: "[class^='SpotCurrentConditions_currentConditionsReportContainer']") {
          text
        }
      }`,
      variables: {
        url: pageUrl,
      },
    }),
  });

  const data = (await response.json()) as {
    data: {
      selector: {
        text: string;
      } | null;
    };
  };
  // See if there is a data.data.selector
  const body = data.data.selector?.text;
  return {
    type: "text",
    body: body || "No surf report available at the moment.",
  };
}

export const surfConditions = async (req: Request, res: Response) => {
  try {
    console.log("Fetching surf report...");
    const surfData = await fetchSurfReport();
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
