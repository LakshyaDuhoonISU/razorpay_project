const QRCode = require('qrcode');

const generateUPIQR = async (upiId, name, amount) => {
    const upiUrl = `upi://pay?pa=${upiId}&pn=${name}&am=${amount}&cu=INR`;
    const qrCode = await QRCode.toDataURL(upiUrl);
    return qrCode;
};

module.exports = generateUPIQR;