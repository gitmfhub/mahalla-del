// مفتاح التخزين المحلي للجلسة فقط
const CURRENT_USER_KEY = 'mahalla_del_current_user';

// عرض/إخفاء شاشة التحميل
function showLoading(show) {
    const loadingDiv = document.getElementById('loading');
    loadingDiv.style.display = show ? 'flex' : 'none';
}

// عرض رسالة
function showMessage(message, type = 'success') {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
        messageDiv.className = 'message';
    }, 3000);
}

// قراءة ملف users.json من GitHub
async function fetchUsersFile() {
    try {
        const response = await fetch(API_URL, {
            headers: getHeaders()
        });
        
        if (response.status === 404) {
            // الملف غير موجود، ننشئه
            return await createUsersFile();
        }
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const content = JSON.parse(atob(data.content));
        return {
            users: content.users || [],
            sha: data.sha // مهم للتحديث
        };
    } catch (error) {
        console.error('Error fetching users:', error);
        throw new Error('فشل في قراءة بيانات العملاء');
    }
}

// إنشاء ملف users.json جديد
async function createUsersFile() {
    const defaultData = {
        users: [
            {
                id: 1,
                name: 'أحمد محمد',
                email: 'ahmed@example.com',
                phone: '0500000000',
                password: '123456',
                createdAt: new Date().toISOString()
            }
        ],
        createdAt: new Date().toISOString()
    };
    
    const content = btoa(JSON.stringify(defaultData, null, 2));
    
    const response = await fetch(API_URL, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
            message: 'إنشاء ملف العملاء',
            content: content
        })
    });
    
    if (!response.ok) {
        throw new Error('فشل في إنشاء ملف العملاء');
    }
    
    const data = await response.json();
    return {
        users: defaultData.users,
        sha: data.content.sha
    };
}

// تحديث ملف users.json
async function updateUsersFile(users, currentSha) {
    const data = {
        users: users,
        lastUpdated: new Date().toISOString()
    };
    
    const content = btoa(JSON.stringify(data, null, 2));
    
    const response = await fetch(API_URL, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
            message: 'تحديث بيانات العملاء',
            content: content,
            sha: currentSha
        })
    });
    
    if (!response.ok) {
        throw new Error('فشل في تحديث بيانات العملاء');
    }
    
    const result = await response.json();
    return result.content.sha;
}

