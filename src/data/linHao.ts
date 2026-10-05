import type { ConfirmedInformation, JobRequirement, MockCase } from '../types/case'

// Fictional test case for product demonstration; this JD is also simulated.
const jdRequirements: JobRequirement[] = [
  { id: 'jd-java', text: '熟悉 Java 基础、集合、多线程', source: 'jd' },
  { id: 'jd-framework', text: '熟悉 Spring Boot、MyBatis', source: 'jd' },
  { id: 'jd-mysql', text: '掌握 MySQL，了解索引、事务', source: 'jd' },
  { id: 'jd-redis', text: '了解 Redis', source: 'jd' },
  { id: 'jd-tools', text: '熟悉 Git、Linux 常用命令', source: 'jd' },
  { id: 'jd-algorithms', text: '具备基本数据结构与算法能力', source: 'jd' },
  { id: 'jd-project', text: '有完整后端项目经历者优先', source: 'jd' },
]

const initialFacts: ConfirmedInformation[] = [
  { id: 'fact-grade', topic: '年级', statement: '大三上学期', status: 'confirmed', source: 'user_input' },
  { id: 'fact-major', topic: '专业', statement: '软件工程专业', status: 'confirmed', source: 'user_input' },
  { id: 'fact-role', topic: '目标岗位', statement: 'Java 后端开发实习生', status: 'confirmed', source: 'user_input' },
  { id: 'fact-timing', topic: '投递时间', statement: '4 个月后开始投递', status: 'confirmed', source: 'user_input' },
  { id: 'fact-hours', topic: '每周时间', statement: '每周可投入约 20 小时', status: 'confirmed', source: 'user_input' },
  { id: 'fact-java', topic: 'Java 基础', statement: '学过 Java 基础', status: 'confirmed', source: 'user_input' },
  { id: 'fact-project', topic: '项目经历', statement: '做过 Java + MySQL 学生管理系统', status: 'confirmed', source: 'user_input' },
]

