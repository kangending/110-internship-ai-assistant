import type { MockCase } from '../types/case'

export const linHaoCase: MockCase = {
  name: '林浩',
  grade: '大三上学期',
  major: '软件工程',
  targetRole: 'Java 后端开发实习生',
  monthsUntilApplications: 4,
  hoursPerWeek: 20,
  initialDescription: '学过 Java 基础，有一个 Java + MySQL 学生管理系统',
  initialAiMisunderstanding: '把“学过 Java 基础”理解成已经具备进入 Spring Boot 阶段的完整基础',
  userCorrection: '实际刚学完集合，多线程不会，MySQL 只会 CRUD，项目只是 JDBC 课程作业',
  correctedPriorities: ['Java 核心基础', 'MySQL 基础', 'Spring Boot'],
  followUp: '用户选择一个 7 天行动，完成后回来反馈，系统根据新事实重新调整建议',
}
