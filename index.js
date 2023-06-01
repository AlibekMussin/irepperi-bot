const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, {polling: true});
const webAppUrl = process.env.APP_URL;
const app = express();


app.use(express.json());
app.use(cors())
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text == '/start')
  {
    await bot.sendMessage(chatId, 'Нажмите на кнопку Каталог товаров и выберите товары, которые вам нужны', {
      reply_markup:{
        inline_keyboard: [
          [{text: "Каталог товаров", web_app:{url: webAppUrl }}]
        ]
      }
    });    
  }
  
});

app.post('/web-data', async (req, res) => {
  console.log('1111');
  console.log(req.body);
  const {queryId, title, text, number, payment, products, token, total, delivery } = req.body;
  console.log(queryId);
  console.log('products', products);
  
  const message_products = products.map((product) => {
    return `${product.product_name}. Количество: ${product.products_count}. Стоимость: ${product.common_price} тнг.`;
  }).join('\n');
  let  message_delivery = '';
  if (delivery>0)
  {
    message_delivery = ' (В том числе доставка: '+delivery+' тнг.)';
  }
  const message_total = '\n\nОбщая стоимость: '+total+' тнг'+message_delivery;

  try {
    const message_text = title+'\n\nВы приобретаете:\n'+message_products+message_total+'\n\n'+text+'\n'+number+'\n'+payment;
      await bot.answerWebAppQuery(queryId, {
          type: 'article',
          id: queryId,
          title: 'Успешная покупка',
          input_message_content: {
              message_text: message_text
          }
      })
      return res.status(200).json({});
  } catch (e) {
    console.error(e);
    return res.status(500).json({})
  }
})

const PORT = 8009;

app.listen(PORT, () => console.log('server started on PORT ' + PORT))