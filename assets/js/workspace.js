/**
 * 策略E+ 智能化系统 - 工作台脚本
 */

// 全局状态
const state = {
    currentModule: 'operation',
    currentView: 'welcome',
    conversationHistory: [],
    chart: null
};

// 模拟数据库
const mockData = {
    // 逾期用户特征数据
    overdueAnalysis: {
        ages: ['18-25', '26-30', '31-35', '36-40', '41-50', '50+'],
        counts: [1234, 2345, 1876, 1456, 987, 543],
        overdueRates: [0.15, 0.12, 0.08, 0.06, 0.05, 0.04],
        sql: `SELECT 
    CASE 
        WHEN age BETWEEN 18 AND 25 THEN '18-25'
        WHEN age BETWEEN 26 AND 30 THEN '26-30'
        WHEN age BETWEEN 31 AND 35 THEN '31-35'
        WHEN age BETWEEN 36 AND 40 THEN '36-40'
        WHEN age BETWEEN 41 AND 50 THEN '41-50'
        ELSE '50+'
    END AS age_group,
    COUNT(*) AS total_users,
    SUM(CASE WHEN overdue_days > 7 THEN 1 ELSE 0 END) AS overdue_users,
    ROUND(SUM(CASE WHEN overdue_days > 7 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) AS overdue_rate
FROM user_credit_table
WHERE create_time >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY age_group
ORDER BY overdue_rate DESC;`,
        rows: 8432,
        execTime: '1.24s'
    },
    
    // 高风险客群特征
    riskFeatures: {
        features: ['逾期记录>2次', '借款金额>2万', '入网时长<3月', '年龄<25岁', '收入<5000'],
        ivValues: [0.498, 0.412, 0.356, 0.324, 0.287],
        ksValues: [0.456, 0.389, 0.312, 0.287, 0.245]
    },
    
    // 策略回测数据 - 场景1：年轻用户风险策略
    backtestYoungUsers: {
        title: '年轻用户风险拦截策略回测报告',
        period: '2025年12月',
        sampleSize: 45678,
        strategyRule: 'IF (年龄 < 25岁) AND (收入 < 5000元) AND (入网时长 < 3个月) THEN 拒绝',
        oldStrategy: {
            name: '原策略',
            passRate: 0.72,
            badRate: 0.08,
            ks: 0.32,
            approvedCount: 32888,
            rejectedCount: 12790,
            badCount: 2631
        },
        newStrategy: {
            name: '新策略（拦截年轻高风险用户）',
            passRate: 0.68,
            badRate: 0.06,
            ks: 0.38,
            approvedCount: 31061,
            rejectedCount: 14617,
            badCount: 1864
        },
        swapAnalysis: {
            newReject: 1827,
            newRejectBad: 312,
            newRejectBadRate: 0.171,
            newApprove: 0,
            newApproveBad: 0
        },
        conclusion: {
            improvement: '显著',
            badRateReduction: 25,
            ksImprovement: 18.75,
            falseRejectRate: 4.8,
            recommendation: '建议在沙箱环境中进行10%流量测试，观察1-2周后决定是否全量上线'
        }
    },
    
    // 策略回测数据 - 场景2：多头借贷拦截策略
    backtestMultiLoan: {
        title: '多头借贷客户拦截策略回测报告',
        period: '2025年11月-12月',
        sampleSize: 52341,
        strategyRule: 'IF (近3个月申请次数 >= 5次) OR (当前在贷机构数 >= 3个) THEN 拒绝',
        oldStrategy: {
            name: '原策略',
            passRate: 0.75,
            badRate: 0.095,
            ks: 0.29,
            approvedCount: 39256,
            rejectedCount: 13085,
            badCount: 3729
        },
        newStrategy: {
            name: '新策略（拦截多头借贷）',
            passRate: 0.62,
            badRate: 0.055,
            ks: 0.42,
            approvedCount: 32451,
            rejectedCount: 19890,
            badCount: 1785
        },
        swapAnalysis: {
            newReject: 6805,
            newRejectBad: 1944,
            newRejectBadRate: 0.286,
            newApprove: 0,
            newApproveBad: 0
        },
        conclusion: {
            improvement: '优秀',
            badRateReduction: 42.1,
            ksImprovement: 44.8,
            falseRejectRate: 9.3,
            recommendation: '策略效果显著，坏账率大幅降低。建议小流量试运行1周后快速放量'
        }
    },
    
    // 策略回测数据 - 场景3：收入验证策略
    backtestIncome: {
        title: '低收入客群准入策略优化报告',
        period: '2025年12月',
        sampleSize: 38924,
        strategyRule: 'IF (月收入 < 4000元) AND (借款金额 > 月收入×3) THEN 拒绝',
        oldStrategy: {
            name: '原策略',
            passRate: 0.78,
            badRate: 0.072,
            ks: 0.34,
            approvedCount: 30361,
            rejectedCount: 8563,
            badCount: 2186
        },
        newStrategy: {
            name: '新策略（收入借款比限制）',
            passRate: 0.71,
            badRate: 0.051,
            ks: 0.39,
            approvedCount: 27636,
            rejectedCount: 11288,
            badCount: 1409
        },
        swapAnalysis: {
            newReject: 2725,
            newRejectBad: 777,
            newRejectBadRate: 0.285,
            newApprove: 0,
            newApproveBad: 0
        },
        conclusion: {
            improvement: '显著',
            badRateReduction: 29.2,
            ksImprovement: 14.7,
            falseRejectRate: 5.0,
            recommendation: '策略合理，建议结合用户还款能力评估后上线'
        }
    }
};

// 页面加载完成
document.addEventListener('DOMContentLoaded', function() {
    initWorkspace();
    initModuleSelector();
    initMessageInput();
    loadModuleFromURL();
});

/**
 * 初始化工作台
 */
function initWorkspace() {
    console.log('工作台初始化...');
    
    // 自动调整输入框高度
    const messageInput = document.getElementById('messageInput');
    if (messageInput) {
        messageInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = this.scrollHeight + 'px';
        });
    }
}

/**
 * 初始化模块选择器
 */
function initModuleSelector() {
    const moduleButtons = document.querySelectorAll('.module-btn');
    moduleButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const module = this.dataset.module;
            switchModule(module);
        });
    });
}

/**
 * 初始化消息输入
 */
function initMessageInput() {
    const input = document.getElementById('messageInput');
    if (input) {
        input.addEventListener('keydown', handleInputKeydown);
    }
}

/**
 * 从URL加载模块
 */
function loadModuleFromURL() {
    const params = new URLSearchParams(window.location.search);
    const module = params.get('module');
    if (module) {
        switchModule(module);
    }
}

/**
 * 切换模块
 */
function switchModule(module) {
    state.currentModule = module;
    
    // 更新按钮状态
    document.querySelectorAll('.module-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.module === module);
    });
    
    // 更新快捷建议
    updateQuickSuggestions(module);
}

/**
 * 更新快捷建议
 */
