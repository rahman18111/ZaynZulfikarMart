import pool from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username dan password wajib diisi.' });
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username.trim()]);
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Username atau password salah.' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Username atau password salah.' });
    }

    const payload = {
      id: user.id,
      username: user.username,
      nama_lengkap: user.nama_lengkap,
      role: user.role
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'zaynzulfikar_super_secret_jwt_key_2026_luxury_pos',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login berhasil. Selamat datang kembali!',
      token,
      user: payload
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server saat login.' });
  }
};

export const getMe = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, username, nama_lengkap, role, created_at FROM users WHERE id = ?', [req.user.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.' });
    }
    res.json({ success: true, user: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};