// تسجيل مستخدم جديد
async function registerUser(name, email, phone, password) {
    showLoading(true);
    
    try {
        const { users, sha } = await fetchUsersFile();
        
        // التحقق من وجود البريد الإلكتروني
        if (users.find(u => u.email === email)) {
            showLoading(false);
            return { success: false, message: 'البريد الإلكتروني مسجل مسبقاً' };
        }
        
        // إنشاء مستخدم جديد
        const newUser = {
            id: Date.now(),
            name: name,
            email: email,
            phone: phone,
            password: password, // في التطبيق الحقيقي، يجب تشفير كلمة المرور
            createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        
        // حفظ في GitHub
        await updateUsersFile(users, sha);
        
        showLoading(false);
        return { success: true, message: 'تم إنشاء الحساب بنجاح' };
        
    } catch (error) {
        showLoading(false);
        console.error(error);
        return { success: false, message: 'حدث خطأ في الاتصال. تأكد من إعدادات GitHub' };
    }
}

// دخول المستخدم
async function loginUser(email, password) {
    showLoading(true);
    
    try {
        const { users } = await fetchUsersFile();
        const user = users.find(u => u.email === email && u.password === password);
        
        showLoading(false);
        
        if (user) {
            // حفظ المستخدم الحالي (بدون كلمة المرور للأمان)
            const { password, ...userWithoutPassword } = user;
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
            return { success: true, message: 'تم الدخول بنجاح', user: userWithoutPassword };
        }
        
        return { success: false, message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' };
        
    } catch (error) {
        showLoading(false);
        console.error(error);
        return { success: false, message: 'حدث خطأ في الاتصال. تأكد من إعدادات GitHub' };
    }
}

// التحقق من وجود جلسة نشطة
function checkActiveSession() {
    const currentUser = localStorage.getItem(CURRENT_USER_KEY);
    if (currentUser) {
        const user = JSON.parse(currentUser);
        showDashboard(user);
        return true;
    }
    return false;
}

// عرض لوحة تحكم العميل
function showDashboard(user) {
    const container = document.querySelector('.container');
    container.innerHTML = `
        <div class="store-header">
            <h1>🏪 محله دِل</h1>
            <p>مرحباً بك في متجرك</p>
        </div>
        <div class="auth-card">
            <div class="dashboard">
                <div class="welcome-section">
                    <h2>👋 مرحباً ${user.name}</h2>
                    <p class="user-info">📧 ${user.email}</p>
                    <p class="user-info">📱 ${user.phone}</p>
                </div>
                
                <div class="dashboard-menu">
                    <button class="dashboard-btn" onclick="viewProducts()">
                        🛍️ استعراض المنتجات
                    </button>
                    <button class="dashboard-btn" onclick="viewOrders()">
                        📦 طلباتي
                    </button>
                    <button class="dashboard-btn" onclick="editProfile()">
                        ✏️ تعديل الملف الشخصي
                    </button>
                    <button class="dashboard-btn logout" onclick="logout()">
                        🚪 تسجيل خروج
                    </button>
                </div>
            </div>
        </div>
    `;
}

// دوال لوحة التحكم
function viewProducts() {
    alert('🛍️ جاري تحميل المنتجات...\n(سيتم إضافة هذه الميزة قريباً)');
}

function viewOrders() {
    alert('📦 لا توجد طلبات سابقة\n(سيتم إضافة هذه الميزة قريباً)');
}

function editProfile() {
    alert('✏️ جاري تحميل صفحة تعديل الملف الشخصي...\n(سيتم إضافة هذه الميزة قريباً)');
}

function logout() {
    localStorage.removeItem(CURRENT_USER_KEY);
    location.reload();
}

// تبديل التبويبات
function setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            if (tab === 'login') {
                loginForm.classList.add('active');
                registerForm.classList.remove('active');
            } else {
                loginForm.classList.remove('active');
                registerForm.classList.add('active');
            }
        });
    });
}

// معالجة نموذج الدخول
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    if (!email || !password) {
        showMessage('الرجاء إدخال البريد الإلكتروني وكلمة المرور', 'error');
        return;
    }
    
    const result = await loginUser(email, password);
    
    if (result.success) {
        showMessage(result.message, 'success');
        setTimeout(() => {
            showDashboard(result.user);
        }, 1000);
    } else {
        showMessage(result.message, 'error');
    }
}

// معالجة نموذج التسجيل
async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const phone = document.getElementById('reg-phone').value;
    const password = document.getElementById('reg-password').value;
    const confirm = document.getElementById('reg-confirm').value;
    
    if (!name || !email || !phone || !password) {
        showMessage('الرجاء ملء جميع الحقول', 'error');
        return;
    }
    
    if (password !== confirm) {
        showMessage('كلمة المرور وتأكيدها غير متطابقين', 'error');
        return;
    }
    
    if (password.length < 6) {
        showMessage('كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'error');
        return;
    }
    
    if (!/^\d+$/.test(phone.replace(/[^0-9]/g, ''))) {
        showMessage('الرجاء إدخال رقم جوال صحيح', 'error');
        return;
    }
    
    const result = await registerUser(name, email, phone, password);
    
    if (result.success) {
        showMessage(result.message, 'success');
        document.getElementById('register').reset();
        document.querySelector('[data-tab="login"]').click();
    } else {
        showMessage(result.message, 'error');
    }
}

// التحقق من إعدادات GitHub
function checkGitHubConfig() {
    if (GITHUB_CONFIG.username === 'YOUR_GITHUB_USERNAME' || 
        GITHUB_CONFIG.token === 'YOUR_GITHUB_TOKEN') {
        showMessage('⚠️ يرجى إعداد ملف config.js مع بيانات GitHub الخاصة بك أولاً', 'error');
        return false;
    }
    return true;
}

// تهيئة الصفحة
function init() {
    if (!checkGitHubConfig()) return;
    
    if (checkActiveSession()) return;
    
    setupTabs();
    
    const loginForm = document.getElementById('login');
    const registerForm = document.getElementById('register');
    
    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);
}

// بدء التطبيق
init();
