const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Import các web scraper (đã có sẵn)
const vietcombankScraper = require('./scrapers/vietcombank');
const bidvScraper = require('./scrapers/bidv');
const mbbankScraper = require('./scrapers/mbbank');
const techcombankScraper = require('./scrapers/techcombank');
const vpbankScraper = require('./scrapers/vpbank');
const sacombankScraper = require('./scrapers/sacombank');

// ==================== DATABASE ====================
const DB_PATH = path.join(__dirname, '../database/loans.json');

// Đảm bảo thư mục database tồn tại
if (!fs.existsSync(path.dirname(DB_PATH))) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
}

// Dữ liệu mặc định (giống hệt file localhost của bạn)
const DEFAULT_LOANS = [
    { id: 1, name: "Vietcombank", packageName: "Cho vay SXKD", interestRate: 4.6, processingFee: 0.5, maxTerm: 12, minLoan: 50000000, maxLoan: 30000000000, maxLTV: 100, minIncome: 8000000, pros: "Lãi suất chỉ từ 4,6%/năm", cons: "Chỉ vay ngắn hạn", requirements: "Phương án SXKD khả thi", loanTypes: ["collateral"], source: "Vietcombank" },
    { id: 2, name: "BIDV", packageName: "Vay vốn lưu động", interestRate: 7.0, processingFee: 0.3, maxTerm: 12, minLoan: 30000000, maxLoan: 10000000000, maxLTV: 100, minIncome: 7000000, pros: "Giải ngân nhanh", cons: "Lãi suất thay đổi", requirements: "Giấy tờ chứng minh SXKD", loanTypes: ["collateral"], source: "BIDV" },
    { id: 3, name: "MB Bank", packageName: "MISA Lending", interestRate: 6.0, processingFee: 0.5, maxTerm: 120, minLoan: 100000000, maxLoan: 10000000000, maxLTV: 80, minIncome: 10000000, pros: "Gói vay số hóa", cons: "Yêu cầu hồ sơ số", requirements: "Kết nối MISA", loanTypes: ["collateral"], source: "MB Bank" },
    { id: 4, name: "Techcombank", packageName: "Vay SME", interestRate: 5.99, processingFee: 0.8, maxTerm: 120, minLoan: 100000000, maxLoan: 8000000000, maxLTV: 80, minIncome: 10000000, pros: "Lãi suất thấp", cons: "Phí xử lý cao", requirements: "BCTC 2 năm", loanTypes: ["collateral"], source: "Techcombank" },
    { id: 5, name: "VPBank", packageName: "Vay doanh nghiệp", interestRate: 6.9, processingFee: 0.6, maxTerm: 120, minLoan: 50000000, maxLoan: 6000000000, maxLTV: 75, minIncome: 8000000, pros: "Thủ tục nhanh", cons: "Phí xử lý", requirements: "Hoạt động có lãi", loanTypes: ["collateral"], source: "VPBank" },
    { id: 6, name: "Sacombank", packageName: "Vay SXKD", interestRate: 7.49, processingFee: 0.4, maxTerm: 120, minLoan: 50000000, maxLoan: 5000000000, maxLTV: 75, minIncome: 8000000, pros: "Thủ tục đơn giản", cons: "Lãi suất sau ưu đãi cao", requirements: "CMND, ĐKKD", loanTypes: ["collateral"], source: "Sacombank" },
    { id: 7, name: "VPBank", packageName: "Cho vay bổ sung vốn lưu động siêu nhanh", interestRate: 7.5, processingFee: 0.5, maxTerm: 12, minLoan: 100000000, maxLoan: 3000000000, maxLTV: 80, minIncome: 8000000, pros: "Phê duyệt nhanh trong 5 giờ", cons: "Kỳ hạn ngắn hạn", requirements: "Có dòng tiền qua tài khoản tốt", loanTypes: ["collateral"], source: "VPBank" },
    { id: 8, name: "Sacombank", packageName: "Thấu chi tài khoản doanh nghiệp", interestRate: 8.5, processingFee: 0.4, maxTerm: 12, minLoan: 50000000, maxLoan: 2000000000, maxLTV: 75, minIncome: 8000000, pros: "Rút vốn nhanh chóng không cần làm hồ sơ giải ngân nhiều lần", cons: "Lãi suất cao hơn vay thế chấp thông thường", requirements: "Có doanh thu qua tài khoản Sacombank", loanTypes: ["collateral"], source: "Sacombank" }
];

