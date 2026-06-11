const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const pdfParseModule = require('pdf-parse');
const https = require('https');
const http = require('http');
const BaseScraper = require('./baseScraper');

puppeteer.use(StealthPlugin());

class SacombankScraper extends BaseScraper {
    constructor() {
        super('Sacombank', [
            'https://www.sacombank.com.vn/cong-cu/lai-suat.html'
        ]);
    }

    async scrape() {
        console.log(`[${new Date().toISOString()}] 🔄 Bắt đầu scrape ${this.bankName}...`);
        
        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                const result = await this._scrapePDF();
                if (result && result.length > 0) {
                    console.log(`[${new Date().toISOString()}] ✅ ${this.bankName}: ${result.length} gói vay từ PDF`);
                    return result;
                }
            } catch (error) {
                console.error(`[${new Date().toISOString()}] ❌ ${this.bankName} lần ${attempt} thất bại:`, error.message);
                if (attempt < this.maxRetries) {
                    await this.wait(this.retryDelay);
                }
            }
        }
        
        console.log(`[${new Date().toISOString()}] ⚠️ ${this.bankName}: Dùng fallback data`);
        return this.getFallbackData();
    }

    async _scrapePDF() {
        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        try {
            const page = await browser.newPage();
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
            await page.setViewport({ width: 1280, height: 720 });
            
            const url = 'https://www.sacombank.com.vn/cong-cu/lai-suat.html';
            console.log(`   → Truy cập: ${url}`);
            
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
            await this.wait(3000);
            
            // Find PDF links
            const pdfLinks = await page.evaluate(() => {
                const links = [];
                document.querySelectorAll('a[href*=".pdf"]').forEach(el => {
                    const href = el.getAttribute('href');
                    if (href && href.includes('lai-suat')) {
                        links.push({
                            url: href.startsWith('http') ? href : (href.startsWith('/') ? 'https://www.sacombank.com.vn' + href : 'https://www.sacombank.com.vn/' + href),
                            text: el.innerText
                        });
                    }
                });
                return links;
            });

            console.log(`   📄 Tìm được ${pdfLinks.length} PDF links`);
            
            if (pdfLinks.length === 0) {
                console.warn(`   ⚠️ Không tìm được PDF links`);
                return [];
            }

            // Download and parse first loan-related PDF
            for (const pdfLink of pdfLinks) {
                try {
                    console.log(`   ⬇️  Tải PDF: ${pdfLink.text}`);
                    const pdfData = await this._downloadPDF(pdfLink.url);
                    const loans = await this._parsePDF(pdfData);
                    
                    if (loans && loans.length > 0) {
                        console.log(`   ✅ Extracted ${loans.length} loans từ PDF`);
                        return loans;
                    }
                } catch (error) {
                    console.warn(`   ⚠️ Lỗi khi parse PDF ${pdfLink.text}:`, error.message);
                }
            }

            return [];
        } finally {
            await browser.close();
        }
    }

    async _downloadPDF(url) {
        return new Promise((resolve, reject) => {
            const protocol = url.startsWith('https') ? https : http;
            const chunks = [];

            protocol.get(url, { timeout: 30000 }, (response) => {
                if (response.statusCode !== 200) {
                    return reject(new Error(`HTTP ${response.statusCode}`));
                }

                response.on('data', chunk => chunks.push(chunk));
                response.on('end', () => resolve(Buffer.concat(chunks)));
                response.on('error', reject);
            }).on('error', reject);
        });
    }

    async _parsePDF(pdfBuffer) {
        try {
            const pdfParse = pdfParseModule.default ? pdfParseModule.default : pdfParseModule;
            const data = await pdfParse(pdfBuffer);
            const text = data.text;
            
            console.log(`   📖 PDF có ${data.numpages} trang`);
            
            const loans = [];
            const foundRates = new Set();

            // Keywords để xác định dòng là vay
            const loanKeywords = ['vay', 'cho vay', 'hạn mức vay'];
            
            // Parse lãi suất từ text
            const parseRate = (text) => {
                if (!text) return null;
                const normalized = text.replace(/\./g, '').replace(/,/g, '.');
                const match = normalized.match(/([\d.,]+)\s*%/);
                if (match) {
                    const rate = parseFloat(match[1].replace(/\./g, '').replace(/,/g, '.'));
                    if (rate > 0 && rate < 50) return rate;
                }
                return null;
            };

            const lines = text.split('\n');
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                
                // Tìm dòng có từ khóa vay
                if (loanKeywords.some(kw => line.toLowerCase().includes(kw))) {
                    // Tìm lãi suất gần đó (trong 3 dòng tiếp theo)
                    for (let j = i; j < Math.min(i + 5, lines.length); j++) {
                        const rate = parseRate(lines[j]);
                        if (rate) {
                            const key = `${line.substring(0, 50)}|${rate}`;
                            if (!foundRates.has(key)) {
                                foundRates.add(key);
                                loans.push({
                                    packageName: line.substring(0, 100).trim() || 'Gói vay Sacombank',
                                    interestRate: rate,
                                    maxTerm: 120,
                                    minLoan: 50000000,
                                    maxLoan: 5000000000,
                                    pros: `Lãi suất ${rate}%/năm từ website Sacombank`,
                                    cons: 'Liên hệ ngân hàng để biết chi tiết',
                                    requirements: 'Phương án kinh doanh khả thi'
                                });
                            }
                            break;
                        }
                    }
                }
            }

            // Nếu không tìm được từ keywords, tìm tất cả các lãi suất
            if (loans.length === 0) {
                for (let i = 0; i < lines.length; i++) {
                    const rate = parseRate(lines[i]);
                    if (rate) {
                        const packageName = lines[i - 1]?.substring(0, 100) || 'Gói vay Sacombank';
                        const key = `${packageName}|${rate}`;
                        
                        if (!foundRates.has(key)) {
                            foundRates.add(key);
                            loans.push({
                                packageName: packageName.trim(),
                                interestRate: rate,
                                maxTerm: 120,
                                minLoan: 50000000,
                                maxLoan: 5000000000,
                                pros: `Lãi suất ${rate}%/năm từ website Sacombank`,
                                cons: 'Liên hệ ngân hàng để biết chi tiết',
                                requirements: 'Phương án kinh doanh khả thi'
                            });
                        }
                    }
                }
            }

            return loans;
        } catch (error) {
            console.error(`   ❌ Lỗi parse PDF:`, error.message);
            throw error;
        }
    }

    getFallbackData() {
        return [
            { packageName: "Vay sản xuất kinh doanh", interestRate: 7.49, maxTerm: 120, minLoan: 50000000, maxLoan: 5000000000, pros: "Thủ tục đơn giản", cons: "Lãi suất sau ưu đãi cao", requirements: "CMND, ĐKKD" },
            { packageName: "Thấu chi tài khoản doanh nghiệp", interestRate: 8.5, maxTerm: 12, minLoan: 50000000, maxLoan: 2000000000, pros: "Rút vốn nhanh chóng không cần làm hồ sơ giải ngân nhiều lần", cons: "Lãi suất cao hơn vay thế chấp thông thường", requirements: "Có doanh thu qua tài khoản Sacombank" }
        ];
    }

    async wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = new SacombankScraper();
