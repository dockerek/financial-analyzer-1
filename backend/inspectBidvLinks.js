const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  for (const url of ['https://bidv.com.vn/vn/ca-nhan', 'https://bidv.com.vn/vn/doanh-nghiep']) {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(12000);
    const links = await page.evaluate(() => Array.from(document.querySelectorAll('a')).map(a => ({text: a.innerText.replace(/\s+/g, ' ').trim(), href: a.href})).filter(l => l.text || l.href).slice(0, 100));
    console.log('---', url, '---');
    console.log(JSON.stringify(links, null, 2));
    await page.close();
  }
  await browser.close();
})();
