import fetch from 'node-fetch'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed')
  }

  const { name, phone, email, date, people } = req.body

  const message = `
📩 <b>Новая заявка</b>
👤 Имя: ${name}
📞 Телефон: ${phone}
📧 Email: ${email}
📅 Дата: ${date}
👥 Кол-во человек: ${people}
  `.trim()

  try {
    const telegramRes = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: process.env.CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      })
    })

    const result = await telegramRes.json()
    console.log('Telegram ответ:', result)

    if (!telegramRes.ok) throw new Error('Telegram API error')

    res.status(200).json({ ok: true })
  } catch (error) {
    console.error('Ошибка при отправке:', error)
    res.status(500).json({ error: 'Ошибка при отправке в Telegram' })
  }
}
