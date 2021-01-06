const { Telegraf } = require('telegraf');
const ytdl = require('ytdl-core');
const puppeteer = require('puppeteer');

const BOT_TOKEN = '1462024491:AAFMWRTy2NZj2wQ7rakitSYzK5DQtLbGg2g';
const PORT = process.env.PORT || 5000;
const URL = 'https://gentle-tundra-06412.herokuapp.com/';

const bot = new Telegraf(BOT_TOKEN);

bot.on('message', async ctx => {
    const url = ctx.message.text;

    if (!url) return;

    const isValidYoutubeUrl = await ytdl.validateURL(url);

    if (!isValidYoutubeUrl) return;

    await ctx.replyWithHTML('<strong>Start downloading... 👌</strong>')
    
    try {
        const mp3Link = await findYoutubeDownloadLink(url);

        await ctx.replyWithAudio(mp3Link);
    } catch (error) {
        console.log(error);
        return await ctx.replyWithHTML('<strong>Something has gone wrong, please check your connection ⭕😔</strong>')
    }


    await ctx.replyWithHTML('<strong>Successfully downloaded ✔️</strong>')
})

// bot.telegram.setWebhook(`${URL}/bot${BOT_TOKEN}`);
// bot.startWebhook(`/bot${BOT_TOKEN}`, null, PORT);
// bot.startPolling();

bot.launch();

const findYoutubeDownloadLink = async (youtubeLink) => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();

    await page.goto('https://ytmp3.cc/en13/');

    await page.$eval('#input', (el, youtubeLink) => el.value = youtubeLink, youtubeLink);
    
    await page.$eval('#submit', button => button.click() );

    await page.waitForSelector('#converter #buttons a', {visible: true});
    await page.waitForTimeout(100);

    const mp3Link = await page.$eval('#converter #buttons a', el => el.href);

    await browser.close();

    return mp3Link;
}