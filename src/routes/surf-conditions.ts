import { synthesizeText } from "@src/utils/synthesize-text.js";
import type { Request, Response } from "express";
import fetch from "node-fetch";

type SurfDataType = {
  data: { conditions: { observation: string }[] };
};

const fetchSurfReport = async () => {
  const response = await fetch(
    "https://services.surfline.com/kbyg/regions/forecasts/conditions?subregionId=5cc73566c30e4c0001096989&days=1&accesstoken=b892cc4f756bdbce41c7abfd05f96cae384664fd",
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
        Cookie:
          "sl_bc_login_production=56fae82a19b74318a73b3e07; __cf_bm=FLfEaWHTHrLhtEhJPHgkZTda.Vr5jYj6Bh9KnnPrvKU-1762584762-1.0.1.1-KOMZFE4KECo.Xz2cHXSJdRBV2CruAJwROi8BfVpX54WmXHwQhkHqsGOPwphQ3FaNTWkbQmqr6GzeQaMdVyLevOLzHX43UFmSFsoiNsocUkI; cf_clearance=XK61qsM2pR8kProJ2xLA0jgxaU4oWGgWlxwvZI_aZC0-1762584762-1.2.1.1-FL.eYkkgBCzRa0BZf9VfNJkULbE6KUmYURDxPS8ge9nYv2Cu1V40cigfA1iKQ_33H_AUD8z71vGkPGkfH1eYKOL39DF3uX5gPJvRo0cMIERDh2q38i3IJ2Zdfx2a2ie_dEXPevbiptn2oHFWN04gyat76srJmNCj9ZKfsBFrEyPvqutCTVeKlTelUyp76Z0ZIuM.iLx7K2maOIZR2ZlJHRVouvAgIBh7WqofupQfHho",
        "Sec-Ch-Ua":
          '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
      },
    }
  );

  if (!response.ok) {
    return {
      type: "html",
      body: `<h1>Error fetching surf report: ${response.status} ${response.statusText}, ${response.body}</h1>`,
    };
  }

  // Test to see if the repsonse is html or json
  const responseText = await response.clone().text();
  if (responseText.startsWith("<")) {
    return {
      type: "html",
      body: responseText,
    };
  } else {
    const json = (await response.json()) as SurfDataType;
    const { observation } = json.data.conditions[0];
    // remove any <br> tags or \n characters
    const cleanedObservation = observation
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/\n+/g, " ")
      .trim();
    return {
      type: "text",
      body: cleanedObservation,
    };
  }
};

export const surfConditions = async (req: Request, res: Response) => {
  try {
    const surfData = await fetchSurfReport();
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
    res.status(500).send(err);
    console.error(err);
  }
};
