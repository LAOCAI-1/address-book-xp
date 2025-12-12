# 代码风格指南

本文档定义了通讯录管理系统项目的代码风格和最佳实践规范，旨在确保代码的一致性、可读性和可维护性。

## 1. 通用代码风格规则

### 1.1 文件组织和命名

- **文件命名**：使用小驼峰命名法（camelCase），如 `apiService.js`
- **组件文件**：React组件文件使用大驼峰命名法（PascalCase），如 `ContactForm.jsx`
- **目录结构**：按功能模块组织文件，保持扁平的目录结构
- **文件扩展名**：
  - JavaScript 文件：`.js`
  - JSX 文件：`.jsx`
  - CSS 文件：`.css`

### 1.2 代码格式

- **缩进**：使用2个空格进行缩进，不使用制表符
- **行长度**：每行代码不超过100个字符
- **空行**：
  - 在函数、类定义前后添加空行
  - 在代码逻辑块之间添加空行
  - 在导入语句和代码主体之间添加空行
- **分号**：始终使用分号结束语句
- **引号**：使用单引号 `''`，除非字符串中包含单引号需要转义

### 1.3 变量和函数命名

- **变量命名**：使用小驼峰命名法，如 `userName`
- **常量命名**：使用全大写加下划线，如 `MAX_SIZE`
- **函数命名**：使用小驼峰命名法，动词开头，如 `getContacts()`
- **类命名**：使用大驼峰命名法，如 `ContactManager`
- **私有成员**：使用下划线前缀，如 `_privateMethod()`

### 1.4 注释规范

- **单行注释**：使用 `//` 进行简短注释
- **多行注释**：使用 `/* */` 进行多行注释
- **函数注释**：为重要函数添加 JSDoc 格式注释
- **复杂逻辑**：为复杂逻辑添加清晰的解释注释
- **TODO注释**：使用 `// TODO: ` 标记待完成的任务

### 1.5 错误处理

- **使用try/catch**：处理可能抛出异常的代码
- **错误信息**：提供清晰、具体的错误信息
- **日志记录**：使用 `console.error()` 记录错误信息
- **用户反馈**：向用户展示友好的错误提示

## 2. 前端React代码风格规范

### 2.1 组件结构

- **函数组件**：优先使用函数组件和Hooks
- **组件拆分**：将复杂组件拆分为多个小组件
- **props类型**：使用PropTypes或TypeScript进行类型检查
- **状态管理**：使用React Hooks（useState, useEffect等）管理状态

```jsx
// 推荐的组件结构
function ContactCard({ contact, onEdit, onDelete }) {
  return (
    <div className="card">
      <div className="card-content">
        <h3>{contact.name}</h3>
        {/* 组件内容 */}
      </div>
      <div className="card-actions">
        <button onClick={onEdit}>编辑</button>
        <button onClick={onDelete}>删除</button>
      </div>
    </div>
  );
}
```

### 2.2 Hooks使用

- **依赖数组**：在useEffect中正确设置依赖项
- **自定义Hooks**：将可复用的逻辑抽取为自定义Hooks
- **Hook顺序**：保持Hooks调用顺序一致
- **useMemo/useCallback**：适当使用以优化性能

### 2.3 API调用

- **封装API**：在单独的文件中封装API调用（如api.js）
- **异步处理**：使用async/await处理异步请求
- **错误处理**：统一处理API错误
- **请求状态**：管理加载状态和错误状态

```javascript
// API调用示例
export const getContacts = async (bookmarkedOnly = false) => {
  try {
    const response = await api.get("/contacts", {
      params: bookmarkedOnly ? { bookmarked: 1 } : {}
    });
    return response;
  } catch (error) {
    console.error("Failed to fetch contacts:", error);
    throw error;
  }
};
```

### 2.4 CSS规范

- **类名命名**：使用语义化的类名，如 `.contact-card`
- **BEM命名**：考虑使用BEM（Block-Element-Modifier）命名规范
- **样式组织**：按组件组织CSS代码
- **响应式设计**：使用媒体查询实现响应式布局

### 2.5 代码示例

```jsx
// 推荐的代码风格示例
import { useState, useEffect } from 'react';
import { getContacts } from './api';

function ContactList() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchContacts() {
      try {
        setLoading(true);
        const response = await getContacts();
        setContacts(response.data);
      } catch (err) {
        setError('Failed to load contacts');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchContacts();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="contact-list">
      {contacts.map(contact => (
        <div key={contact.id} className="contact-item">
          {contact.name}
        </div>
      ))}
    </div>
  );
}
```

## 3. 后端Express代码风格规范

### 3.1 路由设计

