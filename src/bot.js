// Basismodul für einfache Bot-Funktionen
export async function handleMessage(msg) {
  const text = msg.content?.toLowerCase().trim() || "";

  if (text === "start" || text === "hi" || text === "hallo") {
    await msg.conversation.send(
      "👋 Willkommen bei SONR Barsch Forecast!\n" +
      "Schreib 'barsch', um eine Analyse zu starten."
    );
    return;
  }

  if (text === "barsch") {
    await msg.conversation.send(
      "🟦 Okay! Lass uns starten.\n" +
      "Welche Tiefe angelst du? (Antwort: z.B. 3)"
    );
    return { next: "tiefe" };
  }

  return;
}
