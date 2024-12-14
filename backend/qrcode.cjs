const QRCode = require('qrcode');

const generateUPIQR = async (upiId, name, amount) => {
    const upiUrl = `upi://pay?pa=${upiId}&pn=${name}&am=${amount}&cu=INR`; // UPI URL format
    const qrCode = await QRCode.toDataURL(upiUrl); // Generate QR code
    return qrCode;
};

module.exports = generateUPIQR;