export const linHaoCase: MockCase = {
  disclaimer: '虚构测试案例，仅用于产品演示；人物、经历、技能、岗位信息及后续行为均为模拟内容。',
  initialInput: {
    profile: { name: '林浩', grade: '大三上学期', major: '软件工程' },
    targetJob: {
      title: 'Java 后端开发实习生',
      jd: { source: 'jd', requirements: jdRequirements },
    },
    monthsUntilApplications: 4,
    hoursPerWeek: 20,
    experienceDescription: '学过 Java 基础，有一个 Java + MySQL 学生管理系统',
    statedFacts: initialFacts,
  },
  firstUnderstanding: {
    confirmed: initialFacts,
    inferred: [
      {
        id: 'inference-spring-ready', topic: '框架学习准备度',
        statement: '可能已经具备进入 Spring Boot 学习阶段的基础',
        status: 'inferred', source: 'ai_inference', basedOnInformationIds: ['fact-java'],
      },
    ],
    unknown: [
      { id: 'unknown-threads', topic: 'Java 多线程', statement: 'Java 多线程掌握情况未知', status: 'unknown', source: null },
      { id: 'unknown-mysql-depth', topic: 'MySQL 深度', statement: 'MySQL 掌握深度未知', status: 'unknown', source: null },
      { id: 'unknown-tools', topic: 'Git / Linux', statement: 'Git / Linux 使用情况未知', status: 'unknown', source: null },
    ],
  },
  firstDiagnosis: {
    id: 'diagnosis-before-correction',
    kind: 'preliminary',
    preliminary: true,
    requirements: jdRequirements,
    informationChoice: 'view_preliminary',
    missingInformation: [
      { informationId: 'unknown-threads', affectsTopThree: true, reason: '多线程基础会影响是否应先学习 Spring Boot。' },
      { informationId: 'unknown-mysql-depth', affectsTopThree: true, reason: 'MySQL 深度会影响数据库学习的优先级。' },
      { informationId: 'unknown-tools', affectsTopThree: false, reason: '仍需确认 Git / Linux 使用情况。' },
    ],
    supplementQuestions: [
      { id: 'question-threads', missingInformationId: 'unknown-threads', text: '目前学到 Java 多线程了吗？' },
      { id: 'question-mysql', missingInformationId: 'unknown-mysql-depth', text: 'MySQL 除 CRUD 外，索引和事务掌握到什么程度？' },
    ],
    recommendations: [
      {
        id: 'before-spring', rank: 1, title: 'Spring Boot', gapStatus: 'unknown', priority: 'P0',
        requirementIds: ['jd-framework'], informationIds: ['inference-spring-ready', 'unknown-threads'],
        basis: { explicitInJd: true, confirmedGap: false, prerequisiteForLaterAbility: false, monthsUntilApplications: 4 },
        reasons: ['模拟 AI 根据“学过 Java 基础”作出的偏乐观推测；基础是否足够尚未确认。', '这是可能变化的初步建议。'],
      },
      {
        id: 'before-project', rank: 2, title: '完善 Java 后端项目', gapStatus: 'unknown', priority: 'P1',
        requirementIds: ['jd-project'], informationIds: ['fact-project'],
        basis: { explicitInJd: true, confirmedGap: false, prerequisiteForLaterAbility: false, monthsUntilApplications: 4 },
        reasons: ['模拟 JD 将完整后端项目列为优先项，但现有项目的完整程度尚未确认。'],
      },
      {
        id: 'before-algorithms', rank: 3, title: '基础算法练习', gapStatus: 'unknown', priority: 'P1',
        requirementIds: ['jd-algorithms'], informationIds: [],
        basis: { explicitInJd: true, confirmedGap: false, prerequisiteForLaterAbility: false, monthsUntilApplications: 4 },
        reasons: ['模拟 JD 提及数据结构与算法；用户掌握情况尚未确认。'],
      },
    ],
  },
  corrections: [
    { id: 'correction-java', status: 'confirmed', source: 'user_correction', topic: 'Java 基础', statement: 'Java 实际刚学完集合', supersedesInformationIds: ['inference-spring-ready'] },
    { id: 'correction-threads', status: 'confirmed', source: 'user_correction', topic: 'Java 多线程', statement: 'Java 多线程尚未学习', supersedesInformationIds: ['unknown-threads', 'inference-spring-ready'] },
    { id: 'correction-mysql', status: 'confirmed', source: 'user_correction', topic: 'MySQL 深度', statement: 'MySQL 目前只会 CRUD', supersedesInformationIds: ['unknown-mysql-depth'] },
    { id: 'correction-project', status: 'confirmed', source: 'user_correction', topic: '项目经历', statement: '学生管理系统只是 JDBC 课程作业', supersedesInformationIds: [] },
  ],
  correctedUnderstanding: {
    confirmed: [
      ...initialFacts,
      { id: 'correction-java', topic: 'Java 基础', statement: 'Java 实际刚学完集合', status: 'confirmed', source: 'user_correction' },
      { id: 'correction-threads', topic: 'Java 多线程', statement: 'Java 多线程尚未学习', status: 'confirmed', source: 'user_correction' },
      { id: 'correction-mysql', topic: 'MySQL 深度', statement: 'MySQL 目前只会 CRUD', status: 'confirmed', source: 'user_correction' },
      { id: 'correction-project', topic: '项目经历', statement: '学生管理系统只是 JDBC 课程作业', status: 'confirmed', source: 'user_correction' },
    ],
    inferred: [],
    unknown: [
      { id: 'unknown-tools', topic: 'Git / Linux', statement: 'Git / Linux 使用情况未知', status: 'unknown', source: null },
      { id: 'unknown-spring', topic: 'Spring Boot', statement: 'Spring Boot 学习情况未知', status: 'unknown', source: null },
    ],
  },
  revisedDiagnosis: {
    id: 'diagnosis-after-correction',
    kind: 'revised',
    preliminary: false,
    requirements: jdRequirements,
    missingInformation: [
      { informationId: 'unknown-tools', affectsTopThree: false, reason: '目前不改变已确认的前三项排序。' },
      { informationId: 'unknown-spring', affectsTopThree: false, reason: '先补 Java 核心基础与 MySQL 基础。' },
    ],
    supplementQuestions: [],
    replacesDiagnosisId: 'diagnosis-before-correction',
    recommendations: [
      {
        id: 'after-java', rank: 1, title: 'Java 核心基础', gapStatus: 'gap', priority: 'P0',
        requirementIds: ['jd-java'], informationIds: ['correction-java', 'correction-threads'],
        basis: { explicitInJd: true, confirmedGap: true, prerequisiteForLaterAbility: true, prerequisiteFor: ['Spring Boot'], monthsUntilApplications: 4 },
        reasons: ['模拟 JD 明确要求 Java 核心能力。', '用户确认多线程尚未学习。', 'Java 核心基础是后续框架学习的重要前置。'],
      },
      {
        id: 'after-mysql', rank: 2, title: 'MySQL 基础', gapStatus: 'partial', priority: 'P0',
        requirementIds: ['jd-mysql'], informationIds: ['correction-mysql'],
        basis: { explicitInJd: true, confirmedGap: true, prerequisiteForLaterAbility: false, monthsUntilApplications: 4 },
        reasons: ['模拟 JD 要求 MySQL、索引和事务。', '用户明确目前只掌握 CRUD。'],
      },
      {
        id: 'after-spring', rank: 3, title: 'Spring Boot', gapStatus: 'unknown', priority: 'P1',
        requirementIds: ['jd-framework'], informationIds: ['correction-java', 'correction-threads', 'unknown-spring'],
        basis: { explicitInJd: true, confirmedGap: false, prerequisiteForLaterAbility: false, monthsUntilApplications: 4 },
        reasons: ['Spring Boot 是目标岗位关键能力。', '当前应排在 Java 核心基础和 MySQL 基础之后；掌握情况仍待确认。'],
      },
    ],
  },
  recommendationChanges: [
    { previousRecommendationId: 'before-spring', revisedRecommendationId: 'after-spring', correctionIds: ['correction-java', 'correction-threads'], explanation: '此前基于“学过 Java 基础”推测可以先学 Spring Boot；用户说明刚学完集合且多线程尚未学习后，Spring Boot 降至第三位。' },
    { previousRecommendationId: null, revisedRecommendationId: 'after-java', correctionIds: ['correction-java', 'correction-threads'], explanation: '用户确认 Java 多线程尚未学习，Java 核心基础成为先处理的前置能力。' },
    { previousRecommendationId: null, revisedRecommendationId: 'after-mysql', correctionIds: ['correction-mysql'], explanation: '用户确认 MySQL 只会 CRUD，与模拟 JD 的索引、事务要求相比仍有差距。' },
    { previousRecommendationId: 'before-project', revisedRecommendationId: null, correctionIds: ['correction-project'], explanation: '用户确认项目只是 JDBC 课程作业；前三位先处理已确认的 Java 与 MySQL 基础差距。' },
    { previousRecommendationId: 'before-algorithms', revisedRecommendationId: null, correctionIds: ['correction-java', 'correction-mysql'], explanation: '已确认的 Java 与 MySQL 基础差距当前更优先；算法掌握情况仍未知。' },
  ],
  followUp: '用户选择一个 7 天行动，完成后回来反馈，系统根据新事实重新调整建议',
}
