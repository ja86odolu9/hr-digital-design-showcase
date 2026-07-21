/**
* 人才内部活水匹配平台 — 数据层
* 包含：部门/城市/序列定义、人才画像、岗位画像、申请记录、成长资源、社区内容、部门流动数据
* 三维匹配引擎：硬性匹配 + 潜力匹配 + 文化匹配
*/

// ==================== 基础字典 ====================
const DEPARTMENTS = ['技术部', '产品部', '设计部', '市场部', '运营部', '人力资源部', '财务部', '法务部', '数据部', '客服部'];
const CITIES = ['深圳', '北京', '上海', '广州', '杭州', '成都'];
const SEQUENCES = ['技术研发', '产品设计', '数据分析', '市场营销', '运营增长', '职能管理'];
const LEVELS = ['P4', 'P5', 'P6', 'P7', 'M1', 'M2', 'M3'];

const STATUS_MAP = {
  available:  { label: '可流动', class: 'status-available',  color: '#6BAED6' },
  matching:   { label: '匹配中', class: 'status-matching',   color: '#E8A838' },
  matched:    { label: '已匹配', class: 'status-matched',    color: '#5B8FA8' },
  completed:  { label: '已转岗', class: 'status-completed',  color: '#4CAF7C' },
  open:       { label: '招聘中', class: 'status-open',       color: '#4CAF7C' },
  closed:     { label: '已关闭', class: 'status-closed',     color: '#E5655E' },
  screening:  { label: 'HR初筛', class: 'status-screening',  color: '#6BAED6' },
  interviewing:{label: '业务面试',class: 'status-interviewing',color: '#E8A838' },
  offer:      { label: '录用沟通', class: 'status-offer',     color: '#5B8FA8' },
  transfer:   { label: '转岗交接', class: 'status-transfer',  color: '#4CAF7C' },
  rejected:   { label: '未通过',   class: 'status-closed',    color: '#E5655E' },
};

// ==================== 16型人格字典 ====================
const MBTI_TYPES = {
  'INTJ': { nickname: '建筑师',   color: '#6C5CE7', bg: '#EEEAFE', desc: '富有想象力的战略家，精心计划一切' },
  'INTP': { nickname: '逻辑学家', color: '#0A7BD0', bg: '#E1F0FA', desc: '具有创造力的发明家，对知识有不可遏制的渴望' },
  'ENTJ': { nickname: '指挥官',   color: '#E17055', bg: '#FDEDE9', desc: '大胆，富有想象力且意志强大的领导者' },
  'ENTP': { nickname: '辩论家',   color: '#00B894', bg: '#E0F8F2', desc: '聪明好奇的思想者，不会放过任何智力上的挑战' },
  'INFJ': { nickname: '提倡者',   color: '#9B59B6', bg: '#F4ECF7', desc: '安静而神秘，同时鼓舞人心且不知疲倦的理想主义者' },
  'INFP': { nickname: '调停者',   color: '#E84393', bg: '#FDE8F3', desc: '诗意而善良的利他主义者，渴望为正当事业提供帮助' },
  'ENFJ': { nickname: '主人公',   color: '#E8A838', bg: '#FDF3E2', desc: '富有魅力和鼓舞人心的领导者，能够吸引听众' },
  'ENFP': { nickname: '竞选者',   color: '#F39C12', bg: '#FEF5E7', desc: '热情、有创造力、爱社交的自由灵魂' },
  'ISTJ': { nickname: '物流师',   color: '#34495E', bg: '#EBEEF1', desc: '实际而注重事实的人，可靠性不容怀疑' },
  'ISFJ': { nickname: '守卫者',   color: '#16A085', bg: '#E0F5F0', desc: '非常专注而温暖的守护者，时刻准备保护爱的人' },
  'ESTJ': { nickname: '总经理',   color: '#C0392B', bg: '#FBEAE8', desc: '出色的管理者，在管理事情或人方面无与伦比' },
  'ESFJ': { nickname: '执政官',   color: '#D35400', bg: '#FCEEE6', desc: '极有同情心，爱交往，受欢迎的人们' },
  'ISTP': { nickname: '鉴赏家',   color: '#2980B9', bg: '#E8F2FB', desc: '大胆而实际的实验家，擅长各种工具的使用' },
  'ISFP': { nickname: '探险家',   color: '#8E44AD', bg: '#F2EAF7', desc: '灵活而富有魅力的艺术家，时刻准备探索新的可能' },
  'ESTP': { nickname: '企业家',   color: '#E74C3C', bg: '#FCEAE8', desc: '聪明、精力充沛的人们，真正享受生活在边缘' },
  'ESFP': { nickname: '表演者',   color: '#FF6B81', bg: '#FFEAEF', desc: '自发的、精力充沛而热情的表演者' },
};

