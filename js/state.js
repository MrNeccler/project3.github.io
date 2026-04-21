/**
 * State Manager module
 * @module state
 */

const StateManager = (function() {
    'use strict';

    const STORAGE_KEY = 'collectibles_vault_v2';

    /**
     * Default state structure
     */
    const DEFAULT_STATE = {
        currentUser: null,
        users: [
            { 
                id: 1, 
                email: 'demo@vault.ru', 
                password: '123456', 
                name: 'Демо Пользователь' 
            }
        ],
        collections: [],
        wishlist: [],
        nextId: { 
            collection: 1, 
            wish: 1 
        }
    };

    let state = null;

    /**
     * Load state from localStorage
     */
    function loadState() {
        const saved = localStorage.getItem(STORAGE_KEY);
        
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                state = { ...DEFAULT_STATE, ...parsed };
            } catch (e) {
                console.warn('Failed to load state, using default');
                state = Utils.deepClone(DEFAULT_STATE);
            }
        } else {
            state = Utils.deepClone(DEFAULT_STATE);
        }
        
        return state;
    }

    /**
     * Save state to localStorage
     */
    function saveState() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (e) {
            console.warn('Failed to save state');
            Utils.showToast('Ошибка сохранения данных', 'error');
        }
    }

    /**
     * Get current state
     */
    function getState() {
        return state;
    }

    /**
     * Set current user
     */
    function setCurrentUser(user) {
        state.currentUser = user ? { ...user } : null;
        saveState();
    }

    /**
     * Get current user
     */
    function getCurrentUser() {
        return state.currentUser;
    }

    /**
     * Check if user is authenticated
     */
    function isAuthenticated() {
        return state.currentUser !== null;
    }

    /**
     * Find user by credentials
     */
    function findUser(email, password) {
        return state.users.find(u => u.email === email && u.password === password);
    }

    /**
     * Check if user exists
     */
    function userExists(email) {
        return state.users.some(u => u.email === email);
    }

    /**
     * Add new user
     */
    function addUser(userData) {
        const newUser = {
            ...userData,
            id: Date.now()
        };
        state.users.push(newUser);
        saveState();
        return newUser;
    }

    /**
     * Get user items by type
     */
    function getUserItems(type) {
        const user = state.currentUser;
        if (!user) return [];
        return state[type].filter(item => item.userId === user.id);
    }

    /**
     * Add item to collection or wishlist
     */
    function addItem(type, itemData) {
        const user = state.currentUser;
        if (!user) return null;
        
        const newItem = {
            ...itemData,
            id: state.nextId[type]++,
            userId: user.id,
            createdAt: new Date().toISOString()
        };
        
        state[type].push(newItem);
        saveState();
        return newItem;
    }

    /**
     * Update item
     */
    function updateItem(type, id, updates) {
        const index = state[type].findIndex(item => item.id === id);
        if (index === -1) return false;
        
        state[type][index] = {
            ...state[type][index],
            ...updates,
            updatedAt: new Date().toISOString()
        };
        
        saveState();
        return true;
    }

    /**
     * Delete item
     */
    function deleteItem(type, id) {
        const initialLength = state[type].length;
        state[type] = state[type].filter(item => item.id !== id);
        
        if (state[type].length !== initialLength) {
            saveState();
            return true;
        }
        return false;
    }

    /**
     * Get item by ID
     */
    function getItem(type, id) {
        return state[type].find(item => item.id === id);
    }

    /**
     * Move item from wishlist to collection
     */
    function moveWishToCollection(wishId) {
        const wish = getItem('wishlist', wishId);
        if (!wish) return null;
        
        const collectionItem = addItem('collections', {
            name: wish.name,
            category: wish.category,
            price: wish.desiredPrice,
            date: new Date().toISOString().split('T')[0],
            desc: 'Перемещено из списка желаний'
        });
        
        if (collectionItem) {
            updateItem('wishlist', wishId, { acquired: true });
        }
        
        return collectionItem;
    }

    /**
     * Get statistics
     */
    function getStats() {
        const collection = getUserItems('collections');
        const wishlist = getUserItems('wishlist').filter(w => !w.acquired);
        
        return {
            totalItems: collection.length,
            totalValue: Utils.sum(collection, 'price'),
            wishlistCount: wishlist.length,
            averagePrice: Utils.average(collection, 'price'),
            categories: Utils.groupBy(collection, 'category')
        };
    }

    /**
     * Export all data
     */
    function exportData() {
        return Utils.deepClone(state);
    }

    /**
     * Import data
     */
    function importData(data) {
        try {
            state = { ...DEFAULT_STATE, ...data };
            saveState();
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Clear all data for current user
     */
    function clearUserData() {
        const user = state.currentUser;
        if (!user) return;
        
        state.collections = state.collections.filter(item => item.userId !== user.id);
        state.wishlist = state.wishlist.filter(item => item.userId !== user.id);
        saveState();
    }

    /**
     * Reset state to default
     */
    function resetState() {
        state = Utils.deepClone(DEFAULT_STATE);
        saveState();
    }

    // Initialize state
    loadState();

    // Public API
    return {
        getState,
        setCurrentUser,
        getCurrentUser,
        isAuthenticated,
        findUser,
        userExists,
        addUser,
        getUserItems,
        addItem,
        updateItem,
        deleteItem,
        getItem,
        moveWishToCollection,
        getStats,
        exportData,
        importData,
        clearUserData,
        resetState
    };
})();