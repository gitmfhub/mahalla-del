// تكوين GitHub API
const GITHUB_CONFIG = {
    // ⚠️ مهم: استبدل هذه البيانات بمعلومات حسابك
    username: 'YOUR_GITHUB_USERNAME',  // اسم المستخدم في GitHub
    repo: 'YOUR_REPO_NAME',             // اسم المستودع
    token: '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',         // التوكن الشخصي
    filePath: '/users.json'         // مسار ملف العملاء
};

// رابط API للملف
const API_URL = `https://api.github.com/repos/${GITHUB_CONFIG.username}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.filePath}`;

// دوال مساعدة
function getHeaders() {
    return {
        'Authorization': `token ${GITHUB_CONFIG.token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json'
    };
}