// ==================== 人才画像 ====================
const SEED_TALENTS = [
  {
    id: 1, name: '陈思远', empId: 'EMP001', avatar: '陈', mbti: 'INTJ',
    currentDept: '技术部', currentPosition: '前端开发工程师', level: 'P6', city: '深圳',
    education: { school: '华中科技大学', degree: '本科', major: '计算机科学与技术', year: 2021 },
    tenure: 4.3, joinDate: '2021-03-15',
    performanceHistory: [{ year: 2023, rating: 'A' }, { year: 2024, rating: 'A' }, { year: 2025, rating: 'A' }],
    promotionRecords: [{ date: '2023-07', from: 'P5', to: 'P6' }],
    skills: [
      { name: 'React', level: 'expert', source: 'project' },
      { name: 'TypeScript', level: 'expert', source: 'project' },
      { name: 'Node.js', level: 'intermediate', source: 'project' },
      { name: 'Figma', level: 'beginner', source: 'manual' },
      { name: '需求分析', level: 'intermediate', source: 'project' },
      { name: '团队协作', level: 'expert', source: 'project' },
    ],
    projects: [
      { name: '电商平台前端重构', role: '技术负责人', period: '2023.01-2023.06', desc: '主导前端架构升级，性能提升40%', skills: ['React', 'TypeScript'] },
      { name: '内部设计系统建设', role: '核心开发', period: '2024.03-2024.09', desc: '搭建组件库，覆盖12条业务线', skills: ['React', 'Figma'] },
    ],
    careerPreferences: { desiredDirection: '产品管理', desiredRoles: ['产品经理', '高级产品经理'], willingCities: ['深圳', '北京'], openToRelocation: true },
    privacySettings: { hideFromManager: true, deptWhitelist: ['产品部', '运营部'], deptBlacklist: [] },
    learningAgility: 88, cultureFit: { collaboration: 90, innovation: 82, ownership: 85, adaptability: 88 },
    desiredDept: '产品部', desiredRole: '产品经理', status: 'available', phone: '138****1234', notes: '对产品方向有浓厚兴趣', currentRole: 'employee',
  },
  {
    id: 2, name: '林婉清', empId: 'EMP002', avatar: '林', mbti: 'INFP',
    currentDept: '设计部', currentPosition: 'UI设计师', level: 'P5', city: '深圳',
    education: { school: '中国美术学院', degree: '硕士', major: '设计学', year: 2022 },
    tenure: 3.1, joinDate: '2022-07-01',
    performanceHistory: [{ year: 2023, rating: 'A' }, { year: 2024, rating: 'A' }],
    promotionRecords: [],
    skills: [
      { name: 'Figma', level: 'expert', source: 'project' },
      { name: '动效设计', level: 'expert', source: 'project' },
      { name: '用户研究', level: 'intermediate', source: 'project' },
      { name: 'Sketch', level: 'expert', source: 'manual' },
      { name: '交互设计', level: 'intermediate', source: 'project' },
    ],
    projects: [
      { name: 'App全面视觉升级', role: '主设计师', period: '2023.05-2023.11', desc: '主导移动端视觉体系重构', skills: ['Figma', '动效设计'] },
      { name: '设计规范2.0', role: '负责人', period: '2024.01-2024.06', desc: '统一设计语言，覆盖全产品线', skills: ['Figma'] },
    ],
    careerPreferences: { desiredDirection: '交互设计', desiredRoles: ['交互设计师', '高级交互设计师'], willingCities: ['深圳'], openToRelocation: false },
    privacySettings: { hideFromManager: false, deptWhitelist: ['产品部'], deptBlacklist: [] },
    learningAgility: 82, cultureFit: { collaboration: 85, innovation: 90, ownership: 80, adaptability: 75 },
    desiredDept: '产品部', desiredRole: '交互设计师', status: 'matching', phone: '139****5678', notes: '希望向交互设计方向深耕', currentRole: 'employee',
  },
  {
    id: 3, name: '王浩然', empId: 'EMP003', avatar: '王', mbti: 'ENFJ',
    currentDept: '市场部', currentPosition: '品牌策划', level: 'P6', city: '上海',
    education: { school: '复旦大学', degree: '本科', major: '市场营销', year: 2020 },
    tenure: 5.5, joinDate: '2020-01-10',
    performanceHistory: [{ year: 2023, rating: 'B' }, { year: 2024, rating: 'A' }, { year: 2025, rating: 'A' }],
    promotionRecords: [{ date: '2023-01', from: 'P5', to: 'P6' }],
    skills: [
      { name: '品牌策划', level: 'expert', source: 'project' },
      { name: '数据分析', level: 'intermediate', source: 'project' },
      { name: '文案写作', level: 'expert', source: 'manual' },
      { name: 'SEO', level: 'intermediate', source: 'manual' },
      { name: '团队管理', level: 'intermediate', source: 'project' },
    ],
    projects: [
      { name: '品牌升级战役', role: '项目牵头人', period: '2024.01-2024.06', desc: '品牌焕新，全网曝光+200%', skills: ['品牌策划', '文案写作'] },
      { name: '数字营销体系搭建', role: '核心成员', period: '2023.06-2023.12', desc: '搭建SEO+SEM投放体系', skills: ['SEO', '数据分析'] },
    ],
    careerPreferences: { desiredDirection: '运营管理', desiredRoles: ['运营经理', '运营总监'], willingCities: ['上海', '深圳'], openToRelocation: true },
    privacySettings: { hideFromManager: true, deptWhitelist: ['运营部'], deptBlacklist: [] },
    learningAgility: 78, cultureFit: { collaboration: 80, innovation: 75, ownership: 88, adaptability: 82 },
    desiredDept: '运营部', desiredRole: '运营总监', status: 'available', phone: '137****9012', notes: '具备丰富品牌运营经验', currentRole: 'employee',
  },
  {
    id: 4, name: '赵雨桐', empId: 'EMP004', avatar: '赵', mbti: 'INTP',
    currentDept: '数据部', currentPosition: '数据分析师', level: 'P5', city: '北京',
    education: { school: '北京大学', degree: '硕士', major: '统计学', year: 2022 },
    tenure: 3.3, joinDate: '2022-03-20',
    performanceHistory: [{ year: 2023, rating: 'A' }, { year: 2024, rating: 'A' }],
    promotionRecords: [],
    skills: [
      { name: 'Python', level: 'expert', source: 'project' },
      { name: 'SQL', level: 'expert', source: 'project' },
      { name: '机器学习', level: 'intermediate', source: 'project' },
      { name: 'Tableau', level: 'expert', source: 'manual' },
      { name: '统计学', level: 'expert', source: 'project' },
    ],
    projects: [
      { name: '用户增长分析平台', role: '核心开发', period: '2023.03-2023.09', desc: '搭建用户行为分析中台', skills: ['Python', 'SQL'] },
      { name: '推荐算法v2', role: '算法负责人', period: '2024.05-2024.12', desc: '推荐CTR提升15%', skills: ['Python', '机器学习'] },
    ],
    careerPreferences: { desiredDirection: '算法工程', desiredRoles: ['算法工程师'], willingCities: ['北京', '深圳'], openToRelocation: true },
    privacySettings: { hideFromManager: false, deptWhitelist: ['技术部'], deptBlacklist: [] },
    learningAgility: 92, cultureFit: { collaboration: 78, innovation: 88, ownership: 85, adaptability: 90 },
    desiredDept: '技术部', desiredRole: '算法工程师', status: 'matched', phone: '136****3456', notes: '机器学习方向有较强基础', currentRole: 'employee',
  },
  {
    id: 5, name: '刘子轩', empId: 'EMP005', avatar: '刘', mbti: 'ISTJ',
    currentDept: '技术部', currentPosition: '后端开发工程师', level: 'P6', city: '深圳',
    education: { school: '电子科技大学', degree: '本科', major: '软件工程', year: 2019 },
    tenure: 6.2, joinDate: '2019-05-15',
    performanceHistory: [{ year: 2023, rating: 'A' }, { year: 2024, rating: 'A' }, { year: 2025, rating: 'A' }],
    promotionRecords: [{ date: '2022-01', from: 'P4', to: 'P5' }, { date: '2024-01', from: 'P5', to: 'P6' }],
    skills: [
      { name: 'Java', level: 'expert', source: 'project' },
      { name: '微服务', level: 'expert', source: 'project' },
      { name: 'MySQL', level: 'expert', source: 'project' },
      { name: 'Redis', level: 'expert', source: 'project' },
      { name: '系统设计', level: 'expert', source: 'project' },
    ],
    projects: [
      { name: '交易系统微服务化', role: '架构负责人', period: '2023.01-2023.12', desc: '完成核心交易系统拆分', skills: ['Java', '微服务'] },
      { name: '高并发缓存体系', role: '技术负责人', period: '2024.03-2024.08', desc: 'QPS提升5倍', skills: ['Redis', '系统设计'] },
    ],
    careerPreferences: { desiredDirection: '架构师', desiredRoles: ['架构师'], willingCities: ['深圳'], openToRelocation: false },
    privacySettings: { hideFromManager: true, deptWhitelist: ['技术部'], deptBlacklist: [] },
    learningAgility: 80, cultureFit: { collaboration: 82, innovation: 78, ownership: 90, adaptability: 75 },
    desiredDept: '技术部', desiredRole: '架构师', status: 'available', phone: '135****7890', notes: '希望向架构方向发展', currentRole: 'employee',
  },
  {
    id: 6, name: '张悦宁', empId: 'EMP006', avatar: '张', mbti: 'ENFP',
    currentDept: '运营部', currentPosition: '用户运营', level: 'P4', city: '深圳',
    education: { school: '中山大学', degree: '本科', major: '新闻传播', year: 2023 },
    tenure: 2.4, joinDate: '2023-03-01',
    performanceHistory: [{ year: 2024, rating: 'B' }],
    promotionRecords: [],
    skills: [
      { name: '用户增长', level: 'intermediate', source: 'project' },
      { name: '社群运营', level: 'expert', source: 'project' },
      { name: '数据分析', level: 'beginner', source: 'manual' },
      { name: '活动策划', level: 'intermediate', source: 'project' },
    ],
    projects: [
      { name: '私域社群体系搭建', role: '执行负责人', period: '2023.06-2023.12', desc: '社群规模从0到10万', skills: ['社群运营', '用户增长'] },
    ],
    careerPreferences: { desiredDirection: '产品运营', desiredRoles: ['产品运营'], willingCities: ['深圳', '广州'], openToRelocation: true },
    privacySettings: { hideFromManager: false, deptWhitelist: ['产品部', '运营部'], deptBlacklist: [] },
    learningAgility: 85, cultureFit: { collaboration: 88, innovation: 80, ownership: 82, adaptability: 88 },
    desiredDept: '产品部', desiredRole: '产品运营', status: 'available', phone: '138****2345', notes: '对产品运营有热情', currentRole: 'employee',
  },
  {
    id: 7, name: '孙铭泽', empId: 'EMP007', avatar: '孙', mbti: 'ESTJ',
    currentDept: '产品部', currentPosition: '产品助理', level: 'P4', city: '深圳',
    education: { school: '武汉大学', degree: '本科', major: '信息管理', year: 2023 },
    tenure: 2.0, joinDate: '2023-07-10',
    performanceHistory: [{ year: 2024, rating: 'B' }],
    promotionRecords: [],
    skills: [
      { name: '需求分析', level: 'intermediate', source: 'project' },
      { name: 'Axure', level: 'expert', source: 'manual' },
      { name: '数据分析', level: 'beginner', source: 'manual' },
      { name: '用户研究', level: 'intermediate', source: 'project' },
    ],
    projects: [
      { name: 'B端后台产品迭代', role: '产品助理', period: '2024.01-2024.12', desc: '协助完成15个版本迭代', skills: ['需求分析', 'Axure'] },
    ],
    careerPreferences: { desiredDirection: '项目管理', desiredRoles: ['项目经理'], willingCities: ['深圳'], openToRelocation: false },
    privacySettings: { hideFromManager: true, deptWhitelist: ['技术部'], deptBlacklist: [] },
    learningAgility: 83, cultureFit: { collaboration: 85, innovation: 75, ownership: 80, adaptability: 82 },
    desiredDept: '技术部', desiredRole: '项目经理', status: 'matching', phone: '139****6789', notes: '希望转型项目管理', currentRole: 'employee',
  },
  {
    id: 8, name: '周诗涵', empId: 'EMP008', avatar: '周', mbti: 'ESFJ',
    currentDept: '人力资源部', currentPosition: '招聘专员', level: 'P5', city: '深圳',
    education: { school: '中国人民大学', degree: '本科', major: '人力资源管理', year: 2021 },
    tenure: 4.0, joinDate: '2021-09-01',
    performanceHistory: [{ year: 2023, rating: 'A' }, { year: 2024, rating: 'A' }],
    promotionRecords: [{ date: '2023-07', from: 'P4', to: 'P5' }],
    skills: [
      { name: '招聘', level: 'expert', source: 'project' },
      { name: '面试评估', level: 'expert', source: 'project' },
      { name: '雇主品牌', level: 'intermediate', source: 'project' },
      { name: '员工关系', level: 'intermediate', source: 'manual' },
    ],
    projects: [
      { name: '校招体系升级', role: '项目牵头人', period: '2023.09-2024.01', desc: '校招转化率提升30%', skills: ['招聘', '雇主品牌'] },
    ],
    careerPreferences: { desiredDirection: 'HRBP', desiredRoles: ['HRBP'], willingCities: ['深圳', '上海'], openToRelocation: true },
    privacySettings: { hideFromManager: false, deptWhitelist: ['运营部'], deptBlacklist: [] },
    learningAgility: 80, cultureFit: { collaboration: 92, innovation: 75, ownership: 85, adaptability: 80 },
    desiredDept: '运营部', desiredRole: 'HRBP', status: 'completed', phone: '137****0123', notes: '已完成转岗至运营部HRBP', currentRole: 'employee',
  },
  {
    id: 9, name: '吴俊杰', empId: 'EMP009', avatar: '吴', mbti: 'ISTP',
    currentDept: '技术部', currentPosition: '测试工程师', level: 'P5', city: '深圳',
    education: { school: '北京理工大学', degree: '本科', major: '计算机科学', year: 2022 },
    tenure: 3.2, joinDate: '2022-11-15',
    performanceHistory: [{ year: 2023, rating: 'B' }, { year: 2024, rating: 'B' }],
    promotionRecords: [],
    skills: [
      { name: '自动化测试', level: 'expert', source: 'project' },
      { name: 'Python', level: 'intermediate', source: 'project' },
      { name: 'CI/CD', level: 'intermediate', source: 'manual' },
      { name: 'Selenium', level: 'expert', source: 'project' },
    ],
    projects: [
      { name: '自动化测试平台', role: '核心开发', period: '2024.01-2024.08', desc: '自动化覆盖率从30%到75%', skills: ['自动化测试', 'Python'] },
    ],
    careerPreferences: { desiredDirection: 'DevOps', desiredRoles: ['DevOps工程师'], willingCities: ['深圳'], openToRelocation: false },
    privacySettings: { hideFromManager: true, deptWhitelist: ['技术部'], deptBlacklist: [] },
    learningAgility: 78, cultureFit: { collaboration: 80, innovation: 72, ownership: 78, adaptability: 80 },
    desiredDept: '技术部', desiredRole: 'DevOps工程师', status: 'available', phone: '136****4567', notes: '对DevOps方向有兴趣', currentRole: 'employee',
  },
  {
    id: 10, name: '郑晓琳', empId: 'EMP010', avatar: '郑', mbti: 'ENTJ',
    currentDept: '财务部', currentPosition: '财务分析师', level: 'P6', city: '北京',
    education: { school: '上海财经大学', degree: '硕士', major: '会计学', year: 2020 },
    tenure: 5.1, joinDate: '2020-06-20',
    performanceHistory: [{ year: 2023, rating: 'A' }, { year: 2024, rating: 'A' }],
    promotionRecords: [{ date: '2023-01', from: 'P5', to: 'P6' }],
    skills: [
      { name: '财务建模', level: 'expert', source: 'project' },
      { name: 'Python', level: 'intermediate', source: 'manual' },
      { name: 'Excel', level: 'expert', source: 'manual' },
      { name: '商业分析', level: 'expert', source: 'project' },
      { name: 'CPA', level: 'expert', source: 'manual' },
    ],
    projects: [
      { name: '全面预算管理改革', role: '核心成员', period: '2023.06-2024.03', desc: '预算精度提升25%', skills: ['财务建模', 'Excel'] },
    ],
    careerPreferences: { desiredDirection: '商业分析', desiredRoles: ['商业分析师'], willingCities: ['北京', '上海'], openToRelocation: true },
    privacySettings: { hideFromManager: false, deptWhitelist: ['数据部'], deptBlacklist: [] },
    learningAgility: 86, cultureFit: { collaboration: 82, innovation: 80, ownership: 88, adaptability: 85 },
    desiredDept: '数据部', desiredRole: '商业分析师', status: 'matching', phone: '135****8901', notes: '数据分析能力突出', currentRole: 'employee',
  },
  {
    id: 11, name: '黄子豪', empId: 'EMP011', avatar: '黄', mbti: 'ESTP',
    currentDept: '客服部', currentPosition: '客服主管', level: 'M1', city: '深圳',
    education: { school: '暨南大学', degree: '本科', major: '工商管理', year: 2021 },
    tenure: 4.1, joinDate: '2021-11-01',
    performanceHistory: [{ year: 2023, rating: 'B' }, { year: 2024, rating: 'B' }],
    promotionRecords: [{ date: '2024-01', from: 'P6', to: 'M1' }],
    skills: [
      { name: '团队管理', level: 'expert', source: 'project' },
      { name: '客户体验', level: 'expert', source: 'project' },
      { name: '数据分析', level: 'intermediate', source: 'manual' },
      { name: '流程优化', level: 'expert', source: 'project' },
    ],
    projects: [
      { name: '客服满意度提升项目', role: '项目负责人', period: '2024.03-2024.09', desc: 'CSAT从82%到91%', skills: ['团队管理', '客户体验'] },
    ],
    careerPreferences: { desiredDirection: '运营管理', desiredRoles: ['运营经理'], willingCities: ['深圳'], openToRelocation: false },
    privacySettings: { hideFromManager: true, deptWhitelist: ['运营部'], deptBlacklist: [] },
    learningAgility: 75, cultureFit: { collaboration: 85, innovation: 70, ownership: 82, adaptability: 78 },
    desiredDept: '运营部', desiredRole: '运营经理', status: 'available', phone: '138****3456', notes: '有团队管理经验', currentRole: 'employee',
  },
  {
    id: 12, name: '冯雅琪', empId: 'EMP012', avatar: '冯', mbti: 'ISFJ',
    currentDept: '法务部', currentPosition: '法务专员', level: 'P5', city: '深圳',
    education: { school: '中国政法大学', degree: '硕士', major: '民商法', year: 2022 },
    tenure: 3.1, joinDate: '2022-09-10',
    performanceHistory: [{ year: 2023, rating: 'B' }, { year: 2024, rating: 'B' }],
    promotionRecords: [],
    skills: [
      { name: '合同审查', level: 'expert', source: 'project' },
      { name: '合规管理', level: 'expert', source: 'project' },
      { name: '知识产权', level: 'intermediate', source: 'manual' },
      { name: '员工关系', level: 'beginner', source: 'manual' },
    ],
    projects: [
      { name: '合同管理系统数字化', role: '法务负责人', period: '2024.02-2024.08', desc: '合同审批效率提升50%', skills: ['合同审查', '合规管理'] },
    ],
    careerPreferences: { desiredDirection: '员工关系', desiredRoles: ['员工关系经理'], willingCities: ['深圳', '上海'], openToRelocation: true },
    privacySettings: { hideFromManager: false, deptWhitelist: ['人力资源部'], deptBlacklist: [] },
    learningAgility: 82, cultureFit: { collaboration: 80, innovation: 75, ownership: 82, adaptability: 85 },
    desiredDept: '人力资源部', desiredRole: '员工关系经理', status: 'available', phone: '139****7890', notes: '希望转型HR员工关系方向', currentRole: 'employee',
  },
  {
    id: 13, name: '何宇辰', empId: 'EMP013', avatar: '何', mbti: 'INTJ',
    currentDept: '技术部', currentPosition: '移动端开发工程师', level: 'P6', city: '深圳',
    education: { school: '浙江大学', degree: '本科', major: '计算机科学', year: 2021 },
    tenure: 4.2, joinDate: '2021-05-20',
    performanceHistory: [{ year: 2023, rating: 'A' }, { year: 2024, rating: 'A' }],
    promotionRecords: [{ date: '2023-07', from: 'P5', to: 'P6' }],
    skills: [
      { name: 'React', level: 'expert', source: 'project' },
      { name: 'TypeScript', level: 'expert', source: 'project' },
      { name: 'Flutter', level: 'expert', source: 'project' },
      { name: 'React Native', level: 'expert', source: 'project' },
      { name: '性能优化', level: 'expert', source: 'project' },
    ],
    projects: [
      { name: '跨平台App架构升级', role: '技术负责人', period: '2024.01-2024.10', desc: '统一iOS/Android/H5技术栈', skills: ['Flutter', 'React Native'] },
    ],
    careerPreferences: { desiredDirection: '前端架构', desiredRoles: ['前端技术专家'], willingCities: ['深圳'], openToRelocation: false },
    privacySettings: { hideFromManager: true, deptWhitelist: ['技术部'], deptBlacklist: [] },
    learningAgility: 84, cultureFit: { collaboration: 82, innovation: 85, ownership: 88, adaptability: 80 },
    desiredDept: '技术部', desiredRole: '前端技术专家', status: 'available', phone: '137****2345', notes: '全栈能力，希望深耕前端', currentRole: 'employee',
  },
  {
    id: 14, name: '罗梦瑶', empId: 'EMP014', avatar: '罗', mbti: 'ISFP',
    currentDept: '设计部', currentPosition: '视觉设计师', level: 'P5', city: '深圳',
    education: { school: '广州美术学院', degree: '本科', major: '视觉传达', year: 2022 },
    tenure: 3.2, joinDate: '2022-04-15',
    performanceHistory: [{ year: 2023, rating: 'B' }, { year: 2024, rating: 'B' }],
    promotionRecords: [],
    skills: [
      { name: 'Photoshop', level: 'expert', source: 'manual' },
      { name: 'Illustrator', level: 'expert', source: 'manual' },
      { name: '3D建模', level: 'intermediate', source: 'project' },
      { name: '品牌设计', level: 'expert', source: 'project' },
    ],
    projects: [
      { name: '品牌视觉升级', role: '主设计师', period: '2024.05-2024.11', desc: '品牌识别度提升显著', skills: ['品牌设计', 'Photoshop'] },
    ],
    careerPreferences: { desiredDirection: '品牌设计', desiredRoles: ['品牌设计师'], willingCities: ['深圳'], openToRelocation: false },
    privacySettings: { hideFromManager: false, deptWhitelist: ['市场部'], deptBlacklist: [] },
    learningAgility: 76, cultureFit: { collaboration: 78, innovation: 85, ownership: 75, adaptability: 72 },
    desiredDept: '市场部', desiredRole: '品牌设计师', status: 'matched', phone: '136****6789', notes: '品牌设计方向匹配度高', currentRole: 'employee',
  },
  {
    id: 15, name: '高逸飞', empId: 'EMP015', avatar: '高', mbti: 'ENFP',
    currentDept: '运营部', currentPosition: '内容运营', level: 'P4', city: '上海',
    education: { school: '华东师范大学', degree: '本科', major: '传播学', year: 2023 },
    tenure: 2.4, joinDate: '2023-02-01',
    performanceHistory: [{ year: 2024, rating: 'B' }],
    promotionRecords: [],
    skills: [
      { name: '内容策划', level: 'intermediate', source: 'project' },
      { name: '新媒体运营', level: 'expert', source: 'project' },
      { name: '数据分析', level: 'beginner', source: 'manual' },
      { name: '视频剪辑', level: 'intermediate', source: 'manual' },
    ],
    projects: [
      { name: '短视频矩阵搭建', role: '执行负责人', period: '2024.03-2024.10', desc: '粉丝量从5万到50万', skills: ['新媒体运营', '视频剪辑'] },
    ],
    careerPreferences: { desiredDirection: '数字营销', desiredRoles: ['数字营销专员'], willingCities: ['上海', '深圳'], openToRelocation: true },
    privacySettings: { hideFromManager: true, deptWhitelist: ['市场部'], deptBlacklist: [] },
    learningAgility: 83, cultureFit: { collaboration: 80, innovation: 82, ownership: 78, adaptability: 85 },
    desiredDept: '市场部', desiredRole: '数字营销专员', status: 'available', phone: '135****1234', notes: '对数字营销有热情', currentRole: 'employee',
  },
  {
    // 雷达之星：高匹配示范员工（运营部 → 产品部·高级产品经理）
    id: 16, name: '韩雪晴', empId: 'EMP016', avatar: '韩', mbti: 'ENFJ',
    currentDept: '运营部', currentPosition: '高级运营专员', level: 'P6', city: '深圳',
    education: { school: '中山大学', degree: '本科', major: '市场营销', year: 2022 },
    tenure: 3.5, joinDate: '2022-06-15',
    performanceHistory: [{ year: 2023, rating: 'A' }, { year: 2024, rating: 'A' }, { year: 2025, rating: 'A' }],
    promotionRecords: [{ date: '2024-01', from: 'P5', to: 'P6' }],
    skills: [
      { name: '需求分析', level: 'expert', source: 'project' },
      { name: '数据分析', level: 'expert', source: 'project' },
      { name: '用户研究', level: 'expert', source: 'project' },
      { name: 'Axure', level: 'intermediate', source: 'manual' },
      { name: '跨部门协作', level: 'expert', source: 'project' },
      { name: '产品规划', level: 'intermediate', source: 'project' },
    ],
    projects: [
      { name: '用户增长策略制定', role: '负责人', period: '2023.06-2023.12', desc: '主导A/B测试体系搭建，DAU提升35%', skills: ['数据分析', '用户研究'] },
      { name: '跨产品孵化项目', role: '核心成员', period: '2024.03-2024.09', desc: '与产品部联合孵化新业务线，从0到1完成MVP', skills: ['需求分析', '跨部门协作', '产品规划'] },
      { name: '客户洞察体系', role: '负责人', period: '2024.10-2025.04', desc: '搭建用户画像与NPS体系，输出20+洞察报告', skills: ['用户研究', '需求分析'] },
    ],
    careerPreferences: { desiredDirection: '产品管理', desiredRoles: ['产品经理', '高级产品经理'], willingCities: ['深圳', '北京'], openToRelocation: true },
    privacySettings: { hideFromManager: false, deptWhitelist: [], deptBlacklist: [] },
    learningAgility: 92, cultureFit: { collaboration: 95, innovation: 90, ownership: 92, adaptability: 90 },
    desiredDept: '产品部', desiredRole: '高级产品经理', status: 'available', phone: '136****5678', notes: '已自学完成产品经理核心课程，有产品孵化经验', currentRole: 'employee',
  },
];

