import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors()); // ✅ позволяет любым фронтам стучаться
app.use(express.json());

app.post("/api/send", async (req, res) => {
  const { name, phone, email, date, people } = req.body;

  const message = `
📩 <b>Новая заявка</b>
👤 Имя: ${name}
📞 Телефон: ${phone}
📧 Email: ${email}
📅 Дата: ${date}
👥 Кол-во человек: ${people}
  `.trim();

  const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
  const CHAT_ID = process.env.CHAT_ID;

  try {
    const tgResponse = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: message,
          parse_mode: "HTML",
        }),
      }
    );

    const result = await tgResponse.json();
    console.log("Telegram ответ:", result);

    if (!tgResponse.ok) throw new Error("Telegram API error");
    res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Ошибка при отправке:", error);
    res.status(500).json({ error: "Ошибка при отправке в Telegram" });
  }
});

app.listen(3000, () => console.log("Сервер запущен на порту 3000"));
