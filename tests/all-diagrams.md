# Mermaid 图表类型综合示例

本文件汇总了 tests 目录中所有不同格式的 Mermaid 图表示例，用于对比不同插件的渲染效果。

---

## 1. Graph (基础图)

来源：[test-graph.mmd](./test-graph.mmd)

```mermaid
graph TB
    A[开始] --> B{条件判断}
    B -->|是| C[处理1]
    B -->|否| D[处理2]
    C --> E[结束]
    D --> E
    style A fill:#4CAF50,stroke:#388E3C,color:white
    style B fill:#FF9800,stroke:#F57C00,color:white
    style E fill:#f44336,stroke:#d32f2f,color:white
```

---

## 2. Flowchart (流程图)

来源：[test-flowchart.mmd](./test-flowchart.mmd)

```mermaid
flowchart TD
    Start[开始] --> Decision{是否成功?}
    Decision -->|Yes| Success[成功处理]
    Decision -->|No| Error[错误处理]
    Success --> End[结束]
    Error --> Retry[重试]
    Retry --> Decision
    style Start fill:#4CAF50,stroke:#388E3C,color:white
    style Decision fill:#FF9800,stroke:#F57C00,color:white
    style End fill:#f44336,stroke:#d32f2f,color:white
```

---

## 3. Sequence Diagram (时序图)

来源：[test-sequence.mmd](./test-sequence.mmd)

```mermaid
sequenceDiagram
    participant User as 用户
    participant Frontend as 前端
    participant Backend as 后端
    participant Database as 数据库
    
    User->>Frontend: 点击登录按钮
    Frontend->>Backend: POST /api/login
    Backend->>Database: 查询用户信息
    Database-->>Backend: 返回用户数据
    Backend-->>Frontend: 返回登录结果
    Frontend-->>User: 显示登录状态
    
    Note over User,Database: 完整的登录流程
```

---

## 4. Class Diagram (类图)

来源：[test-class.mmd](./test-class.mmd)

```mermaid
classDiagram
    class Animal {
        +String name
        +int age
        +eat()
        +sleep()
        #makeSound()
    }
    
    class Dog {
        +String breed
        +bark()
        +fetch()
    }
    
    class Cat {
        +String color
        +meow()
        +purr()
    }
    
    class Bird {
        +double wingSpan
        +fly()
        +sing()
    }
    
    Animal <|-- Dog : 继承
    Animal <|-- Cat : 继承
    Animal <|-- Bird : 继承
    
    note for Animal "所有动物的基类"
    note for Dog "忠诚的宠物"
```

---

## 5. State Diagram (状态图)

来源：[test-state.mmd](./test-state.mmd)

```mermaid
stateDiagram-v2
    [*] --> Created
    Created --> Paid: 支付
    Paid --> Shipped: 发货
    Shipped --> Delivered: 送达
    Delivered --> [*]
    
    Paid --> Cancelled: 取消订单
    Shipped --> Returned: 退货
    Returned --> Refunded: 退款
    Refunded --> [*]
    
    note right of Created
        订单已创建
        等待支付
    end note
    
    note right of Delivered
        订单已完成
        交易成功
    end note
```

---

## 6. Gantt Chart (甘特图)

来源：[test-gantt.mmd](./test-gantt.mmd)

```mermaid
gantt
    title 项目开发计划
    dateFormat  YYYY-MM-DD
    section 需求分析
    需求收集           :a1, 2024-01-01, 7d
    需求文档           :a2, after a1, 5d
    
    section 设计阶段
    系统设计           :b1, after a2, 10d
    UI设计            :b2, after a2, 8d
    
    section 开发阶段
    前端开发           :c1, after b1, 20d
    后端开发           :c2, after b1, 25d
    接口联调           :c3, after c1, 10d
    
    section 测试阶段
    单元测试           :d1, after c3, 7d
    集成测试           :d2, after d1, 10d
    用户验收           :d3, after d2, 5d
    
    section 部署上线
    生产部署           :e1, after d3, 3d
```

---

## 7. Pie Chart (饼图)

来源：[test-pie.mmd](./test-pie.mmd)

```mermaid
pie title 技术栈使用比例
    "TypeScript" : 40
    "JavaScript" : 25
    "Python" : 20
    "Java" : 10
    "Other" : 5
```

---

## 8. User Journey (用户旅程图)

来源：[test-journey.mmd](./test-journey.mmd)

