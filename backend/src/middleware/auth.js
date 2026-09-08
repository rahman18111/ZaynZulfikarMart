import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Akses ditolak. Token tidak ditemukan.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'zaynzulfikar_super_secret_jwt_key_2026_luxury_pos');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Sesi login telah berakhir atau token tidak valid.' });
  }
};
