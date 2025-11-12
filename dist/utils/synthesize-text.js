import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
// import textToSpeech from "@google-cloud/text-to-speech";
// import fs from "fs";
// import path from "path";
// import util from "util";
export async function synthesizeText(text, fileName = "output.mp3") {
    const elevenlabs = new ElevenLabsClient({
        apiKey: process.env.ELEVENLABS_API_KEY, // Defaults to process.env.ELEVENLABS_API_KEY
    });
    const audioStream = await elevenlabs.textToSpeech.stream("mgpcWiEXIWuENJCy8ADX", // voice_id
    {
        text,
        modelId: "eleven_multilingual_v2",
        outputFormat: "mp3_44100_128", // output_format
        voiceSettings: {
            stability: 0,
            similarityBoost: 0,
            useSpeakerBoost: true,
            speed: 1.0,
        },
    });
    const chunks = [];
    for await (const chunk of audioStream) {
        chunks.push(chunk);
    }
    const content = Buffer.concat(chunks);
    return content;
    // const client = new textToSpeech.TextToSpeechClient();
    // const request = {
    //   input: { text: text },
    //   voice: { languageCode: "en-US", ssmlGender: "NEUTRAL" as const },
    //   audioConfig: { audioEncoding: "MP3" as const },
    // };
    // const dir = path.resolve("./");
    // const audioFilePath = path.join(dir, fileName);
    // const [response] = await client.synthesizeSpeech(request);
    // if (!response.audioContent) {
    //   return { error: "No audio content received from Text-to-Speech API" };
    // }
    // const writeFile = util.promisify(fs.writeFile);
    // await writeFile(audioFilePath, response.audioContent, "binary");
    // return audioFilePath;
}