// Khởi tạo database nếu chưa có
function initDatabase() {
    if (!fs.existsSync(DB_PATH)) {
        fs.writeFileSync(DB_PATH, JSON.stringify(DEFAULT_LOANS, null, 2));
    }
}

// Đọc database
function readDatabase() {
    try {
        const data = fs.readFileSync(DB_PATH, 'utf8');
        return JSON.parse(data);
    } catch {
        return DEFAULT_LOANS;
    }
}

// Ghi database
function writeDatabase(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// ==================== API GIỐNG HỆT FILE LOCALHOST ====================
app.get('/api/loans', (req, res) => {
    const loans = readDatabase();
    res.json(loans);
});

app.get('/api/loans/:id', (req, res) => {
    const loans = readDatabase();
    const loan = loans.find(l => l.id == req.params.id);
    loan ? res.json(loan) : res.status(404).json({ error: 'Không tìm thấy' });
});

app.put('/api/loans/:id', (req, res) => {
    const loans = readDatabase();
    const index = loans.findIndex(l => l.id == req.params.id);
    if (index !== -1) {
        loans[index] = { ...loans[index], ...req.body };
        writeDatabase(loans);
        res.json(loans[index]);
    } else {
        res.status(404).json({ error: 'Không tìm thấy' });
    }
});

// ==================== API REFRESH - CHẠY WEB SCRAPER THẬT ====================
app.post('/api/loans/refresh', async (req, res) => {
    const scrapers = [
        { name: "Vietcombank", scraper: vietcombankScraper },
        { name: "BIDV", scraper: bidvScraper },
        { name: "MB Bank", scraper: mbbankScraper },
        { name: "Techcombank", scraper: techcombankScraper },
        { name: "VPBank", scraper: vpbankScraper },
        { name: "Sacombank", scraper: sacombankScraper }
    ];

    const allLoans = [];
    let idCounter = 1;
    const results = [];

    for (const bank of scrapers) {
        try {
            console.log(`🔄 Đang scrape ${bank.name}...`);
            const loans = await bank.scraper.scrape();

            for (const loan of loans) {
                allLoans.push({
                    id: idCounter++,
                    name: bank.name,
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
                    source: `${bank.name} - Web Scraping ${new Date().toLocaleString()}`,
                    loanTypes: ["collateral"]
                });
            }

            results.push({ bank: bank.name, status: 'success', count: loans.length });
            console.log(`✅ ${bank.name}: ${loans.length} gói vay`);

        } catch (error) {
            console.error(`❌ ${bank.name} thất bại:`, error.message);
            results.push({ bank: bank.name, status: 'error', error: error.message });
        }
    }

    if (allLoans.length > 0) {
        writeDatabase(allLoans);
    }

    res.json({
        success: true,
        results,
        totalLoans: allLoans.length,
        message: 'Đã cập nhật dữ liệu từ web scraper!'
    });
});

// API RESET về dữ liệu mặc định
app.post('/api/loans/reset', (req, res) => {
    writeDatabase(DEFAULT_LOANS);
    res.json({ success: true, message: 'Đã reset về dữ liệu mặc định' });
});

// Khởi tạo database
initDatabase();
// ==================== AI CONSULTANT WITH DEEPSEEK API ====================

/**
 * API: AI Chat với DeepSeek
 * POST /api/ai/chat
 * Body: { message: "câu hỏi của người dùng" }
 */
app.post('/api/ai/chat', async (req, res) => {
    const userMessage = req.body.message;

    if (!userMessage) {
        return res.status(400).json({
            success: false,
            error: 'Vui lòng nhập câu hỏi'
        });
    }

    // System prompt - định nghĩa vai trò của AI
    const systemPrompt = `Bạn là "Financial Analyzer Pro AI", một chuyên gia tư vấn tài chính cho doanh nghiệp vừa và nhỏ (SME) tại Việt Nam.

Nhiệm vụ của bạn:
1. Trả lời các câu hỏi về tài chính doanh nghiệp, vay vốn ngân hàng, quản lý rủi ro, dòng tiền.
2. Đưa ra lời khuyên thực tế, dễ hiểu, phù hợp với bối cảnh Việt Nam.
3. Trả lời bằng tiếng Việt, giọng chuyên nghiệp, thân thiện.

Hãy trả lời câu hỏi của người dùng một cách hữu ích và chính xác.`;

    try {
        console.log(`🤖 Gọi DeepSeek API với câu hỏi: ${userMessage.substring(0, 100)}...`);

        const response = await axios.post(
            'https://api.deepseek.com/v1/chat/completions',
            {
                model: 'deepseek-chat',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userMessage }
                ],
                temperature: 0.7,
                max_tokens: 1000,
                stream: false
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            }
        );

        const aiReply = response.data.choices[0].message.content;

        res.json({
            success: true,
            reply: aiReply
        });

    } catch (error) {
        console.error('DeepSeek API Error:', error.response?.data || error.message);

        let fallbackReply = "Xin lỗi, tôi đang gặp sự cố kết nối. Vui lòng thử lại sau.";

        if (error.response?.status === 401) {
            fallbackReply = "Lỗi xác thực API. Vui lòng kiểm tra lại API Key.";
        } else if (error.response?.status === 429) {
            fallbackReply = "Đã vượt quá giới hạn sử dụng. Vui lòng thử lại sau vài phút.";
        }

        res.status(500).json({
            success: false,
            error: error.message,
            reply: fallbackReply
        });
    }
});

