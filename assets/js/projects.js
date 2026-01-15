/**
 * Projects Management JavaScript
 * 分析项目管理脚本
 */

// 模拟项目数据
const mockProjects = {
    'proj-001': {
        id: 'proj-001',
        title: '年轻用户风险拦截策略分析',
        description: '针对18-24岁年轻用户群体的风险特征分析，通过策略规则拦截高风险客群，预计降低坏账率3.2个百分点。',
        status: 'completed',
        author: '张三',
        createTime: '2026-01-12 15:30',
        duration: '45分钟',
        tags: ['年轻用户', '风险拦截', '已上线'],
        stats: {
            sampleSize: '45,230',
            rejectRate: '18.5%',
            badRateImprovement: '-3.2pp',
            ksImprovement: '+8.3%'
        },
        conclusion: `
            <h3>📊 分析结论</h3>
            <p>通过对45,230个样本的深入分析，我们发现18-24岁年轻用户群体存在以下显著风险特征：</p>
            <ul>
                <li><strong>收入不稳定</strong>：该群体月收入波动大于±30%的比例达到58.3%</li>
                <li><strong>负债率高</strong>：平均负债率为67.8%，显著高于全平台平均（45.2%）</li>
                <li><strong>逾期倾向</strong>：历史逾期率为24.5%，是整体逾期率（14.2%）的1.7倍</li>
            </ul>
            
            <h4>💡 策略建议</h4>
            <p>建议对符合以下条件的年轻用户进行拦截：</p>
            <ol>
                <li>年龄 ≤ 24岁</li>
                <li>月收入 < 5000元 或 收入波动 > 30%</li>
                <li>负债率 > 60%</li>
                <li>历史逾期次数 ≥ 1次</li>
            </ol>
            
            <h4>✅ 预期效果</h4>
            <ul>
                <li>预计拦截率：<strong>18.5%</strong></li>
                <li>坏账率改善：<strong>-3.2pp</strong>（从14.2%降至11.0%）</li>
                <li>KS值提升：<strong>+8.3%</strong>（从0.32提升至0.35）</li>
                <li>年化损失减少：约<strong>¥450万元</strong></li>
            </ul>
        `,
        sqlCode: `-- 年轻用户风险样本提取
SELECT 
    user_id,
    age,
    monthly_income,
    income_volatility,
    debt_ratio,
    overdue_count,
    overdue_days_max,
    credit_score
FROM user_credit_table
WHERE age BETWEEN 18 AND 24
  AND create_time >= DATE_SUB(NOW(), INTERVAL 90 DAY)
  AND application_status IN ('approved', 'rejected')
ORDER BY create_time DESC
LIMIT 50000;

-- 风险特征计算
WITH risk_features AS (
    SELECT 
        user_id,
        CASE 
            WHEN monthly_income < 5000 OR income_volatility > 0.3 THEN 1 
            ELSE 0 
        END AS is_low_income,
        CASE 
            WHEN debt_ratio > 0.6 THEN 1 
            ELSE 0 
        END AS is_high_debt,
        CASE 
            WHEN overdue_count >= 1 THEN 1 
            ELSE 0 
        END AS has_overdue,
        is_bad_user
    FROM user_credit_table
    WHERE age BETWEEN 18 AND 24
)
SELECT 
    COUNT(*) as total_users,
    SUM(is_low_income + is_high_debt + has_overdue >= 2) as high_risk_users,
    AVG(is_bad_user) as overall_bad_rate,
    AVG(CASE WHEN is_low_income + is_high_debt + has_overdue >= 2 
        THEN is_bad_user END) as high_risk_bad_rate
FROM risk_features;`,
        dataSnapshot: {
            totalRecords: 45230,
            badUserCount: 6422,
            badRate: 14.2,
            highRiskCount: 8367,
            highRiskBadRate: 28.9,
            features: [
                { name: '年龄', iv: 0.45, importance: '高' },
                { name: '月收入', iv: 0.38, importance: '高' },
                { name: '收入波动', iv: 0.42, importance: '高' },
                { name: '负债率', iv: 0.51, importance: '极高' },
                { name: '历史逾期次数', iv: 0.67, importance: '极高' }
            ]
        },
        workflow: [
            { step: '数据助手', status: 'completed', time: '10分钟', details: '提取45,230个样本，8个特征字段' },
            { step: '策略挖掘', status: 'completed', time: '20分钟', details: 'IV值分析，识别5个高区分度特征' },
            { step: '报告生成', status: 'completed', time: '15分钟', details: '生成完整策略回测报告，预期效果评估' }
        ]
    },
    'proj-002': {
        id: 'proj-002',
        title: '多头借贷客户识别策略',
        description: '基于外部征信数据和平台内行为特征，识别多头借贷高风险客户，建立智能拦截规则。',
        status: 'completed',
        author: '李四',
        createTime: '2026-01-10 10:15',
        duration: '38分钟',
        tags: ['多头借贷', '高风险', '待上线'],
        stats: {
            sampleSize: '32,145',
            accuracy: '92.3%',
            badRateImprovement: '-5.1pp',
            ksImprovement: '+12.5%'
        },
        conclusion: `
            <h3>📊 分析结论</h3>
            <p>多头借贷客户识别准确率达到<strong>92.3%</strong>，显著提升风控效果。</p>
        `,
        sqlCode: `-- 多头借贷特征提取
SELECT 
    user_id,
    external_loan_count,
    external_loan_amount,
    platform_loan_count
FROM user_credit_table
WHERE external_loan_count >= 3
ORDER BY external_loan_count DESC;`,
        dataSnapshot: {
            totalRecords: 32145,
            highRiskCount: 5892,
            accuracy: 92.3
        },
        workflow: [
            { step: '数据助手', status: 'completed', time: '8分钟' },
            { step: '策略挖掘', status: 'completed', time: '18分钟' },
            { step: '报告生成', status: 'completed', time: '12分钟' }
        ]
    },
    'proj-003': {
        id: 'proj-003',
        title: '低收入客群准入策略优化',
        description: '针对月收入5000元以下客群的准入标准优化，平衡业务规模和风险控制。',
        status: 'in-progress',
        author: '王五',
        createTime: '2026-01-15 09:00',
        duration: '进行中 25分钟',
        tags: ['低收入', '准入优化'],
        stats: {
            sampleSize: '28,456',
            featureCount: '15',
            currentStep: '特征挖掘',
            estimatedTime: '20分钟'
        },
        conclusion: '<p>分析进行中...</p>',
        sqlCode: `-- 低收入客群样本提取
SELECT 
    user_id,
    monthly_income,
    age,
    city_level
FROM user_credit_table
WHERE monthly_income < 5000
ORDER BY create_time DESC
LIMIT 30000;`,
        dataSnapshot: {
            totalRecords: 28456,
            inProgress: true
        },
        workflow: [
            { step: '数据助手', status: 'completed', time: '12分钟' },
            { step: '策略挖掘', status: 'in-progress', time: '进行中' },
            { step: '报告生成', status: 'pending', time: '待开始' }
        ]
    }
};