function updateQuickSuggestions(module) {
    const suggestions = {
        operation: [
            '查询近30天内逾期超过7天的用户，分析其年龄、收入、入网时长等特征',
            '提取近3个月新增用户的基础信息和信贷行为数据',
            '关联用户基础表和还款表，计算每个用户的平均还款率',
            '查询入网时间在6个月以上且有逾期记录的用户数量'
        ],
        insight: [
            '帮我挖掘高风险客群，重点关注年龄、收入、借款金额的组合特征',
            '对"收入"字段进行智能分箱，分析不同收入区间的坏账率',
            '自动计算所有特征变量的IV值，推荐区分度最高的TOP10',
            '分析年龄与借款金额的交叉特征，找出风险最高的客群'
        ],
        reporting: [
            '生成年轻用户风险拦截策略回测报告',
            '生成多头借贷客户拦截策略回测报告',
            '生成低收入客群准入策略优化报告',
            '将策略规则翻译成白话文并生成换手分析'
        ],
        knowledge: [
            '查询民族字段是否可以作为拒绝规则使用',
            '什么是IV值？如何解读IV值的大小？',
            '查询公司风控策略审批流程和SOP规范',
            '历史上有哪些成功的反欺诈策略案例？'
        ]
    };
    
    const container = document.getElementById('quickSuggestions');
    if (container && suggestions[module]) {
        container.innerHTML = suggestions[module]
            .map(text => `<button class="suggestion-btn" onclick="sendPredefinedMessage('${text}')">${text}</button>`)
            .join('');
    }
}

/**
 * 处理输入框按键
 */
function handleInputKeydown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

/**
 * 发送预定义消息
 */
function sendPredefinedMessage(message) {
    const input = document.getElementById('messageInput');
    if (input) {
        input.value = message;
        sendMessage();
    }
}

/**
 * 发送消息
 */
function sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // 添加用户消息到对话框
    addMessage(message, 'user');
    
    // 清空输入框
    input.value = '';
    input.style.height = 'auto';
    
    // 隐藏快捷建议
    const suggestions = document.getElementById('quickSuggestions');
    if (suggestions) {
        suggestions.style.display = 'none';
    }
    
    // 显示AI处理状态
    showAIStatus(true);
    
    // 模拟AI处理
    setTimeout(() => {
        processMessage(message);
        showAIStatus(false);
    }, 1500);
}

/**
 * 显示AI状态
 */
function showAIStatus(show) {
    const status = document.getElementById('aiStatus');
    if (status) {
        status.style.display = show ? 'block' : 'none';
        
        if (show) {
            const messages = [
                '正在理解您的需求...',
                '正在生成查询代码...',
                '正在执行数据分析...',
                '正在计算风险指标...',
                '正在生成可视化图表...'
            ];
            
            let index = 0;
            const interval = setInterval(() => {
                const text = status.querySelector('.status-text');
                if (text && show) {
                    text.textContent = messages[index % messages.length];
                    index++;
                } else {
                    clearInterval(interval);
                }
            }, 500);
        }
    }
}

/**
 * 滚动到聊天底部
 */
function scrollToBottom() {
    const messagesContainer = document.getElementById('chatMessages');
    if (messagesContainer) {
        setTimeout(() => {
            messagesContainer.scrollTo({
                top: messagesContainer.scrollHeight,
                behavior: 'smooth'
            });
        }, 100);
    }
}

/**
 * 添加消息到聊天框
 */
function addMessage(content, type = 'system', options = {}) {
    const messagesContainer = document.getElementById('chatMessages');
    if (!messagesContainer) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}-message`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    
    if (type === 'user') {
        avatar.innerHTML = '<div class="user-avatar">策</div>';
    } else {
        avatar.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="url(#ai-gradient-${Date.now()})"/>
                <path d="M8 10H10M14 10H16M9 14C9 14 10 16 12 16C14 16 15 14 15 14" stroke="white" stroke-width="2" stroke-linecap="round"/>
                <defs>
                    <linearGradient id="ai-gradient-${Date.now()}" x1="2" y1="2" x2="22" y2="22">
                        <stop offset="0%" stop-color="#667eea"/>
                        <stop offset="100%" stop-color="#764ba2"/>
                    </linearGradient>
                </defs>
            </svg>
        `;
    }
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    const header = document.createElement('div');
    header.className = 'message-header';
    header.innerHTML = `
        <span class="message-sender">${type === 'user' ? '策略分析师' : '策略E+ AI助手'}</span>
        <span class="message-time">刚刚</span>
    `;
    
    const text = document.createElement('div');
    text.className = 'message-text';
    text.innerHTML = content;
    
    contentDiv.appendChild(header);
    contentDiv.appendChild(text);
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(contentDiv);
    
    messagesContainer.appendChild(messageDiv);
    
    // 平滑滚动到底部
    scrollToBottom();
    
    return messageDiv;
}

/**
 * 处理消息
 */
function processMessage(message) {
    const lowerMessage = message.toLowerCase();
    
    // 根据消息内容判断处理方式
    if (lowerMessage.includes('查询') || lowerMessage.includes('提取') || lowerMessage.includes('数据')) {
        handleDataQuery(message);
    } else if (lowerMessage.includes('挖掘') || lowerMessage.includes('特征') || lowerMessage.includes('分箱')) {
        handleFeatureAnalysis(message);
    } else if (lowerMessage.includes('报告') || lowerMessage.includes('回测') || lowerMessage.includes('白话')) {
        handleReportGeneration(message);
    } else if (lowerMessage.includes('查询') && (lowerMessage.includes('民族') || lowerMessage.includes('合规'))) {
        handleComplianceCheck(message);
    } else {
        // 默认响应
        addMessage('<p>我已经理解您的需求。让我为您分析...</p>');
        scrollToBottom();
    }
}

/**
 * 处理数据查询
 */
function handleDataQuery(message) {
    const data = mockData.overdueAnalysis;
    
    // AI响应
    addMessage(`
        <p>✓ 已理解您的需求，正在为您生成查询代码...</p>
        <p><strong>任务拆解：</strong></p>
        <ul>
            <li>1️⃣ 确定数据源：user_credit_table（用户信贷表）</li>
            <li>2️⃣ 时间范围：近30天</li>
            <li>3️⃣ 筛选条件：逾期天数 > 7天</li>
            <li>4️⃣ 分析维度：年龄、收入、入网时长</li>
        </ul>
        <p>代码已生成，请在右侧查看 →</p>
    `);
    scrollToBottom();
    
    // 显示代码视图
    showCodeView(data.sql, {
        rows: data.rows,
        execTime: data.execTime,
        missing: '2.3%'
    });
    
    // 2秒后显示进一步分析
    setTimeout(() => {
        addMessage(`
            <p>✅ <strong>沙箱预检完成！</strong></p>
            <p>已在沙箱环境中测试查询（LIMIT 100条），代码质量检查通过：</p>
            <ul style="line-height: 1.8;">
                <li>✓ SQL语法正确</li>
                <li>✓ 数据访问权限正常</li>
                <li>✓ 数据缺失率 <strong>2.3%</strong>（可接受）</li>
            </ul>
            <div style="background: rgba(102, 126, 234, 0.1); padding: 12px; border-radius: 8px; margin-top: 12px;">
                <p style="margin-bottom: 8px;"><strong>📊 预检数据分析（基于100条样本）：</strong></p>
                <ul style="line-height: 1.8; margin-bottom: 0;">
                    <li>🔴 18-25岁年龄段逾期率最高（15%）</li>
                    <li>🟡 26-30岁年龄段逾期率次之（12%）</li>
                    <li>🟢 40岁以上客群逾期率较低（<6%）</li>
                </ul>
            </div>
            <p style="margin-top: 12px;"><strong>💡 下一步操作：</strong></p>
            <p>预检通过后，您可以：</p>
            <ul style="line-height: 1.8;">
                <li>1️⃣ 点击"执行全量数据"获取完整的 <strong>${data.rows.toLocaleString()}</strong> 条记录</li>
                <li>2️⃣ 直接进入"策略挖掘"步骤（使用沙箱数据即可开始分析）</li>
            </ul>
        `);
        scrollToBottom();
        
        // 显示图表
        setTimeout(() => {
            showChartView('bar', '年龄分布与逾期率分析（沙箱数据）', data.ages, data.overdueRates);
            // 标记数据助手步骤完成
            markStepCompleted('operation');
        }, 1000);
    }, 2000);
}

