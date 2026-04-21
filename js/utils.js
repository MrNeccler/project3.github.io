/**
 * Utilities module
 * @module utils
 */

const Utils = (function() {
    'use strict';

    /**
     * Format price to Russian rubles
     */
    function formatPrice(price) {
        return (price || 0).toLocaleString('ru-RU') + ' ₽';
    }

    /**
     * Format date to Russian locale
     */
    function formatDate(date) {
        if (!date) return '';
        return new Date(date).toLocaleDateString('ru-RU');
    }

    /**
     * Format date and time
     */
    function formatDateTime(dateTime) {
        if (!dateTime) return '';
        return new Date(dateTime).toLocaleString('ru-RU');
    }

    /**
     * Escape HTML to prevent XSS
     */
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Show toast notification
     */
    function showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        
        const icon = icons[type] || 'info-circle';
        toast.innerHTML = `<i class="fas fa-${icon}"></i><span>${escapeHtml(message)}</span>`;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    /**
     * Generate unique ID
     */
    function generateId(prefix = '') {
        return prefix + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Debounce function
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Deep clone object
     */
    function deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    /**
     * Group array by key
     */
    function groupBy(array, key) {
        return array.reduce((result, item) => {
            const groupKey = item[key];
            if (!result[groupKey]) result[groupKey] = [];
            result[groupKey].push(item);
            return result;
        }, {});
    }

    /**
     * Sum array of numbers
     */
    function sum(array, key = null) {
        if (key) {
            return array.reduce((total, item) => total + (item[key] || 0), 0);
        }
        return array.reduce((total, num) => total + (num || 0), 0);
    }

    /**
     * Calculate average
     */
    function average(array, key = null) {
        if (!array.length) return 0;
        return sum(array, key) / array.length;
    }

    // Public API
    return {
        formatPrice,
        formatDate,
        formatDateTime,
        escapeHtml,
        showToast,
        generateId,
        debounce,
        deepClone,
        groupBy,
        sum,
        average
    };
})();