// ==================== 岗位画像 ====================
const SEED_POSITIONS = [
  {
    id: 1, title: '高级产品经理', dept: '产品部', headcount: 2, location: '深圳', level: 'P6', sequence: '产品设计',
    status: 'open', postedDate: '2025-06-01', postedBy: '李明远 (M2)',
    skills: [{ name: '需求分析', required: true, level: 'expert' }, { name: '数据分析', required: true, level: 'intermediate' }, { name: '用户研究', required: true, level: 'intermediate' }, { name: 'Axure', required: false, level: 'intermediate' }],
    desc: '负责核心产品线的规划与迭代，需要跨部门协作能力。主导0-1新产品孵化及商业化落地。',
    mobilityInfo: {
      teamVibe: '团队扁平高效，每周一次产品评审，鼓励数据驱动决策。团队氛围轻松，PM有较大自主权。',
      urgencyReason: '新业务线扩张，Q3需补充2名PM支撑产品矩阵扩展',
      predecessorDestination: '原岗位人员已晋升为产品总监，带领独立业务线',
      firstThreeMonths: '1. 熟悉核心产品架构与用户画像\n2. 独立完成一个功能模块的0-1规划\n3. 主导一次跨部门需求评审\n4. 输出竞品分析报告1份',
    },
    managerIntro: { name: '李明远', title: '产品总监', bioText: '大家好，我是产品负责人李明远。我们团队正在做真正有挑战的产品，欢迎对产品有热情的同学来聊聊。', coffeeChatAvailable: true },
    visibility: 'all', approved: true,
  },
  {
    id: 2, title: '交互设计师', dept: '产品部', headcount: 1, location: '深圳', level: 'P5', sequence: '产品设计',
    status: 'open', postedDate: '2025-06-05', postedBy: '李明远 (M2)',
    skills: [{ name: 'Figma', required: true, level: 'expert' }, { name: '动效设计', required: true, level: 'intermediate' }, { name: '用户研究', required: true, level: 'intermediate' }],
    desc: '负责产品交互设计，提升用户体验。参与产品全生命周期，从概念到落地。',
    mobilityInfo: {
      teamVibe: '设计驱动的产品团队，重视用户体验研究，每周有设计走查环节。',
      urgencyReason: '团队交互设计师产假，需补充1人',
      predecessorDestination: '原岗位人员休产假，预计6个月后回归转岗至设计管理方向',
      firstThreeMonths: '1. 熟悉设计系统与组件库\n2. 独立负责一个产品线的交互设计\n3. 完成一次可用性测试\n4. 产出交互规范文档',
    },
    managerIntro: { name: '李明远', title: '产品总监', bioText: '交互设计在我们团队是核心角色，直接参与产品决策。', coffeeChatAvailable: true },
    visibility: 'all', approved: true,
  },
  {
    id: 3, title: '算法工程师', dept: '技术部', headcount: 3, location: '北京', level: 'P6', sequence: '技术研发',
    status: 'open', postedDate: '2025-05-20', postedBy: '张志强 (M3)',
    skills: [{ name: 'Python', required: true, level: 'expert' }, { name: '机器学习', required: true, level: 'expert' }, { name: '统计学', required: true, level: 'intermediate' }],
    desc: '负责推荐系统和数据挖掘算法的研发，支撑亿级用户规模的个性化体验。',
    mobilityInfo: {
      teamVibe: '技术氛围浓厚，每周有Paper Reading，鼓励创新和实验。工程师有充分的技术探索空间。',
      urgencyReason: '推荐系统升级，需补充3名算法工程师',
      predecessorDestination: '团队持续扩张中，无人员离职',
      firstThreeMonths: '1. 熟悉推荐系统整体架构\n2. 独立完成一个召回策略的优化\n3. 参与模型迭代实验\n4. 输出技术方案文档',
    },
    managerIntro: { name: '张志强', title: '技术副总裁', bioText: '我们做的是真正影响亿万用户的推荐系统，技术挑战和成长空间都很大。', coffeeChatAvailable: true },
    visibility: 'all', approved: true,
  },
  {
    id: 4, title: 'DevOps工程师', dept: '技术部', headcount: 2, location: '深圳', level: 'P5', sequence: '技术研发',
    status: 'open', postedDate: '2025-06-10', postedBy: '王磊 (M2)',
    skills: [{ name: 'CI/CD', required: true, level: 'expert' }, { name: 'Python', required: true, level: 'intermediate' }, { name: '自动化测试', required: false, level: 'intermediate' }],
    desc: '负责自动化部署和运维体系建设，打造高效可靠的研发基础设施。',
    mobilityInfo: {
      teamVibe: '基础设施团队，服务全公司研发，工作节奏稳定，重视工程化思维。',
      urgencyReason: 'DevOps平台升级，需补充2人',
      predecessorDestination: '团队扩张岗位，无前任',
      firstThreeMonths: '1. 熟悉CI/CD流水线\n2. 独立维护一套发布流程\n3. 完成监控告警体系优化\n4. 产出运维自动化脚本',
    },
    managerIntro: { name: '王磊', title: '技术总监', bioText: 'DevOps是研发效率的基石，我们团队在做有长期价值的事情。', coffeeChatAvailable: true },
    visibility: 'all', approved: true,
  },
  {
    id: 5, title: '架构师', dept: '技术部', headcount: 1, location: '深圳', level: 'P7', sequence: '技术研发',
    status: 'open', postedDate: '2025-05-15', postedBy: '张志强 (M3)',
    skills: [{ name: '系统设计', required: true, level: 'expert' }, { name: '微服务', required: true, level: 'expert' }, { name: 'Java', required: true, level: 'expert' }],
    desc: '负责核心技术架构设计与评审，指导团队技术演进方向。',
    mobilityInfo: {
      teamVibe: '技术驱动型团队，架构师有高度自主权，直接向VP汇报。',
      urgencyReason: '核心系统架构升级的关键时期',
      predecessorDestination: '原架构师调任新业务线CTO',
      firstThreeMonths: '1. 完成核心系统架构评审\n2. 输出技术演进路线图\n3. 主导一次重大架构决策\n4. 建立架构治理机制',
    },
    managerIntro: { name: '张志强', title: '技术副总裁', bioText: '架构师在我们这里不是画图的，是真正做技术决策的人。', coffeeChatAvailable: true },
    visibility: 'all', approved: true,
  },
  {
    id: 6, title: '运营经理', dept: '运营部', headcount: 1, location: '上海', level: 'M1', sequence: '运营增长',
    status: 'open', postedDate: '2025-06-08', postedBy: '陈薇 (M2)',
    skills: [{ name: '团队管理', required: true, level: 'expert' }, { name: '数据分析', required: true, level: 'intermediate' }, { name: '用户增长', required: true, level: 'expert' }, { name: '活动策划', required: false, level: 'intermediate' }],
    desc: '负责用户运营团队管理和策略制定，驱动用户规模和活跃度增长。',
    mobilityInfo: {
      teamVibe: '数据驱动的运营团队，每周复盘增长指标，鼓励创新增长策略。',
      urgencyReason: '上海运营团队扩张，需1名团队负责人',
      predecessorDestination: '原负责人调任总部运营总监',
      firstThreeMonths: '1. 熟悉运营数据看板和指标体系\n2. 完成团队1v1并制定成长计划\n3. 主导一次大型增长活动\n4. 输出运营策略Q3规划',
    },
    managerIntro: { name: '陈薇', title: '运营总监', bioText: '运营经理不是执行者，是增长策略的制定者。', coffeeChatAvailable: true },
    visibility: 'all', approved: true,
  },
  {
    id: 7, title: 'HRBP', dept: '运营部', headcount: 2, location: '深圳', level: 'P6', sequence: '职能管理',
    status: 'open', postedDate: '2025-06-12', postedBy: '刘芳 (M2)',
    skills: [{ name: '招聘', required: true, level: 'expert' }, { name: '员工关系', required: true, level: 'intermediate' }, { name: '组织发展', required: false, level: 'intermediate' }],
    desc: '支持业务部门的人力资源需求，作为业务与HR的桥梁。',
    mobilityInfo: {
      teamVibe: 'HRBP直接深度参与业务，不是职能支持而是业务伙伴。团队专业度高，有完善的发展通道。',
      urgencyReason: '业务规模扩大，需增加HRBP配置',
      predecessorDestination: '原HRBP晋升为HRBP团队负责人',
      firstThreeMonths: '1. 熟悉所支持业务线的组织架构\n2. 完成核心团队1v1\n3. 输出人才盘点报告\n4. 主导一次关键岗位招聘',
    },
    managerIntro: { name: '刘芳', title: 'HR总监', bioText: 'HRBP在我们公司是真正有影响力的角色，深度参与业务决策。', coffeeChatAvailable: true },
    visibility: 'all', approved: true,
  },
  {
    id: 8, title: '商业分析师', dept: '数据部', headcount: 2, location: '北京', level: 'P6', sequence: '数据分析',
    status: 'open', postedDate: '2025-05-28', postedBy: '赵明 (M2)',
    skills: [{ name: 'Python', required: true, level: 'intermediate' }, { name: 'SQL', required: true, level: 'expert' }, { name: '财务建模', required: false, level: 'intermediate' }, { name: 'Tableau', required: true, level: 'expert' }],
    desc: '负责商业数据分析和决策支持，将数据洞察转化为业务行动。',
    mobilityInfo: {
      teamVibe: '分析与业务紧密结合，分析师直接参与经营决策会议，影响力大。',
      urgencyReason: '商业化分析需求增加',
      predecessorDestination: '团队扩张岗位',
      firstThreeMonths: '1. 熟悉核心数据指标体系\n2. 独立完成一个业务专题分析\n3. 搭建经营分析仪表盘\n4. 支持一次重要经营决策',
    },
    managerIntro: { name: '赵明', title: '数据总监', bioText: '我们的分析师不是做报表的，是做商业洞察的。', coffeeChatAvailable: true },
    visibility: 'all', approved: true,
  },
  {
    id: 9, title: '品牌设计师', dept: '市场部', headcount: 1, location: '深圳', level: 'P5', sequence: '产品设计',
    status: 'open', postedDate: '2025-06-03', postedBy: '周婷 (M1)',
    skills: [{ name: '品牌设计', required: true, level: 'expert' }, { name: 'Photoshop', required: true, level: 'expert' }, { name: 'Illustrator', required: true, level: 'expert' }, { name: '3D建模', required: false, level: 'intermediate' }],
    desc: '负责品牌视觉体系建设和创意设计，打造有辨识度的品牌形象。',
    mobilityInfo: {
      teamVibe: '创意驱动的市场团队，鼓励大胆创意，有充足的视觉实验空间。',
      urgencyReason: '品牌升级项目启动',
      predecessorDestination: '原设计师调任海外品牌负责人',
      firstThreeMonths: '1. 熟悉品牌视觉规范\n2. 独立完成一个品牌传播项目\n3. 产出品牌视觉升级方案\n4. 主导一次品牌创意评审',
    },
    managerIntro: { name: '周婷', title: '品牌经理', bioText: '品牌设计在我们这里不是执行需求，是定义品牌调性的人。', coffeeChatAvailable: false },
    visibility: 'all', approved: true,
  },
  {
    id: 10, title: '数字营销专员', dept: '市场部', headcount: 2, location: '上海', level: 'P4', sequence: '市场营销',
    status: 'open', postedDate: '2025-06-15', postedBy: '周婷 (M1)',
    skills: [{ name: '内容策划', required: true, level: 'intermediate' }, { name: '数据分析', required: true, level: 'intermediate' }, { name: '新媒体运营', required: true, level: 'expert' }],
    desc: '负责数字渠道营销推广和效果分析，驱动品牌数字化增长。',
    mobilityInfo: {
      teamVibe: '年轻活力的数字营销团队，重视内容创新和数据驱动。',
      urgencyReason: '数字化营销战略升级',
      predecessorDestination: '团队扩张岗位',
      firstThreeMonths: '1. 熟悉数字营销渠道矩阵\n2. 独立负责一个渠道的投放策略\n3. 完成一次营销效果分析报告\n4. 提出内容创新方案',
    },
    managerIntro: { name: '周婷', title: '品牌经理', bioText: '数字营销是增长引擎，我们团队有很多创新空间。', coffeeChatAvailable: true },
    visibility: 'all', approved: true,
  },
  {
    id: 11, title: '项目经理', dept: '技术部', headcount: 1, location: '深圳', level: 'P6', sequence: '技术研发',
    status: 'open', postedDate: '2025-05-25', postedBy: '王磊 (M2)',
    skills: [{ name: '需求分析', required: true, level: 'expert' }, { name: '数据分析', required: false, level: 'intermediate' }, { name: '团队管理', required: false, level: 'intermediate' }],
    desc: '负责技术项目管理与交付，确保项目按时保质完成。',
    mobilityInfo: {
      teamVibe: '项目管理的核心团队，跨部门协作多，沟通能力强的人会很适应。',
      urgencyReason: '项目管理规范化需求',
      predecessorDestination: '原PM晋升为PMO负责人',
      firstThreeMonths: '1. 熟悉项目管理流程规范\n2. 独立负责一个中等规模项目\n3. 建立项目看板和周报机制\n4. 完成一次项目复盘',
    },
    managerIntro: { name: '王磊', title: '技术总监', bioText: '项目经理是团队效率的保障，欢迎有产品思维的技术管理者。', coffeeChatAvailable: true },
    visibility: 'all', approved: true,
  },
  {
    id: 12, title: '前端技术专家', dept: '技术部', headcount: 1, location: '深圳', level: 'P7', sequence: '技术研发',
    status: 'closed', postedDate: '2025-04-10', postedBy: '张志强 (M3)',
    skills: [{ name: 'React', required: true, level: 'expert' }, { name: 'TypeScript', required: true, level: 'expert' }, { name: '性能优化', required: true, level: 'expert' }],
    desc: '负责前端技术架构和团队技术提升。',
    mobilityInfo: {
      teamVibe: '技术追求极致的团队，重视前端工程化和性能。',
      urgencyReason: '岗位已关闭',
      predecessorDestination: '已通过外部招聘补齐',
      firstThreeMonths: '岗位已关闭',
    },
    managerIntro: { name: '张志强', title: '技术副总裁', bioText: '', coffeeChatAvailable: false },
    visibility: 'all', approved: true,
  },
];

