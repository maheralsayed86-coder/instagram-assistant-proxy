export default function handler(req, res) {
  // حماية باستخدام المفتاح السري
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== process.env.API_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // لو المفتاح صحيح
  res.status(200).json({
    status: "ok",
    message: "✅ Status route is working!"
  });
}
