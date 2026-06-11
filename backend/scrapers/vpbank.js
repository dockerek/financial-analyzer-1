const BaseScraper = require('./baseScraper');

class VPBankScraper extends BaseScraper {
    constructor() {
        super('VPBank', [
            'https://www.vpbank.com.vn/ca-nhan/vay',
            'https://www.vpbank.com.vn/ca-nhan/vay'
        ]);
    }

    getFallbackData() {
        return [
            { packageName: "Vay doanh nghiệp vừa và nhỏ", interestRate: 6.9, maxTerm: 120, minLoan: 50000000, maxLoan: 6000000000, pros: "Thủ tục nhanh", cons: "Phí xử lý", requirements: "Hoạt động có lãi" },
            { packageName: "Cho vay bổ sung vốn lưu động siêu nhanh", interestRate: 7.5, maxTerm: 12, minLoan: 100000000, maxLoan: 3000000000, pros: "Phê duyệt nhanh trong 5 giờ", cons: "Kỳ hạn ngắn hạn", requirements: "Có dòng tiền qua tài khoản tốt" }
        ];
    }
}

module.exports = new VPBankScraper();