// ==================== 申请记录 ====================
const SEED_APPLICATIONS = [
  {
    id: 1, talentId: 4, positionId: 3, status: 'offer', applyDate: '2025-06-10',
    timeline: [
      { stage: 'HR初筛', status: 'completed', date: '2025-06-11', note: '简历匹配度高，通过初筛' },
      { stage: '业务面试', status: 'completed', date: '2025-06-15', note: '两轮技术面试均通过，算法能力突出' },
      { stage: '录用沟通', status: 'current', date: '2025-06-20', note: 'HRBP正在进行转岗沟通' },
      { stage: '转岗交接', status: 'pending', date: null, note: '' },
    ],
    interviews: [
      { round: '一面', interviewer: '张志强', date: '2025-06-15', rating: 4.5, comment: '算法基础扎实，对推荐系统有深入理解，沟通清晰', passed: true },
      { round: '二面', interviewer: '赵明', date: '2025-06-17', rating: 4.0, comment: '工程能力良好，有较好的业务理解力', passed: true },
    ],
    notifications: [
      { type: 'success', message: '恭喜！您已通过业务面试，进入录用沟通阶段', time: '2025-06-17 16:30' },
      { type: 'info', message: 'HRBP将在2个工作日内与您联系沟通转岗事宜', time: '2025-06-17 16:35' },
    ],
  },
  {
    id: 2, talentId: 2, positionId: 2, status: 'interviewing', applyDate: '2025-06-12',
    timeline: [
      { stage: 'HR初筛', status: 'completed', date: '2025-06-13', note: '设计能力匹配，通过初筛' },
      { stage: '业务面试', status: 'current', date: '2025-06-18', note: '已安排一面' },
      { stage: '录用沟通', status: 'pending', date: null, note: '' },
      { stage: '转岗交接', status: 'pending', date: null, note: '' },
    ],
    interviews: [
      { round: '一面', interviewer: '李明远', date: '2025-06-18', rating: 4.2, comment: '设计能力强，交互思维好，对用户研究有独到见解', passed: true },
    ],
    notifications: [
      { type: 'info', message: '您的一面已通过，二面安排在6月22日', time: '2025-06-18 17:00' },
    ],
  },
  {
    id: 3, talentId: 7, positionId: 11, status: 'screening', applyDate: '2025-06-18',
    timeline: [
      { stage: 'HR初筛', status: 'current', date: null, note: 'HR正在审核您的申请' },
      { stage: '业务面试', status: 'pending', date: null, note: '' },
      { stage: '录用沟通', status: 'pending', date: null, note: '' },
      { stage: '转岗交接', status: 'pending', date: null, note: '' },
    ],
    interviews: [],
    notifications: [
      { type: 'info', message: '您的申请已提交，HR将在3个工作日内审核', time: '2025-06-18 10:00' },
    ],
  },
  {
    id: 4, talentId: 10, positionId: 8, status: 'interviewing', applyDate: '2025-06-08',
    timeline: [
      { stage: 'HR初筛', status: 'completed', date: '2025-06-09', note: '财务+数据分析复合背景，高匹配' },
      { stage: '业务面试', status: 'current', date: '2025-06-14', note: '一面通过，二面待安排' },
      { stage: '录用沟通', status: 'pending', date: null, note: '' },
      { stage: '转岗交接', status: 'pending', date: null, note: '' },
    ],
    interviews: [
      { round: '一面', interviewer: '赵明', date: '2025-06-14', rating: 4.3, comment: '商业敏感度高，数据分析能力强，CPA背景加分', passed: true },
    ],
    notifications: [
      { type: 'info', message: '一面已通过，二面预计6月25日安排', time: '2025-06-14 18:00' },
    ],
  },
  {
    id: 5, talentId: 14, positionId: 9, status: 'offer', applyDate: '2025-06-05',
    timeline: [
      { stage: 'HR初筛', status: 'completed', date: '2025-06-06', note: '品牌设计经验丰富' },
      { stage: '业务面试', status: 'completed', date: '2025-06-10', note: '作品集优秀，设计思路清晰' },
      { stage: '录用沟通', status: 'current', date: '2025-06-16', note: '已发出口头offer' },
      { stage: '转岗交接', status: 'pending', date: null, note: '' },
    ],
    interviews: [
      { round: '一面', interviewer: '周婷', date: '2025-06-10', rating: 4.5, comment: '品牌设计能力强，3D技能加分，创意思维活跃', passed: true },
      { round: '二面', interviewer: '市场VP', date: '2025-06-12', rating: 4.0, comment: '综合能力达标，建议加入品牌升级项目', passed: true },
    ],
    notifications: [
      { type: 'success', message: '恭喜！您已通过全部面试，收到口头offer', time: '2025-06-12 17:30' },
      { type: 'info', message: '请在3个工作日内回复是否接受offer', time: '2025-06-12 17:35' },
    ],
  },
  {
    id: 6, talentId: 8, positionId: 7, status: 'completed', applyDate: '2025-04-15',
    timeline: [
      { stage: 'HR初筛', status: 'completed', date: '2025-04-16', note: '招聘背景与HRBP方向高度匹配' },
      { stage: '业务面试', status: 'completed', date: '2025-04-20', note: '面试表现优秀' },
      { stage: '录用沟通', status: 'completed', date: '2025-04-25', note: '已确认转岗' },
      { stage: '转岗交接', status: 'completed', date: '2025-05-15', note: '完成交接，正式入职运营部HRBP' },
    ],
    interviews: [
      { round: '一面', interviewer: '刘芳', date: '2025-04-20', rating: 4.5, comment: '招聘专业能力强，沟通能力出色', passed: true },
      { round: '二面', interviewer: '运营VP', date: '2025-04-22', rating: 4.2, comment: '对业务理解到位，适合HRBP角色', passed: true },
    ],
    notifications: [
      { type: 'success', message: '转岗交接已完成，欢迎加入运营部！', time: '2025-05-15 09:00' },
    ],
  },
];

