const BaseScraper = require('./baseScraper');

class BIDVScraper extends BaseScraper {
    constructor() {
        super('BIDV', [
            'https://bidv.com.vn/vn/ca-nhan',
            'https://bidv.com.vn/vn/doanh-nghiep',
            'http://bidv.com.vn/lai-suat/',
            'http://bidv.com.vn/ca-nhan/vay-von'
        ]);
    }

    getFallbackData() {
        return [
            { packageName: "Vay vốn lưu động", interestRate: 7.0, maxTerm: 12, minLoan: 30000000, maxLoan: 10000000000, pros: "Giải ngân nhanh", cons: "Lãi suất thay đổi", requirements: "Giấy tờ chứng minh SXKD" },
            { packageName: "Vay trung dài hạn có TSĐB", interestRate: 8.2, maxTerm: 84, minLoan: 100000000, maxLoan: 10000000000, pros: "Lãi suất cố định ưu đãi", cons: "Lãi suất sau ưu đãi thả nổi", requirements: "Phương án/dự án SXKD" }
        ];
    }
}

module.exports = new BIDVScraper();
