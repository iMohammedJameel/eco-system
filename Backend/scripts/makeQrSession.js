// إنشاء QR session حقيقية لاختبار فلو الإيداع العام
const mongoose = require('mongoose');
require('dotenv').config();
const Machine = require('../models/Machine');
const User = require('../models/User');
const QRSession = require('../models/QRSession');
const crypto = require('crypto');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const machine = await Machine.findOne({ status: 'active' });
  const user = await User.findOne({ email: 'user1@ecocycle.com' });
  const token = crypto.randomBytes(16).toString('hex');
  await QRSession.create({
    token,
    user: user._id,
    machine: machine._id,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
  });
  console.log('QR_TOKEN=' + token);
  console.log('MACHINE=' + machine.name);
  await mongoose.disconnect();
})();
