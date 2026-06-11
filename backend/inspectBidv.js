const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
  await page.goto('https://www.bidv.com.vn/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(12000);
  const text = await page.evaluate(() => ({
    url: window.location.href,
    title: document.title,
    body: document.body.innerText.slice(0, 5000),
    links: Array.from(document.querySelectorAll('a')).map(a => ({text: a.innerText.replace(/\s+/g, ' ').trim(), href: a.href})).slice(0, 80)
  }));
  console.log('URL:', text.url);
  console.log('TITLE:', text.title);
  console.log('BODY_SNIPPET:');
  console.log(text.body);
  console.log('LINKS:');
  console.log(JSON.stringify(text.links, null, 2));
  await browser.close();
})();