```mermaid
journey
    title 用户购物旅程
    section 浏览商品
      搜索商品: 5: 用户
      查看详情: 4: 用户
      加入购物车: 3: 用户
    section 下单支付
      填写地址: 3: 用户
      选择支付方式: 4: 用户
      完成支付: 5: 用户
    section 等待收货
      物流跟踪: 3: 用户
      确认收货: 5: 用户
      评价商品: 4: 用户
```

---

## 9. Git Graph (Git 提交历史图)

来源：[test-gitgraph.mmd](./test-gitgraph.mmd)

```mermaid
gitGraph
    commit id: "初始化项目"
    commit id: "添加基础结构"
    branch develop
    checkout develop
    commit id: "开发功能A"
    commit id: "开发功能B"
    checkout main
    merge develop id: "合并develop"
    commit id: "发布v1.0"
    branch feature-c
    checkout feature-c
    commit id: "开发功能C"
    checkout main
    merge feature-c id: "合并功能C"
    commit id: "发布v1.1"
```

---

## 10. ER Diagram (实体关系图)

来源：[test-er.mmd](./test-er.mmd)

```mermaid
erDiagram
    CUSTOMER ||--o{ ORDER : "places"
    ORDER ||--|{ ORDER_ITEM : "contains"
    PRODUCT ||--o{ ORDER_ITEM : "ordered_in"

    CUSTOMER {
        string name
        string email
        string phone
    }

    ORDER {
        int id
        date orderDate
        string status
    }

    PRODUCT {
        int id
        string name
        float price
    }

    ORDER_ITEM {
        int quantity
        float unitPrice
    }
```

---

## 11. Requirement Diagram (需求图)

来源：[test-requirement.mmd](./test-requirement.mmd)

> **注意**: `requirementDiagram` 语法需要 Mermaid 11+ 版本。当前项目使用 Mermaid 10.6.0，此图表可能无法正确渲染。

```mermaid
requirementDiagram
    requirement 用户登录 {
        id: REQ-001
        desc: 用户可以通过用户名和密码登录系统
        risk: high
        verifymethod: test
    }
    
    requirement 密码加密 {
        id: REQ-002
        desc: 用户密码必须加密存储
        risk: critical
        verifymethod: inspection
    }
    
    requirement 会话管理 {
        id: REQ-003
        desc: 系统需要管理用户会话
        risk: medium
        verifymethod: test
    }
    
    functionalRequirement JWT令牌 {
        id: FR-001
        desc: 使用JWT进行身份验证
        risk: high
        verifymethod: test
    }
    
    用户登录 - satisfies -> JWT令牌
    密码加密 - refines -> 用户登录
    会话管理 - contains -> JWT令牌
```

---

## 12. Architecture Diagram (架构图)

来源：[test-architecture.mmd](./test-architecture.mmd)

> **注意**: `architecture-beta` 语法需要 Mermaid 11+ 版本。当前项目使用 Mermaid 10.6.0，此图表可能无法正确渲染。

```mermaid
---
title: 微服务架构
config:
  theme: default
---
architecture-beta
    group frontend(logos:react)[前端层]
    group backend(logos:nodejs)[后端层]
    group database(logos:database)[数据层]
    
    service web(server)[Web应用] in frontend
    service api(gateway)[API网关] in backend
    service auth(service)[认证服务] in backend
    service user(service)[用户服务] in backend
    service order(service)[订单服务] in backend
    service db(database)[主数据库] in database
    service cache(cache)[缓存] in database
    
    web:R --> L:api
    api:R --> L:auth
    api:R --> L:user
    api:R --> L:order
    auth:B --> T:db
    user:B --> T:db
    order:B --> T:db
    auth:T --> B:cache
    user:T --> B:cache
```

---

## 使用说明

### 在 VS Code 中查看

1. 安装支持 Mermaid 预览的扩展（如 "Mermaid Preview"）
2. 打开此文件
3. 每个代码块都会自动渲染为对应的图表

### 对比不同插件的渲染效果

此文件包含所有主要的 Mermaid 图表类型，可以用于：
- 测试不同 VS Code 扩展的渲染能力
- 验证语法兼容性
- 对比渲染质量和样式
- 检查对各图表类型的支持程度

### 相关文件

- [README.md](./README.md) - 测试文件详细说明
- [TESTING.md](./TESTING.md) - 完整测试清单
- [SUMMARY.md](./SUMMARY.md) - 工作总结
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - 快速参考

---

**总计：12 种图表类型**

所有示例均来自 `tests/` 目录中的独立测试文件，确保语法的准确性和完整性。
