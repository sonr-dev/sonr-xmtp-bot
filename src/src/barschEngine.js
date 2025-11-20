export function barschForecast(data, weather) {
  let score = 50;

  // Tiefe
  if (data.tiefe <= 5) score += 10;
  if (data.tiefe >= 12) score -= 10;

  // Struktur
  if (data.struktur.includes("brücke")) score += 15;
  if (data.struktur.includes("kante")) score += 20;
  if (data.struktur.includes("stein")) score += 10;

  // Trübung
  if (data.truebung === "klar") score += 10;
  if (data.truebung === "trüb") score -= 10;

  // Köder
  if (data.koeder === "ned") score += 12;
  if (data.koeder === "twitch") score += 8;

  // Führung
  if (data.fuehrung === "langsam") score += 10;

  // Wetter (Dummy)
  if (weather?.wind < 10) score += 5;

  score = Math.min(100, Math.max(0, score));

  return {
    score,
    text: generateText(score, data),
  };
}

function generateText(score, data) {
  if (score >= 75) {
    return "🔥 HOT! Perfekte Bedingungen für Barsch!";
  }
  if (score >= 50) {
    return "👌 Gute Bedingungen – Barsche sind aktiv!";
  }
  return "❄️ Eher schwierig – aber probier langsam und flach!";
}
