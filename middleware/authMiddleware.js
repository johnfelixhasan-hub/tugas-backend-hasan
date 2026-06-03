'use strict';

// Middleware untuk proteksi route (harus login)
const protect = (req, res, next) => {
  if (req.session && req.session.user) {
    next();
  } else {
    res.status(401).json({
      success: false,
      message: 'Anda belum login. Silakan login terlebih dahulu.'
    });
  }
};

// Middleware untuk admin only
const adminOnly = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Akses ditolak. Hanya admin yang dapat mengakses.'
    });
  }
};

// Middleware untuk cek sudah login (redirect ke dashboard jika sudah)
const guestOnly = (req, res, next) => {
  if (req.session && req.session.user) {
    return res.status(400).json({
      success: false,
      message: 'Anda sudah login'
    });
  }
  next();
};

module.exports = { protect, adminOnly, guestOnly };