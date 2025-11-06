import { synthesizeText } from "./synthesize-text";
export const surfConditions = async (req, res) => {
    const response = await fetch("https://services.surfline.com/kbyg/regions/forecasts/conditions?subregionId=5cc73566c30e4c0001096989&days=16&accesstoken=b892cc4f756bdbce41c7abfd05f96cae384664fd").then((res) => res.json());
    const { observation } = response.data.conditions[0];
    const audioFilePath = await synthesizeText(observation);
    res.setHeader("Content-Type", "audio/mpeg");
    res.sendFile(audioFilePath, (err) => {
        if (err) {
            res.status(500).send(err);
        }
    });
};
//# sourceMappingURL=surf-conditions.js.map