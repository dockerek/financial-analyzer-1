const BaseScraper = require('./baseScraper');

class MBBankScraper extends BaseScraper {
    constructor() {
        super('MB Bank', [
            'https://www.mbbank.com.vn/Fee',
            'https://www.mbbank.com.vn/26/36/36/san-pham-all/cho-vay'
        ]);
    }

    getFallbackData() {
        return [
            { packageName: "Vay sản xuất kinh doanh", interestRate: 6.0, maxTerm: 120, minLoan: 100000000, maxLoan: 10000000000, pros: "Lãi suất cạnh tranh", cons: "Yêu cầu TSĐB", requirements: "Giấy phép kinh doanh" },
            { packageName: "MISA Lending - MB Bank", interestRate: 5.8, maxTerm: 120, minLoan: 100000000, maxLoan: 10000000000, pros: "Gói vay số hóa", cons: "Yêu cầu kết nối MISA", requirements: "Kết nối MISA" }
        ];
    }
}

module.exports = new MBBankScraper();
