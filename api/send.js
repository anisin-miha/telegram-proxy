import fetch from "node-fetch";

export default async function handler(req, res) {
  // 👇 Ставим заголовки CORS СРАЗУ
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    // 👇 Просто завершаем preflight-запрос
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  try {
    const { message } = req.body;

    const chatIds = process.env.TELEGRAM_CHAT_IDS.split(",").map((id) => id.trim());

    const telegramRequests = chatIds.map((chatId) =>
      fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: "HTML",
        }),
      })
    );

    const telegramResponses = await Promise.all(telegramRequests);
    const results = await Promise.all(
      telegramResponses.map((response) => response.json())
    );

    res.status(200).json({ ok: true, results });
  } catch (error) {
    console.error("Ошибка при отправке:", error);
    res.status(500).json({ error: "Ошибка при отправке в Telegram" });
  }
}
