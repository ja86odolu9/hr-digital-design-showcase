# 人才内部活水匹配平台

一个零依赖的纯前端内部人才流动匹配后台管理系统。

## 快速启动

### 方式一：Windows 一键启动（推荐）

双击 `start.bat`，自动启动本地服务并打开浏览器。

### 方式二：手动启动

需要 Python 3 或 Node.js 任一已安装：

```bash
# Python
python -m http.server 8080

# Node.js
npx serve -l 8080
```

然后浏览器打开 <http://localhost:8080>

### 方式三：直接打开

如果双击 `index.html` 后页面布局异常（无样式），说明浏览器拦截了
`file://` 协议下的 CSS 加载，请改用方式一或方式二。

## 演示账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| HR 管理员 | admin | admin123 |
| 用人经理 | manager | manager123 |
| 员工 | emp001 | emp123 |

也可以选择"其他"按钮，在角色选择页直接进入对应角色（数据用员工1）。

## 文件结构

```
talent-mobility-admin/
├── index.html          # SPA 入口
├── css/style.css       # 样式
├── js/
│   ├── data.js         # 数据模型 + 三维匹配引擎
│   ├── app.js          # 核心框架（路由/弹窗/Toast）
│   ├── employee.js     # 员工端
│   ├── manager.js      # 业务管理端
│   └── admin.js        # 管理驾驶舱
├── start.bat           # Windows 启动脚本
└── README.md
```

## 数据存储

所有数据保存在浏览器 `localStorage`（key: `tms_db_v2`）。
点击登录页"数据异常？点击重置"可恢复初始数据。
