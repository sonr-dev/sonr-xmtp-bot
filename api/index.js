import { startBot } from "../src/index.js";

let botStarted = false;

export default async function handler(req, res) {
  if (!botStarted) {
    botStarted = true;
    console.log("🚀 Starte SONR Barsch-Bot (V3)...");
    await startBot(process.env.BOT_PRIVATE_KEY);
  }

  res.status(200).json({ ok: true, message: "SONR Bot running (V3)" });
}
