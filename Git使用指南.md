# 📦 Git 使用指南

## 🎯 快速开始

### 方式一：在项目目录中初始化（推荐）

```bash
# 1. 进入项目目录
cd "风控策略平台规划"

# 2. 初始化Git仓库
git init

# 3. 添加所有文件
git add .

# 4. 创建初始提交
git commit -m "初始提交：策略E+智能化系统前端原型 V1.7"

# 5. 添加远程仓库（替换为您的Git仓库地址）
git remote add origin https://github.com/your-username/your-repo.git

# 6. 推送到远程仓库
git branch -M main
git push -u origin main
```

---

## 📋 详细步骤

### 步骤1：初始化Git仓库

```bash
cd "风控策略平台规划"
git init
```

**输出示例**：
```
Initialized empty Git repository in E:/.../风控策略平台规划/.git/
```

---

### 步骤2：检查文件状态

```bash
git status
```

**输出示例**：
```
On branch main

No commits yet

Untracked files:
  (use "git add <file>..." to include in what will be committed)
        .gitignore
        README.md
        assets/
        index.html
        projects.html
        workspace.html
        ...
```

---

### 步骤3：添加文件到暂存区

```bash
# 添加所有文件
git add .

# 或者只添加特定文件
git add index.html workspace.html assets/
```

---

### 步骤4：创建提交

```bash
git commit -m "初始提交：策略E+智能化系统前端原型 V1.7

- 实现四大智能模块（数据助手、策略挖掘、报告生成、知识库）
- 样本条件选择器（V1.6）
- 分析项目管理（V1.7）
- 完整的交互式界面和功能演示"
```

**提交信息规范**：
```
<类型>: <简短描述>

<详细说明>

<相关Issue>
```

**常用类型**：
- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建/工具相关

---

### 步骤5：连接远程仓库

#### 5.1 在Git平台创建仓库

**GitHub**:
1. 登录 GitHub
2. 点击右上角 "+" → "New repository"
3. 填写仓库名称（如：`risk-strategy-platform`）
4. 选择 Public 或 Private
5. **不要**勾选 "Initialize this repository with a README"
6. 点击 "Create repository"

**GitLab/Gitee**:
类似步骤，创建空仓库

#### 5.2 添加远程仓库地址

```bash
# GitHub示例
git remote add origin https://github.com/your-username/risk-strategy-platform.git

# GitLab示例
git remote add origin https://gitlab.com/your-username/risk-strategy-platform.git

# Gitee示例
git remote add origin https://gitee.com/your-username/risk-strategy-platform.git

# SSH方式（推荐，需要配置SSH密钥）
git remote add origin git@github.com:your-username/risk-strategy-platform.git
```

#### 5.3 查看远程仓库

```bash
git remote -v
```

**输出示例**：
```
origin  https://github.com/your-username/risk-strategy-platform.git (fetch)
origin  https://github.com/your-username/risk-strategy-platform.git (push)
```

---

### 步骤6：推送到远程仓库

```bash
# 设置主分支名称（GitHub默认使用main）
git branch -M main

# 推送到远程仓库
git push -u origin main
```

**首次推送需要输入用户名和密码**（或使用SSH密钥）

---

## 🔄 日常使用

### 查看修改

```bash
# 查看所有修改
git status

# 查看具体修改内容
git diff

# 查看提交历史
git log --oneline
```

---

### 提交修改

```bash
# 1. 查看修改
git status

# 2. 添加修改的文件
git add .

# 3. 提交
git commit -m "修复：导航栏样式问题"

# 4. 推送到远程
git push
```

---

### 创建分支

```bash
# 创建新分支
git checkout -b feature/new-feature

# 或使用新语法
git switch -c feature/new-feature

# 切换分支
git checkout main
git switch main

# 查看所有分支
git branch -a
```

---

### 合并分支

```bash
# 切换到主分支
git checkout main

# 合并功能分支
git merge feature/new-feature

# 删除已合并的分支
git branch -d feature/new-feature
```

---

## 📁 项目文件结构

```
风控策略平台规划/
├── .gitignore              # Git忽略文件配置
├── README.md               # 项目说明文档
├── index.html              # 主页
├── workspace.html          # 工作台页面
├── projects.html           # 项目管理页面
├── assets/                 # 静态资源
│   ├── css/               # 样式文件
│   │   ├── style.css
│   │   └── projects.css
│   └── js/                # JavaScript文件
│       ├── main.js
│       ├── workspace.js
│       └── projects.js
└── *.md                    # 各种说明文档
```

