# 通讯录管理系统

这是一个功能完整的通讯录管理系统，提供联系人的增删改查、收藏管理、多联系方式管理以及Excel导入导出等功能。

## 项目架构

本项目采用前后端分离架构：

- **前端**：React + Vite + Axios
- **后端**：Express + Prisma + MySQL
- **数据库**：MySQL/MariaDB

## 目录结构

```
.\n├── client/              # 前端React应用\n│   ├── src/             # 前端源码\n│   │   ├── api.js       # API接口封装\n│   │   ├── App.jsx      # 主应用组件\n│   │   └── methodTypes.js # 联系方式类型定义\n│   └── package.json     # 前端依赖配置\n│\n└── server/              # 后端Express应用\n    ├── prisma/          # Prisma ORM配置\n    │   └── schema.prisma # 数据库模型定义\n    ├── src/             # 后端源码\n    │   ├── db.js        # 数据库连接配置\n    │   └── index.js     # 后端入口和API路由\n    └── package.json     # 后端依赖配置\n
```

## 技术栈

### 前端
- **React 19**：用于构建用户界面的JavaScript库
- **Vite**：现代前端构建工具，提供快速的开发体验
- **Axios**：用于发起HTTP请求的客户端库
- **SheetJS (xlsx)**：用于Excel文件的导入和导出

### 后端
- **Express**：轻量级Web应用框架
- **Prisma**：现代ORM工具，用于数据库操作
- **MySQL/MariaDB**：关系型数据库
- **CORS**：跨域资源共享中间件
- **dotenv**：环境变量管理

## 主要功能

### 联系人管理
- ✅ 创建新联系人
- ✅ 查看联系人列表
- ✅ 编辑联系人信息
- ✅ 删除联系人
- ✅ 联系人收藏功能
- ✅ 按收藏状态筛选联系人

### 多联系方式管理
- ✅ 支持多种联系方式类型：电话、邮箱、社交媒体、地址
- ✅ 为每个联系方式添加备注标签
- ✅ 灵活添加和删除联系方式

### 数据导入导出
- ✅ Excel文件导出功能
- ✅ Excel文件批量导入功能
- ✅ 文件格式和大小验证
- ✅ 批量数据处理和错误处理

## 安装与配置

### 前置要求
- Node.js (v16+)\n- npm或yarn\n- MySQL/MariaDB数据库

### 步骤

#### 1. 克隆项目
```bash
git clone <项目仓库地址>
cd <项目目录>
```

#### 2. 后端配置与启动

```bash
# 进入后端目录
cd server

# 安装依赖
npm install

# 配置环境变量
# 复制.env.example文件并修改为.env
# 在.env文件中设置数据库连接信息
# DATABASE_URL="mysql://用户名:密码@localhost:3306/通讯录数据库名"

# 数据库迁移
npx prisma migrate dev

# 启动后端服务
npm run dev
# 或
npm start
```

#### 3. 前端配置与启动

```bash
# 进入前端目录
cd client

# 安装依赖
npm install

# 配置环境变量
# 在.env文件中设置API基础URL
# VITE_API_BASE="http://localhost:3001"

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## API接口说明

### 联系人管理
- `GET /contacts` - 获取联系人列表（支持bookmarked参数筛选）
- `POST /contacts` - 创建新联系人
- `PUT /contacts/:id` - 更新联系人基本信息
- `DELETE /contacts/:id` - 删除联系人
- `PATCH /contacts/:id/bookmark` - 切换联系人收藏状态

### 联系方式管理
- `PUT /contacts/:id/methods` - 替换联系人的所有联系方式

### 批量操作
- `POST /contacts/bulk` - 批量导入联系人

## 数据库模型

### Contact (联系人)
- `id`: 主键，自增
- `name`: 联系人姓名
- `isBookmarked`: 是否收藏
- `methods`: 联系方式列表
- `createdAt`: 创建时间
- `updatedAt`: 更新时间

### ContactMethod (联系方式)
- `id`: 主键，自增
- `contactId`: 关联联系人ID
- `type`: 联系方式类型 (phone, email, social, address)
- `value`: 联系方式值
- `label`: 可选的标签/备注

## 项目特性

### 安全性
- 输入验证和清洗
- SQL注入防护（通过Prisma ORM）
- 文件上传大小限制
- 跨域安全配置

### 性能优化
- 分页数据加载
- 批量事务处理
- 数据库索引优化

### 用户体验
- 响应式设计
- 实时数据更新
- 友好的错误提示
- 直观的操作界面

## 使用说明

### 基本操作
1. **添加联系人**：点击"+ 新"按钮，填写表单后保存
2. **编辑联系人**：点击联系人卡片上的"编辑"按钮
3. **删除联系人**：点击联系人卡片上的"删除"按钮
4. **收藏联系人**：点击联系人卡片左侧的星星图标
5. **筛选收藏联系人**：勾选"只收藏"复选框

### 导入导出
1. **导出Excel**：点击"导出Excel"按钮，系统会下载包含所有联系人的Excel文件
2. **导入Excel**：点击"导入Excel"按钮，选择符合格式要求的Excel文件
   - 导入文件需要包含"Name"列
   - 可选列：Bookmarked, Phones, Emails, Socials, Addresses
   - 多值以分号(;)分隔

