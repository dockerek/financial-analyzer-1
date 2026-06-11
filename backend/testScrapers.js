const Techcombank = require('./scrapers/techcombank.js');
const VPBank = require('./scrapers/vpbank.js');
const Sacombank = require('./scrapers/sacombank.js');
const MBBank = require('./scrapers/mbbank.js');
const Vietcombank = require('./scrapers/vietcombank.js');
const BIDV = require('./scrapers/bidv.js');

async function testAllScrapers() {
    console.log('Testing all bank scrapers...\n');
    
    const scrapers = [
        { name: 'Techcombank', scraper: Techcombank },
        { name: 'VPBank', scraper: VPBank },
        { name: 'Sacombank', scraper: Sacombank },
        { name: 'MB Bank', scraper: MBBank },
        { name: 'Vietcombank', scraper: Vietcombank },
        { name: 'BIDV', scraper: BIDV }
    ];
    
    for (const { name, scraper } of scrapers) {
        try {
            console.log(`Testing ${name}...`);
            const data = await scraper.scrape();
            
            if (data && data.length > 0) {
                const firstPackage = data[0];
                if (firstPackage.interestRate > 0) {
                    console.log(`✅ ${name} SUCCESS - Found ${data.length} packages with rates`);
                    console.log(`   Example: ${firstPackage.packageName} - ${firstPackage.interestRate}%`);
                } else {
                    console.log(`❌ ${name} - Used fallback data (rate = 0 or fallback)`);
                }
            } else {
                console.log(`❌ ${name} - No data returned`);
            }
        } catch (error) {
            console.log(`❌ ${name} - Error: ${error.message}`);
        }
        console.log();
    }
}

testAllScrapers().then(() => {
    console.log('All tests completed');
    process.exit(0);
}).catch(err => {
    console.error('Test failed:', err);
    process.exit(1);
});