- **RESTful规范**：遵循RESTful API设计原则
- **路由分组**：按功能模块组织路由
- **中间件使用**：正确使用Express中间件
- **参数验证**：验证请求参数的有效性

### 3.2 控制器逻辑

- **错误处理**：统一的错误处理机制
- **响应格式**：保持一致的响应格式
- **状态码**：使用正确的HTTP状态码
- **请求体大小限制**：设置合理的请求体大小限制

```javascript
// 推荐的路由处理示例
app.get('/contacts', async (req, res) => {
  try {
    const bookmarked = req.query.bookmarked;
    const where = bookmarked === '1' || bookmarked === 'true' 
      ? { isBookmarked: true } 
      : {};

    const contacts = await prisma.contact.findMany({
      where,
      include: { methods: true },
      orderBy: [{ isBookmarked: 'desc' }, { updatedAt: 'desc' }],
    });

    res.json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
```

### 3.3 数据库操作

- **Prisma最佳实践**：遵循Prisma ORM的最佳实践
- **事务使用**：在需要原子操作时使用事务
- **查询优化**：优化数据库查询，避免N+1查询问题
- **数据验证**：在数据库操作前验证数据

### 3.4 安全考虑

- **CORS配置**：正确配置CORS策略
- **输入验证**：验证所有用户输入
- **SQL注入防护**：通过ORM避免SQL注入
- **敏感信息保护**：不记录敏感信息到日志

### 3.5 代码示例

```javascript
// 推荐的后端代码风格示例
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from './db.js';

dotenv.config();

const app = express();

// CORS中间件配置
app.use(cors({
  origin: '*', // 生产环境应限制为特定域名
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'Content-Type', 'Accept']
}));

// 解析JSON请求体
app.use(express.json({ limit: '5mb' }));

// 健康检查路由
app.get('/health', (req, res) => {
  res.status(200).json({ ok: true });
});

// 创建联系人路由
app.post('/contacts', async (req, res) => {
  try {
    const { name, isBookmarked = false, methods = [] } = req.body;

    // 输入验证
    if (!name?.trim()) {
      return res.status(400).json({ message: 'Name is required' });
    }

    // 创建联系人
    const contact = await prisma.contact.create({
      data: {
        name: name.trim(),
        isBookmarked: !!isBookmarked,
        methods: {
          create: methods.map(m => ({
            type: m.type,
            value: String(m.value ?? '').trim(),
            label: m.label ?? null
          }))
        }
      },
      include: { methods: true }
    });

    res.status(201).json(contact);
  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(500).json({ message: 'Failed to create contact' });
  }
});

// 启动服务器
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
```

## 4. 代码规范工具和配置

### 4.1 ESLint配置

项目使用ESLint进行代码质量检查，配置文件位于 `client/eslint.config.js`。主要规则包括：

- 遵循JavaScript推荐规则
- React Hooks规则
- JSX语法支持
- 模块导入导出规范

### 4.2 开发工具集成

- **VSCode**：推荐使用VSCode编辑器
- **扩展**：
  - ESLint
  - Prettier
  - React Developer Tools
  - JavaScript (ES6) code snippets

### 4.3 自动化检查

- **提交前检查**：配置git pre-commit钩子运行lint检查
- **CI/CD集成**：在CI/CD流程中包含代码质量检查
- **定期代码审查**：团队定期进行代码审查

## 5. 最佳实践

### 5.1 性能优化

- **前端性能**：
  - 使用React.memo避免不必要的重渲染
  - 合理使用useMemo和useCallback
  - 懒加载组件
  - 优化图片和资源

- **后端性能**：
  - 数据库索引优化
  - 缓存常用数据
  - 合理使用分页
  - 异步处理非关键操作

### 5.2 可测试性

- **单元测试**：编写单元测试覆盖关键功能
- **测试工具**：前端使用Jest和React Testing Library
- **模拟数据**：使用模拟数据进行测试
- **测试覆盖率**：目标覆盖率达到80%以上

### 5.3 可维护性

- **模块化**：将代码拆分为小的、可复用的模块
- **文档**：为复杂逻辑和API提供文档
- **重构**：定期重构代码，消除技术债务
- **代码审查**：实施代码审查流程

### 5.4 协作规范

- **分支管理**：使用Git Flow或GitHub Flow工作流
- **提交消息**：遵循规范的提交消息格式
- **PR模板**：使用Pull Request模板
- **冲突解决**：建立冲突解决的最佳实践

## 6. 总结

本代码风格指南旨在帮助团队成员编写一致、高质量的代码。请所有开发者在开发过程中严格遵守这些规范，确保项目代码的可维护性和可扩展性。随着项目的发展，这些规范可能会不断更新和完善。