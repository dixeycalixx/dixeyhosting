// create-order.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  try {
    const { product = 'Unknown', price = '' } = req.body || {};
    const orderId = `${Date.now().toString(36)}-${Math.floor(Math.random()*9000+1000)}`;
    const order = { orderId, product, price, status: 'waiting_payment', createdAt: new Date().toISOString() };

    // save to /tmp/orders.json
    const fs = require('fs');
    const path = '/tmp/orders.json';
    let orders = [];
    if (fs.existsSync(path)) {
      try { orders = JSON.parse(fs.readFileSync(path)); } catch(e){ orders = []; }
    }
    orders.push(order);
    fs.writeFileSync(path, JSON.stringify(orders, null, 2));

    // send notification to owner via bot (optional)
    const BOT = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT = process.env.CHAT_ID || process.env.OWNER_ID;
    if (BOT && CHAT) {
      const text = `🆕 New Order Created\n• OrderID: ${orderId}\n• Product: ${product}\n• Price: Rp${price}\nStatus: waiting_payment`;
      await fetch(`https://api.telegram.org/bot${BOT}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ chat_id: CHAT, text })
      });
    }

    res.json({ ok: true, orderId });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok:false, message:'fail' });
  }
}
