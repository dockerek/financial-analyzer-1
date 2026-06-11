const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const urls = [
  'https://www.mbbank.com.vn/26/36/36/san-pham-all/cho-vay',
  'https://www.mbbank.com.vn/ca-nhan/vay',
  'https://www.mbbank.com.vn/Fee',
  'https://www.techcombank.com/khach-hang-ca-nhan/vay/vay-mua-o-to',
  'https://www.techcombank.com/khach-hang-ca-nhan/vay/vay-tieu-dung',
  'https://www.techcombank.com/khach-hang-ca-nhan/vay',
  'https://www.vpbank.com.vn/ca-nhan/vay',
  'https://www.sacombank.com.vn/ca-nhan/vay.html',
  'https://www.sacombank.com.vn/ca-nhan/vay/vay-mua-xe.html',
  'https://www.sacombank.com.vn/ca-nhan/vay/vay-tieu-dung.html',
];

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  for (const url of urls) {
    try {
      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForTimeout(8000);
      const title = await page.title();
      const final = page.url();
      const response = await page.mainFrame().response();
      const status = response ? response.status() : 'unknown';
      const body = await page.evaluate(() => document.body.innerText.slice(0, 1200));
      console.log('\n====', url, '====');
      console.log('finalUrl', final);
      console.log('status', status);
      console.log('title', title);
      console.log('bodySnippet', JSON.stringify(body.replace(/\n+/g, ' ').slice(0, 500)));
      await page.close();
    } catch (e) {
      console.error('\nERROR', url, e.message);
    }
  }
  await browser.close();
})();
