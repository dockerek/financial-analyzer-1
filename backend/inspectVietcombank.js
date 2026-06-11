const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
  await page.setExtraHTTPHeaders({ 'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7' });
  await page.goto('https://www.vietcombank.com.vn/lai-suat/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(8000);
  const info = await page.evaluate(() => ({
    url: window.location.href,
    title: document.title,
    body: document.body.innerText.slice(0, 6000),
    html: document.documentElement.innerHTML.slice(0, 6000)
  }));
  console.log('URL:', info.url);
  console.log('TITLE:', info.title);
  console.log('BODY_SNIPPET:');
  console.log(info.body);
  console.log('HTML_SNIPPET:');
  console.log(info.html);
  await browser.close();
})();
