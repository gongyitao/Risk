/**
 * 策略E+ 智能化系统 - 主页脚本
 */

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    initAnimations();
    initScrollEffects();
});

// 项目标签管理
let projectTags = [];

/**
 * 显示创建项目对话框
 */
function showCreateProjectModal() {
    const modal = document.getElementById('createProjectModal');
    if (modal) {
        modal.style.display = 'flex';
        document.getElementById('projectName').focus();
    }
}

/**
 * 关闭创建项目对话框
 */
function closeCreateProjectModal() {
    const modal = document.getElementById('createProjectModal');
    if (modal) {
        modal.style.display = 'none';
        // 重置表单
        document.getElementById('createProjectForm').reset();
        projectTags = [];
        updateTagsDisplay();
    }
}

/**
 * 处理标签输入
 */
function handleTagInput(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        const input = event.target;
        const tag = input.value.trim();
        
        if (tag && !projectTags.includes(tag) && projectTags.length < 5) {
            projectTags.push(tag);
            input.value = '';
            updateTagsDisplay();
        }
    } else if (event.key === 'Backspace' && event.target.value === '' && projectTags.length > 0) {
        projectTags.pop();
        updateTagsDisplay();
    }
}

/**
 * 更新标签显示
 */
function updateTagsDisplay() {
    const tagsList = document.getElementById('tagsList');
    if (!tagsList) return;
    
    tagsList.innerHTML = projectTags.map(tag => `
        <span class="tag-item">
            ${tag}
            <button type="button" class="tag-remove" onclick="removeTag('${tag}')">×</button>
        </span>
    `).join('');
}

/**
 * 移除标签
 */
function removeTag(tag) {
    projectTags = projectTags.filter(t => t !== tag);
    updateTagsDisplay();
}

/**
 * 处理创建项目
 */
function handleCreateProject(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const projectName = formData.get('projectName').trim();
    const projectDescription = formData.get('projectDescription')?.trim() || '';
    
    if (!projectName) {
        showNotification('请输入项目名称', 'error');
        return;
    }
    
    // 创建项目对象
    const project = {
        id: 'proj-' + Date.now(),
        name: projectName,
        description: projectDescription,
        tags: [...projectTags],
        status: 'in-progress',
        currentStep: 'operation',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        creator: '策略分析师',
        conversationHistory: [],
        sqlScripts: [],
        analysisResults: {},
        reports: []
    };
    
    // 保存到localStorage
    saveProject(project);
    
    // 关闭对话框
    closeCreateProjectModal();
    
    // 跳转到工作台，并传递项目ID
    window.location.href = `workspace.html?projectId=${project.id}`;
}

/**
 * 保存项目到localStorage
 */
function saveProject(project) {
    let projects = getProjects();
    projects.unshift(project); // 添加到开头
    // 只保留最近100个项目
    if (projects.length > 100) {
        projects = projects.slice(0, 100);
    }
    localStorage.setItem('riskProjects', JSON.stringify(projects));
}

/**
 * 获取所有项目
 */
function getProjects() {
    const projectsJson = localStorage.getItem('riskProjects');
    return projectsJson ? JSON.parse(projectsJson) : [];
}

/**
 * 继续编辑项目
 */
function continueProject(projectId) {
    window.location.href = `workspace.html?projectId=${projectId}`;
}

/**
 * 查看项目详情
 */
function viewProject(projectId) {
    window.location.href = `projects.html#project-${projectId}`;
}

/**
 * 转义HTML
 */
function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

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
