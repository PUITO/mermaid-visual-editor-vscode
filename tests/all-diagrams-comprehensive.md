# 多图表类型综合测试

本文件包含所有支持的图表类型测试用例。

## 1. Flowchart（流程图）- React Flow 可视化编辑

```mermaid
flowchart TB
    Start[开始] --> Decision{条件判断}
    Decision -->|Yes| Process1[处理1]
    Decision -->|No| Process2[处理2]
    Process1 --> End[结束]
    Process2 --> End
```

## 2. ER Diagram（实体关系图）- 表单编辑器

```mermaid
erDiagram
    CUSTOMER {
        string name
        string email PK
        int age
    }
    ORDER {
        int id PK
        date orderDate
        float total
    }
    PRODUCT {
        string sku PK
        string name
        float price
    }
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ PRODUCT : contains
```

## 3. Sequence Diagram（序列图）- 表单编辑器

```mermaid
sequenceDiagram
    participant User as 用户
    participant Browser as 浏览器
    participant Server as 服务器
    participant Database as 数据库
    
    User->>Browser: 输入URL
    Browser->>Server: HTTP请求
    Server->>Database: 查询数据
    Database-->>Server: 返回数据
    Server-->>Browser: HTML响应
    Browser-->>User: 显示页面
    
    Note over User,Browser: 用户交互流程
```

## 4. Class Diagram（类图）- 代码预览

```mermaid
classDiagram
    class Animal {
        +String name
        +int age
        +makeSound() void
    }
    class Dog {
        +String breed
        +fetch() void
    }
    class Cat {
        +String color
        +purr() void
    }
    Animal <|-- Dog : inherits
    Animal <|-- Cat : inherits
    Dog ..> Cat : competes with
```

## 5. State Diagram（状态图）- 代码预览

```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Processing : start
    Processing --> Success : complete
    Processing --> Error : fail
    Success --> [*]
    Error --> Idle : retry
    note right of Error : 错误状态需要重试
```

## 6. Complex Flowchart（复杂流程图）

```mermaid
flowchart TB
    subgraph Input
        A[数据源1] --> D[数据处理]
        B[数据源2] --> D
        C[数据源3] --> D
    end
    
    subgraph Process
        D --> E{验证}
        E -->|有效| F[转换]
        E -->|无效| G[错误日志]
        F --> H[存储]
    end
    
    subgraph Output
        H --> I[API响应]
        H --> J[数据库]
        H --> K[缓存]
    end
    
    G --> L[通知]
    I --> M[客户端]
```

## 7. Advanced ER Diagram（高级ER图）

```mermaid
erDiagram
    USER {
        int id PK
        string username UK
        string email UK
        string password
        datetime createdAt
        datetime updatedAt
    }
    ROLE {
        int id PK
        string name UK
        string description
    }
    PERMISSION {
        int id PK
        string code UK
        string name
    }
    USER ||--o{ USER_ROLE : has
    ROLE ||--o{ USER_ROLE : assigned
    ROLE ||--o{ ROLE_PERMISSION : grants
    PERMISSION ||--o{ ROLE_PERMISSION : included
```

## 8. Complex Sequence Diagram（复杂序列图）

```mermaid
sequenceDiagram
    autonumber
    participant Client as 客户端
    participant API as API网关
    participant Auth as 认证服务
    participant Service as 业务服务
    participant DB as 数据库
    
    Client->>API: POST /api/data
    API->>Auth: 验证Token
    Auth-->>API: Token有效
    API->>Service: 转发请求
    Service->>DB: 保存数据
    DB-->>Service: 保存成功
    Service-->>API: 返回结果
    API-->>Client: 201 Created
    
    Note over Client,DB: 完整的数据提交流程
```

## 9. Inheritance Class Diagram（继承类图）

```mermaid
classDiagram
    class Shape {
        <<abstract>>
        #double x
        #double y
        +move(double dx, double dy)
        +draw()* void
    }
    class Circle {
        +double radius
        +draw() void
    }
    class Rectangle {
        +double width
        +double height
        +draw() void
    }
    class Triangle {
        +double base
        +double height
        +draw() void
    }
    Shape <|-- Circle
    Shape <|-- Rectangle
    Shape <|-- Triangle
    Circle o-- Shape : extends
```

## 10. State Machine（状态机）

```mermaid
stateDiagram-v2
    state "订单处理" as OrderProcess {
        [*] --> Created
        Created --> Paid : 支付
        Paid --> Shipped : 发货
        Shipped --> Delivered : 送达
        Delivered --> [*]
        
        state "取消流程" as CancelFlow {
            Created --> Cancelled : 取消
            Paid --> Refunding : 申请退款
            Refunding --> Refunded : 退款完成
            Refunded --> Cancelled
        }
    }
    
    Cancelled --> [*]
```

## 使用说明

1. **流程图**：支持 React Flow 可视化拖拽编辑，自动布局
2. **ER 图**：使用表单编辑器管理实体、属性、关系
3. **序列图**：使用表单编辑器管理参与者、消息流、注释
4. **类图**：目前仅支持代码预览和编辑
5. **状态图**：目前仅支持代码预览和编辑

所有图表类型都支持：
- 自动检测图表类型
- 双向同步（代码 ↔ 编辑器）
- 保留原始格式
- Mermaid v11.14.0 语法
