import express from 'express';
import multer from 'multer';
import fetch from 'node-fetch';

const app = express();
const upload = multer();

const BOT_TOKEN = '7329243125:AAFao6lHDfTuXd6pZYpM27ytPdbnUZCEHLw';
const CHAT_ID = '7475467697';

app.post('/upload-proof', upload.single('photo'), async (req, res) => {
  try {
    const photoBuffer = req.file.buffer;
    const caption = req.body.caption || 'Bukti Pembayaran';

    const formData = new FormData();
    formData.append('chat_id', CHAT_ID);
    formData.append('caption', caption);
    formData.append('photo', photoBuffer, { filename: 'proof.jpg' });

    const tgResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
      method: 'POST',
      body: formData
    });

    const tgResult = await tgResponse.json();
    if (tgResult.ok) {
      res.json({ success: true });
    } else {
      res.json({ success: false, error: tgResult });
    }
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

app.listen(3000, () => console.log('Server berjalan di http://localhost:3000'));
