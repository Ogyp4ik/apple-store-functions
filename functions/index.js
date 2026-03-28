const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');

admin.initializeApp();

const BOT_TOKEN = "8754493631:AAH9vZvWTS-SOHwk5Y0y7Rbr6klwmgeSgN0";
const GROUP_CHAT_ID = "-1003850642883";
const ADMIN_IDS = ["7441684316", "1317122793", "1015865721"];

// Функция отправки сообщения в Telegram
async function sendTelegramMessage(chatId, text) {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    try {
        await axios.post(url, {
            chat_id: chatId,
            text: text,
            parse_mode: 'HTML'
        });
        console.log(`✅ Отправлено в ${chatId}`);
    } catch (error) {
        console.error('❌ Ошибка:', error.message);
    }
}

// Триггер на создание нового заказа
exports.onNewOrder = functions.firestore
    .document('orders/{orderId}')
    .onCreate(async (snapshot, context) => {
        const order = snapshot.data();
        console.log(`🆕 Новый заказ: ${order.productName} от ${order.username}`);
        
        const date = new Date().toLocaleString('ru-RU');
        
        const message = `
🛍 НОВЫЙ ЗАКАЗ!

👤 Клиент: ${order.username ? '@' + order.username : 'Не указан'}
🆔 ID: ${order.userId || '—'}

📱 Товар: ${order.productName}
💾 Память: ${order.storage || '—'}
🎨 Цвет: ${order.color || '—'}
💰 Сумма: ${(order.price || 0).toLocaleString()} ₽

📅 Время: ${date}
        `.trim();
        
        // Отправляем в группу
        await sendTelegramMessage(GROUP_CHAT_ID, message);
        
        // Отправляем каждому админу
        for (const adminId of ADMIN_IDS) {
            await sendTelegramMessage(adminId, message);
        }
    });
