const { Telegraf } = require('telegraf');
const ytdl = require('ytdl-core');
const got = require('got');
const puppeteer = require('puppeteer');

require('promise-any-polyfill');

const token = '1462024491:AAFMWRTy2NZj2wQ7rakitSYzK5DQtLbGg2g';

const bot = new Telegraf(token);

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

bot.launch();

const findYoutubeDownloadLink = async (youtubeLink) => {
    const browser = await puppeteer.launch();
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

findYoutubeDownloadLink('https://www.youtube.com/watch?v=dXjKh66BR2U');