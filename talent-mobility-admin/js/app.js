/**
 * 人才内部活水匹配平台 — 核心应用
 * 职责：登录/角色选择/路由/侧边栏/顶栏/弹窗/Toast/通知/图标库
 */
const App = {
  currentRole: null,
  currentRoute: null,
  charts: {},
  notifications: [],
  // 当前员工身份（员工端用，模拟登录员工）
  currentTalentId: 1,

  // ==================== 路由表 ====================
  routes: {
    // 员工端
    'emp-home':         { title: '智能推荐', render: () => Employee.home(), role: 'employee', group: '人才发现' },
    'emp-plaza':        { title: '机会广场', render: () => Employee.plaza(), role: 'employee', group: '人才发现' },
    'emp-profile':      { title: '我的档案', render: () => Employee.profile(), role: 'employee', group: '个人中心' },
    'emp-applications': { title: '申请中心', render: () => Employee.applications(), role: 'employee', group: '个人中心' },
    'emp-growth':       { title: '成长赋能', render: () => Admin.growth(), role: 'employee', group: '个人中心' },
    'emp-community':    { title: '活水社区', render: () => Admin.community(), role: 'employee', group: '个人中心' },
    'emp-invite':       { title: '邀请好友', render: () => Employee.invite(), role: 'employee', group: '个人中心' },
    // 管理端
    'mgr-publish':      { title: '岗位发布', render: () => Manager.publish(), role: 'manager', group: '需求管理' },
    'mgr-talent':       { title: '人才雷达', render: () => Manager.talentPool(), role: 'manager', group: '人才选拔' },
    'mgr-candidates':   { title: '候选人管理', render: () => Manager.candidates(), role: 'manager', group: '人才选拔' },
    'mgr-applications': { title: '申请总览', render: () => Manager.applicationsList(), role: 'manager', group: '人才选拔' },
    // 驾驶舱
    'admin-dashboard':  { title: '健康驾驶舱', render: () => Admin.dashboard(), role: 'admin', group: '数据洞察' },
    'admin-heatmap':    { title: '流动热力图', render: () => Admin.heatmap(), role: 'admin', group: '数据洞察' },
    'admin-skills':     { title: 'Skills 引擎', render: () => Admin.skillsEngine(), role: 'admin', group: '智能引擎' },
    'admin-ranking':    { title: '竞争力排行榜', render: () => Admin.ranking(), role: 'admin', group: '智能引擎' },
    'admin-rules':      { title: '规则配置', render: () => Admin.rules(), role: 'admin', group: '运营管理' },
    'admin-ops':        { title: '运营促活', render: () => Admin.operations(), role: 'admin', group: '运营管理' },
    'admin-community':  { title: '活水社区', render: () => Admin.community(), role: 'admin', group: '运营管理' },
    'admin-invite':     { title: '邀请管理', render: () => Admin.inviteMgmt(), role: 'admin', group: '运营管理' },
  },

  // ==================== 侧边栏配置 ====================
  sidebarConfig: {
    employee: [
      { group: '人才发现', items: [
        { route: 'emp-home', label: '智能推荐', icon: 'home' },
        { route: 'emp-plaza', label: '机会广场', icon: 'plaza' },
      ]},
      { group: '个人中心', items: [
        { route: 'emp-profile', label: '我的档案', icon: 'profile' },
        { route: 'emp-applications', label: '申请中心', icon: 'apply', badge: true },
        { route: 'emp-growth', label: '成长赋能', icon: 'growth' },
        { route: 'emp-community', label: '活水社区', icon: 'community' },
        { route: 'emp-invite', label: '邀请好友', icon: 'invite' },
      ]},
    ],
    manager: [
      { group: '需求管理', items: [
        { route: 'mgr-publish', label: '岗位发布', icon: 'briefcase' },
      ]},
      { group: '人才选拔', items: [
        { route: 'mgr-talent', label: '人才雷达', icon: 'radar' },
        { route: 'mgr-candidates', label: '候选人管理', icon: 'candidates' },
      ]},
    ],
    admin: [
      { group: '数据洞察', items: [
        { route: 'admin-dashboard', label: '健康驾驶舱', icon: 'dashboard' },
        { route: 'admin-heatmap', label: '流动热力图', icon: 'heatmap' },
      ]},
      { group: '智能引擎', items: [
        { route: 'admin-skills', label: 'Skills 引擎', icon: 'skills' },
        { route: 'admin-ranking', label: '竞争力排行榜', icon: 'ranking' },
      ]},
      { group: '运营管理', items: [
        { route: 'admin-rules', label: '规则配置', icon: 'rules' },
        { route: 'admin-ops', label: '运营促活', icon: 'ops' },
        { route: 'admin-community', label: '活水社区', icon: 'community' },
        { route: 'admin-invite', label: '邀请管理', icon: 'invite' },
      ]},
    ],
  },

  roleLabels: { employee: '员工端', manager: '业务管理端', admin: '管理驾驶舱' },
  roleUsers: {
    employee: { name: '陈思远', role: '技术部 · P6' },
    manager: { name: '李明远', role: '产品总监 · M2' },
    admin: { name: '系统管理员', role: 'HR运营中心' },
  },

  // ==================== 初始化 ====================
  init() {
    Store.init();
    this.initLogin();
    this.initRoleSelect();
    this.initSidebar();
    this.initTopbar();
    this.initModal();
    this.initNotifications();
    this.checkSession();
  },

  // ==================== 登录 ====================
  initLogin() {
    document.getElementById('loginForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const user = document.getElementById('loginUser').value.trim();
      const pass = document.getElementById('loginPass').value.trim();
      const errEl = document.getElementById('loginError');
      if (user === 'admin' && pass === 'admin123') {
        sessionStorage.setItem('tms_auth', '1');
        errEl.textContent = '';
        this.showRoleSelect();
      } else {
        errEl.textContent = '用户名或密码错误，请使用 admin / admin123';
        const card = document.querySelector('.login-card');
        card.style.animation = 'none';
        requestAnimationFrame(() => { card.style.animation = 'shake 0.4s ease'; });
      }
    });
  },

  checkSession() {
    if (sessionStorage.getItem('tms_auth') === '1') {
      if (sessionStorage.getItem('tms_role')) {
        this.enterApp(sessionStorage.getItem('tms_role'));
      } else {
        this.showRoleSelect();
      }
    }
  },

  // ==================== 数据重置 ====================
  resetData() {
    if (confirm('确定要重置所有数据为初始状态吗？此操作不可撤销。')) {
      localStorage.removeItem(DB_KEY);
      location.reload();
    }
  },

  // ==================== 角色选择 ====================
  initRoleSelect() {
    document.querySelectorAll('.role-card').forEach(card => {
      card.addEventListener('click', () => {
        this.enterApp(card.dataset.role);
      });
    });
  },

  showRoleSelect() {
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('app').classList.add('hidden');
    document.getElementById('roleSelectPage').classList.remove('hidden');
  },

  enterApp(role) {
    this.currentRole = role;
    sessionStorage.setItem('tms_role', role);
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('roleSelectPage').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
    this.renderSidebar();
    // 默认进入第一个路由
    const firstRoute = this.sidebarConfig[role][0].items[0].route;
    this.navigate(firstRoute);
    this.loadNotifications();
  },

  switchRole() {
    sessionStorage.removeItem('tms_role');
    this.currentRole = null;
    document.getElementById('app').classList.add('hidden');
    document.getElementById('roleSelectPage').classList.remove('hidden');
  },

  // ==================== 侧边栏 ====================
  initSidebar() {
    document.getElementById('menuBtn').addEventListener('click', () => {
      document.getElementById('sidebar').classList.add('show');
      document.getElementById('sidebarOverlay').classList.add('show');
    });
    document.getElementById('sidebarOverlay').addEventListener('click', () => {
      document.getElementById('sidebar').classList.remove('show');
      document.getElementById('sidebarOverlay').classList.remove('show');
    });
  },

  renderSidebar() {
    const sidebar = document.getElementById('sidebar');
    const config = this.sidebarConfig[this.currentRole];
    const userInfo = this.roleUsers[this.currentRole];

    let html = `
      <div class="sidebar-header">
        <div class="sidebar-logo">
          ${this.icon('logo')}
          <span>活水匹配</span>
        </div>
      </div>
      <nav class="sidebar-nav">
    `;

    config.forEach(section => {
      html += `<div class="nav-section-label">${section.group}</div>`;
      section.items.forEach(item => {
        const badge = item.badge && this.getActiveAppCount() > 0
          ? `<span class="nav-badge">${this.getActiveAppCount()}</span>` : '';
        html += `
          <a href="#" class="nav-item" data-route="${item.route}">
            ${this.icon(item.icon)}
            <span>${item.label}</span>
            ${badge}
          </a>
        `;
      });
    });

    html += `</nav>
      <div class="sidebar-footer">
        <div class="user-info">
          <div class="user-avatar">${userInfo.name.charAt(0)}</div>
          <div class="user-detail">
            <span class="user-name">${userInfo.name}</span>
            <span class="user-role">${userInfo.role}</span>
          </div>
        </div>
        <button class="btn btn-ghost btn-sm" id="btnSwitchRole">切换角色</button>
      </div>
    `;

    sidebar.innerHTML = html;

    // 绑定导航
    sidebar.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        this.navigate(item.dataset.route);
        document.getElementById('sidebar').classList.remove('show');
        document.getElementById('sidebarOverlay').classList.remove('show');
      });
    });

    document.getElementById('btnSwitchRole').addEventListener('click', () => this.switchRole());
  },

  getActiveAppCount() {
    const apps = Store.getApplicationsByTalent(this.currentTalentId);
    return apps.filter(a => a.status === 'screening' || a.status === 'interviewing' || a.status === 'offer').length;
  },

  // ==================== 路由 ====================
  navigate(route) {
    if (!this.routes[route]) return;
    this.currentRoute = route;
    const r = this.routes[route];

    // 更新标题
    document.getElementById('topbarTitle').textContent = r.title;

    // 更新侧边栏激活态
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const activeNav = document.querySelector(`.nav-item[data-route="${route}"]`);
    if (activeNav) activeNav.classList.add('active');

    // 销毁旧图表
    Object.values(this.charts).forEach(c => { try { c.destroy(); } catch(e) {} });
    this.charts = {};

    // 渲染视图
    const container = document.getElementById('viewContainer');
    container.innerHTML = '';
    container.scrollTop = 0;
    r.render();

    // 更新通知角标
    this.updateNotifBadge();
  },

  // ==================== 顶栏 ====================
  initTopbar() {
    document.getElementById('globalSearch').addEventListener('input', (e) => {
      const val = e.target.value.trim().toLowerCase();
      if (val.length < 2) return;
      const talents = Store.getTalents().filter(t => t.name.toLowerCase().includes(val) || t.empId.toLowerCase().includes(val));
      const positions = Store.getPositions().filter(p => p.title.toLowerCase().includes(val) || p.dept.toLowerCase().includes(val));
      if (talents.length > 0 && this.currentRole !== 'employee') {
        const route = this.currentRole === 'manager' ? 'mgr-talent' : 'admin-dashboard';
        this.navigate(route);
      } else if (positions.length > 0) {
        const route = this.currentRole === 'employee' ? 'emp-plaza' : 'mgr-publish';
        this.navigate(route);
      }
    });
  },

  // ==================== 弹窗 ====================
  initModal() {
    document.getElementById('modalClose').addEventListener('click', () => this.closeModal());
    document.getElementById('modalOverlay').addEventListener('click', (e) => {
      if (e.target.id === 'modalOverlay') this.closeModal();
    });
  },

  openModal(title, bodyHtml, size = '') {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = bodyHtml;
    const box = document.getElementById('modalBox');
    box.className = 'modal' + (size ? ' modal-' + size : '');
    document.getElementById('modalOverlay').classList.add('show');
    document.body.style.overflow = 'hidden';
  },

  closeModal() {
    document.getElementById('modalOverlay').classList.remove('show');
    document.body.style.overflow = '';
  },

  // ==================== Toast ====================
  toast(msg, type = 'info') {
    const container = document.getElementById('toastContainer');
    const icons = { success: '✓', error: '✕', warning: '!', info: 'i' };
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `<span class="toast-icon">${icons[type] || icons.info}</span><span>${msg}</span>`;
    container.appendChild(el);
    setTimeout(() => { el.classList.add('fade-out'); setTimeout(() => el.remove(), 300); }, 2800);
  },

  // ==================== 确认弹窗 ====================
  confirm(title, message, onOk, okText = '确认') {
    const body = `
      <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:8px;">${message}</p>
      <div class="modal-footer" style="border:none;padding:0;margin-top:20px;">
        <button type="button" class="btn btn-ghost" id="confirmCancelBtn">取消</button>
        <button type="button" class="btn btn-danger" id="confirmOkBtn">${okText}</button>
      </div>
    `;
    this.openModal(title, body, 'sm');
    document.getElementById('confirmOkBtn').addEventListener('click', () => { this.closeModal(); onOk(); });
    document.getElementById('confirmCancelBtn').addEventListener('click', () => this.closeModal());
  },

  // ==================== 通知 ====================
  initNotifications() {
    document.getElementById('btnNotifications').addEventListener('click', () => {
      document.getElementById('notifDrawer').classList.add('show');
      document.getElementById('notifOverlay').classList.add('show');
    });
    document.getElementById('notifClose').addEventListener('click', () => this.closeNotif());
    document.getElementById('notifOverlay').addEventListener('click', () => this.closeNotif());
  },

  closeNotif() {
    document.getElementById('notifDrawer').classList.remove('show');
    document.getElementById('notifOverlay').classList.remove('show');
  },

  loadNotifications() {
    // 收集当前用户相关的通知
    this.notifications = [];
    if (this.currentRole === 'employee') {
      const apps = Store.getApplicationsByTalent(this.currentTalentId);
      apps.forEach(app => {
        (app.notifications || []).forEach(n => {
          this.notifications.push({ ...n, appName: Store.getPosition(app.positionId)?.title });
        });
      });
    } else if (this.currentRole === 'manager') {
      // 模拟管理端通知
      this.notifications = [
        { type: 'info', message: '赵雨桐 申请了 算法工程师 岗位', time: '2小时前' },
        { type: 'success', message: '罗梦瑶 的面试评价已提交', time: '5小时前' },
        { type: 'info', message: '系统推荐了 3 位高匹配候选人', time: '昨天' },
      ];
    } else {
      this.notifications = [
        { type: 'success', message: '本月活水匹配率提升至 63.6%', time: '今天 09:00' },
        { type: 'info', message: '技术部人才流出预警，建议关注', time: '昨天' },
        { type: 'warning', message: '2个岗位发布审批待处理', time: '昨天' },
      ];
    }
    this.renderNotifications();
    this.updateNotifBadge();
  },

  renderNotifications() {
    const body = document.getElementById('notifBody');
    if (this.notifications.length === 0) {
      body.innerHTML = '<div class="empty-state"><p>暂无通知</p></div>';
      return;
    }
    body.innerHTML = this.notifications.map(n => {
      const iconMap = { success: '✓', info: 'i', warning: '!' };
      return `
        <div class="notif-item">
          <div class="notif-icon ${n.type}">${iconMap[n.type] || 'i'}</div>
          <div class="notif-content">
            <div class="notif-text">${n.message}</div>
            <div class="notif-time">${n.time}</div>
          </div>
        </div>
      `;
    }).join('');
  },

  updateNotifBadge() {
    const badge = document.getElementById('notifBadge');
    if (this.notifications.length > 0) badge?.classList.remove('hidden');
    else badge?.classList.add('hidden');
  },

  // ==================== 辅助方法 ====================
  scoreColor(score) {
    if (score >= 80) return '#4CAF7C';
    if (score >= 60) return '#E8A838';
    return '#6BAED6';
  },

  formatDate(dateStr) {
    if (!dateStr) return '—';
    return dateStr;
  },

  // ==================== 图标库 ====================
  icon(name) {
    const icons = {
      logo: '<svg viewBox="0 0 48 48" width="32" height="32" fill="none"><rect x="4" y="4" width="40" height="40" rx="12" fill="#A8C4D4" opacity="0.2"/><path d="M24 10c-4 0-7 3-7 7v3h-2v16h18V20h-2v-3c0-4-3-7-7-7zm0 3c2.2 0 4 1.8 4 4v3h-8v-3c0-2.2 1.8-4 4-4zm0 13c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z" fill="#5B8FA8"/></svg>',
      home: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
      plaza: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
      profile: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
      apply: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
      growth: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>',
      community: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
      briefcase: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',
      radar: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
      candidates: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg>',
      dashboard: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>',
      heatmap: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="6" height="6"/><rect x="15" y="3" width="6" height="6"/><rect x="9" y="9" width="6" height="6"/><rect x="3" y="15" width="6" height="6"/><rect x="15" y="15" width="6" height="6"/></svg>',
      rules: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M9 15l2 2 4-4"/></svg>',
      ops: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 11l18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>',
      people: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
      link: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
      trend: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>',
      pin: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
      users: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>',
      edit: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
      delete: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
      back: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>',
      arrow: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
      empty: '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',
      shield: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
      coffee: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>',
      book: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
      star: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
      check: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>',
      clock: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
      award: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>',
      send: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',
      invite: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="8" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="16" y1="11" x2="22" y2="11"/></svg>',
      heart: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
      chat: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
      refresh: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-9-9c2.5 0 4.8 1 6.5 2.6L21 8"/><path d="M21 3v5h-5"/></svg>',
      plus: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
      lock: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
      skills: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>',
      ranking: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>',
    };
    return icons[name] || '';
  },
};

// 启动
document.addEventListener('DOMContentLoaded', () => App.init());