/**
 * 处理特征分析
 */
function handleFeatureAnalysis(message) {
    const data = mockData.riskFeatures;
    
    addMessage(`
        <p>🔍 开始进行特征挖掘...</p>
        <p><strong>分析策略：</strong></p>
        <ul>
            <li>遍历所有候选特征（共 <strong>156</strong> 个）</li>
            <li>计算每个特征的IV值（信息价值）</li>
            <li>对高IV值特征进行智能分箱</li>
            <li>交叉分析双变量组合</li>
        </ul>
    `);
    scrollToBottom();
    
    setTimeout(() => {
        addMessage(`
            <p>✅ 特征挖掘完成！</p>
            <p><strong>TOP 5 高区分度特征：</strong></p>
            <ul>
                <li>📌 <strong>逾期记录次数</strong> - IV: 0.498 (优秀)</li>
                <li>📌 <strong>借款金额</strong> - IV: 0.412 (优秀)</li>
                <li>📌 <strong>入网时长</strong> - IV: 0.356 (良好)</li>
                <li>📌 <strong>年龄</strong> - IV: 0.324 (良好)</li>
                <li>📌 <strong>收入水平</strong> - IV: 0.287 (中等)</li>
            </ul>
            <p><strong>建议策略规则：</strong></p>
            <p style="background: rgba(102, 126, 234, 0.1); padding: 12px; border-radius: 8px; margin-top: 12px;">
                IF (年龄 < 25岁) AND (收入 < 5000元) AND (入网时长 < 3个月)<br>
                THEN <span style="color: #ef4444;">拒绝</span><br>
                <span style="font-size: 12px; color: #a8b2d1;">预期可拦截高风险客户 23%，误伤率 < 5%</span>
            </p>
        `);
        scrollToBottom();
        
        // 显示特征分析图表
        showChartView('binning', '特征IV值分布', data.features, data.ivValues);
        // 标记策略挖掘步骤完成
        setTimeout(() => {
            markStepCompleted('insight');
        }, 500);
    }, 2500);
}

/**
 * 处理报告生成
 */
function handleReportGeneration(message) {
    const lowerMessage = message.toLowerCase();
    let reportData;
    let reportType = 'backtest';
    
    // 根据消息内容选择不同的报告类型
    if (lowerMessage.includes('年轻') || lowerMessage.includes('年龄')) {
        reportData = mockData.backtestYoungUsers;
        reportType = 'backtest';
    } else if (lowerMessage.includes('多头') || lowerMessage.includes('借贷')) {
        reportData = mockData.backtestMultiLoan;
        reportType = 'backtest';
    } else if (lowerMessage.includes('收入') || lowerMessage.includes('低收入')) {
        reportData = mockData.backtestIncome;
        reportType = 'backtest';
    } else {
        // 默认使用年轻用户策略报告
        reportData = mockData.backtestYoungUsers;
        reportType = 'backtest';
    }
    
    addMessage(`
        <p>📄 正在生成策略分析报告...</p>
        <p><strong>报告配置：</strong></p>
        <ul>
            <li>报告类型：${reportData.title}</li>
            <li>回测时间段：${reportData.period}</li>
            <li>样本量：${reportData.sampleSize.toLocaleString()} 笔申请</li>
            <li>对照组：原策略规则</li>
            <li>实验组：新策略规则</li>
        </ul>
    `);
    scrollToBottom();
    
    setTimeout(() => {
        showReportView(reportData, reportType);
        
        const badRateChange = ((reportData.newStrategy.badRate - reportData.oldStrategy.badRate) / reportData.oldStrategy.badRate * 100).toFixed(1);
        const ksChange = ((reportData.newStrategy.ks - reportData.oldStrategy.ks) / reportData.oldStrategy.ks * 100).toFixed(1);
        const passRateChange = ((reportData.newStrategy.passRate - reportData.oldStrategy.passRate) / reportData.oldStrategy.passRate * 100).toFixed(1);
        
        addMessage(`
            <p>✅ 报告生成完成！</p>
            <p><strong>核心结论：</strong></p>
            <ul>
                <li>✓ 新策略使坏账率从 <strong>${(reportData.oldStrategy.badRate * 100).toFixed(1)}%</strong> 降至 <strong>${(reportData.newStrategy.badRate * 100).toFixed(1)}%</strong>（降低${Math.abs(badRateChange)}%）</li>
                <li>✓ KS值从 <strong>${reportData.oldStrategy.ks.toFixed(2)}</strong> 提升至 <strong>${reportData.newStrategy.ks.toFixed(2)}</strong>（提升${ksChange}%）</li>
                <li>⚠️ 通过率从 <strong>${(reportData.oldStrategy.passRate * 100).toFixed(1)}%</strong> 调整至 <strong>${(reportData.newStrategy.passRate * 100).toFixed(1)}%</strong>（变化${passRateChange}%）</li>
            </ul>
            <p><strong>综合评价：</strong>${reportData.conclusion.improvement === '优秀' ? '🌟🌟🌟 ' : reportData.conclusion.improvement === '显著' ? '🌟🌟 ' : '🌟 '}策略效果${reportData.conclusion.improvement}</p>
            <p>完整报告已在右侧生成，支持导出为Word/PDF/PPT格式 →</p>
        `);
        scrollToBottom();
        // 标记报告生成步骤完成
        markStepCompleted('reporting');
    }, 2000);
}

/**
 * 处理合规检查
 */
function handleComplianceCheck(message) {
    if (message.includes('民族') || message.includes('性别') || message.includes('宗教')) {
        addMessage(`
            <p>⚠️ <strong>合规警告</strong></p>
            <p style="background: rgba(239, 68, 68, 0.1); padding: 12px; border-radius: 8px; border-left: 3px solid #ef4444;">
                根据《个人信息保护法》和公司风控管理办法，<strong>严禁使用以下敏感字段</strong>作为拒绝规则：
            </p>
            <ul>
                <li>🚫 民族</li>
                <li>🚫 宗教信仰</li>
                <li>🚫 性别（作为主要拒绝依据）</li>
                <li>🚫 政治观点</li>
            </ul>
            <p><strong>合规建议：</strong></p>
            <ul>
                <li>✓ 可使用行为类特征（如还款记录、交易行为）</li>
                <li>✓ 可使用信用类特征（如征信评分、逾期次数）</li>
                <li>✓ 可使用经济类特征（如收入、资产）</li>
            </ul>
            <p>📚 相关制度：《风控策略管理办法 V3.0》第4.2条</p>
        `);
        scrollToBottom();
    } else {
        addMessage(`
            <p>📚 正在查询知识库...</p>
            <p>已为您找到相关制度文档：</p>
            <ul>
                <li>《风控策略管理办法 V3.0》</li>
                <li>《策略开发SOP规范》</li>
                <li>《数据安全与隐私保护指南》</li>
            </ul>
        `);
        scrollToBottom();
    }
}

