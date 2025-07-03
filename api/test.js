
export default function handler(req, res) {
  res.status(200).json({ 
    message: 'Medical AI Assistant API is working!',
    timestamp: new Date().toISOString()
  });
}
