import { synthesizeText } from "@src/utils/synthesize-text.js";
import type { Request, Response } from "express";
import fetch from "node-fetch";

type SurfDataType = {
  data: { conditions: { observation: string }[] };
};

const fetchSurfReport = async () => {
  const response = await fetch(
    "https://services.surfline.com/kbyg/regions/forecasts/conditions?subregionId=5cc73566c30e4c0001096989&days=1&accesstoken=b892cc4f756bdbce41c7abfd05f96cae384664fd"
  );

  if (!response.ok) {
    return {
      type: "html",
      body: `<h1>Error fetching surf report: ${response.status} ${response.statusText}</h1>`,
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