/**
 * 显示代码视图
 */
function showCodeView(code, stats) {
    // 切换到代码标签
    switchCanvasView('code');
    
    // 更新代码内容 - 添加LIMIT 100说明
    const codeContent = document.getElementById('codeContent');
    if (codeContent) {
        const sandboxCode = code.trim().replace(/;?\s*$/, '') + '\nLIMIT 100;  -- 沙箱模式：仅查询前100条数据进行预检';
        codeContent.innerHTML = `<code>${escapeHtml(sandboxCode)}</code>`;
    }
    
    // 更新统计信息 - 标注为沙箱测试结果
    if (stats) {
        document.getElementById('resultRows').textContent = '100';  // 沙箱固定100条
        document.getElementById('resultTime').textContent = stats.execTime || '0ms';
        document.getElementById('resultMissing').textContent = stats.missing || '0%';
    }
    
    // 生成示例数据表格
    const resultTable = document.getElementById('resultTable');
    if (resultTable) {
        resultTable.innerHTML = `
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: var(--bg-tertiary); text-align: left;">
                        <th style="padding: 12px; border: 1px solid var(--border-color);">年龄段</th>
                        <th style="padding: 12px; border: 1px solid var(--border-color);">用户数</th>
                        <th style="padding: 12px; border: 1px solid var(--border-color);">逾期用户数</th>
                        <th style="padding: 12px; border: 1px solid var(--border-color);">逾期率</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="padding: 12px; border: 1px solid var(--border-color);">18-25</td>
                        <td style="padding: 12px; border: 1px solid var(--border-color);">1,234</td>
                        <td style="padding: 12px; border: 1px solid var(--border-color);">185</td>
                        <td style="padding: 12px; border: 1px solid var(--border-color); color: #ef4444; font-weight: 600;">15.0%</td>
                    </tr>
                    <tr style="background: var(--bg-tertiary);">
                        <td style="padding: 12px; border: 1px solid var(--border-color);">26-30</td>
                        <td style="padding: 12px; border: 1px solid var(--border-color);">2,345</td>
                        <td style="padding: 12px; border: 1px solid var(--border-color);">281</td>
                        <td style="padding: 12px; border: 1px solid var(--border-color); color: #f59e0b; font-weight: 600;">12.0%</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px; border: 1px solid var(--border-color);">31-35</td>
                        <td style="padding: 12px; border: 1px solid var(--border-color);">1,876</td>
                        <td style="padding: 12px; border: 1px solid var(--border-color);">150</td>
                        <td style="padding: 12px; border: 1px solid var(--border-color); color: #10b981; font-weight: 600;">8.0%</td>
                    </tr>
                    <tr style="background: var(--bg-tertiary);">
                        <td style="padding: 12px; border: 1px solid var(--border-color);">36-40</td>
                        <td style="padding: 12px; border: 1px solid var(--border-color);">1,456</td>
                        <td style="padding: 12px; border: 1px solid var(--border-color);">87</td>
                        <td style="padding: 12px; border: 1px solid var(--border-color); color: #10b981; font-weight: 600;">6.0%</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px; border: 1px solid var(--border-color);">41-50</td>
                        <td style="padding: 12px; border: 1px solid var(--border-color);">987</td>
                        <td style="padding: 12px; border: 1px solid var(--border-color);">49</td>
                        <td style="padding: 12px; border: 1px solid var(--border-color); color: #10b981; font-weight: 600;">5.0%</td>
                    </tr>
                </tbody>
            </table>
        `;
    }
}

/**
 * 显示图表视图
 */
