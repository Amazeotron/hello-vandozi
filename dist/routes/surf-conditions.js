import { synthesizeText } from "../utils/synthesize-text.js";
import fetch from "node-fetch";
export const surfConditions = async (req, res) => {
    try {
        const response = await fetch("https://services.surfline.com/kbyg/regions/forecasts/conditions?subregionId=5cc73566c30e4c0001096989&days=1&accesstoken=b892cc4f756bdbce41c7abfd05f96cae384664fd");
        const surfData = (await response.json());
        const { observation } = surfData.data.conditions[0];
        // remove any <br> tags or \n characters
        const cleanedObservation = observation
            .replace(/<br\s*\/?>/gi, " ")
            .replace(/\n+/g, " ")
            .trim();
        const maybeAudioFilePath = await synthesizeText(cleanedObservation);
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
        console.error(err);
        const audioFilePath = await synthesizeText("Sorry, we couldn't retrieve the surf conditions.");
        if (typeof audioFilePath !== "string") {
            res.status(500).send("Unexpected error occurred.");
            return;
        }
        res.setHeader("Content-Type", "audio/mpeg");
        res.sendFile(audioFilePath, (err) => {
            if (err) {
                res.status(500).send(err);
            }
        });
        return;
    }
};
