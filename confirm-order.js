// confirm-order.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message:'Method Not Allowed' });

  try {
    const body = req.body || {};
    const { orderId, status = 'confirmed', note = '' } = body;
    const fs = require('fs');
    const path = '/tmp/orders.json';
    let orders = [];
    if (fs.existsSync(path)) {
      try { orders = JSON.parse(fs.readFileSync(path)); } catch(e) { orders = []; }
    }
    let updated = false;
    orders = orders.map(o => {
      if (o.orderId === orderId) { o.status = status; o.verifiedAt = new Date().toISOString(); o.note = note; updated = true; }
      return o;
    });
    fs.writeFileSync(path, JSON.stringify(orders, null, 2));

    const BOT = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT = process.env.CHAT_ID || process.env.OWNER_ID;
    if (updated && BOT && CHAT) {
      const text = `✅ Order ${orderId} updated -> ${status}\n${note ? 'Note: '+note : ''}`;
      await fetch(`https://api.telegram.org/bot${BOT}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ chat_id: CHAT, text })
      });
    }

    res.json({ ok: true, updated });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok:false, message:'fail' });
  }
}
