import { Client } from "@xmtp/xmtp-js";
import { handleMessage } from "./bot.js";
import { handleFlow, flowState } from "./flow.js";
import { barschForecast } from "./barschEngine.js";
import { getWeather } from "./weather.js";

export async function startBot(privateKey) {
  if (!privateKey) {
    console.error("❌ BOT_PRIVATE_KEY fehlt!");
    return;
  }

  const xmtp = await Client.create(privateKey, { env: "production" });
  console.log("✅ SONR Barsch-Bot ist mit XMTP verbunden:", xmtp.address);

  // NICHT blockieren → kein for await!
  // Stattdessen Event-Stream starten, der nicht blockiert:
  (async () => {
    for await (const msg of await xmtp.conversations.streamAllMessages()) {
      console.log("📩 Nachricht:", msg.content);

      if (msg.senderAddress === xmtp.address) continue;

      const base = await handleMessage(msg);

      if (base?.next === "tiefe") {
        flowState[msg.senderAddress] = { step: "tiefe", data: {} };
        continue;
      }

      const userState = await handleFlow(msg);

      if (userState?.data?.fuehrung) {
        const weather = await getWeather();
        const result = barschForecast(userState.data, weather);

        await msg.conversation.send(
          `🎣 **SONR Barsch-Score:** ${result.score}/100\n\n${result.text}`
        );

        flowState[msg.senderAddress] = { step: null, data: {} };
      }
    }
  })();
}
