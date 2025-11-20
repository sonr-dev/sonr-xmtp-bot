import { Client } from "@xmtp/xmtp-js";
import dotenv from "dotenv";
dotenv.config();

async function startBot() {
  // Der Private Key kommt später aus .env (sicher!)
  const privateKey = process.env.BOT_PRIVATE_KEY;

  if (!privateKey) {
    console.error("❌ Kein BOT_PRIVATE_KEY gefunden! Bitte in .env eintragen.");
    process.exit(1);
  }

  const xmtp = await Client.create(privateKey, {
    env: "production",
  });

  console.log("✅ SONR Bot ist verbunden mit XMTP");

  // Beispiel: Auf Nachrichten reagieren
  for await (const msg of await xmtp.conversations.streamAllMessages()) {
    console.log("📩 Nachricht erhalten:", msg.content);

    // Einfachste Antwort
    if (msg.content === "ping") {
      await msg.conversation.send("pong");
    }
  }
}

startBot();