/**
 * 筛选项目（按状态）
 */
function filterByStatus(status) {
    const filterBtns = document.querySelectorAll('.filter-btn[data-status]');
    filterBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.status === status);
    });

    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        if (status === 'all') {
            card.style.display = 'block';
        } else {
            card.style.display = card.dataset.status === status ? 'block' : 'none';
        }
    });
}

/**
 * 筛选项目（按时间）
 */
function filterByTime(timeRange) {
    console.log('筛选时间范围:', timeRange);
    // 实际应用中根据时间范围筛选项目
    showNotification(`已切换到：${timeRange}`);
}

/**
 * 搜索项目
 */
function searchProjects(keyword) {
    const projectCards = document.querySelectorAll('.project-card');
    keyword = keyword.toLowerCase();

    projectCards.forEach(card => {
        const title = card.querySelector('.project-title').textContent.toLowerCase();
        const description = card.querySelector('.project-description').textContent.toLowerCase();
        const tags = Array.from(card.querySelectorAll('.tag')).map(tag => tag.textContent.toLowerCase()).join(' ');

        const matches = title.includes(keyword) || description.includes(keyword) || tags.includes(keyword);
        card.style.display = matches ? 'block' : 'none';
    });
}

/**
 * 切换视图（网格/列表）
 */
