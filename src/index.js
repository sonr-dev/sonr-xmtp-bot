import { Client } from "@xmtp/xmtp-js";
import { Wallet } from "ethers";
import { ContentTypeText, TextCodec } from "@xmtp/content-type-text";

import { handleMessage } from "./bot.js";
import { handleFlow, flowState } from "./flow.js";
import { barschForecast } from "./barschEngine.js";
import { getWeather } from "./weather.js";

export async function startBot(privateKey) {
  try {
    if (!privateKey) {
      console.error("❌ BOT_PRIVATE_KEY fehlt!");
      return;
    }

    // 1) Signer vorbereiten
    const signer = new Wallet(privateKey);

    // 2) XMTP-Client für V3 erstellen
    const xmtp = await Client.create(signer, {
      env: "production",
      codecs: [new TextCodec()],
    });

    console.log("✅ SONR Barsch-Bot (XMTP V3) verbunden:", xmtp.address);

    // 3) Streaming aller eingehenden Messages
    for await (const msg of xmtp.streamMessages()) {
      // Eigene Messages ignorieren
      if (msg.senderAddress === xmtp.address) continue;

      const text = msg.content;

      console.log("📩 Nachricht:", text);

      // Flow-Logik
      const base = await handleMessage(msg);

      if (base?.next === "tiefe") {
        flowState[msg.senderAddress] = { step: "tiefe", data: {} };
        continue;
      }

      const userState = await handleFlow(msg);

      if (userState?.data?.fuehrung) {
        const weather = await getWeather();
        const result = barschForecast(userState.data, weather);

        await msg.reply(
          `🎣 **SONR Barsch-Score:** ${result.score}/100\n\n${result.text}`
        );

        flowState[msg.senderAddress] = { step: null, data: {} };
      }
    }
  } catch (err) {
    console.error("❌ Fehler im Bot (V3):", err);
  }
}