// ==================== 成长赋能资源 ====================
const SEED_GROWTH = {
  courses: [
    { id: 1, title: '产品经理入门到精通', category: '产品', duration: '12小时', level: '初级', skills: ['需求分析', '用户研究'], matchGap: true, students: 320, rating: 4.6 },
    { id: 2, title: '机器学习实战', category: '技术', duration: '20小时', level: '中级', skills: ['Python', '机器学习'], matchGap: true, students: 580, rating: 4.8 },
    { id: 3, title: '设计系统构建指南', category: '设计', duration: '8小时', level: '中级', skills: ['Figma', '动效设计'], matchGap: false, students: 210, rating: 4.5 },
    { id: 4, title: '数据分析与商业决策', category: '数据', duration: '15小时', level: '中级', skills: ['Python', 'SQL', 'Tableau'], matchGap: true, students: 420, rating: 4.7 },
    { id: 5, title: '敏捷项目管理认证', category: '管理', duration: '10小时', level: '中级', skills: ['团队管理', '需求分析'], matchGap: false, students: 180, rating: 4.4 },
    { id: 6, title: '品牌策略与视觉传达', category: '市场', duration: '10小时', level: '中级', skills: ['品牌设计', '品牌策划'], matchGap: false, students: 150, rating: 4.3 },
  ],
  mentors: [
    { id: 1, name: '张志强', title: '技术副总裁', dept: '技术部', expertise: ['系统设计', '架构', '技术管理'], available: true, sessions: 45, rating: 4.9 },
    { id: 2, name: '李明远', title: '产品总监', dept: '产品部', expertise: ['产品策略', '用户研究', '商业化'], available: true, sessions: 38, rating: 4.8 },
    { id: 3, name: '陈薇', title: '运营总监', dept: '运营部', expertise: ['用户增长', '团队管理', '数据驱动'], available: false, sessions: 52, rating: 4.7 },
    { id: 4, name: '赵明', title: '数据总监', dept: '数据部', expertise: ['商业分析', '数据建模', '决策支持'], available: true, sessions: 30, rating: 4.6 },
  ],
  challenges: [
    { id: 1, title: '推荐算法优化挑战赛', desc: '基于真实业务数据，优化推荐策略提升CTR', difficulty: '高', duration: '4周', skills: ['Python', '机器学习'], participants: 24, reward: '技术晋升加分' },
    { id: 2, title: '产品设计Hackathon', desc: '48小时极限设计，从0到1打造创新产品方案', difficulty: '中', duration: '48小时', skills: ['需求分析', 'Figma'], participants: 56, reward: '创新奖+产品孵化机会' },
    { id: 3, title: '跨部门协作项目', desc: '参与技术部与产品部联合项目，积累跨界经验', difficulty: '中', duration: '8周', skills: ['团队协作', '需求分析'], participants: 18, reward: '跨界经验认证' },
  ],
};