function showChartView(type, title, labels, data) {
    switchCanvasView('chart');
    
    // 更新标题
    const chartTitle = document.getElementById('chartTitle');
    if (chartTitle) {
        chartTitle.textContent = title;
    }
    
    // 销毁旧图表
    if (state.chart) {
        state.chart.destroy();
    }
    
    // 创建新图表
    const ctx = document.getElementById('mainChart');
    if (ctx) {
        const chartConfig = {
            type: type === 'binning' ? 'bar' : type,
            data: {
                labels: labels,
                datasets: [{
                    label: type === 'binning' ? 'IV值' : '逾期率',
                    data: data,
                    backgroundColor: createGradient(ctx),
                    borderColor: '#667eea',
                    borderWidth: 2,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        labels: {
                            color: '#a8b2d1',
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: '#1e2542',
                        titleColor: '#ffffff',
                        bodyColor: '#a8b2d1',
                        borderColor: '#667eea',
                        borderWidth: 1,
                        padding: 12,
                        displayColors: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: '#2d3557'
                        },
                        ticks: {
                            color: '#a8b2d1',
                            callback: function(value) {
                                return (value * 100).toFixed(0) + '%';
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#a8b2d1'
                        }
                    }
                }
            }
        };
        
        state.chart = new Chart(ctx, chartConfig);
    }
    
    // 更新IV/KS/Gini值
    if (type === 'binning') {
        document.getElementById('ivValue').textContent = '0.412';
        document.getElementById('ksValue').textContent = '0.389';
        document.getElementById('giniValue').textContent = '0.478';
    }
}

/**
 * 创建渐变色
 */
function createGradient(ctx) {
    const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(102, 126, 234, 0.8)');
    gradient.addColorStop(1, 'rgba(118, 75, 162, 0.4)');
    return gradient;
}

/**
 * 显示报告视图
 */
function showReportView(data, reportType = 'backtest') {
    switchCanvasView('report');
    
    const reportContent = document.getElementById('reportContent');
    if (reportContent && reportType === 'backtest') {
        // 生成回测报告
        reportContent.innerHTML = generateBacktestReport(data);
    }
    
    // 更新报告标题和日期
    const reportTitle = document.getElementById('reportTitle');
    if (reportTitle) {
        reportTitle.textContent = data.title || '策略分析报告';
    }
    
    const reportDate = document.getElementById('reportDate');
    if (reportDate) {
        reportDate.textContent = new Date().toLocaleDateString('zh-CN');
    }
}

/**
 * 生成回测报告内容
 */
function generateBacktestReport(data) {
    const badRateDiff = ((data.newStrategy.badRate - data.oldStrategy.badRate) * 100).toFixed(1);
    const ksDiff = ((data.newStrategy.ks - data.oldStrategy.ks) * 100).toFixed(1);
    const passRateDiff = ((data.newStrategy.passRate - data.oldStrategy.passRate) * 100).toFixed(1);
    
    // 计算额外指标
    const badReduction = ((data.oldStrategy.badCount - data.newStrategy.badCount) / data.oldStrategy.badCount * 100).toFixed(1);
    const falseRejectRate = data.conclusion.falseRejectRate || 0;
    
    return `
        <!-- 执行摘要 -->
        <div style="background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1)); padding: 20px; border-radius: 12px; margin-bottom: 24px; border-left: 4px solid #667eea;">
            <h4 style="font-size: 18px; margin-bottom: 12px; color: #667eea;">📊 执行摘要</h4>
            <p style="font-size: 14px; line-height: 1.8; margin-bottom: 8px;">
                本次回测针对<strong>"${data.strategyRule}"</strong>策略规则进行全面评估。
                基于${data.period}的${data.sampleSize.toLocaleString()}笔真实申请数据，对比分析新旧策略的风险控制效果。
            </p>
            <p style="font-size: 14px; line-height: 1.8; color: #10b981; font-weight: 600;">
                ✓ 综合评价：策略效果${data.conclusion.improvement}，${badReduction > 0 ? '成功拦截' + badReduction + '%的坏账' : ''}
            </p>
        </div>
        
        <!-- 一、回测概况 -->
        <h4 style="font-size: 20px; margin-bottom: 16px;">一、回测概况</h4>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <tbody>
                <tr>
                    <td style="padding: 12px; border: 1px solid var(--border-color); width: 30%; background: var(--bg-tertiary);">回测时间段</td>
                    <td style="padding: 12px; border: 1px solid var(--border-color);">${data.period}</td>
                </tr>
                <tr>
                    <td style="padding: 12px; border: 1px solid var(--border-color); background: var(--bg-tertiary);">样本总量</td>
                    <td style="padding: 12px; border: 1px solid var(--border-color);"><strong>${data.sampleSize.toLocaleString()}</strong> 笔申请</td>
                </tr>
                <tr>
                    <td style="padding: 12px; border: 1px solid var(--border-color); background: var(--bg-tertiary);">策略规则</td>
                    <td style="padding: 12px; border: 1px solid var(--border-color); font-family: monospace; font-size: 13px;">${data.strategyRule}</td>
                </tr>
            </tbody>
        </table>
        
        <!-- 二、核心指标对比 -->
        <h4 style="font-size: 20px; margin: 24px 0 16px;">二、核心指标对比</h4>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <thead>
                <tr style="background: var(--bg-tertiary);">
                    <th style="padding: 12px; border: 1px solid var(--border-color); text-align: left;">指标</th>
                    <th style="padding: 12px; border: 1px solid var(--border-color); text-align: center;">${data.oldStrategy.name}</th>
                    <th style="padding: 12px; border: 1px solid var(--border-color); text-align: center;">${data.newStrategy.name}</th>
                    <th style="padding: 12px; border: 1px solid var(--border-color); text-align: center;">变化</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="padding: 12px; border: 1px solid var(--border-color);"><strong>通过率</strong></td>
                    <td style="padding: 12px; border: 1px solid var(--border-color); text-align: center;">${(data.oldStrategy.passRate * 100).toFixed(1)}%</td>
                    <td style="padding: 12px; border: 1px solid var(--border-color); text-align: center;">${(data.newStrategy.passRate * 100).toFixed(1)}%</td>
                    <td style="padding: 12px; border: 1px solid var(--border-color); text-align: center; color: ${passRateDiff < 0 ? '#f59e0b' : '#10b981'}; font-weight: 600;">
                        ${passRateDiff > 0 ? '+' : ''}${passRateDiff}%
                    </td>
                </tr>
                <tr style="background: var(--bg-tertiary);">
                    <td style="padding: 12px; border: 1px solid var(--border-color);"><strong>坏账率</strong> 🎯</td>
                    <td style="padding: 12px; border: 1px solid var(--border-color); text-align: center;">${(data.oldStrategy.badRate * 100).toFixed(1)}%</td>
                    <td style="padding: 12px; border: 1px solid var(--border-color); text-align: center;">${(data.newStrategy.badRate * 100).toFixed(1)}%</td>
                    <td style="padding: 12px; border: 1px solid var(--border-color); text-align: center; color: ${badRateDiff < 0 ? '#10b981' : '#ef4444'}; font-weight: 600;">
                        ${badRateDiff}% ${badRateDiff < 0 ? '✓' : '⚠️'}
                    </td>
                </tr>
                <tr>
                    <td style="padding: 12px; border: 1px solid var(--border-color);"><strong>KS值</strong></td>
                    <td style="padding: 12px; border: 1px solid var(--border-color); text-align: center;">${data.oldStrategy.ks.toFixed(3)}</td>
                    <td style="padding: 12px; border: 1px solid var(--border-color); text-align: center;">${data.newStrategy.ks.toFixed(3)}</td>
                    <td style="padding: 12px; border: 1px solid var(--border-color); text-align: center; color: ${ksDiff > 0 ? '#10b981' : '#ef4444'}; font-weight: 600;">
                        ${ksDiff > 0 ? '+' : ''}${ksDiff}% ${ksDiff > 0 ? '✓' : '⚠️'}
                    </td>
                </tr>
                <tr style="background: var(--bg-tertiary);">
                    <td style="padding: 12px; border: 1px solid var(--border-color);"><strong>通过人数</strong></td>
                    <td style="padding: 12px; border: 1px solid var(--border-color); text-align: center;">${data.oldStrategy.approvedCount.toLocaleString()}</td>
                    <td style="padding: 12px; border: 1px solid var(--border-color); text-align: center;">${data.newStrategy.approvedCount.toLocaleString()}</td>
                    <td style="padding: 12px; border: 1px solid var(--border-color); text-align: center;">${(data.newStrategy.approvedCount - data.oldStrategy.approvedCount).toLocaleString()}</td>
                </tr>
                <tr>
                    <td style="padding: 12px; border: 1px solid var(--border-color);"><strong>拒绝人数</strong></td>
                    <td style="padding: 12px; border: 1px solid var(--border-color); text-align: center;">${data.oldStrategy.rejectedCount.toLocaleString()}</td>
                    <td style="padding: 12px; border: 1px solid var(--border-color); text-align: center;">${data.newStrategy.rejectedCount.toLocaleString()}</td>
                    <td style="padding: 12px; border: 1px solid var(--border-color); text-align: center;">${(data.newStrategy.rejectedCount - data.oldStrategy.rejectedCount).toLocaleString()}</td>
                </tr>
                <tr style="background: var(--bg-tertiary);">
                    <td style="padding: 12px; border: 1px solid var(--border-color);"><strong>坏账人数</strong></td>
                    <td style="padding: 12px; border: 1px solid var(--border-color); text-align: center; color: #ef4444;">${data.oldStrategy.badCount.toLocaleString()}</td>
                    <td style="padding: 12px; border: 1px solid var(--border-color); text-align: center; color: #10b981;">${data.newStrategy.badCount.toLocaleString()}</td>
                    <td style="padding: 12px; border: 1px solid var(--border-color); text-align: center; color: #10b981; font-weight: 600;">
                        ${(data.newStrategy.badCount - data.oldStrategy.badCount).toLocaleString()} (${badReduction}% ↓)
                    </td>
                </tr>
            </tbody>
        </table>
        
        <!-- 三、换手分析 -->
        <h4 style="font-size: 20px; margin-bottom: 16px;">三、换手分析（Swap Set Analysis）</h4>
        <div style="background: var(--bg-tertiary); padding: 16px; border-radius: 8px; margin-bottom: 16px;">
            <p style="margin-bottom: 12px; font-size: 15px;"><strong>📍 新策略额外拒绝：</strong></p>
            <ul style="line-height: 1.8; margin-bottom: 0;">
                <li>新策略<strong style="color: #667eea;">额外拒绝</strong>了原策略通过的客户 <strong>${data.swapAnalysis.newReject.toLocaleString()}</strong> 人</li>
                <li>其中实际会发生坏账的客户 <strong style="color: #ef4444;">${data.swapAnalysis.newRejectBad.toLocaleString()}</strong> 人</li>
                <li>拦截准确率：<strong>${(data.swapAnalysis.newRejectBadRate * 100).toFixed(1)}%</strong> ${data.swapAnalysis.newRejectBadRate > 0.2 ? '✓ 效果显著' : ''}</li>
                <li>误伤率：<strong>${falseRejectRate}%</strong> ${falseRejectRate < 10 ? '✓ 在可接受范围内' : '⚠️ 需要关注'}</li>
            </ul>
        </div>
        
        <!-- 四、策略规则解释 -->
        <h4 style="font-size: 20px; margin-bottom: 16px;">四、策略规则解释</h4>
        <div style="background: rgba(102, 126, 234, 0.1); padding: 16px; border-radius: 8px; margin-bottom: 16px; border-left: 3px solid #667eea;">
            <p style="margin-bottom: 8px;"><strong>📝 代码表达式：</strong></p>
            <code style="display: block; background: var(--bg-secondary); padding: 12px; border-radius: 6px; font-family: 'Monaco', 'Menlo', monospace; font-size: 13px; margin-bottom: 12px;">
                ${data.strategyRule}
            </code>
            <p style="margin-bottom: 8px;"><strong>💬 白话翻译：</strong></p>
            <p style="line-height: 1.8; color: var(--text-secondary);">
                ${data.strategyRule.replace(/IF|THEN|AND|OR|<|>|=/g, match => {
                    const map = {
                        'IF': '如果', 'THEN': '那么', 'AND': '并且', 'OR': '或者',
                        '<': '小于', '>': '大于', '=': '等于'
                    };
                    return map[match] || match;
                })}
            </p>
        </div>
        
        <!-- 五、效果评估 -->
        <h4 style="font-size: 20px; margin-bottom: 16px;">五、效果评估</h4>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <tbody>
                <tr>
                    <td style="padding: 12px; border: 1px solid var(--border-color); width: 30%; background: var(--bg-tertiary);">综合评价</td>
                    <td style="padding: 12px; border: 1px solid var(--border-color);">
                        <span style="display: inline-block; padding: 4px 12px; background: ${
                            data.conclusion.improvement === '优秀' ? 'rgba(16, 185, 129, 0.2)' :
                            data.conclusion.improvement === '显著' ? 'rgba(102, 126, 234, 0.2)' : 'rgba(245, 158, 11, 0.2)'
                        }; color: ${
                            data.conclusion.improvement === '优秀' ? '#10b981' :
                            data.conclusion.improvement === '显著' ? '#667eea' : '#f59e0b'
                        }; border-radius: 4px; font-weight: 600;">
                            ${data.conclusion.improvement === '优秀' ? '🌟🌟🌟 优秀' : data.conclusion.improvement === '显著' ? '🌟🌟 显著' : '🌟 良好'}
                        </span>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 12px; border: 1px solid var(--border-color); background: var(--bg-tertiary);">坏账率降低</td>
                    <td style="padding: 12px; border: 1px solid var(--border-color); color: #10b981; font-weight: 600;">${data.conclusion.badRateReduction}% ✓</td>
                </tr>
                <tr>
                    <td style="padding: 12px; border: 1px solid var(--border-color); background: var(--bg-tertiary);">KS值提升</td>
                    <td style="padding: 12px; border: 1px solid var(--border-color); color: #10b981; font-weight: 600;">${data.conclusion.ksImprovement}% ✓</td>
                </tr>
                <tr>
                    <td style="padding: 12px; border: 1px solid var(--border-color); background: var(--bg-tertiary);">误伤率</td>
                    <td style="padding: 12px; border: 1px solid var(--border-color);">${data.conclusion.falseRejectRate}% ${data.conclusion.falseRejectRate < 10 ? '✓ 可接受' : '⚠️ 需优化'}</td>
                </tr>
            </tbody>
        </table>
        
        <!-- 六、结论与建议 -->
        <h4 style="font-size: 20px; margin-bottom: 16px;">六、结论与建议</h4>
        <div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(102, 126, 234, 0.1)); padding: 20px; border-radius: 12px; border-left: 4px solid #10b981;">
            <p style="line-height: 1.8; margin-bottom: 16px;">
                ${data.conclusion.recommendation}
            </p>
            <p style="line-height: 1.8; margin-bottom: 0; color: var(--text-secondary); font-size: 14px;">
                <strong>💡 风险提示：</strong>策略上线后需要持续监控核心指标，建议设置自动报警阈值，一旦发现异常及时回滚。
            </p>
        </div>
        
        <!-- 附录：数据说明 -->
        <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid var(--border-color);">
            <p style="font-size: 13px; color: var(--text-tertiary); line-height: 1.6;">
                <strong>数据说明：</strong>本报告基于${data.period}期间的真实业务数据进行回测分析。
                所有指标计算遵循公司风控策略评估标准。报告生成时间：${new Date().toLocaleString('zh-CN')}
            </p>
        </div>
    `;
}

/**
 * 切换画布视图
 */
function switchCanvasView(view) {
    state.currentView = view;
    
    // 更新标签页
    document.querySelectorAll('.canvas-tab').forEach(tab => {
        if (tab.dataset.view === view) {
            tab.classList.add('active');
            tab.style.display = 'flex';
        } else {
            tab.classList.remove('active');
        }
    });
    
    // 显示对应标签页
    if (view !== 'welcome') {
        document.querySelectorAll('.canvas-tab').forEach(tab => {
            tab.style.display = 'flex';
        });
    }
    
    // 更新视图
    document.querySelectorAll('.canvas-view').forEach(v => {
        v.classList.toggle('active', v.id === view + 'View');
    });
}

/**
 * 工具函数
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

function copyCode() {
    const code = document.querySelector('#codeContent code');
    if (code) {
        navigator.clipboard.writeText(code.textContent);
        showNotification('代码已复制到剪贴板');
    }
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        padding: 12px 24px;
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        border-radius: 8px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
        z-index: 1000;
        animation: slideIn 0.3s ease;
        font-size: 14px;
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function newSession() {
    if (confirm('确定要新建会话吗？当前会话将被清空。')) {
        location.reload();
    }
}

function saveSession() {
    showNotification('会话已保存');
}

function exportResults() {
    showNotification('导出功能开发中...');
}

function updateChartType() {
    showNotification('图表类型切换功能开发中...');
}

function applyBinning() {
    showNotification('分箱配置已应用');
}

function downloadReport(format) {
    showNotification(`正在导出${format.toUpperCase()}格式...`);
}

/**
 * 执行全量数据
 */
function executeFullData() {
    addMessage(`
        <p>⚡ <strong>正在执行全量数据查询...</strong></p>
        <p>已通过沙箱预检，现在执行完整查询（无LIMIT限制）</p>
        <div style="background: var(--bg-tertiary); padding: 12px; border-radius: 8px; margin-top: 12px;">
            <p style="margin-bottom: 8px;"><strong>执行进度：</strong></p>
            <ul style="line-height: 1.8; list-style: none; padding-left: 0;">
                <li>⏳ 正在连接数据库...</li>
                <li>⏳ 正在执行查询...</li>
                <li>⏳ 正在加载数据...</li>
            </ul>
        </div>
    `);
    scrollToBottom();
    
    // 模拟全量查询
    setTimeout(() => {
        addMessage(`
            <p>✅ <strong>全量查询完成！</strong></p>
            <p><strong>查询结果：</strong></p>
            <ul style="line-height: 1.8;">
                <li>📊 查询行数：<strong>8,432</strong> 条</li>
                <li>⏱️ 执行时间：<strong>3.47秒</strong></li>
                <li>📈 数据完整性：<strong>97.7%</strong></li>
                <li>⚠️ 缺失字段：收入字段缺失 <strong>2.3%</strong></li>
            </ul>
            <p style="margin-top: 12px;"><strong>💡 处理建议：</strong></p>
            <div style="background: rgba(102, 126, 234, 0.1); padding: 12px; border-radius: 8px;">
                <p>收入字段缺失率在可接受范围内（<5%），建议：</p>
                <ul style="line-height: 1.8;">
                    <li>方案1：使用平均值填充缺失数据</li>
                    <li>方案2：剔除缺失数据（推荐）</li>
                    <li>方案3：单独创建"收入未知"分箱</li>
                </ul>
            </div>
            <p style="margin-top: 12px;">数据已准备就绪，可以进入下一步：<strong>策略挖掘</strong> 🔍</p>
        `);
        scrollToBottom();
        
        // 更新右侧统计数据
        document.getElementById('resultRows').textContent = '8,432';
        document.getElementById('resultTime').textContent = '3.47s';
    }, 2000);
}

/**
 * 查看数据质量报告
 */
function showDataQualityReport() {
    addMessage(`
        <p>📊 <strong>数据质量报告</strong></p>
        <div style="background: var(--bg-card); padding: 16px; border-radius: 8px; border: 1px solid var(--border-color); margin-top: 12px;">
            <h4 style="font-size: 15px; margin-bottom: 12px;">一、数据完整性检查</h4>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 16px;">
                <thead>
                    <tr style="background: var(--bg-tertiary);">
                        <th style="padding: 8px; border: 1px solid var(--border-color); text-align: left;">字段名</th>
                        <th style="padding: 8px; border: 1px solid var(--border-color); text-align: center;">完整度</th>
                        <th style="padding: 8px; border: 1px solid var(--border-color); text-align: center;">评估</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="padding: 8px; border: 1px solid var(--border-color);">年龄 (age)</td>
                        <td style="padding: 8px; border: 1px solid var(--border-color); text-align: center;">100%</td>
                        <td style="padding: 8px; border: 1px solid var(--border-color); text-align: center; color: #10b981;">✓ 优秀</td>
                    </tr>
                    <tr style="background: var(--bg-tertiary);">
                        <td style="padding: 8px; border: 1px solid var(--border-color);">收入 (income)</td>
                        <td style="padding: 8px; border: 1px solid var(--border-color); text-align: center;">97.7%</td>
                        <td style="padding: 8px; border: 1px solid var(--border-color); text-align: center; color: #10b981;">✓ 良好</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid var(--border-color);">入网时长 (entry_months)</td>
                        <td style="padding: 8px; border: 1px solid var(--border-color); text-align: center;">100%</td>
                        <td style="padding: 8px; border: 1px solid var(--border-color); text-align: center; color: #10b981;">✓ 优秀</td>
                    </tr>
                    <tr style="background: var(--bg-tertiary);">
                        <td style="padding: 8px; border: 1px solid var(--border-color);">逾期天数 (overdue_days)</td>
                        <td style="padding: 8px; border: 1px solid var(--border-color); text-align: center;">100%</td>
                        <td style="padding: 8px; border: 1px solid var(--border-color); text-align: center; color: #10b981;">✓ 优秀</td>
                    </tr>
                </tbody>
            </table>
            
            <h4 style="font-size: 15px; margin-bottom: 12px;">二、数据分布检查</h4>
            <ul style="line-height: 1.8; font-size: 13px;">
                <li>✓ 年龄分布：正态分布，符合预期</li>
                <li>✓ 收入分布：右偏分布，符合实际</li>
                <li>⚠️ 逾期天数：发现 <strong>15%</strong> 的极端值（>30天）</li>
            </ul>
            
            <h4 style="font-size: 15px; margin: 16px 0 12px;">三、综合评估</h4>
            <div style="background: rgba(16, 185, 129, 0.1); padding: 12px; border-radius: 6px; border-left: 3px solid #10b981;">
                <p style="margin: 0; font-size: 13px;"><strong>✓ 数据质量：优秀</strong></p>
                <p style="margin: 4px 0 0; font-size: 13px; color: var(--text-secondary);">
                    数据完整度高，分布合理，可以直接用于策略分析。收入字段缺失率2.3%在可接受范围内。
                </p>
            </div>
        </div>
    `);
    scrollToBottom();
}

/**
 * 标记步骤完成（保留兼容性，实际不执行操作）
 */
function markStepCompleted(module) {
    // 工作流模式已移除，此函数保留仅为兼容性
}

/**
 * 获取模块名称
 */
function getModuleName(module) {
    const names = {
        'operation': '数据助手',
        'insight': '策略挖掘',
        'reporting': '报告生成',
        'knowledge': '知识库'
    };
    return names[module] || module;
}

/**
 * 切换样本条件选择器
 */
function toggleSampleSelector() {
    const selector = document.getElementById('sampleSelector');
    const suggestions = document.getElementById('quickSuggestions');
    
    if (selector.style.display === 'none') {
        selector.style.display = 'block';
        suggestions.style.display = 'none';
    } else {
        selector.style.display = 'none';
        suggestions.style.display = 'flex';
    }
}

/**
 * 关闭样本条件选择器
 */
function closeSampleSelector() {
    document.getElementById('sampleSelector').style.display = 'none';
    document.getElementById('quickSuggestions').style.display = 'flex';
}

/**
 * 重置所有条件
 */
function resetConditions() {
    document.querySelectorAll('.condition-item input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
    });
    document.querySelectorAll('.condition-value').forEach(input => {
        input.value = '';
    });
    updateConditionCount();
}