function toggleView(viewType) {
    const viewBtns = document.querySelectorAll('.view-toggle-btn');
    viewBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === viewType);
    });

    const projectsList = document.getElementById('projectsList');
    if (viewType === 'grid') {
        projectsList.style.display = 'grid';
        projectsList.style.gridTemplateColumns = 'repeat(auto-fill, minmax(400px, 1fr))';
        projectsList.style.gap = 'var(--spacing-lg)';
    } else {
        projectsList.style.display = 'flex';
        projectsList.style.flexDirection = 'column';
    }
}

/**
 * 打开项目详情
 */
function openProject(projectId) {
    const project = mockProjects[projectId];
    if (!project) {
        showNotification('项目不存在', 'error');
        return;
    }

    const modal = document.getElementById('projectModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    modalTitle.textContent = project.title;

    // 生成项目详情HTML
    modalBody.innerHTML = `
        <div class="project-detail-section">
            <div class="section-title">
                📋 项目信息
            </div>
            <div class="section-content">
                <div class="project-meta" style="margin: 0; display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--spacing-lg);">
                    <div>
                        <strong>创建人：</strong>${project.author}
                    </div>
                    <div>
                        <strong>创建时间：</strong>${project.createTime}
                    </div>
                    <div>
                        <strong>总耗时：</strong>${project.duration}
                    </div>
                    <div>
                        <strong>项目状态：</strong><span class="tag ${getStatusTagClass(project.status)}">${getStatusText(project.status)}</span>
                    </div>
                    <div>
                        <strong>样本量：</strong>${project.stats.sampleSize || project.dataSnapshot.totalRecords}
                    </div>
                </div>
            </div>
        </div>

        <div class="project-detail-section">
            <div class="section-title">
                📊 分析结论
            </div>
            <div class="section-content">
                ${project.conclusion}
            </div>
        </div>

        <div class="project-detail-section">
            <div class="section-title">
                💻 原始SQL脚本
            </div>
            <div class="code-block">
                <pre><code>${escapeHtml(project.sqlCode)}</code></pre>
            </div>
            <div style="margin-top: var(--spacing-md);">
                <button class="btn-secondary btn-small" onclick="copySQLCode('${projectId}')">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.2"/>
                        <path d="M5 3V2C5 1.44772 5.44772 1 6 1H12C12.5523 1 13 1.44772 13 2V8C13 8.55228 12.5523 9 12 9H11" stroke="currentColor" stroke-width="1.2"/>
                    </svg>
                    复制代码
                </button>
                <button class="btn-secondary btn-small" onclick="reuseSQLCode('${projectId}')">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M11 7C11 9.20914 9.20914 11 7 11C4.79086 11 3 9.20914 3 7C3 4.79086 4.79086 3 7 3C8.5 3 9.8 3.8 10.5 5M10.5 5V3M10.5 5H8.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
                    </svg>
                    复用到工作台
                </button>
            </div>
        </div>

        ${project.dataSnapshot ? `
        <div class="project-detail-section">
            <div class="section-title">
                📈 数据快照
            </div>
            <div class="section-content">
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--spacing-lg); margin-bottom: var(--spacing-lg);">
                    <div>
                        <div style="font-size: 12px; color: var(--text-tertiary); margin-bottom: 4px;">总记录数</div>
                        <div style="font-size: 24px; font-weight: 600;">${project.dataSnapshot.totalRecords.toLocaleString()}</div>
                    </div>
                    ${project.dataSnapshot.badUserCount ? `
                    <div>
                        <div style="font-size: 12px; color: var(--text-tertiary); margin-bottom: 4px;">坏账用户数</div>
                        <div style="font-size: 24px; font-weight: 600; color: #ef4444;">${project.dataSnapshot.badUserCount.toLocaleString()}</div>
                    </div>
                    <div>
                        <div style="font-size: 12px; color: var(--text-tertiary); margin-bottom: 4px;">整体坏账率</div>
                        <div style="font-size: 24px; font-weight: 600; color: #ef4444;">${project.dataSnapshot.badRate}%</div>
                    </div>
                    ` : ''}
                </div>
                
                ${project.dataSnapshot.features ? `
                <div>
                    <h4 style="margin: var(--spacing-lg) 0 var(--spacing-md); font-size: 14px;">特征重要度排序</h4>
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="border-bottom: 1px solid var(--border-color);">
                                <th style="padding: var(--spacing-sm); text-align: left; font-size: 13px; color: var(--text-secondary);">特征名称</th>
                                <th style="padding: var(--spacing-sm); text-align: center; font-size: 13px; color: var(--text-secondary);">IV值</th>
                                <th style="padding: var(--spacing-sm); text-align: center; font-size: 13px; color: var(--text-secondary);">重要度</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${project.dataSnapshot.features.map(f => `
                                <tr style="border-bottom: 1px solid var(--border-color);">
                                    <td style="padding: var(--spacing-sm);">${f.name}</td>
                                    <td style="padding: var(--spacing-sm); text-align: center; font-weight: 600;">${f.iv}</td>
                                    <td style="padding: var(--spacing-sm); text-align: center;">
                                        <span class="tag ${f.importance === '极高' ? 'tag-red' : f.importance === '高' ? 'tag-orange' : 'tag-blue'}">${f.importance}</span>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                ` : ''}
            </div>
        </div>
        ` : ''}

        <div class="project-detail-section">
            <div class="section-title">
                🔄 工作流程记录
            </div>
            <div class="section-content">
                ${project.workflow.map((step, index) => `
                    <div style="display: flex; align-items: center; gap: var(--spacing-md); margin-bottom: ${index < project.workflow.length - 1 ? 'var(--spacing-md)' : '0'}; padding-bottom: ${index < project.workflow.length - 1 ? 'var(--spacing-md)' : '0'}; border-bottom: ${index < project.workflow.length - 1 ? '1px solid var(--border-color)' : 'none'};">
                        <div style="width: 40px; height: 40px; border-radius: 50%; background: ${step.status === 'completed' ? 'rgba(16, 185, 129, 0.1)' : step.status === 'in-progress' ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-tertiary)'}; color: ${step.status === 'completed' ? '#10b981' : step.status === 'in-progress' ? '#3b82f6' : 'var(--text-tertiary)'}; display: flex; align-items: center; justify-content: center; font-weight: 600; flex-shrink: 0;">
                            ${step.status === 'completed' ? '✓' : step.status === 'in-progress' ? '...' : index + 1}
                        </div>
                        <div style="flex: 1;">
                            <div style="font-weight: 600; margin-bottom: 4px;">${step.step}</div>
                            <div style="font-size: 13px; color: var(--text-secondary);">${step.details || step.time}</div>
                        </div>
                        <div style="font-size: 13px; color: var(--text-tertiary); white-space: nowrap;">${step.time}</div>
                    </div>
                `).join('')}
            </div>
        </div>

        <div style="display: flex; gap: var(--spacing-md); justify-content: flex-end; margin-top: var(--spacing-xl); padding-top: var(--spacing-xl); border-top: 1px solid var(--border-color);">
            <button class="btn-secondary btn-medium" onclick="exportProject('${projectId}')">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 2V10M8 10L5 7M8 10L11 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M2 12V13C2 13.5523 2.44772 14 3 14H13C13.5523 14 14 13.5523 14 13V12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
                导出完整报告
            </button>
            <button class="btn-primary btn-medium" onclick="duplicateProject('${projectId}'); closeModal();">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="4" y="4" width="8" height="8" rx="1" stroke="currentColor" stroke-width="1.5"/>
                    <path d="M6 4V3C6 2.44772 6.44772 2 7 2H13C13.5523 2 14 2.44772 14 3V9C14 9.55228 13.5523 10 13 10H12" stroke="currentColor" stroke-width="1.5"/>
                </svg>
                复制项目
            </button>
        </div>
    `;

    modal.style.display = 'flex';
}

/**
 * 关闭模态框
 */
function closeModal() {
    const modal = document.getElementById('projectModal');
    modal.style.display = 'none';
}

/**
 * 导出项目
 */
function exportProject(projectId) {
    const project = mockProjects[projectId];
    if (!project) return;

    showNotification(`正在导出项目"${project.title}"...`);
    
    // 模拟导出过程
    setTimeout(() => {
        showNotification(`✅ 项目"${project.title}"导出成功！`, 'success');
        console.log('导出项目:', project);
    }, 1500);
}

/**
 * 复制项目
 */
function duplicateProject(projectId) {
    const project = mockProjects[projectId];
    if (!project) return;

    showNotification(`正在复制项目"${project.title}"...`);
    
    setTimeout(() => {
        showNotification(`✅ 项目已复制！可在工作台继续编辑。`, 'success');
        console.log('复制项目:', project);
    }, 1000);
}

/**
 * 删除项目
 */
function deleteProject(projectId) {
    const project = mockProjects[projectId];
    if (!project) return;

    if (confirm(`确定要删除项目"${project.title}"吗？此操作不可恢复！`)) {
        showNotification(`正在删除项目"${project.title}"...`);
        
        setTimeout(() => {
            const card = document.querySelector(`.project-card[data-id="${projectId}"]`);
            if (card) {
                card.style.transition = 'all 0.3s ease';
                card.style.opacity = '0';
                card.style.transform = 'scale(0.9)';
                setTimeout(() => {
                    card.remove();
                    showNotification(`✅ 项目已删除`, 'success');
                }, 300);
            }
        }, 500);
    }
}

/**
 * 批量导出所有项目
 */
function exportAllProjects() {
    showNotification('正在导出所有项目...');
    
    setTimeout(() => {
        showNotification('✅ 所有项目已导出！', 'success');
        console.log('导出所有项目');
    }, 2000);
}

/**
 * 复制SQL代码
 */
function copySQLCode(projectId) {
    const project = mockProjects[projectId];
    if (!project) return;

    // 创建临时textarea来复制内容
    const textarea = document.createElement('textarea');
    textarea.value = project.sqlCode;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);

    showNotification('✅ SQL代码已复制到剪贴板', 'success');
}

/**
 * 复用SQL代码到工作台
 */
function reuseSQLCode(projectId) {
    const project = mockProjects[projectId];
    if (!project) return;

    // 将SQL代码存储到localStorage
    localStorage.setItem('reusedSQL', project.sqlCode);
    localStorage.setItem('reusedProjectTitle', project.title);

    showNotification('✅ 代码已加载到工作台', 'success');

    // 2秒后跳转到工作台
    setTimeout(() => {
        window.location.href = 'workspace.html?reuse=true';
    }, 1000);
}

/**
 * 辅助函数：转义HTML
 */
function escapeHtml(text) {
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
 * 辅助函数：获取状态标签类名
 */
function getStatusTagClass(status) {
    const map = {
        'completed': 'tag-green',
        'in-progress': 'tag-blue',
        'draft': 'tag-yellow'
    };
    return map[status] || 'tag-blue';
}

/**
 * 辅助函数：获取状态文本
 */
function getStatusText(status) {
    const map = {
        'completed': '已完成',
        'in-progress': '进行中',
        'draft': '草稿'
    };
    return map[status] || status;
}

/**
 * 显示通知
 */
function showNotification(message, type = 'info') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        padding: 16px 20px;
        background: ${type === 'success' ? 'rgba(16, 185, 129, 0.95)' : type === 'error' ? 'rgba(239, 68, 68, 0.95)' : 'rgba(59, 130, 246, 0.95)'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        max-width: 350px;
        font-size: 14px;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    // 3秒后自动移除
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100px);
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
            transform: translateX(100px);
        }
    }
`;
document.head.appendChild(style);

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('项目管理页面已加载');
    
    // 监听ESC键关闭模态框
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
});
