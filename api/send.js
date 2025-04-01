import fetch from "node-fetch";

export default async function handler(req, res) {
  // 👇 Разрешаем CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // 👇 Обрабатываем preflight-запрос (OPTIONS)
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const { name, phone, email, date, people } = req.body;

  const message = `
📩 <b>Новая заявка</b>
👤 Имя: ${name}
📞 Телефон: ${phone}
📧 Email: ${email}
📅 Дата: ${date}
👥 Кол-во человек: ${people}
  `.trim();

  // Получаем массив chat_id из переменной окружения
  const chatIds = process.env.TELEGRAM_CHAT_IDS.split(",").map((id) =>
    id.trim()
  );

  try {
    // Отправляем сообщение каждому chat_id
    const telegramRequests = chatIds.map((chatId) =>
      fetch(
        `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: "HTML",
          }),
        }
      )
    );

    // Ожидаем завершения всех запросов
    const telegramResponses = await Promise.all(telegramRequests);
    const results = await Promise.all(
      telegramResponses.map((response) => response.json())
    );

    // Проверяем наличие ошибок
    for (let i = 0; i < telegramResponses.length; i++) {
      if (!telegramResponses[i].ok) {
        throw new Error(`Telegram API error for chat_id ${chatIds[i]}`);
      }
    }

    console.log("Telegram ответы:", results);
    res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Ошибка при отправке:", error);
    res.status(500).json({ error: "Ошибка при отправке в Telegram" });
  }
}