// ==================== 活水社区 ====================
const SEED_COMMUNITY = {
  stories: [
    { id: 1, name: '周诗涵', fromDept: '人力资源部', fromRole: '招聘专员', toDept: '运营部', toRole: 'HRBP', date: '2025-05', avatar: '周', quote: '活水转岗让我找到了真正热爱的方向。从招聘专员到HRBP，不仅是岗位的变化，更是视角的升级——现在我能从业务角度思考人才战略。', tags: ['跨部门', 'HRBP', '成长突破'] },
    { id: 2, name: '赵雨桐', fromDept: '数据部', fromRole: '数据分析师', toDept: '技术部', toRole: '算法工程师', date: '2025-06', avatar: '赵', quote: '从数据分析到算法工程，活水机制给了我跨界的机会。公司提供了学习资源和导师支持，让我平稳过渡到新角色。', tags: ['技术转型', '算法', '学习成长'] },
    { id: 3, name: '罗梦瑶', fromDept: '设计部', fromRole: '视觉设计师', toDept: '市场部', toRole: '品牌设计师', date: '2025-06', avatar: '罗', quote: '从纯视觉设计到品牌设计，我找到了更大的发挥空间。市场团队给了我更多创意自由，也让我理解了设计与商业的关系。', tags: ['设计转型', '品牌', '创意发挥'] },
  ],
  faqs: [
    { q: '活水转岗需要满足什么条件？', a: '一般要求司龄满1年、最近一次绩效不低于B级。具体要求可在"规则配置"中查看，不同岗位可能有额外要求。' },
    { q: '申请活水会被直属上级知道吗？', a: '不会。在HR初筛和面试阶段，您的申请对当前直属上级严格保密。只有在您确认接受offer后，才会启动转岗交接流程并通知上级。' },
    { q: '转岗后薪资会变化吗？', a: '转岗后薪资原则上保持平移。如果新岗位职级高于当前职级，将按公司调薪流程进行调整。' },
    { q: '如果转岗不成功，会影响现有工作吗？', a: '完全不会。所有申请记录严格保密，未成功的申请不会对您当前的工作和绩效评估产生任何影响。面试反馈将沉淀为您的成长记录。' },
    { q: '可以同时申请多个岗位吗？', a: '可以同时申请最多3个岗位。建议根据匹配度优先选择最合适的岗位，避免分散精力。' },
    { q: '转岗后的试用期是怎样的？', a: '转岗后有1-3个月的适应期，期间有导师带教和定期check-in。适应期不通过的情况极少，如有不适应可协商回原岗位。' },
  ],
  posts: [
    { id: 1, author: '匿名用户', content: '想了解从技术转产品有什么建议？有没有过来人分享下经验？', time: '2小时前', replies: 5, likes: 12 },
    { id: 2, author: '匿名用户', content: '活水政策真的很好，但担心申请被拒后尴尬。有人被拒过吗？', time: '5小时前', replies: 8, likes: 25 },
    { id: 3, author: '匿名用户', content: '建议大家多关注"猜你喜欢"的推荐，匹配度真的很准！', time: '昨天', replies: 3, likes: 18 },
    { id: 4, author: '匿名用户', content: '跨城市转岗的补贴政策有人了解吗？深圳转北京。', time: '2天前', replies: 6, likes: 9 },
  ],
};

