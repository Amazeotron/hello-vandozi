"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.surfConditions = void 0;
const synthesize_text_1 = require("../utils/synthesize-text");
const node_fetch_1 = __importDefault(require("node-fetch"));
const surfConditions = async (req, res) => {
    const surfData = {};
    try {
        const response = await (0, node_fetch_1.default)("https://services.surfline.com/kbyg/regions/forecasts/conditions?subregionId=5cc73566c30e4c0001096989&days=1&accesstoken=b892cc4f756bdbce41c7abfd05f96cae384664fd");
        const surfData = (await response.json());
        const { observation } = surfData.data.conditions[0];
        // remove any <br> tags or \n characters
        const cleanedObservation = observation
            .replace(/<br\s*\/?>/gi, " ")
            .replace(/\n+/g, " ")
            .trim();
        const audioFilePath = await (0, synthesize_text_1.synthesizeText)(cleanedObservation);
        res.setHeader("Content-Type", "audio/mpeg");
        res.sendFile(audioFilePath, (err) => {
            if (err) {
                res.status(500).send(err);
            }
        });
    }
    catch (err) {
        console.error(err);
        res.status(200).send(JSON.stringify(surfData));
        return;
    }
};
exports.surfConditions = surfConditions;