/**
 * API: Phân tích & Trích xuất BCTC bằng AI DeepSeek (hoặc Fallback)
 * POST /api/ai/parse-bctc
 * Body: { text: "nội dung văn bản BCTC" }
 */
app.post('/api/ai/parse-bctc', async (req, res) => {
    const { text } = req.body;
    if (!text) {
        return res.status(400).json({
            success: false,
            error: 'Không nhận được dữ liệu văn bản BCTC'
        });
    }

    const hasApiKey = !!process.env.DEEPSEEK_API_KEY;
    if (!hasApiKey) {
        console.log("⚠️ DEEPSEEK_API_KEY chưa cấu hình. Đang chạy fallback rule-based parser...");
        const data = fallbackParseBCTC(text);
        return res.json({
            success: true,
            data,
            isFallback: true,
            message: 'Đã trích xuất dữ liệu bằng công cụ phân tích từ khóa (chưa có API Key)'
        });
    }

    const systemPrompt = `Bạn là một chuyên gia tài chính và trí tuệ nhân tạo chuyên phân tích Báo cáo tài chính (BCTC) của doanh nghiệp SME Việt Nam.
Nhiệm vụ của bạn là đọc đoạn văn bản được trích xuất từ file BCTC (có thể ở nhiều định dạng khác nhau, viết bằng tiếng Việt) và trích xuất/ước lượng chính xác nhất các thông số tài chính.

Hãy trích xuất và trả về đúng một đối tượng JSON có cấu trúc chính xác như sau (không kèm theo bất kỳ giải thích nào bên ngoài hoặc định dạng markdown code block):
{
  "companyName": "Tên doanh nghiệp",
  "businessYears": 5,
  "employeeCount": 50,
  "totalAssets": 10000000000,
  "currentAssets": 4000000000,
  "debt": 4000000000,
  "monthlyRevenue": 1250000000,
  "monthlyCOGS": 800000000,
  "monthlyOpex": 200000000,
  "monthlyDepreciation": 50000000,
  "loanAmount": 500000000,
  "loanTerm": 120,
  "collateralValue": 700000000,
  "dupontAnalysis": {
    "profitMargin": 8.5,
    "assetTurnover": 1.2,
    "equityMultiplier": 1.67,
    "roe": 17.03,
    "explanation": "Lý giải ngắn gọn bằng tiếng Việt về cơ cấu ROE của doanh nghiệp theo mô hình DuPont."
  }
}

Lưu ý quan trọng:
- Nếu văn bản ghi chép các số liệu theo năm (ví dụ: Doanh thu năm = 12 tỷ), hãy chia cho 12 để có số liệu tháng (Doanh thu tháng = 1 tỷ), do form nhập của hệ thống thiết kế theo tháng.
- Nếu không tìm thấy số liệu cụ thể nào, hãy dùng suy luận tài chính hợp lý để ước lượng hoặc tính toán dựa trên các số liệu khác (ví dụ: Vốn CSH = Tổng tài sản - Tổng nợ). Nếu hoàn toàn không thể có số liệu đó, trả về giá trị mặc định của form hoặc null.
- Hãy cố gắng chuẩn hóa các tên gọi tiếng Việt (ví dụ: "Doanh thu bán hàng và cung cấp dịch vụ", "Doanh thu thuần" -> doanh thu; "Giá vốn hàng bán" -> COGS; "Chi phí quản lý doanh nghiệp + Chi phí bán hàng" -> Opex).
- Đảm bảo JSON đầu ra hợp lệ và chỉ chứa chuỗi JSON đó mà không chứa ký tự nào khác.`;

    try {
        console.log(`🤖 Đang dùng DeepSeek để phân tách BCTC (${text.length} ký tự)...`);
        
        // Cắt bớt văn bản nếu quá dài để tránh quá tải token
        const truncatedText = text.substring(0, 25000);

        const response = await axios.post(
            'https://api.deepseek.com/v1/chat/completions',
            {
                model: 'deepseek-chat',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: truncatedText }
                ],
                temperature: 0.1
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 45000
            }
        );

        let aiReply = response.data.choices[0].message.content.trim();
        console.log("🤖 Nhận kết quả từ DeepSeek.");

        // Loại bỏ markdown code blocks nếu có
        if (aiReply.startsWith('```json')) {
            aiReply = aiReply.substring(7, aiReply.length - 3).trim();
        } else if (aiReply.startsWith('```')) {
            aiReply = aiReply.substring(3, aiReply.length - 3).trim();
        }

        const parsedData = JSON.parse(aiReply);
        res.json({
            success: true,
            data: parsedData
        });

    } catch (error) {
        console.error('DeepSeek Parse BCTC Error:', error.response?.data || error.message);
        console.log("⚠️ Lỗi gọi API DeepSeek. Chuyển sang fallback rule-based parser...");
        const data = fallbackParseBCTC(text);
        res.json({
            success: true,
            data,
            isFallback: true,
            error: error.message
        });
    }
});