---

## 🚫 .gitignore 说明

已创建的 `.gitignore` 文件会忽略以下内容：

- ✅ 操作系统文件（.DS_Store, Thumbs.db等）
- ✅ 编辑器配置文件（.vscode/, .idea/等）
- ✅ 临时文件和日志（*.tmp, *.log等）
- ✅ 依赖文件（node_modules/等）
- ✅ 备份文件（*.bak, *.backup等）

**所有项目源代码和文档都会被提交！**

---

## 🔐 认证方式

### 方式1：HTTPS（简单，需要输入密码）

```bash
git remote add origin https://github.com/your-username/repo.git
git push -u origin main
```

**缺点**：每次推送需要输入用户名和密码

---

### 方式2：SSH（推荐，无需密码）

#### 2.1 生成SSH密钥

```bash
# Windows (Git Bash)
ssh-keygen -t ed25519 -C "your_email@example.com"

# 按提示操作，默认保存在 ~/.ssh/id_ed25519
```

#### 2.2 复制公钥

```bash
# Windows
cat ~/.ssh/id_ed25519.pub

# 或直接打开文件
notepad ~/.ssh/id_ed25519.pub
```

#### 2.3 添加到Git平台

**GitHub**:
1. 点击右上角头像 → Settings
2. SSH and GPG keys → New SSH key
3. 粘贴公钥内容
4. 点击 Add SSH key

**GitLab/Gitee**: 类似操作

#### 2.4 使用SSH地址

```bash
git remote add origin git@github.com:your-username/repo.git
git push -u origin main
```

---

### 方式3：Personal Access Token（GitHub推荐）

**GitHub**:
1. Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token (classic)
3. 选择权限：`repo`（完整仓库权限）
4. 生成后复制token
5. 推送时使用token作为密码

---

## 🎯 常用命令速查

```bash
# 初始化
git init

# 查看状态
git status

# 添加文件
git add .
git add <file>

# 提交
git commit -m "提交信息"

# 查看历史
git log
git log --oneline

# 远程仓库
git remote add origin <url>
git remote -v
git remote remove origin

# 推送
git push -u origin main
git push

# 拉取
git pull

# 分支
git branch
git checkout -b <branch>
git merge <branch>

# 撤销
git reset HEAD <file>        # 取消暂存
git checkout -- <file>       # 撤销修改
git commit --amend            # 修改最后一次提交
```

---

## ⚠️ 注意事项

### 1. 不要提交敏感信息
- ❌ API密钥
- ❌ 密码
- ❌ 个人隐私数据
- ✅ 使用 `.gitignore` 排除

### 2. 提交前检查
```bash
# 查看将要提交的内容
git status
git diff --cached
```

### 3. 提交信息要清晰
```bash
# ❌ 不好的提交信息
git commit -m "fix"

# ✅ 好的提交信息
git commit -m "修复：导航栏样式显示问题"
```

### 4. 定期推送
```bash
# 建议每次完成一个功能就推送
git add .
git commit -m "feat: 新增样本条件选择器"
git push
```

---

## 🆘 常见问题

### Q1: 推送时提示"remote origin already exists"
**A**: 远程仓库已存在，先删除再添加：
```bash
git remote remove origin
git remote add origin <new-url>
```

### Q2: 推送时提示"failed to push some refs"
**A**: 远程仓库有新的提交，先拉取再推送：
```bash
git pull origin main --rebase
git push
```

### Q3: 忘记添加.gitignore，提交了不需要的文件
**A**: 从Git中移除但保留本地文件：
```bash
git rm --cached <file>
git commit -m "移除不需要的文件"
```

### Q4: 想撤销最后一次提交
**A**: 
```bash
# 保留修改，只撤销提交
git reset --soft HEAD~1

# 完全撤销（危险！）
git reset --hard HEAD~1
```

---

## 📚 推荐学习资源

- **Git官方文档**: https://git-scm.com/doc
- **GitHub Guides**: https://guides.github.com/
- **Pro Git电子书**: https://git-scm.com/book/zh/v2

---

## ✅ 检查清单

在推送前确认：

- [ ] 已创建 `.gitignore` 文件
- [ ] 已检查 `git status`，没有意外文件
- [ ] 已添加所有需要的文件 `git add .`
- [ ] 已创建有意义的提交信息
- [ ] 已配置远程仓库地址
- [ ] 已测试本地功能正常

---

**准备好了吗？** 按照上面的步骤，开始将项目推送到Git吧！🚀
