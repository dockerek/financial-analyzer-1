const BaseScraper = require('./baseScraper');

class TechcombankScraper extends BaseScraper {
    constructor() {
        super('Techcombank', [
            'https://techcombank.com/khach-hang-ca-nhan/vay',
            'https://techcombank.com/khach-hang-ca-nhan/vay/vay-tieu-dung'
        ]);
    }

    getFallbackData() {
        return [
            { packageName: "Vay doanh nghiệp SME", interestRate: 5.99, maxTerm: 120, minLoan: 100000000, maxLoan: 8000000000, pros: "Lãi suất thấp", cons: "Phí xử lý cao", requirements: "BCTC 2 năm" },
            { packageName: "Vay tín chấp doanh nghiệp", interestRate: 13.78, maxTerm: 60, minLoan: 50000000, maxLoan: 500000000, pros: "Không cần TSĐB", cons: "Lãi suất cao", requirements: "Lịch sử tín dụng tốt" }
        ];
    }
}

module.exports = new TechcombankScraper();
