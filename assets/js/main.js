/**
 * 策略E+ 智能化系统 - 主页脚本
 */

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    initAnimations();
    initScrollEffects();
});

/**
 * 初始化动画效果
 */
function initAnimations() {
    // 观察器配置
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    // 创建观察器
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // 观察所有模块卡片
    const cards = document.querySelectorAll('.module-card, .advantage-card');
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
}

/**
 * 初始化滚动效果
 */
function initScrollEffects() {
    let lastScroll = 0;
    const header = document.querySelector('.header');

    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;

        if (currentScroll > lastScroll && currentScroll > 100) {
            // 向下滚动
            header.style.transform = 'translateY(-100%)';
        } else {
            // 向上滚动
            header.style.transform = 'translateY(0)';
        }

        lastScroll = currentScroll;
    });
}

/**
 * 跳转到工作台
 */
function goToWorkspace(module = '') {
    let url = 'workspace.html';
    if (module) {
        url += '?module=' + module;
    }
    window.location.href = url;
}

/**
 * 显示通知
 */
function showNotification(message, type = 'info') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        border-radius: 8px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
        z-index: 1000;
        animation: slideInRight 0.3s ease;
        font-size: 14px;
        max-width: 300px;
    `;

    // 添加到页面
    document.body.appendChild(notification);

    // 3秒后自动移除
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// 添加动画样式
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
`;
document.head.appendChild(style);
