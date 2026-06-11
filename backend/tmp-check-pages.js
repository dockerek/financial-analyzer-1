const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const urls = [
  'https://www.mbbank.com.vn/lai-suat/',
  'https://www.mbbank.com.vn/khach-hang-ca-nhan/vay-von',
  'https://www.techcombank.com.vn/lai-suat/',
  'https://www.techcombank.com.vn/khach-hang-ca-nhan/vay-von',
  'https://www.vpbank.com.vn/lai-suat',
  'https://www.vpbank.com.vn/khach-hang-ca-nhan/vay-von',
  'https://www.sacombank.com.vn/lai-suat',
  'https://www.sacombank.com.vn/ca-nhan/vay-von'
];
(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  for (const url of urls) {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7' });
    console.log('URL:', url);
    try {
      const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(10000);
      console.log('finalURL:', page.url());
      console.log('status:', response ? response.status() : 'no response');
      console.log('title:', await page.title());
      const bodyText = await page.evaluate(() => document.body.innerText.slice(0, 1000));
      console.log('bodyTextSnippet:', bodyText.replace(/\n/g, ' | ').slice(0, 800));
      const percentCount = await page.evaluate(() => (document.body.innerText.match(/%/g) || []).length);
      console.log('percentCount:', percentCount);
    } catch (err) {
      console.error('ERROR:', err.message);
    }
    await page.close();
    console.log('---');
  }
  await browser.close();
})();
