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
    'https://www.sacombank.com.vn/ca-nhan/vay/vay-tieu-dung.html'
];

(async () => {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    for (const url of urls) {
        try {
            const page = await browser.newPage();
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
            await page.waitForTimeout(8000);
            
            const title = await page.title();
            const finalUrl = page.url();
            const bodySnippet = await page.evaluate(() => document.body.innerText.slice(0, 800));
            
            console.log('\n====', url, '====');
            console.log('Final URL:', finalUrl);
            console.log('Title:', title);
            console.log('Body (first 800 chars):', bodySnippet.substring(0, 300).replace(/\n+/g, ' '));
            
            await page.close();
        } catch (e) {
            console.error('ERROR', url, e.message);
        }
    }
    
    await browser.close();
})();