// Hàm fallback trích xuất dữ liệu bằng keyword matching khi không có API Key hoặc gọi API lỗi
function fallbackParseBCTC(text) {
    const data = {
        companyName: "Công ty TNHH BCTC Trích Xuất (Fallback)",
        businessYears: 5,
        employeeCount: 50,
        totalAssets: 10000000000,
        currentAssets: 4000000000,
        debt: 4000000000,
        monthlyRevenue: 1250000000,
        monthlyCOGS: 800000000,
        monthlyOpex: 200000000,
        monthlyDepreciation: 50000000,
        loanAmount: 500000000,
        loanTerm: 120,
        collateralValue: 700000000,
        dupontAnalysis: {
            profitMargin: 8.5,
            assetTurnover: 1.2,
            equityMultiplier: 1.67,
            roe: 17.03,
            explanation: "Phân tích DuPont sử dụng dữ liệu được trích xuất bằng giải thuật phân tích từ khóa (Chế độ Fallback do chưa cấu hình hoặc lỗi kết nối DeepSeek API)."
        }
    };

    const lines = text.split('\n');

    const findNumberAfterKeywords = (keywords) => {
        for (const line of lines) {
            const lowerLine = line.toLowerCase();
            if (keywords.some(k => lowerLine.includes(k))) {
                const matches = line.match(/[\d.,\s]{5,}/g);
                if (matches && matches.length > 0) {
                    for (let j = matches.length - 1; j >= 0; j--) {
                        const cleanNum = matches[j].replace(/[\s.,]/g, '');
                        const val = parseFloat(cleanNum);
                        if (!isNaN(val) && val > 100000) {
                            return val;
                        }
                    }
                }
            }
        }
        return null;
    };

    const totalAssets = findNumberAfterKeywords(["tổng cộng tài sản", "tổng tài sản", "cộng tài sản", "total assets", "tổng ts"]);
    if (totalAssets) data.totalAssets = totalAssets;

    const currentAssets = findNumberAfterKeywords(["tài sản ngắn hạn", "ngắn hạn", "current assets", "ts ngắn hạn"]);
    if (currentAssets) data.currentAssets = currentAssets;

    const debt = findNumberAfterKeywords(["nợ phải trả", "tổng nợ phải trả", "nợ phải trả ngắn hạn", "total liabilities", "total debt"]);
    if (debt) data.debt = debt;

    const revenue = findNumberAfterKeywords(["doanh thu thuần", "doanh thu bán hàng", "tổng doanh thu", "net revenue", "net sales"]);
    if (revenue) {
        if (revenue > 200000000) {
            data.monthlyRevenue = Math.round(revenue / 12);
        } else {
            data.monthlyRevenue = revenue;
        }
    }

    const netProfit = findNumberAfterKeywords(["lợi nhuận sau thuế", "lợi nhuận ròng", "lợi nhuận sau thuế thu nhập", "net profit", "net income"]);
    if (netProfit) {
        if (netProfit > 20000000) {
            const monthlyProfit = Math.round(netProfit / 12);
            const monthlyRev = data.monthlyRevenue;
            data.monthlyCOGS = Math.round(monthlyRev * 0.65);
            data.monthlyOpex = Math.max(100000, Math.round(monthlyRev * 0.25) - monthlyProfit);
            data.monthlyDepreciation = Math.round(data.totalAssets * 0.005);
        } else {
            const monthlyProfit = netProfit;
            const monthlyRev = data.monthlyRevenue;
            data.monthlyCOGS = Math.round(monthlyRev * 0.65);
            data.monthlyOpex = Math.max(100000, Math.round(monthlyRev * 0.25) - monthlyProfit);
            data.monthlyDepreciation = Math.round(data.totalAssets * 0.005);
        }
    }

    const rev = data.monthlyRevenue * 12;
    const np = (netProfit && netProfit > 20000000) ? netProfit : (data.monthlyRevenue * 0.1 * 12);
    const assets = data.totalAssets;
    const equity = Math.max(10000000, assets - data.debt);

    const pm = rev > 0 ? (np / rev) * 100 : 8.5;
    const at = assets > 0 ? rev / assets : 1.2;
    const em = equity > 0 ? assets / equity : 1.67;
    const roe = pm * at * em;

    data.dupontAnalysis = {
        profitMargin: pm,
        assetTurnover: at,
        equityMultiplier: em,
        roe: roe,
        explanation: `Phân tích DuPont (giải thuật quy tắc): Tỷ suất sinh lời ROE = ${roe.toFixed(2)}% được phân rã thành Biên lợi nhuận ròng (${pm.toFixed(1)}%), Vòng quay tài sản (${at.toFixed(2)} lần) và Hệ số nhân vốn chủ sở hữu (${em.toFixed(2)} lần).`
    };

    return data;
}


/**
 * API: Kiểm tra trạng thái AI
 * GET /api/ai/status
 */
app.get('/api/ai/status', (req, res) => {
    const hasApiKey = !!process.env.DEEPSEEK_API_KEY;
    res.json({
        success: true,
        aiEnabled: hasApiKey,
        message: hasApiKey ? 'AI Consultant sẵn sàng' : 'Chưa cấu hình API Key'
    });
});
// Chạy server
app.listen(PORT, () => {
    console.log(`🚀 Server chạy tại http://localhost:${PORT}`);
    console.log(`📊 API: http://localhost:${PORT}/api/loans`);
    console.log(`🔄 Refresh: http://localhost:${PORT}/api/loans/refresh`);
});
