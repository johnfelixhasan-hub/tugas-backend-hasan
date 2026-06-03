'use strict';
const { User } = require('../models');

// @desc    Halaman Login (GET)
// @route   GET /api/auth/login
// @access  Public
const loginPage = (req, res) => {
  if (req.session.user) {
    return res.redirect('/api/dashboard');
  }
  res.json({
    success: true,
    message: 'Silakan login',
    data: {
      email: 'string',
      password: 'string'
    }
  });
};

// @desc    Proses Login (POST)
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email dan password wajib diisi'
      });
    }

    // Cari user berdasarkan email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah'
      });
    }

    // Cek password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah'
      });
    }

    // Simpan ke session
    req.session.user = {
      id: user.id,
      nama: user.nama,
      email: user.email,
      role: user.role
    };

    res.json({
      success: true,
      message: 'Login berhasil',
      data: {
        user: req.session.user,
        redirect: '/api/dashboard'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Proses Register (POST)
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { nama, email, password, role } = req.body;

    if (!nama || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nama, email, dan password wajib diisi'
      });
    }

    // Cek email sudah terdaftar
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Email sudah terdaftar'
      });
    }

    // Buat user baru
    const user = await User.create({
      nama,
      email,
      password,
      role: role || 'user'
    });

    res.status(201).json({
      success: true,
      message: 'Registrasi berhasil, silakan login',
      data: {
        id: user.id,
        nama: user.nama,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        errors: error.errors.map(e => e.message)
      });
    }
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Logout
// @route   POST /api/auth/logout
// @access  Private
const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Gagal logout'
      });
    }
    res.json({
      success: true,
      message: 'Logout berhasil'
    });
  });
};

// @desc    Get user yang sedang login
// @route   GET /api/auth/me
// @access  Private
const getMe = (req, res) => {
  if (req.session.user) {
    res.json({
      success: true,
      data: { user: req.session.user }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Tidak ada session'
    });
  }
};

module.exports = { loginPage, login, register, logout, getMe };