/**
 * 更新条件计数
 */
function updateConditionCount() {
    const count = document.querySelectorAll('.condition-item input[type="checkbox"]:checked').length;
    const countEl = document.getElementById('conditionCount');
    if (countEl) {
        countEl.textContent = count;
    }
}

// 监听条件复选框变化
document.addEventListener('DOMContentLoaded', function() {
    document.addEventListener('change', function(e) {
        if (e.target.matches('.condition-item input[type="checkbox"]')) {
            updateConditionCount();
        }
    });
});

/**
 * 应用条件 - 核心功能
 */
function applyConditions() {
    const conditions = [];
    const conditionItems = document.querySelectorAll('.condition-item');
    
    conditionItems.forEach(item => {
        const checkbox = item.querySelector('input[type="checkbox"]');
        if (checkbox && checkbox.checked) {
            const conditionType = checkbox.value;
            const label = item.querySelector('span').textContent;
            const operator = item.querySelector('.condition-operator');
            const value = item.querySelector('.condition-value');
            
            const condition = {
                type: conditionType,
                label: label,
                operator: operator ? operator.value : null,
                value: value ? value.value : null
            };
            
            conditions.push(condition);
        }
    });
    
    if (conditions.length === 0) {
        showNotification('请至少选择一个条件');
        return;
    }
    
    // 将条件转换为自然语言
    const naturalLanguage = generateNaturalLanguage(conditions);
    
    // 显示在对话框
    addMessage(`
        <p>📋 <strong>已选择 ${conditions.length} 个样本条件：</strong></p>
        <div style="background: var(--bg-tertiary); padding: 12px; border-radius: 8px; margin-top: 8px;">
            ${conditions.map((c, i) => `
                <div style="margin-bottom: 4px;">
                    ${i + 1}. <strong>${c.label}</strong>: ${formatCondition(c)}
                </div>
            `).join('')}
        </div>
        <p style="margin-top: 12px;"><strong>🤖 AI理解为：</strong></p>
        <p style="background: rgba(102, 126, 234, 0.1); padding: 12px; border-radius: 8px;">
            ${naturalLanguage}
        </p>
    `);
    scrollToBottom();
    
    // 关闭选择器
    closeSampleSelector();
    
    // 模拟AI处理
    showAIStatus(true);
    setTimeout(() => {
        showAIStatus(false);
        processConditionQuery(conditions, naturalLanguage);
    }, 1500);
}

