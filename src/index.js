import { Client } from "@xmtp/xmtp-js";
import { Wallet } from "ethers";
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

    // Aus Hex-String → Ethers-Wallet (Signer für XMTP)
    const signer = new Wallet(privateKey);

    const xmtp = await Client.create(signer, { env: "production" });

    console.log("✅ SONR Barsch-Bot XMTP connected:", xmtp.address);

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
  } catch (err) {
    console.error("❌ Fehler im Bot:", err);
  }
}
