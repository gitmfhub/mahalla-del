// مفتاح التخزين المحلي
const STORAGE_KEY = 'mahalla_del_users';
const CURRENT_USER_KEY = 'mahalla_del_current_user';

// تهيئة البيانات (لأول مرة)
function initializeData() {
    if (!localStorage.getItem(STORAGE_KEY)) {
        const defaultUsers = [
            {
                id: 1,
                name: 'أحمد محمد',
                email: 'ahmed@example.com',
                phone: '0500000000',
                password: '123456',
                createdAt: new Date().toISOString()
            }
        ];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultUsers));
    }
}

// الحصول على جميع المستخدمين
function getUsers() {
    const users = localStorage.getItem(STORAGE_KEY);
    return users ? JSON.parse(users) : [];
}

// حفظ المستخدمين
function saveUsers(users) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

// تسجيل مستخدم جديد
function registerUser(name, email, phone, password) {
    const users = getUsers();
    
    // التحقق من وجود البريد الإلكتروني
    if (users.find(u => u.email === email)) {
        return { success: false, message: 'البريد الإلكتروني مسجل مسبقاً' };
    }
    
    // إنشاء مستخدم جديد
    const newUser = {
        id: Date.now(),
        name: name,
        email: email,
        phone: phone,
        password: password,
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    saveUsers(users);
    
    return { success: true, message: 'تم إنشاء الحساب بنجاح' };
}

// دخول المستخدم
function loginUser(email, password) {
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        // حفظ المستخدم الحالي (بدون كلمة المرور للأمان)
        const { password, ...userWithoutPassword } = user;
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
        return { success: true, message: 'تم الدخول بنجاح', user: userWithoutPassword };
    }
    
    return { success: false, message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' };
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
    
    // إضافة التنسيقات الإضافية للوحة التحكم
    const style = document.createElement('style');
    style.textContent = `
        .dashboard {
            text-align: center;
        }
        .welcome-section {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 15px;
            margin-bottom: 25px;
        }
        .welcome-section h2 {
            margin-bottom: 10px;
        }
        .user-info {
            margin: 8px 0;
            opacity: 0.95;
        }
        .dashboard-menu {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        .dashboard-btn {
            padding: 15px;
            background: #f8f9fa;
            border: 2px solid #e0e0e0;
            border-radius: 10px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            font-family: inherit;
        }
        .dashboard-btn:hover {
            background: #667eea;
            color: white;
            border-color: #667eea;
            transform: translateX(5px);
        }
        .dashboard-btn.logout {
            background: #dc3545;
            color: white;
            border-color: #dc3545;
        }
        .dashboard-btn.logout:hover {
            background: #c82333;
            transform: translateX(5px);
        }
    `;
    document.head.appendChild(style);
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

// تبديل التبويبات
function setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            
            // تحديث حالة الأزرار
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // عرض النموذج المناسب
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
function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    if (!email || !password) {
        showMessage('الرجاء إدخال البريد الإلكتروني وكلمة المرور', 'error');
        return;
    }
    
    const result = loginUser(email, password);
    
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
function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const phone = document.getElementById('reg-phone').value;
    const password = document.getElementById('reg-password').value;
    const confirm = document.getElementById('reg-confirm').value;
    
    // التحقق من صحة البيانات
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
    
    const result = registerUser(name, email, phone, password);
    
    if (result.success) {
        showMessage(result.message, 'success');
        // مسح النموذج
        document.getElementById('register').reset();
        // التبديل إلى تبويب الدخول
        document.querySelector('[data-tab="login"]').click();
    } else {
        showMessage(result.message, 'error');
    }
}

// تهيئة الصفحة
function init() {
    initializeData();
    
    // التحقق من وجود جلسة نشطة
    if (checkActiveSession()) {
        return;
    }
    
    setupTabs();
    
    const loginForm = document.getElementById('login');
    const registerForm = document.getElementById('register');
    
    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);
}

// بدء التطبيق
init();