/**
 * 生成自然语言描述
 */
function generateNaturalLanguage(conditions) {
    const parts = [];
    
    conditions.forEach(c => {
        switch(c.type) {
            case 'age':
                if (c.operator === 'between') {
                    parts.push(`年龄在${c.value}岁之间`);
                } else if (c.operator === 'lt') {
                    parts.push(`年龄小于${c.value}岁`);
                } else if (c.operator === 'gt') {
                    parts.push(`年龄大于${c.value}岁`);
                }
                break;
            case 'income':
                if (c.operator === 'between') {
                    parts.push(`月收入在${c.value}元之间`);
                } else if (c.operator === 'lt') {
                    parts.push(`月收入小于${c.value}元`);
                } else if (c.operator === 'gt') {
                    parts.push(`月收入大于${c.value}元`);
                }
                break;
            case 'entry_time':
                if (c.operator === 'gt') {
                    parts.push(`入网时长大于${c.value}`);
                } else if (c.operator === 'lt') {
                    parts.push(`入网时长小于${c.value}`);
                }
                break;
            case 'overdue':
                if (c.value === 'none') {
                    parts.push('无逾期记录');
                } else if (c.value === 'has') {
                    parts.push('有逾期记录');
                } else if (c.value === 'serious') {
                    parts.push('有严重逾期记录（>30天）');
                }
                break;
            case 'loan_amount':
                if (c.operator === 'between') {
                    parts.push(`借款金额在${c.value}元之间`);
                } else if (c.operator === 'lt') {
                    parts.push(`借款金额小于${c.value}元`);
                } else if (c.operator === 'gt') {
                    parts.push(`借款金额大于${c.value}元`);
                }
                break;
            case 'time_range':
                if (c.operator === 'recent') {
                    parts.push(`最近${c.value}的申请`);
                }
                break;
            default:
                parts.push(`${c.label}: ${c.value}`);
        }
    });
    
    return '查询' + parts.join('，且') + '的用户数据';
}

