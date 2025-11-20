import { Client } from "@xmtp/xmtp-js";
import dotenv from "dotenv";
import { handleMessage } from "./bot.js";
import { handleFlow, flowState } from "./flow.js";
import { barschForecast } from "./barschEngine.js";
import { getWeather } from "./weather.js";

dotenv.config();

async function startBot() {
  const privateKey = process.env.BOT_PRIVATE_KEY;

  if (!privateKey) {
    console.error("❌ Kein BOT_PRIVATE_KEY gefunden! Bitte in Vercel .env eintragen.");
    process.exit(1);
  }

  // XMTP-Client erstellen
  const xmtp = await Client.create(privateKey, { env: "production" });

  console.log("✅ SONR Barsch-Bot verbunden mit XMTP");

  // Nachrichtenstream starten
  for await (const msg of await xmtp.conversations.streamAllMessages()) {
    console.log("📩 Nachricht erhalten:", msg.content);

    // Sicherheitscheck: ignoriere eigene Nachrichten
    if (msg.senderAddress === xmtp.address) continue;

    // 1) Kommandos wie "start" oder "barsch"
    const base = await handleMessage(msg);

    // Falls Flow starten soll
    if (base?.next === "tiefe") {
      flowState[msg.senderAddress] = { step: "tiefe", data: {} };
      return;
    }

    // 2) Falls Nutzer mitten im Flow ist
    const userState = await handleFlow(msg);

    // Wenn userState vollständig ist → Barsch-Vorhersage erstellen
    if (userState?.data?.fuehrung) {
      const weather = await getWeather();
      const result = barschForecast(userState.data, weather);

      await msg.conversation.send(
        `🎣 **SONR Barsch-Score:** ${result.score}/100\n\n${result.text}`
      );

      // Flow für diesen Nutzer zurücksetzen
      flowState[msg.senderAddress] = { step: null, data: {} };
    }
  }
}

startBot();