// ==================== 部门流动数据（热力图） ====================
const SEED_DEPT_FLOW = {
  // 流入流出统计
  summary: DEPARTMENTS.map(dept => {
    const inflow = Math.floor(Math.random() * 8) + 1;
    const outflow = Math.floor(Math.random() * 6) + 1;
    return { dept, inflow, outflow, net: inflow - outflow };
  }),
  // 部门间流动矩阵
  matrix: [
    { from: '技术部', to: '产品部', count: 3 },
    { from: '设计部', to: '产品部', count: 2 },
    { from: '数据部', to: '技术部', count: 2 },
    { from: '市场部', to: '运营部', count: 2 },
    { from: '客服部', to: '运营部', count: 1 },
    { from: '财务部', to: '数据部', count: 1 },
    { from: '法务部', to: '人力资源部', count: 1 },
    { from: '人力资源部', to: '运营部', count: 1 },
    { from: '运营部', to: '市场部', count: 1 },
    { from: '技术部', to: '技术部', count: 2 },
  ],
};

// ==================== 活水政策 ====================
const MOBILITY_POLICY = {
  minTenure: 1, // 最低司龄（年）
  minPerformance: 'B', // 最低绩效
  confidentiality: '在您确认接受offer前，申请信息对当前直属上级严格保密',
  maxConcurrent: 3, // 最大同时申请数
  adaptationPeriod: '1-3个月', // 适应期
  salaryPolicy: '薪资原则上平移，职级提升按调薪流程处理',
  trialPassRate: 94, // 试用期通过率
  retentionRate: 89, // 一年留存率
};

// ==================== 管理驾驶舱指标 ====================
const SEED_METRICS = {
  internalApplyRate: 23.5, // 内部申请率
  mobilityPenetration: 18.2, // 活水渗透率
  avgTransferCycle: 28, // 平均转岗周期（天）
  trialPassRate: 94, // 转岗后试用期通过率
  retentionRate: 89, // 活水员工一年留存率
  totalMobility: 156, // 累计活水人次
  thisMonth: 22, // 本月申请数
  thisMonthMatched: 14, // 本月匹配成功
  trends: {
    months: ['1月', '2月', '3月', '4月', '5月', '6月'],
    applied: [12, 15, 18, 20, 25, 22],
    matched: [5, 7, 9, 11, 14, 14],
    completed: [3, 5, 6, 8, 10, 12],
  },
};

// ==================== 数据存储 ====================
const DB_KEY = 'tms_db_v2';
const DB_SHAPE_VERSION = 5;  // v5: 新增邀请记录 invitations

const Store = {
  _db: null,
  init() {
    const saved = localStorage.getItem(DB_KEY);
    let valid = false;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // 形状校验：版本号 + 关键字段都存在
        if (parsed && parsed.shapeVersion === DB_SHAPE_VERSION
            && Array.isArray(parsed.talents) && parsed.talents.length > 0
            && Array.isArray(parsed.positions) && parsed.positions.length > 0
            && Array.isArray(parsed.invitations)
            && parsed.talents[0].skills && parsed.talents[0].privacySettings !== undefined
            && parsed.positions[0].mobilityInfo !== undefined) {
          valid = true;
          this._db = parsed;
        }
      } catch (e) {
        valid = false;
      }
    }
    if (!valid) {
      // 旧数据/损坏数据/形状不匹配 → 重置为种子
      this._db = {
        shapeVersion: DB_SHAPE_VERSION,
        talents: JSON.parse(JSON.stringify(SEED_TALENTS)),
        positions: JSON.parse(JSON.stringify(SEED_POSITIONS)),
        applications: JSON.parse(JSON.stringify(SEED_APPLICATIONS)),
        growth: JSON.parse(JSON.stringify(SEED_GROWTH)),
        community: JSON.parse(JSON.stringify(SEED_COMMUNITY)),
        deptFlow: JSON.parse(JSON.stringify(SEED_DEPT_FLOW)),
        metrics: JSON.parse(JSON.stringify(SEED_METRICS)),
        nextTalentId: 16,
        nextPositionId: 13,
        nextAppId: 7,
        nextPostId: 5,
        invitations: [],
        nextInviteId: 1,
      };
      this._save();
    }
  },
  _save() { localStorage.setItem(DB_KEY, JSON.stringify(this._db)); },

  getTalents() { return [...this._db.talents]; },
  getTalent(id) { return this._db.talents.find(t => t.id === id); },
  addTalent(data) { const t = { ...data, id: this._db.nextTalentId++ }; this._db.talents.unshift(t); this._save(); return t; },
  updateTalent(id, data) { const i = this._db.talents.findIndex(t => t.id === id); if (i >= 0) { this._db.talents[i] = { ...this._db.talents[i], ...data, id: id }; this._save(); return this._db.talents[i]; } return null; },
  deleteTalent(id) { this._db.talents = this._db.talents.filter(t => t.id !== id); this._save(); },

  getPositions() { return [...this._db.positions]; },
  getPosition(id) { return this._db.positions.find(p => p.id === id); },
  addPosition(data) { const p = { ...data, id: this._db.nextPositionId++, postedDate: new Date().toISOString().slice(0, 10) }; this._db.positions.unshift(p); this._save(); return p; },
  updatePosition(id, data) { const i = this._db.positions.findIndex(p => p.id === id); if (i >= 0) { this._db.positions[i] = { ...this._db.positions[i], ...data, id: id }; this._save(); return this._db.positions[i]; } return null; },
  deletePosition(id) { this._db.positions = this._db.positions.filter(p => p.id !== id); this._save(); },

  getApplications() { return [...this._db.applications]; },
  getApplication(id) { return this._db.applications.find(a => a.id === id); },
  getApplicationsByTalent(talentId) { return this._db.applications.filter(a => a.talentId === talentId); },
  getApplicationsByPosition(positionId) { return this._db.applications.filter(a => a.positionId === positionId); },
  addApplication(data) { const a = { ...data, id: this._db.nextAppId++ }; this._db.applications.unshift(a); this._save(); return a; },
  updateApplication(id, data) { const i = this._db.applications.findIndex(a => a.id === id); if (i >= 0) { this._db.applications[i] = { ...this._db.applications[i], ...data, id: id }; this._save(); return this._db.applications[i]; } return null; },

  getGrowth() { return JSON.parse(JSON.stringify(this._db.growth)); },
  getCommunity() { return JSON.parse(JSON.stringify(this._db.community)); },
  addCommunityPost(content) { this._db.community.posts.unshift({ id: this._db.nextPostId++, author: '匿名用户', content, time: '刚刚', replies: 0, likes: 0 }); this._save(); },
  likePost(id) { const p = this._db.community.posts.find(p => p.id === id); if (p) { p.likes++; this._save(); } },

  getDeptFlow() { return JSON.parse(JSON.stringify(this._db.deptFlow)); },
  getMetrics() { return JSON.parse(JSON.stringify(this._db.metrics)); },

  getInvitations() { return JSON.parse(JSON.stringify(this._db.invitations || [])); },
  getInvitation(code) { return this._db.invitations?.find(i => i.code === code); },
  addInvitation(data) {
    const code = data.code || this._generateInviteCode();
    if (this._db.invitations.find(i => i.code === code)) return null;
    const invite = { ...data, id: this._db.nextInviteId++, code, usedCount: 0, createdAt: new Date().toISOString().slice(0, 10), status: 'active' };
    this._db.invitations.unshift(invite);
    this._save();
    return invite;
  },
  useInvitation(code, talentId) {
    const invite = this._db.invitations.find(i => i.code === code && i.status === 'active');
    if (!invite) return false;
    if (invite.maxUses && invite.usedCount >= invite.maxUses) { invite.status = 'expired'; this._save(); return false; }
    invite.usedCount++;
    invite.usedBy = invite.usedBy || [];
    invite.usedBy.push({ talentId, usedAt: new Date().toISOString().slice(0, 16).replace('T', ' ') });
    if (invite.maxUses && invite.usedCount >= invite.maxUses) invite.status = 'expired';
    this._save();
    return true;
  },
  revokeInvitation(id) {
    const invite = this._db.invitations.find(i => i.id === id);
    if (invite) { invite.status = 'revoked'; this._save(); return invite; }
    return null;
  },
  deleteInvitation(id) { this._db.invitations = this._db.invitations.filter(i => i.id !== id); this._save(); },
  _generateInviteCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
  },

  reset() { localStorage.removeItem(DB_KEY); this.init(); },
};