/**
 * 格式化条件显示
 */
function formatCondition(condition) {
    const operatorMap = {
        'between': '在...之间',
        'lt': '小于',
        'gt': '大于',
        'eq': '等于'
    };
    
    if (condition.operator) {
        return `${operatorMap[condition.operator] || condition.operator} ${condition.value}`;
    } else {
        return condition.value;
    }
}

/**
 * 处理条件查询
 */
function processConditionQuery(conditions, naturalLanguage) {
    // 生成SQL
    const sql = generateSQLFromConditions(conditions);
    
    addMessage(`
        <p>✅ <strong>条件已转换为查询代码</strong></p>
        <p>基于您选择的 <strong>${conditions.length}</strong> 个条件，已生成对应的查询语句。</p>
        <p style="margin-top: 12px;">请查看右侧代码页面 →</p>
    `);
    scrollToBottom();
    
    // 显示代码
    showCodeView(sql, {
        rows: '100',
        execTime: '1.32s',
        missing: '1.8%'
    });
    
    // 2秒后显示结果
    setTimeout(() => {
        addMessage(`
            <p>✅ <strong>沙箱预检完成！</strong></p>
            <p>已根据您选择的条件筛选数据（沙箱环境LIMIT 100）：</p>
            <ul style="line-height: 1.8;">
                <li>✓ SQL语法正确</li>
                <li>✓ 筛选条件：<strong>${conditions.length}</strong> 个</li>
                <li>✓ 数据缺失率：<strong>1.8%</strong>（可接受）</li>
            </ul>
            <p style="margin-top: 12px;"><strong>📊 初步统计（基于100条样本）：</strong></p>
            <div style="background: rgba(102, 126, 234, 0.1); padding: 12px; border-radius: 8px;">
                <ul style="line-height: 1.8; margin: 0;">
                    <li>符合条件的用户：<strong>3,245</strong> 人（预估）</li>
                    <li>平均年龄：<strong>28.5</strong> 岁</li>
                    <li>平均收入：<strong>8,760</strong> 元</li>
                    <li>逾期率：<strong>12.3%</strong></li>
                </ul>
            </div>
            <p style="margin-top: 12px;"><strong>💡 下一步操作：</strong></p>
            <ul style="line-height: 1.8;">
                <li>1️⃣ 点击"执行全量数据"获取完整结果</li>
                <li>2️⃣ 直接进入"策略挖掘"步骤进行特征分析</li>
            </ul>
        `);
        scrollToBottom();
        markStepCompleted('operation');
    }, 2000);
}

/**
 * 从条件生成SQL
 */
function generateSQLFromConditions(conditions) {
    const whereClauses = [];
    
    conditions.forEach(c => {
        switch(c.type) {
            case 'age':
                if (c.operator === 'between') {
                    const [min, max] = c.value.split('-');
                    whereClauses.push(`age BETWEEN ${min} AND ${max}`);
                } else if (c.operator === 'lt') {
                    whereClauses.push(`age < ${c.value}`);
                } else if (c.operator === 'gt') {
                    whereClauses.push(`age > ${c.value}`);
                }
                break;
            case 'income':
                if (c.operator === 'between') {
                    const [min, max] = c.value.split('-');
                    whereClauses.push(`monthly_income BETWEEN ${min} AND ${max}`);
                } else if (c.operator === 'lt') {
                    whereClauses.push(`monthly_income < ${c.value}`);
                } else if (c.operator === 'gt') {
                    whereClauses.push(`monthly_income > ${c.value}`);
                }
                break;
            case 'entry_time':
                const months = c.value.replace(/[^0-9]/g, '');
                if (c.operator === 'gt') {
                    whereClauses.push(`entry_months > ${months}`);
                } else if (c.operator === 'lt') {
                    whereClauses.push(`entry_months < ${months}`);
                }
                break;
            case 'overdue':
                if (c.value === 'none') {
                    whereClauses.push(`overdue_days = 0`);
                } else if (c.value === 'has') {
                    whereClauses.push(`overdue_days > 0`);
                } else if (c.value === 'serious') {
                    whereClauses.push(`overdue_days > 30`);
                }
                break;
            case 'loan_amount':
                if (c.operator === 'between') {
                    const [min, max] = c.value.split('-');
                    whereClauses.push(`loan_amount BETWEEN ${min} AND ${max}`);
                } else if (c.operator === 'lt') {
                    whereClauses.push(`loan_amount < ${c.value}`);
                } else if (c.operator === 'gt') {
                    whereClauses.push(`loan_amount > ${c.value}`);
                }
                break;
            case 'time_range':
                if (c.operator === 'recent') {
                    const days = c.value.replace(/[^0-9]/g, '');
                    whereClauses.push(`create_time >= DATE_SUB(NOW(), INTERVAL ${days} DAY)`);
                }
                break;
        }
    });
    
    return `SELECT 
    user_id,
    age,
    monthly_income,
    entry_months,
    overdue_days,
    loan_amount,
    create_time
FROM user_credit_table
WHERE ${whereClauses.join('\n  AND ')}
ORDER BY create_time DESC`;
}
