const fs = require('fs');
const path = require('path');

const vietcombank = require('./vietcombank');
const bidv = require('./bidv');
const mbbank = require('./mbbank');
const techcombank = require('./techcombank');
const vpbank = require('./vpbank');
const sacombank = require('./sacombank');

const DB_PATH = path.join(__dirname, '../../database/loans.json');

async function runAllScrapers() {
    console.log('='.repeat(60));
    console.log(`[${new Date().toISOString()}] 🚀 BẮT ĐẦU SCRAPE TOÀN BỘ NGÂN HÀNG`);
    console.log('='.repeat(60));
    
    const scrapers = [
        { name: 'Vietcombank', scraper: vietcombank },
        { name: 'BIDV', scraper: bidv },
        { name: 'MB Bank', scraper: mbbank },
        { name: 'Techcombank', scraper: techcombank },
        { name: 'VPBank', scraper: vpbank },
        { name: 'Sacombank', scraper: sacombank }
    ];
    
    const allLoans = [];
    let idCounter = 1;
    const results = [];
    
    for (const item of scrapers) {
        try {
            const loans = await item.scraper.scrape();
            for (const loan of loans) {
                allLoans.push({
                    id: idCounter++,
                    name: item.name,
                    packageName: loan.packageName,
                    interestRate: loan.interestRate,
                    processingFee: 0.5,
                    maxTerm: loan.maxTerm,
                    minLoan: loan.minLoan,
                    maxLoan: loan.maxLoan,
                    maxLTV: 80,
                    minIncome: 8000000,
                    pros: loan.pros,
                    cons: loan.cons,
                    requirements: loan.requirements,
                    source: `${item.name} - Web Scraping ${new Date().toLocaleString()}`,
                    loanTypes: ["collateral"],
                    lastUpdated: new Date().toISOString()
                });
            }
            results.push({ bank: item.name, status: 'success', count: loans.length });
        } catch (error) {
            console.error(`❌ ${item.name} thất bại:`, error.message);
            results.push({ bank: item.name, status: 'error', error: error.message });
        }
    }
    
    // Lưu vào database
    const dbDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(allLoans, null, 2));
    
    console.log('='.repeat(60));
    console.log(`[${new Date().toISOString()}] 📊 KẾT QUẢ:`);
    results.forEach(r => {
        if (r.status === 'success') {
            console.log(`   ✅ ${r.bank}: ${r.count} gói vay`);
        } else {
            console.log(`   ❌ ${r.bank}: ${r.error}`);
        }
    });
    console.log(`📁 Đã lưu ${allLoans.length} gói vay vào database`);
    console.log('='.repeat(60));
    
    return { results, totalLoans: allLoans.length };
}

// Chạy nếu gọi trực tiếp
if (require.main === module) {
    runAllScrapers().catch(console.error);
}

module.exports = runAllScrapers;
