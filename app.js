if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

var superagent = require('superagent');
var nodemailer = require('nodemailer');
const {
    setIntervalAsync,
    clearIntervalAsync
} = require('set-interval-async/dynamic');

require('superagent-cache')(superagent, {expiration:3600});

async function sendMail(humidity) {
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.GOOGLE_ADDR,
            pass: process.env.GOOGLE_KEY
        }
    });
    let info = await transporter.sendMail({
        from: process.env.GOOGLE_ADDR,
        to: process.env.RECIPIENT,
        subject: 'Humidity Alert',
        text: 'Humidity Alert!  Humidity Level: ' + humidity
    });
    return info;
}

async function run() {
    try {
        let url = process.env.WEATHER_API_BASE_ADDRESS + 'weather?zip=' + process.env.ZIPCODE + '&appid=' + process.env.WEATHER_API_KEY;
        const res = await superagent.get(url);
        console.log(res);
        let humidity = res.body.main.humidity;
        if(humidity < 30) {
            let info = await sendMail(humidity);
            console.log(info);
        }
    } catch(err) {
        console.log(err);
    }
}

run().then(() => setIntervalAsync(async () => run, 60 * 60 * 1000));

