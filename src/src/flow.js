// Zwischenspeicher für Gesprächszustand pro Nutzer
export const flowState = {};

// Konversationsfluss für SONR Barsch Dirty Beta
export async function handleFlow(msg) {
  const user = msg.senderAddress;
  const text = msg.content.trim().toLowerCase();

  // Falls User noch keinen Zustand hat → anlegen
  if (!flowState[user]) {
    flowState[user] = { step: null, data: {} };
  }

  const state = flowState[user];

  // 1) Tiefe
  if (state.step === "tiefe") {
    state.data.tiefe = Number(text);
    state.step = "struktur";
    await msg.conversation.send("Welche Struktur? (brücke / kante / stein / kraut)");
    return;
  }

  // 2) Struktur
  if (state.step === "struktur") {
    state.data.struktur = text;
    state.step = "truebung";
    await msg.conversation.send("Wie klar ist das Wasser? (klar / milchig / trüb)");
    return;
  }

  // 3) Trübung
  if (state.step === "truebung") {
    state.data.truebung = text;
    state.step = "koeder";
    await msg.conversation.send("Welchen Köder nutzt du? (gummi / ned / twitch / spinner)");
    return;
  }

  // 4) Köder
  if (state.step === "koeder") {
    state.data.koeder = text;
    state.step = "fuehrung";
    await msg.conversation.send("Wie führst du? (langsam / moderat / aggressiv)");
    return;
  }

  return state;
}
