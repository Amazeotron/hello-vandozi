import textToSpeech from "@google-cloud/text-to-speech";
import fs from "fs";
import path from "path";
import util from "util";
export async function synthesizeText(text, fileName = "output.mp3") {
    const client = new textToSpeech.TextToSpeechClient();
    const request = {
        input: { text: text },
        voice: { languageCode: "en-US", ssmlGender: "NEUTRAL" },
        audioConfig: { audioEncoding: "MP3" },
    };
    const dir = path.resolve("./");
    const audioFilePath = path.join(dir, fileName);
    const [response] = await client.synthesizeSpeech(request);
    if (!response.audioContent) {
        return { error: "No audio content received from Text-to-Speech API" };
    }
    const writeFile = util.promisify(fs.writeFile);
    await writeFile(audioFilePath, response.audioContent, "binary");
    return audioFilePath;
}
