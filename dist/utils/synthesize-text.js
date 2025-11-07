"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.synthesizeText = synthesizeText;
const text_to_speech_1 = __importDefault(require("@google-cloud/text-to-speech"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const util_1 = __importDefault(require("util"));
async function synthesizeText(text, fileName = "output.mp3") {
    const client = new text_to_speech_1.default.TextToSpeechClient();
    const request = {
        input: { text: text },
        voice: { languageCode: "en-US", ssmlGender: "NEUTRAL" },
        audioConfig: { audioEncoding: "MP3" },
    };
    const dir = path_1.default.resolve("./");
    const audioFilePath = path_1.default.join(dir, fileName);
    const [response] = await client.synthesizeSpeech(request);
    if (!response.audioContent) {
        throw new Error("No audio content received from Text-to-Speech API");
    }
    const writeFile = util_1.default.promisify(fs_1.default.writeFile);
    await writeFile(audioFilePath, response.audioContent, "binary");
    return audioFilePath;
}
