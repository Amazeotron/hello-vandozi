import { synthesizeText } from "@src/utils/synthesize-text";
import type { Request, Response } from "express";
import fetch from "node-fetch";

export const surfConditions = async (req: Request, res: Response) => {
  const response = await fetch(
    "https://services.surfline.com/kbyg/regions/forecasts/conditions?subregionId=5cc73566c30e4c0001096989&days=16&accesstoken=b892cc4f756bdbce41c7abfd05f96cae384664fd"
  );
  const data = (await response.json()) as {
    data: { conditions: { observation: string }[] };
  };
  const { observation } = data.data.conditions[0];
  // remove any <br> tags or \n characters
  const cleanedObservation = observation
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/\n+/g, " ")
    .trim();

  const audioFilePath = await synthesizeText(cleanedObservation);

  res.setHeader("Content-Type", "audio/mpeg");
  res.sendFile(audioFilePath, (err) => {
    if (err) {
      res.status(500).send(err);
    }
  });
};
