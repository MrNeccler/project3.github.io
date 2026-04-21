/**
 * CollectiblesVault Application
 * @module app
 */

const CollectiblesApp = (function() {
    'use strict';

    // ==================== CONSTANTS ====================
    const CATEGORIES = ['Монеты', 'Марки', 'Фигурки', 'Картины', 'Другое'];
    const PRIORITIES = ['Высокий', 'Средний', 'Низкий'];
    const PAGES = ['login', 'register', 'dashboard', 'collection', 'wishlist', 'reports'];

    // ==================== STATE ====================
    let currentPage = 'dashboard';

    // ==================== DOM ELEMENTS ====================
    const DOM = {
        app: document.getElementById('app'),
        navLinks: document.getElementById('nav-links'),
        modal: document.getElementById('modal'),
        modalContent: document.getElementById('modal-content')
    };

    // ==================== NAVIGATION ====================
    function navigateTo(page) {
        if (PAGES.includes(page)) {
            currentPage = page;
            render();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    function logout() {
        StateManager.setCurrentUser(null);
        currentPage = 'login';
        render();
        Utils.showToast('Вы вышли из системы', 'info');
    }

    function highlightActiveNav() {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.toggle('active', link.dataset.page === currentPage);
        });
    }

    // ==================== MODAL ====================
    function openModal(content) {
        DOM.modalContent.innerHTML = content;
        DOM.modal.classList.add('active');
    }

    function closeModal() {
        DOM.modal.classList.remove('active');
    }

    // ==================== RENDER ====================
    function render() {
        renderNav();
        renderContent();
        highlightActiveNav();
    }

    function renderNav() {
        const user = StateManager.getCurrentUser();
        
        if (!user) {
            DOM.navLinks.innerHTML = `
                <div class="nav-link" data-page="login"><i class="fas fa-sign-in-alt"></i>Вход</div>
                <div class="nav-link" data-page="register"><i class="fas fa-user-plus"></i>Регистрация</div>
            `;
        } else {
            DOM.navLinks.innerHTML = `
                <div class="nav-link" data-page="dashboard"><i class="fas fa-chart-line"></i>Дашборд</div>
                <div class="nav-link" data-page="collection"><i class="fas fa-layer-group"></i>Коллекция</div>
                <div class="nav-link" data-page="wishlist"><i class="fas fa-heart"></i>Wishlist</div>
                <div class="nav-link" data-page="reports"><i class="fas fa-file-alt"></i>Отчёты</div>
                <div class="avatar" id="logout-avatar">${user.email[0].toUpperCase()}</div>
                <div class="nav-link" id="logout-text"><i class="fas fa-sign-out-alt"></i>Выход</div>
            `;
            
            document.getElementById('logout-avatar')?.addEventListener('click', logout);
            document.getElementById('logout-text')?.addEventListener('click', logout);
        }
        
        document.querySelectorAll('[data-page]').forEach(el => {
            el.addEventListener('click', () => navigateTo(el.dataset.page));
        });
    }

    function renderContent() {
        const user = StateManager.getCurrentUser();
        
        if (!user) {
            currentPage === 'register' ? renderRegister() : renderLogin();
        } else {
            switch(currentPage) {
                case 'collection': renderCollection(); break;
                case 'wishlist': renderWishlist(); break;
                case 'reports': renderReports(); break;
                default: renderDashboard();
            }
        }
    }

    // ==================== AUTH PAGES ====================
    function renderLogin() {
        DOM.app.innerHTML = `
            <div class="auth-container">
                <h2><i class="fas fa-sign-in-alt"></i> Вход в систему</h2>
                <form id="login-form">
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" id="login-email" value="demo@vault.ru" required>
                    </div>
                    <div class="form-group">
                        <label>Пароль</label>
                        <input type="password" id="login-password" value="123456" required>
                    </div>
                    <button type="submit" class="btn btn-primary btn-lg">
                        <i class="fas fa-sign-in-alt"></i>Войти
                    </button>
                    <p>Нет аккаунта? <a href="#" id="go-register">Зарегистрироваться</a></p>
                </form>
            </div>
        `;
        
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            const user = StateManager.findUser(email, password);
            
            if (user) {
                StateManager.setCurrentUser({ id: user.id, email: user.email, name: user.name });
                Utils.showToast(`Добро пожаловать, ${user.name}!`, 'success');
                navigateTo('dashboard');
            } else {
                Utils.showToast('Неверный email или пароль', 'error');
            }
        });
        
        document.getElementById('go-register').addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo('register');
        });
    }

    function renderRegister() {
        DOM.app.innerHTML = `
            <div class="auth-container">
                <h2><i class="fas fa-user-plus"></i> Регистрация</h2>
                <form id="register-form">
                    <div class="form-group">
                        <label>Имя</label>
                        <input type="text" id="reg-name" placeholder="Ваше имя" required>
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" id="reg-email" placeholder="example@mail.ru" required>
                    </div>
                    <div class="form-group">
                        <label>Пароль</label>
                        <input type="password" id="reg-password" placeholder="Минимум 6 символов" required minlength="6">
                    </div>
                    <button type="submit" class="btn btn-primary btn-lg">
                        <i class="fas fa-user-plus"></i>Зарегистрироваться
                    </button>
                    <p>Уже есть аккаунт? <a href="#" id="go-login">Войти</a></p>
                </form>
            </div>
        `;
        
        document.getElementById('register-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('reg-name').value;
            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-password').value;
            
            if (StateManager.userExists(email)) {
                Utils.showToast('Пользователь с таким email уже существует', 'error');
                return;
            }
            
            const newUser = StateManager.addUser({ email, password, name });
            StateManager.setCurrentUser({ id: newUser.id, email, name });
            Utils.showToast(`Регистрация успешна! Добро пожаловать, ${name}!`, 'success');
            navigateTo('dashboard');
        });
        
        document.getElementById('go-login').addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo('login');
        });
    }

    // ==================== DASHBOARD ====================
    function renderDashboard() {
        const stats = StateManager.getStats();
        const collection = StateManager.getUserItems('collections');
        const recent = [...collection]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 3);
        
        DOM.app.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-title"><i class="fas fa-coins"></i>Общая стоимость</div>
                    <div class="stat-value">${Utils.formatPrice(stats.totalValue)}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-title"><i class="fas fa-boxes"></i>Всего предметов</div>
                    <div class="stat-value">${stats.totalItems}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-title"><i class="fas fa-heart"></i>В списке желаний</div>
                    <div class="stat-value">${stats.wishlistCount}</div>
                </div>
            </div>
            
            <div class="flex-between mb-2">
                <h2><i class="fas fa-clock"></i> Последние добавленные</h2>
                ${collection.length ? '<button class="btn btn-outline btn-sm" data-page="collection"><i class="fas fa-arrow-right"></i>Все предметы</button>' : ''}
            </div>
            
            <div class="items-grid">
                ${recent.length ? recent.map(item => `
                    <div class="item-card">
                        <div class="item-img"><i class="fas fa-box-open fa-3x"></i></div>
                        <div class="item-info">
                            <div class="item-title">${Utils.escapeHtml(item.name)}</div>
                            <div class="item-category">${Utils.escapeHtml(item.category)}</div>
                            <div class="item-price">${Utils.formatPrice(item.price)}</div>
                            <div class="item-date"><i class="far fa-calendar-alt"></i> ${Utils.formatDate(item.date)}</div>
                        </div>
                    </div>
                `).join('') : `
                    <div class="text-center" style="grid-column:1/-1; padding:3rem;">
                        <i class="fas fa-box-open fa-3x" style="color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p class="text-secondary">Нет предметов в коллекции</p>
                        <button class="btn btn-primary mt-2" data-page="collection">
                            <i class="fas fa-plus"></i>Добавить первый предмет
                        </button>
                    </div>
                `}
            </div>
        `;
        
        DOM.app.querySelectorAll('[data-page]').forEach(btn => {
            btn.addEventListener('click', () => navigateTo(btn.dataset.page));
        });
    }

    // ==================== COLLECTION ====================
    function renderCollection() {
        DOM.app.innerHTML = `
            <div class="flex-between mb-2">
                <h2><i class="fas fa-layer-group"></i> Моя коллекция</h2>
                <button class="btn btn-primary" id="add-item"><i class="fas fa-plus"></i>Добавить</button>
            </div>
            
            <div class="filters">
                <input type="text" id="search" placeholder="🔍 Поиск...">
                <select id="category-filter">
                    <option value="">Все категории</option>
                    ${CATEGORIES.map(c => `<option>${c}</option>`).join('')}
                </select>
                <select id="sort">
                    <option value="date">По дате</option>
                    <option value="price">По цене</option>
                    <option value="name">По названию</option>
                </select>
            </div>
            
            <div class="items-grid" id="collection-grid"></div>
        `;
        
        const grid = document.getElementById('collection-grid');
        const search = document.getElementById('search');
        const categoryFilter = document.getElementById('category-filter');
        const sort = document.getElementById('sort');
        
        const updateGrid = () => {
            let items = StateManager.getUserItems('collections');
            const searchTerm = search.value.toLowerCase();
            const category = categoryFilter.value;
            
            if (searchTerm) items = items.filter(i => i.name.toLowerCase().includes(searchTerm));
            if (category) items = items.filter(i => i.category === category);
            
            if (sort.value === 'price') items.sort((a, b) => (b.price || 0) - (a.price || 0));
            else if (sort.value === 'name') items.sort((a, b) => a.name.localeCompare(b.name));
            else items.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            grid.innerHTML = items.length ? items.map(item => `
                <div class="item-card">
                    <div class="item-img"><i class="fas fa-image fa-3x"></i></div>
                    <div class="item-info">
                        <div class="item-title">${Utils.escapeHtml(item.name)}</div>
                        <div class="item-category">${Utils.escapeHtml(item.category)}</div>
                        <div class="item-price">${Utils.formatPrice(item.price)}</div>
                        <div class="item-date">${Utils.formatDate(item.date)}</div>
                        <div class="item-actions">
                            <button class="btn btn-sm edit-item" data-id="${item.id}"><i class="fas fa-edit"></i></button>
                            <button class="btn btn-sm btn-danger delete-item" data-id="${item.id}"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                </div>
            `).join('') : '<p class="text-center" style="grid-column:1/-1; padding:3rem;">Нет предметов в коллекции</p>';
            
            grid.querySelectorAll('.edit-item').forEach(btn => {
                btn.addEventListener('click', () => openCollectionModal(parseInt(btn.dataset.id)));
            });
            
            grid.querySelectorAll('.delete-item').forEach(btn => {
                btn.addEventListener('click', () => {
                    if (confirm('Удалить предмет?')) {
                        StateManager.deleteItem('collections', parseInt(btn.dataset.id));
                        updateGrid();
                        Utils.showToast('Предмет удалён', 'success');
                    }
                });
            });
        };
        
        document.getElementById('add-item').addEventListener('click', () => openCollectionModal(null));
        search.addEventListener('input', updateGrid);
        categoryFilter.addEventListener('change', updateGrid);
        sort.addEventListener('change', updateGrid);
        updateGrid();
    }

    function openCollectionModal(editId) {
        const item = editId ? StateManager.getItem('collections', editId) : null;
        
        openModal(`
            <h2>${item ? 'Редактировать' : 'Добавить'} предмет</h2>
            <form id="item-form">
                <div class="form-group">
                    <label>Название</label>
                    <input type="text" id="item-name" value="${item?.name || ''}" required>
                </div>
                <div class="form-group">
                    <label>Категория</label>
                    <select id="item-category">
                        ${CATEGORIES.map(c => `<option ${item?.category === c ? 'selected' : ''}>${c}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Дата приобретения</label>
                    <input type="date" id="item-date" value="${item?.date || ''}">
                </div>
                <div class="form-group">
                    <label>Стоимость (₽)</label>
                    <input type="number" id="item-price" step="0.01" value="${item?.price || ''}">
                </div>
                <div class="form-group">
                    <label>Описание</label>
                    <textarea id="item-desc" rows="3">${item?.desc || ''}</textarea>
                </div>
                <div class="flex gap-2">
                    <button type="submit" class="btn btn-primary">Сохранить</button>
                    <button type="button" class="btn btn-outline" id="close-modal">Отмена</button>
                </div>
            </form>
        `);
        
        document.getElementById('item-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const data = {
                name: document.getElementById('item-name').value,
                category: document.getElementById('item-category').value,
                date: document.getElementById('item-date').value,
                price: parseFloat(document.getElementById('item-price').value) || 0,
                desc: document.getElementById('item-desc').value
            };
            
            if (item) {
                StateManager.updateItem('collections', item.id, data);
            } else {
                StateManager.addItem('collections', data);
            }
            
            closeModal();
            render();
            Utils.showToast(item ? 'Изменения сохранены' : 'Предмет добавлен', 'success');
        });
        
        document.getElementById('close-modal').addEventListener('click', closeModal);
    }

    // ==================== WISHLIST ====================
    function renderWishlist() {
        DOM.app.innerHTML = `
            <div class="flex-between mb-2">
                <h2><i class="fas fa-heart"></i> Список желаний</h2>
                <button class="btn btn-primary" id="add-wish"><i class="fas fa-plus"></i>Добавить</button>
            </div>
            <div id="wishlist-container"></div>
        `;
        
        const container = document.getElementById('wishlist-container');
        
        const renderWishes = () => {
            const wishes = StateManager.getUserItems('wishlist').filter(w => !w.acquired);
            
            container.innerHTML = wishes.length ? wishes.map(w => {
                const priorityClass = w.priority === 'Высокий' ? 'priority-high' : 
                                     (w.priority === 'Средний' ? 'priority-medium' : 'priority-low');
                return `
                    <div class="wishlist-card ${priorityClass}">
                        <div class="flex-between">
                            <div class="item-title">⭐ ${Utils.escapeHtml(w.name)}</div>
                            <span class="${priorityClass}">${w.priority}</span>
                        </div>
                        <div class="item-category">${Utils.escapeHtml(w.category)}</div>
                        <div style="margin:0.5rem 0;">💰 Желаемая цена: ${Utils.formatPrice(w.desiredPrice)}</div>
                        <div class="item-actions">
                            <button class="btn btn-sm btn-success mark-acquired" data-id="${w.id}">✅ Приобрёл</button>
                            <button class="btn btn-sm edit-wish" data-id="${w.id}"><i class="fas fa-edit"></i></button>
                            <button class="btn btn-sm btn-danger delete-wish" data-id="${w.id}"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                `;
            }).join('') : '<p class="text-center" style="padding:3rem;">Список желаний пуст</p>';
            
            container.querySelectorAll('.mark-acquired').forEach(btn => {
                btn.addEventListener('click', () => {
                    const id = parseInt(btn.dataset.id);
                    StateManager.moveWishToCollection(id);
                    renderWishes();
                    Utils.showToast('Предмет перемещён в коллекцию!', 'success');
                });
            });
            
            container.querySelectorAll('.delete-wish').forEach(btn => {
                btn.addEventListener('click', () => {
                    if (confirm('Удалить из списка желаний?')) {
                        StateManager.deleteItem('wishlist', parseInt(btn.dataset.id));
                        renderWishes();
                        Utils.showToast('Удалено из списка желаний', 'info');
                    }
                });
            });
            
            container.querySelectorAll('.edit-wish').forEach(btn => {
                btn.addEventListener('click', () => openWishModal(parseInt(btn.dataset.id)));
            });
        };
        
        document.getElementById('add-wish').addEventListener('click', () => openWishModal(null));
        renderWishes();
    }

    function openWishModal(editId) {
        const wish = editId ? StateManager.getItem('wishlist', editId) : null;
        
        openModal(`
            <h2>${wish ? 'Редактировать' : 'Добавить'} желание</h2>
            <form id="wish-form">
                <div class="form-group">
                    <label>Название</label>
                    <input id="wish-name" value="${wish?.name || ''}" required>
                </div>
                <div class="form-group">
                    <label>Категория</label>
                    <select id="wish-category">
                        ${CATEGORIES.map(c => `<option ${wish?.category === c ? 'selected' : ''}>${c}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Желаемая цена</label>
                    <input type="number" id="wish-price" value="${wish?.desiredPrice || ''}">
                </div>
                <div class="form-group">
                    <label>Приоритет</label>
                    <select id="wish-priority">
                        ${PRIORITIES.map(p => `<option ${wish?.priority === p ? 'selected' : ''}>${p}</option>`).join('')}
                    </select>
                </div>
                <div class="flex gap-2">
                    <button type="submit" class="btn btn-primary">Сохранить</button>
                    <button type="button" class="btn btn-outline" id="close-modal">Отмена</button>
                </div>
            </form>
        `);
        
        document.getElementById('wish-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const data = {
                name: document.getElementById('wish-name').value,
                category: document.getElementById('wish-category').value,
                desiredPrice: parseFloat(document.getElementById('wish-price').value) || 0,
                priority: document.getElementById('wish-priority').value,
                acquired: false
            };
            
            if (wish) {
                StateManager.updateItem('wishlist', wish.id, data);
            } else {
                StateManager.addItem('wishlist', data);
            }
            
            closeModal();
            render();
            Utils.showToast(wish ? 'Изменения сохранены' : 'Добавлено в список желаний', 'success');
        });
        
        document.getElementById('close-modal').addEventListener('click', closeModal);
    }

    // ==================== REPORTS ====================
    function renderReports() {
        DOM.app.innerHTML = `
            <h2 class="mb-4"><i class="fas fa-chart-simple"></i> Генератор отчётов</h2>
            
            <div class="filters">
                <label><input type="radio" name="reportType" value="all" checked> Все предметы</label>
                <label><input type="radio" name="reportType" value="category"> По категории</label>
            </div>
            
            <div id="category-selector" class="hidden">
                <select id="report-category">${CATEGORIES.map(c => `<option>${c}</option>`).join('')}</select>
            </div>
            
            <div class="flex gap-2 mb-4">
                <button class="btn btn-primary" id="generate-report"><i class="fas fa-chart-line"></i>Сформировать</button>
                <button class="btn btn-accent" id="export-csv"><i class="fas fa-download"></i>Экспорт CSV</button>
            </div>
            
            <div id="report-result"></div>
        `;
        
        const typeRadios = document.querySelectorAll('input[name="reportType"]');
        const categorySelector = document.getElementById('category-selector');
        
        typeRadios.forEach(r => {
            r.addEventListener('change', (e) => {
                categorySelector.classList.toggle('hidden', e.target.value !== 'category');
            });
        });
        
        const generateReport = () => {
            const type = document.querySelector('input[name="reportType"]:checked').value;
            let items = StateManager.getUserItems('collections');
            
            if (type === 'category') {
                const cat = document.getElementById('report-category').value;
                items = items.filter(i => i.category === cat);
            }
            
            const total = Utils.sum(items, 'price');
            const result = document.getElementById('report-result');
            
            if (!items.length) {
                result.innerHTML = '<p class="text-center text-secondary" style="padding:2rem;">Нет данных для отображения</p>';
                return;
            }
            
            result.innerHTML = `
                <table class="table">
                    <thead>
                        <tr><th>Название</th><th>Категория</th><th>Дата</th><th>Цена</th></tr>
                    </thead>
                    <tbody>
                        ${items.map(i => `
                            <tr>
                                <td>${Utils.escapeHtml(i.name)}</td>
                                <td>${i.category}</td>
                                <td>${Utils.formatDate(i.date)}</td>
                                <td>${Utils.formatPrice(i.price)}</td>
                            </tr>
                        `).join('')}
                        <tr style="font-weight:700;">
                            <td colspan="3">Итого:</td>
                            <td>${Utils.formatPrice(total)}</td>
                        </tr>
                    </tbody>
                </table>
                <div class="stats-grid" style="margin-top:1.5rem;">
                    <div class="stat-card">
                        <div class="stat-title">Предметов</div>
                        <div class="stat-value">${items.length}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-title">Средняя цена</div>
                        <div class="stat-value">${Utils.formatPrice(total / items.length)}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-title">Общая стоимость</div>
                        <div class="stat-value">${Utils.formatPrice(total)}</div>
                    </div>
                </div>
            `;
        };
        
        document.getElementById('generate-report').addEventListener('click', generateReport);
        
        document.getElementById('export-csv').addEventListener('click', () => {
            const items = StateManager.getUserItems('collections');
            let csv = "Название,Категория,Дата,Цена,Описание\n";
            items.forEach(i => {
                csv += `"${i.name}","${i.category}","${i.date}",${i.price},"${i.desc || ''}"\n`;
            });
            
            const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `collectibles_report_${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
            Utils.showToast('Отчёт экспортирован', 'success');
        });
        
        generateReport();
    }

    // ==================== INITIALIZATION ====================
    function init() {
        // Setup modal close on backdrop click
        DOM.modal.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                closeModal();
            }
        });
        
        // Initial render
        const user = StateManager.getCurrentUser();
        currentPage = user ? 'dashboard' : 'login';
        render();
    }

    // Public API
    return {
        init,
        navigateTo,
        logout
    };
})();

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    CollectiblesApp.init();
});