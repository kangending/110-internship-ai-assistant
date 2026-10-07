export const supplementOptions = {
  threads: {
    topic: "Java 多线程",
    unknownId: "unknown-threads",
    options: [
      { label: "尚未学习", description: "还没有系统接触 Java 多线程" },
      { label: "了解基础概念", description: "知道 Thread、Runnable 等基本概念" },
      { label: "做过简单练习", description: "写过基础示例，但还不熟练" },
      { label: "可以独立完成常见基础练习", description: "能够独立完成基础多线程代码" },
    ],
  },
  mysql: {
    topic: "MySQL 掌握深度",
    unknownId: "unknown-mysql-depth",
    options: [
      { label: "只会基础 CRUD", description: "目前主要会增删改查" },
      { label: "了解索引", description: "理解索引的基本作用和使用场景" },
      { label: "了解索引和事务", description: "已经学习索引、事务等基础知识" },
      { label: "有较完整实践经验", description: "在项目中实际使用过相关能力" },
    ],
  },
  tools: {
    topic: "Git / Linux",
    unknownId: "unknown-tools",
    options: [
      { label: "基本没有使用过", description: "目前缺少实际使用经验" },
      { label: "会 Git 基本操作", description: "会 add、commit、push 等基本操作" },
      { label: "会 Git + Linux 常用命令", description: "可以进行基础开发环境操作" },
      { label: "有实际开发环境使用经验", description: "在实际项目或部署场景中使用过" },
    ],
  },
} as const;

export type SupplementKey = keyof typeof supplementOptions;
export type Supplements = Partial<Record<SupplementKey, string>> & { general?: string };