// ==================== 三维匹配引擎 ====================
/**
 * 硬性匹配：学历、司龄、必备技能是否达标
 * 潜力匹配：学习敏锐度、跨界经验
 * 文化匹配：团队协作风格适配度
 */
function calculateMatch(talent, position) {
  // ---- 硬性匹配 (40%) ----
  let hardScore = 0;
  const hardReasons = [];

  // 必备技能检查
  const requiredSkills = position.skills.filter(s => s.required);
  const talentSkillNames = talent.skills.map(s => s.name.toLowerCase());
  const matchedRequired = requiredSkills.filter(rs => talentSkillNames.includes(rs.name.toLowerCase()));
  const reqRatio = requiredSkills.length > 0 ? matchedRequired.length / requiredSkills.length : 1;
  hardScore += reqRatio * 25;
  if (matchedRequired.length === requiredSkills.length && requiredSkills.length > 0) {
    hardReasons.push('必备技能全部达标');
  } else if (matchedRequired.length > 0) {
    hardReasons.push(`必备技能 ${matchedRequired.length}/${requiredSkills.length} 达标`);
  }

  // 司龄
  if (talent.tenure >= MOBILITY_POLICY.minTenure) {
    hardScore += 8;
    hardReasons.push('司龄达标');
  }

  // 绩效门槛
  const perfOrder = { D: 0, C: 1, B: 2, A: 3 };
  const latestPerf = talent.performanceHistory[talent.performanceHistory.length - 1]?.rating || 'B';
  if ((perfOrder[latestPerf] || 2) >= (perfOrder[MOBILITY_POLICY.minPerformance] || 2)) {
    hardScore += 7;
    hardReasons.push('绩效达标');
  }

  // ---- 潜力匹配 (30%) ----
  let potentialScore = 0;
  const potentialReasons = [];

  // 学习敏锐度
  if (talent.learningAgility >= 85) {
    potentialScore += 15;
    potentialReasons.push('学习敏锐度优秀');
  } else if (talent.learningAgility >= 75) {
    potentialScore += 10;
    potentialReasons.push('学习敏锐度良好');
  } else {
    potentialScore += 5;
  }

  // 跨界经验
  let crossDomain = false;
  try {
    crossDomain = (talent.projects || []).some(p => {
      const pSkills = p && p.skills ? p.skills : [];
      return pSkills.some(s => {
        // 项目的技能不在当前部门名中（视为跨界），且与目标岗位技能匹配
        if (typeof s !== 'string') return false;
        if (talent.currentDept && talent.currentDept.includes(s)) return false;
        return position.skills.some(ps =>
          (ps.name || '').toLowerCase() === s.toLowerCase()
        );
      });
    });
  } catch (e) {
    crossDomain = false;
  }
  if (crossDomain) {
    potentialScore += 8;
    potentialReasons.push('有跨界项目经验');
  }

  // 技能重叠度（含非必备技能）
  const allPosSkills = position.skills.map(s => s.name.toLowerCase());
  const matchedAll = allPosSkills.filter(s => talentSkillNames.includes(s));
  const overlapRatio = allPosSkills.length > 0 ? matchedAll.length / allPosSkills.length : 0;
  potentialScore += overlapRatio * 7;
  if (overlapRatio >= 0.7) potentialReasons.push('技能高度重叠');

  // ---- 文化匹配 (30%) ----
  let cultureScore = 0;
  const cultureReasons = [];

  const cf = talent.cultureFit;
  cultureScore += (cf.collaboration / 100) * 10;
  cultureScore += (cf.innovation / 100) * 8;
  cultureScore += (cf.ownership / 100) * 7;
  cultureScore += (cf.adaptability / 100) * 5;

  if (cf.collaboration >= 85) cultureReasons.push('协作能力突出');
  if (cf.adaptability >= 85) cultureReasons.push('适应能力强');
  if (cf.innovation >= 85) cultureReasons.push('创新思维活跃');
  if (cf.ownership >= 85) cultureReasons.push('主人翁意识强');

  // ---- 汇总 ----
  // 修复：硬性/潜力/文化原始分都是各自维度满分（如 40/30/30），
  // 需要先归一化到 100 分制再按权重 0.4/0.3/0.3 加权
  const hardNorm = (hardScore / 40) * 100;      // 0-100
  const potentialNorm = (potentialScore / 30) * 100; // 0-100
  const cultureNorm = (cultureScore / 30) * 100;     // 0-100
  const hardWeight = 0.4, potentialWeight = 0.3, cultureWeight = 0.3;
  const totalScore = Math.round(
    hardNorm * hardWeight +
    potentialNorm * potentialWeight +
    cultureNorm * cultureWeight
  );
  const hardPct = Math.round(hardNorm);
  const potentialPct = Math.round(potentialNorm);
  const culturePct = Math.round(cultureNorm);

  const matchedSkills = position.skills
    .filter(ps => talentSkillNames.includes(ps.name.toLowerCase()))
    .map(ps => ps.name);
  const gapSkills = position.skills
    .filter(ps => !talentSkillNames.includes(ps.name.toLowerCase()))
    .map(ps => ps.name);

  return {
    score: Math.min(totalScore, 100),
    hardScore: hardPct, potentialScore: potentialPct, cultureScore: culturePct,
    reasons: [...hardReasons, ...potentialReasons, ...cultureReasons],
    matchedSkills, gapSkills,
  };
}

/** 批量匹配：为人才推荐最佳岗位 */
function recommendForTalent(talentId, topN = 5) {
  const talent = Store.getTalent(talentId);
  if (!talent) return [];
  const positions = Store.getPositions().filter(p => p.status === 'open');
  return positions.map(pos => ({ talent, position: pos, ...calculateMatch(talent, pos) }))
    .filter(m => m.score >= 30)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
}

/** 为岗位推荐最佳人才 */
function recommendForPosition(positionId, topN = 10) {
  const position = Store.getPosition(positionId);
  if (!position) return [];
  const talents = Store.getTalents().filter(t => t.status !== 'completed');
  return talents.map(t => ({ talent: t, position, ...calculateMatch(t, position) }))
    .filter(m => m.score >= 30)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
}

/** 生成全部匹配 */
function generateAllMatches() {
  const talents = Store.getTalents().filter(t => t.status === 'available' || t.status === 'matching');
  const positions = Store.getPositions().filter(p => p.status === 'open');
  const matches = [];
  talents.forEach(t => {
    positions.forEach(p => {
      const result = calculateMatch(t, p);
      if (result.score >= 40) matches.push({ talent: t, position: p, ...result });
    });
  });
  return matches.sort((a, b) => b.score - a.score);
}
