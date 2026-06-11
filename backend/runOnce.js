const runAllScrapers = require('./scrapers/runAll');

runAllScrapers().then(() => {
    console.log('✅ Khởi tạo database thành công!');
    process.exit(0);
}).catch(error => {
    console.error('❌ Lỗi:', error);
    process.exit(1);
});
