/**
 * 业务管理端 — 需求发布与人才选拔
 */
const Manager = {
  positionSkills: [],

  // ==================== 岗位发布工作台 ====================
  publish() {
    const positions = Store.getPositions();
    const c = document.getElementById('viewContainer');
    c.innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <h2>内部岗位发布工作台</h2>
          <span class="page-subtitle">发布和管理内部活水岗位</span>
        </div>
        <div style="display:flex;gap:10px">
          <button class="btn btn-ghost" onclick="Manager.importExternalJD()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            从外部JD导入
          </button>
          <button class="btn btn-primary" onclick="Manager.openPositionForm()">
            ${App.icon('plus')} 新增岗位
          </button>
        </div>
      </div>

      <!-- 审批状态概览（可点击跳转） -->
      <div class="stat-cards" style="margin-bottom:20px">
        <div class="stat-card stat-card-clickable" style="--card-accent:#4CAF7C;--card-icon-bg:#E8F6EE"
             onclick="Manager.openPositionsByStatus('open')"
             title="点击查看所有在招岗位">
          <div class="stat-card-icon" style="color:#4CAF7C">${App.icon('briefcase')}</div>
          <div class="stat-card-label">在招岗位</div>
          <div class="stat-card-value">${positions.filter(p => p.status === 'open').length}</div>
          <div class="stat-card-arrow">查看岗位列表 →</div>
        </div>
        <div class="stat-card stat-card-clickable" style="--card-accent:#E8A838;--card-icon-bg:#FDF3E2"
             onclick="Manager.openApplicationsList('all')"
             title="点击查看全部收到的申请">
          <div class="stat-card-icon" style="color:#E8A838">${App.icon('people')}</div>
          <div class="stat-card-label">收到申请</div>
          <div class="stat-card-value">${Store.getApplications().length}</div>
          <div class="stat-card-arrow">查看申请总览 →</div>
        </div>
        <div class="stat-card stat-card-clickable" style="--card-accent:#5B8FA8;--card-icon-bg:#EDF4F8"
             onclick="Manager.openApplicationsList('interviewing')"
             title="点击查看待处理面试">
          <div class="stat-card-icon" style="color:#5B8FA8">${App.icon('link')}</div>
          <div class="stat-card-label">待处理面试</div>
          <div class="stat-card-value">${Store.getApplications().filter(a => a.status === 'interviewing').length}</div>
          <div class="stat-card-arrow">查看待面试 →</div>
        </div>
      </div>

      <div class="filter-bar">
        <div class="filter-item">
          <input type="text" id="pubSearch" placeholder="搜索岗位名称...">
        </div>
        <select id="pubDept" class="filter-select"><option value="">全部部门</option></select>
        <select id="pubStatus" class="filter-select">
          <option value="">全部状态</option>
          <option value="open">招聘中</option>
          <option value="closed">已关闭</option>
        </select>
      </div>

      <div class="position-grid" id="pubGrid"></div>
    `;

    DEPARTMENTS.forEach(d => document.getElementById('pubDept').add(new Option(d, d)));
    ['pubSearch', 'pubDept', 'pubStatus'].forEach(id => {
      document.getElementById(id).addEventListener('input', () => this.renderPublishGrid());
      document.getElementById(id).addEventListener('change', () => this.renderPublishGrid());
    });
    this.renderPublishGrid();
  },

  renderPublishGrid() {
    let list = Store.getPositions();
    const search = document.getElementById('pubSearch')?.value.trim().toLowerCase();
    const dept = document.getElementById('pubDept')?.value;
    const status = document.getElementById('pubStatus')?.value;
    if (search) list = list.filter(p => p.title.toLowerCase().includes(search));
    if (dept) list = list.filter(p => p.dept === dept);
    if (status) list = list.filter(p => p.status === status);

    const grid = document.getElementById('pubGrid');
    if (list.length === 0) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">${App.icon('empty')}<p>暂无岗位</p></div>`;
      return;
    }
    grid.innerHTML = list.map(p => {
      const apps = Store.getApplicationsByPosition(p.id);
      const status = STATUS_MAP[p.status] || STATUS_MAP.open;
      return `
        <div class="opportunity-card" style="cursor:default">
          <div class="opportunity-card-top">
            <div>
              <div class="opportunity-card-title">${p.title}</div>
              <span class="opportunity-card-dept">${p.dept} · ${p.level}</span>
            </div>
            <span class="status-badge ${status.class}">${status.label}</span>
          </div>
          <div class="opportunity-card-meta">
            <span>${App.icon('pin')} ${p.location}</span>
            <span>${App.icon('users')} ${p.headcount}人</span>
            <span>${App.icon('people')} ${apps.length}申请</span>
          </div>
          <div class="opportunity-card-skills">${p.skills.map(s => `<span class="tag ${s.required ? 'tag-warning' : ''}">${s.name}</span>`).join('')}</div>
          <div style="font-size:0.78rem;color:var(--text-muted);margin-bottom:12px">${p.postedDate} 发布 · 负责人 ${p.postedBy}</div>
          <div class="opportunity-card-match">
            <div style="font-size:0.78rem;color:var(--text-muted)">
              ${p.approved ? '<span class="tag tag-success">已审批</span>' : '<span class="tag tag-warning">待审批</span>'}
              ${p.visibility === 'all' ? '<span class="tag">全公司可见</span>' : '<span class="tag tag-info">定向可见</span>'}
            </div>
            <div class="action-btns">
              <button class="action-btn" onclick="Manager.viewCandidates(${p.id})" title="候选人">${App.icon('candidates')}</button>
              <button class="action-btn" onclick="Manager.openPositionForm(${p.id})" title="编辑">${App.icon('edit')}</button>
              <button class="action-btn delete" onclick="Manager.deletePosition(${p.id})" title="删除">${App.icon('delete')}</button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  importExternalJD() {
    App.openModal('从外部JD导入', `
      <div class="form-group">
        <label>粘贴外部JD内容</label>
        <textarea id="extJD" rows="8" placeholder="粘贴外部招聘JD，系统将自动解析并转换为内部岗位..." style="font-family:inherit"></textarea>
      </div>
      <div class="form-group">
        <label>内部活水专属描述</label>
        <textarea id="extMobility" rows="3" placeholder="补充团队氛围、紧急招聘原因等内部信息..."></textarea>
      </div>
      <div class="modal-footer" style="border:none;padding:0">
        <button class="btn btn-ghost" onclick="App.closeModal()">取消</button>
        <button class="btn btn-primary" onclick="App.closeModal();App.toast('JD已导入，请完善岗位信息','success');Manager.openPositionForm()">解析并创建</button>
      </div>
    `, 'lg');
  },

  openPositionForm(id) {
    this.positionSkills = [];
    const isEdit = !!id;
    const p = isEdit ? Store.getPosition(id) : null;

    App.openModal(isEdit ? '编辑岗位' : '新增岗位', `
      <form id="posForm" onsubmit="event.preventDefault();Manager.savePosition(${id || 'null'})">
        <div class="form-row">
          <div class="form-group">
            <label>岗位名称 <span class="req">*</span></label>
            <input type="text" id="posTitle" required value="${p?.title || ''}" placeholder="如 高级产品经理">
          </div>
          <div class="form-group">
            <label>所属部门 <span class="req">*</span></label>
            <select id="posDept" required>${DEPARTMENTS.map(d => `<option value="${d}" ${p?.dept === d ? 'selected' : ''}>${d}</option>`).join('')}</select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>职级</label>
            <select id="posLevel">${LEVELS.map(l => `<option value="${l}" ${p?.level === l ? 'selected' : ''}>${l}</option>`).join('')}</select>
          </div>
          <div class="form-group">
            <label>职位序列</label>
            <select id="posSeq">${SEQUENCES.map(s => `<option value="${s}" ${p?.sequence === s ? 'selected' : ''}>${s}</option>`).join('')}</select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>招聘人数</label>
            <input type="number" id="posHeadcount" min="1" value="${p?.headcount || 1}">
          </div>
          <div class="form-group">
            <label>工作地点</label>
            <select id="posLocation">${CITIES.map(c => `<option value="${c}" ${p?.location === c ? 'selected' : ''}>${c}</option>`).join('')}</select>
          </div>
        </div>
        <div class="form-group">
          <label>技能要求 <span class="req">*</span></label>
          <div class="tag-input-wrap" id="posSkillWrap">
            <div id="posSkillTags"></div>
            <input type="text" id="posSkillInput" placeholder="输入技能后回车添加">
          </div>
        </div>
        <div class="form-group">
          <label>岗位描述</label>
          <textarea id="posDesc" rows="3" placeholder="岗位职责描述...">${p?.desc || ''}</textarea>
        </div>

        <div style="background:var(--primary-lighter);border-radius:var(--radius-md);padding:16px;margin-bottom:16px">
          <div style="font-weight:600;font-size:0.85rem;margin-bottom:12px;color:var(--primary-darker)">🌊 活水专属信息</div>
          <div class="form-group">
            <label>团队氛围</label>
            <textarea id="posTeamVibe" rows="2" placeholder="描述团队工作氛围...">${p?.mobilityInfo?.teamVibe || ''}</textarea>
          </div>
          <div class="form-group">
            <label>紧急招聘原因</label>
            <input type="text" id="posUrgency" value="${p?.mobilityInfo?.urgencyReason || ''}" placeholder="如 业务扩张需补充人力">
          </div>
          <div class="form-group">
            <label>原岗位人员去向</label>
            <input type="text" id="posPredecessor" value="${p?.mobilityInfo?.predecessorDestination || ''}" placeholder="如 原岗位人员已晋升">
          </div>
          <div class="form-group">
            <label>入职前3个月关键目标</label>
            <textarea id="posFirst3" rows="3" placeholder="1. ...&#10;2. ...&#10;3. ...">${p?.mobilityInfo?.firstThreeMonths || ''}</textarea>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>匹配范围</label>
            <select id="posVisibility">
              <option value="all" ${p?.visibility === 'all' || !p ? 'selected' : ''}>全公司可见</option>
              <option value="specific" ${p?.visibility === 'specific' ? 'selected' : ''}>定向人群可见</option>
            </select>
          </div>
          <div class="form-group">
            <label>状态</label>
            <select id="posStatus">
              <option value="open" ${p?.status === 'open' || !p ? 'selected' : ''}>招聘中</option>
              <option value="closed" ${p?.status === 'closed' ? 'selected' : ''}>已关闭</option>
            </select>
          </div>
        </div>

        <div class="modal-footer" style="border:none;padding:0">
          <button type="button" class="btn btn-ghost" onclick="App.closeModal()">取消</button>
          <button type="submit" class="btn btn-primary">${p ? '保存' : '发布（需审批）'}</button>
        </div>
      </form>
    `, 'lg');

    // 技能标签输入
    if (p) this.positionSkills = p.skills.map(s => ({ name: s.name, required: s.required, level: s.level }));
    this.renderPosSkills();
    const input = document.getElementById('posSkillInput');
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && input.value.trim()) {
        e.preventDefault();
        this.positionSkills.push({ name: input.value.trim(), required: false, level: 'intermediate' });
        input.value = '';
        this.renderPosSkills();
      }
    });
  },

  renderPosSkills() {
    const container = document.getElementById('posSkillTags');
    if (!container) return;
    container.innerHTML = this.positionSkills.map((s, i) => `
      <span class="tag-chip" style="${s.required ? 'background:var(--warning-light);color:var(--warning)' : ''}">
        ${s.name}${s.required ? '*' : ''}
        <button type="button" onclick="Manager.positionSkills.splice(${i},1);Manager.renderPosSkills()">×</button>
      </span>
    `).join('');
  },

  savePosition(id) {
    const data = {
      title: document.getElementById('posTitle').value.trim(),
      dept: document.getElementById('posDept').value,
      level: document.getElementById('posLevel').value,
      sequence: document.getElementById('posSeq').value,
      headcount: parseInt(document.getElementById('posHeadcount').value) || 1,
      location: document.getElementById('posLocation').value,
      skills: this.positionSkills.length > 0 ? this.positionSkills : [{ name: '通用能力', required: true, level: 'intermediate' }],
      desc: document.getElementById('posDesc').value.trim(),
      mobilityInfo: {
        teamVibe: document.getElementById('posTeamVibe').value.trim() || '团队氛围良好',
        urgencyReason: document.getElementById('posUrgency').value.trim() || '常规招聘',
        predecessorDestination: document.getElementById('posPredecessor').value.trim() || '团队扩张岗位',
        firstThreeMonths: document.getElementById('posFirst3').value.trim() || '1. 熟悉业务和团队\n2. 独立负责工作模块',
      },
      managerIntro: { name: App.roleUsers.manager.name, title: App.roleUsers.manager.role, bioText: '欢迎对岗位感兴趣的同学来聊聊', coffeeChatAvailable: true },
      visibility: document.getElementById('posVisibility').value,
      status: document.getElementById('posStatus').value,
      postedBy: App.roleUsers.manager.name + ' (' + App.roleUsers.manager.role + ')',
      approved: true,
    };

    if (data.skills.length === 0) { App.toast('请至少添加一个技能要求', 'warning'); return; }

    if (id) {
      Store.updatePosition(id, data);
      App.toast('岗位已更新', 'success');
    } else {
      Store.addPosition(data);
      App.toast('岗位已发布', 'success');
    }
    App.closeModal();
    this.renderPublishGrid();
  },

  deletePosition(id) {
    const p = Store.getPosition(id);
    App.confirm(`删除岗位「${p.title}」？`, '删除后不可恢复', () => {
      Store.deletePosition(id);
      App.toast('已删除', 'success');
      this.renderPublishGrid();
    });
  },

  viewCandidates(positionId) {
    App.navigate('mgr-candidates');
    setTimeout(() => this.selectPositionInCandidates(positionId), 100);
  },

  // ==================== 人才雷达 ====================
  talentPool() {
    const c = document.getElementById('viewContainer');
    c.innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <h2>智能人才库</h2>
          <span class="page-subtitle">全公司人才搜索引擎 + AI雷达举荐</span>
        </div>
      </div>

      <!-- 搜索引擎 -->
      <div class="card section-gap">
        <div class="card-header"><h3>🔍 人才搜索</h3></div>
        <div class="filter-bar">
          <div class="filter-item">
            <input type="text" id="talentSearch" placeholder="按技能标签 / 姓名 / 部门搜索...">
          </div>
          <select id="talentDept" class="filter-select"><option value="">全部部门</option></select>
          <select id="talentLevel" class="filter-select"><option value="">全部职级</option></select>
          <select id="talentPerf" class="filter-select">
            <option value="">全部绩效</option>
            <option value="A">A级及以上</option>
            <option value="B">B级及以上</option>
          </select>
          <select id="talentStatus" class="filter-select">
            <option value="">全部状态</option>
            <option value="available">可流动</option>
            <option value="matching">匹配中</option>
          </select>
          <button class="btn btn-primary" onclick="Manager.searchTalents()">搜索</button>
        </div>
      </div>

      <!-- 雷达推荐 -->
      <div class="card section-gap">
        <div class="card-header">
          <h3>📡 AI雷达举荐</h3>
          <span class="chart-badge">高匹配但未主动申请的人才</span>
        </div>
        <div id="radarList"></div>
      </div>

      <!-- 搜索结果 -->
      <div class="card">
        <div class="card-header"><h3>搜索结果</h3></div>
        <div id="talentResults"></div>
      </div>
    `;

    DEPARTMENTS.forEach(d => document.getElementById('talentDept').add(new Option(d, d)));
    LEVELS.forEach(l => document.getElementById('talentLevel').add(new Option(l, l)));
    document.getElementById('talentSearch').addEventListener('keydown', (e) => { if (e.key === 'Enter') this.searchTalents(); });

    this.renderRadar();
    this.searchTalents();
  },

  renderRadar() {
    const positions = Store.getPositions().filter(p => p.status === 'open');
    const talents = Store.getTalents().filter(t => t.status === 'available' || t.status === 'matching');
    // 全量打分：open 岗位 × 可流动人才（排除已主动申请的）
    const all = [];
    positions.forEach(p => {
      talents.forEach(t => {
        const appExists = Store.getApplicationsByTalent(t.id).some(a => a.positionId === p.id);
        if (!appExists) {
          const m = calculateMatch(t, p);
          all.push({ talent: t, position: p, ...m });
        }
      });
    });
    all.sort((a, b) => b.score - a.score);

    // 阈值 70 分筛选 + 按 (talent, position) 去重（一个员工只露最佳岗位）
    const seen = new Set();
    const radar = [];
    for (const r of all) {
      if (r.score < 70) break;
      const key = `${r.talent.id}-${r.position.id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      radar.push(r);
    }

    // 诊断日志
    const buckets = { '>=80': 0, '70-79': 0, '60-69': 0, '50-59': 0, '<50': 0 };
    all.forEach(x => {
      if (x.score >= 80) buckets['>=80']++;
      else if (x.score >= 70) buckets['70-79']++;
      else if (x.score >= 60) buckets['60-69']++;
      else if (x.score >= 50) buckets['50-59']++;
      else buckets['<50']++;
    });
    console.log('[雷达诊断] open岗位:', positions.length, '| 人才:', talents.length, '| 总配对:', all.length, '| ≥70 去重后:', radar.length);
    console.log('[雷达诊断] 分数段:', buckets);

    // 暂存全部命中 + 初始化页码
    this._radarAll = radar;
    this._radarAllScores = all; // 用于空态展示
    this._radarPage = 1;
    this._radarPageSize = 3;
    this._renderRadarPage();
  },

  _renderRadarPage() {
    const list = document.getElementById('radarList');
    const all = this._radarAll || [];
    const allScores = this._radarAllScores || [];
    const page = this._radarPage || 1;
    const size = this._radarPageSize;
    const total = all.length;
    const totalPages = Math.max(1, Math.ceil(total / size));
    const start = (page - 1) * size;
    const pageItems = all.slice(start, start + size);

    if (total === 0) {
      // 空态：取分数最高的 3 条降级展示
      const top3 = allScores.slice(0, 3);
      list.innerHTML = `
        <div class="activity-empty" style="padding:20px 16px">
          <div style="font-size:1.05rem;margin-bottom:6px;color:var(--text-secondary)">📡 暂未发现 ≥70 分的高匹配组合</div>
          <div style="font-size:0.78rem;color:var(--text-muted);margin-bottom:14px">
            扫描了 ${allScores.length} 组配对，下方展示最高分降级案例
          </div>
          <div style="text-align:left;display:flex;flex-direction:column;gap:8px;max-width:560px;margin:0 auto">
            ${top3.map(x => `
              <div style="display:flex;align-items:center;gap:12px;padding:10px 14px;background:#fff;border:1px dashed var(--border);border-radius:var(--radius-sm);opacity:0.75">
                <div style="flex:1;font-size:0.85rem"><strong>${x.talent.name}</strong> → ${x.position.title}</div>
                <div style="font-weight:600;color:${App.scoreColor(x.score)};font-size:0.9rem">${x.score}%</div>
                <span style="font-size:0.7rem;color:var(--text-muted)">未达 70</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
      return;
    }

    // 渲染当前页
    list.innerHTML = `
      <div class="radar-list-wrap">
        ${pageItems.map(r => {
          const sc = App.scoreColor(r.score);
          return `
            <div class="activity-item" style="padding:12px;border-radius:var(--radius-md);border:1px solid var(--border-light);margin-bottom:8px">
              <div class="activity-avatar" style="background:var(--primary)">${r.talent.avatar}</div>
              <div class="activity-content">
                <div class="activity-text"><strong>${r.talent.name}</strong> · ${r.talent.currentDept} · ${r.talent.currentPosition} ${(() => { const m = MBTI_TYPES[r.talent.mbti]; return m ? `<span class="mbti-badge" style="background:${m.bg};color:${m.color};font-size:0.65rem;padding:1px 6px" title="${m.desc}">${r.talent.mbti}</span>` : ''; })()}</div>
                <div class="activity-time">推荐岗位：${r.position.title} · ${r.matchedSkills.length}项技能匹配 · ${r.reasons.slice(0,2).join('、')}</div>
              </div>
              <div class="activity-score" style="color:${sc};background:${sc}15">${r.score}%</div>
              <button class="btn btn-sm btn-primary" style="margin-left:8px" onclick="Manager.sendInvitation(${r.talent.id},'${r.position.title}')">${App.icon('send')} 邀约</button>
            </div>
          `;
        }).join('')}
        ${total > size ? `
          <div class="radar-pager">
            <button class="radar-pager-btn" ${page === 1 ? 'disabled' : ''} onclick="Manager._radarGoPage(${page - 1})">‹ 上一页</button>
            <span class="radar-pager-info">第 ${page} / ${totalPages} 页 · 共 ${total} 条推荐</span>
            <button class="radar-pager-btn" ${page === totalPages ? 'disabled' : ''} onclick="Manager._radarGoPage(${page + 1})">下一页 ›</button>
          </div>
        ` : ''}
      </div>
    `;
  },

  _radarGoPage(p) {
    const total = this._radarAll ? this._radarAll.length : 0;
    const totalPages = Math.max(1, Math.ceil(total / this._radarPageSize));
    if (p < 1 || p > totalPages) return;
    this._radarPage = p;
    this._renderRadarPage();
  },

  searchTalents() {
    const search = document.getElementById('talentSearch').value.trim().toLowerCase();
    const dept = document.getElementById('talentDept').value;
    const level = document.getElementById('talentLevel').value;
    const perf = document.getElementById('talentPerf').value;
    const status = document.getElementById('talentStatus').value;

    let list = Store.getTalents();
    if (search) list = list.filter(t => t.name.toLowerCase().includes(search) || t.currentDept.toLowerCase().includes(search) || t.skills.some(s => s.name.toLowerCase().includes(search)));
    if (dept) list = list.filter(t => t.currentDept === dept);
    if (level) list = list.filter(t => t.level === level);
    if (perf) {
      const order = { D: 0, C: 1, B: 2, A: 3 };
      list = list.filter(t => {
        const latest = t.performanceHistory[t.performanceHistory.length - 1]?.rating || 'B';
        return (order[latest] || 2) >= (order[perf] || 2);
      });
    }
    if (status) list = list.filter(t => t.status === status);

    const results = document.getElementById('talentResults');
    if (list.length === 0) {
      results.innerHTML = `<div class="empty-state">${App.icon('empty')}<p>未找到匹配的人才</p></div>`;
      return;
    }
    results.innerHTML = `
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr><th>姓名</th><th>部门/岗位</th><th>职级</th><th>人格</th><th>核心技能</th><th>绩效</th><th>司龄</th><th>状态</th><th>操作</th></tr>
          </thead>
          <tbody>
            ${list.map(t => {
              const latestPerf = t.performanceHistory[t.performanceHistory.length - 1]?.rating || '—';
              return `
                <tr>
                  <td><div class="cell-name"><div class="cell-avatar">${t.avatar}</div><span>${t.name}</span></div></td>
                  <td>${t.currentDept} · ${t.currentPosition}</td>
                  <td>${t.level}</td>
                  <td>${(() => { const m = MBTI_TYPES[t.mbti]; return m ? `<span class="mbti-badge" style="background:${m.bg};color:${m.color}" title="${m.desc}">${t.mbti}</span>` : '—'; })()}</td>
                  <td>${t.skills.slice(0, 3).map(s => `<span class="tag">${s.name}</span>`).join('')}</td>
                  <td><span class="tag tag-success">${latestPerf}</span></td>
                  <td>${t.tenure}年</td>
                  <td><span class="status-badge ${STATUS_MAP[t.status]?.class || ''}">${STATUS_MAP[t.status]?.label || '—'}</span></td>
                  <td>
                    <div class="action-btns">
                      <button class="action-btn" onclick="Manager.viewTalent(${t.id})" title="详情">${App.icon('profile')}</button>
                      <button class="action-btn" onclick="Manager.sendInvitation(${t.id})" title="发起邀约">${App.icon('send')}</button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
      <div class="pagination"><span class="page-info">共 ${list.length} 条</span></div>
    `;
  },

  viewTalent(talentId) {
    const t = Store.getTalent(talentId);
    const recs = recommendForTalent(talentId, 3);
    App.openModal(`${t.name} · 人才详情`, `
      <div class="profile-header" style="margin-bottom:16px;padding:20px">
        <div class="profile-avatar-lg" style="width:56px;height:56px;font-size:1.4rem">${t.avatar}</div>
        <div class="profile-info">
          <div style="font-weight:700;font-size:1.1rem">${t.name}</div>
          <div style="font-size:0.82rem;color:var(--text-secondary)">${t.currentDept} · ${t.currentPosition} · ${t.level}</div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;font-size:0.82rem">
        <div><span style="color:var(--text-muted)">司龄：</span>${t.tenure}年</div>
        <div><span style="color:var(--text-muted)">绩效：</span>${t.performanceHistory[t.performanceHistory.length-1]?.rating || '—'}</div>
        <div><span style="color:var(--text-muted)">学历：</span>${t.education.school} · ${t.education.major}</div>
        <div><span style="color:var(--text-muted)">学习敏锐度：</span>${t.learningAgility}</div>
        <div style="display:flex;align-items:center;gap:6px"><span style="color:var(--text-muted)">人格类型：</span>${(() => { const m = MBTI_TYPES[t.mbti]; return m ? `<span class="mbti-badge" style="background:${m.bg};color:${m.color}" title="${m.desc}">${t.mbti} · ${m.nickname}</span>` : '—'; })()}</div>
      </div>
      <div style="margin-bottom:16px">
        <div style="font-weight:600;font-size:0.85rem;margin-bottom:8px">能力标签</div>
        <div class="skill-cloud">${t.skills.map(s => `<span class="skill-cloud-item ${s.level}">${s.name}</span>`).join('')}</div>
      </div>
      <div style="margin-bottom:16px">
        <div style="font-weight:600;font-size:0.85rem;margin-bottom:8px">项目经历</div>
        ${t.projects.map(p => `<div style="padding:6px 0;border-bottom:1px solid var(--border-light);font-size:0.8rem"><strong>${p.name}</strong> · ${p.role} · ${p.period}<br><span style="color:var(--text-muted)">${p.desc}</span></div>`).join('')}
      </div>
      <div>
        <div style="font-weight:600;font-size:0.85rem;margin-bottom:8px">推荐岗位</div>
        ${recs.map(r => `<div style="display:flex;justify-content:space-between;padding:6px 0;font-size:0.82rem"><span>${r.position.title} · ${r.position.dept}</span><span style="color:${App.scoreColor(r.score)};font-weight:600">${r.score}%</span></div>`).join('')}
      </div>
      <div class="modal-footer" style="border:none;padding:0">
        <button class="btn btn-ghost" onclick="App.closeModal()">关闭</button>
        <button class="btn btn-primary" onclick="App.closeModal();Manager.sendInvitation(${t.id})">${App.icon('send')} 发起私密邀约</button>
      </div>
    `, 'lg');
  },

  sendInvitation(talentId, positionTitle) {
    const t = Store.getTalent(talentId);
    App.openModal('发起私密邀约', `
      <div style="padding:12px;background:var(--primary-lighter);border-radius:var(--radius-md);margin-bottom:16px;font-size:0.82rem;color:var(--text-secondary)">
        ${App.icon('lock')} 邀约消息对候选人当前主管严格保密
      </div>
      <div class="form-group">
        <label>收件人</label>
        <input type="text" value="${t.name} (${t.currentDept})" disabled>
      </div>
      <div class="form-group">
        <label>推荐岗位</label>
        <input type="text" id="invPosition" value="${positionTitle || ''}" placeholder="如 高级产品经理">
      </div>
      <div class="form-group">
        <label>邀约内容</label>
        <textarea id="invMessage" rows="4">你好 ${t.name}，我们正在寻找${positionTitle || '优秀人才'}，根据你的技能和经历，我们认为你非常匹配。期待和你聊聊，了解更多关于你的职业发展规划。</textarea>
      </div>
      <div class="modal-footer" style="border:none;padding:0">
        <button class="btn btn-ghost" onclick="App.closeModal()">取消</button>
        <button class="btn btn-primary" onclick="App.closeModal();App.toast('邀约已发送','success')">${App.icon('send')} 发送邀约</button>
      </div>
    `);
  },

  // ==================== 候选人管理 ====================
  _selectedPositionId: null,
  _appListFilter: 'all',  // 'all' | 'interviewing' | 'screening' | 'offer' | 'rejected' | 'transfer'

  // ==================== 卡片点击：查看在招岗位列表 ====================
  openPositionsByStatus(status) {
    // 跳到当前页（岗位发布），但自动设置状态筛选器
    App.navigate('mgr-publish');
    setTimeout(() => {
      const sel = document.getElementById('pubStatus');
      if (sel) { sel.value = status; sel.dispatchEvent(new Event('change')); }
    }, 60);
  },

  // ==================== 卡片点击：申请总览 ====================
  openApplicationsList(filter) {
    this._appListFilter = filter || 'all';
    App.navigate('mgr-applications');
  },

  // ==================== 申请总览（卡片跳转目标） ====================
  applicationsList() {
    const c = document.getElementById('viewContainer');
    const allApps = Store.getApplications();
    const filter = this._appListFilter || 'all';
    const titleMap = {
      all: { title: '全部申请', sub: '所有收到的内推申请，按状态分组展示', count: allApps.length },
      screening: { title: 'HR 初筛中', sub: '等待 HR 简历初筛的申请', count: allApps.filter(a => a.status === 'screening').length },
      interviewing: { title: '待处理面试', sub: '已进入业务面试环节，需要安排/跟进面试反馈', count: allApps.filter(a => a.status === 'interviewing').length },
      offer: { title: '录用沟通', sub: '已发 offer 或正在沟通入职', count: allApps.filter(a => a.status === 'offer').length },
      rejected: { title: '未通过', sub: '流程终止的申请记录', count: allApps.filter(a => a.status === 'rejected').length },
      transfer: { title: '转岗交接', sub: '已确认转岗，正在交接中的员工', count: allApps.filter(a => a.status === 'transfer').length },
    };
    const meta = titleMap[filter] || titleMap.all;
    const list = filter === 'all' ? allApps : allApps.filter(a => a.status === filter);

    // 状态分组（仅在 all 时按状态分组）
    const groups = filter === 'all'
      ? [
          { key: 'interviewing', label: '业务面试', color: '#E8A838' },
          { key: 'screening',    label: 'HR 初筛', color: '#6BAED6' },
          { key: 'offer',        label: '录用沟通', color: '#5B8FA8' },
          { key: 'transfer',     label: '转岗交接', color: '#4CAF7C' },
          { key: 'rejected',     label: '未通过',   color: '#E5655E' },
        ].map(g => ({ ...g, apps: allApps.filter(a => a.status === g.key) })).filter(g => g.apps.length)
      : null;

    c.innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <h2>${meta.title}</h2>
          <span class="page-subtitle">${meta.sub} · 共 ${meta.count} 条</span>
        </div>
        <button class="btn btn-ghost" onclick="App.navigate('mgr-publish')">
          ${App.icon('back')} 返回岗位发布
        </button>
      </div>

      <!-- 状态分页 tab -->
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px">
        <button class="filter-tab ${filter==='all'?'active':''}" onclick="Manager.openApplicationsList('all')">全部 (${allApps.length})</button>
        <button class="filter-tab ${filter==='screening'?'active':''}" onclick="Manager.openApplicationsList('screening')">HR初筛 (${titleMap.screening.count})</button>
        <button class="filter-tab ${filter==='interviewing'?'active':''}" onclick="Manager.openApplicationsList('interviewing')">业务面试 (${titleMap.interviewing.count})</button>
        <button class="filter-tab ${filter==='offer'?'active':''}" onclick="Manager.openApplicationsList('offer')">录用沟通 (${titleMap.offer.count})</button>
        <button class="filter-tab ${filter==='transfer'?'active':''}" onclick="Manager.openApplicationsList('transfer')">转岗交接 (${titleMap.transfer.count})</button>
        <button class="filter-tab ${filter==='rejected'?'active':''}" onclick="Manager.openApplicationsList('rejected')">未通过 (${titleMap.rejected.count})</button>
      </div>

      <div id="appListContent"></div>
    `;

    const content = document.getElementById('appListContent');
    if (list.length === 0) {
      content.innerHTML = `<div class="empty-state">${App.icon('empty')}<p>该状态下暂无申请</p></div>`;
      return;
    }

    if (groups) {
      // 按状态分组展示
      content.innerHTML = groups.map(g => `
        <div class="chart-card" style="margin-bottom:18px;padding:18px">
          <div class="chart-header" style="margin-bottom:12px">
            <h3 style="font-size:0.95rem;display:flex;align-items:center;gap:8px">
              <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${g.color}"></span>
              ${g.label}
              <span style="font-size:0.78rem;color:var(--text-muted);font-weight:normal">${g.apps.length} 条</span>
            </h3>
            <button class="btn btn-ghost btn-sm" onclick="Manager.openApplicationsList('${g.key}')">查看全部 →</button>
          </div>
          ${this._renderAppTable(g.apps)}
        </div>
      `).join('');
    } else {
      // 单状态平铺
      content.innerHTML = this._renderAppTable(list);
    }
  },

  _renderAppTable(apps) {
    return `
      <table style="width:100%;border-collapse:collapse;font-size:0.85rem">
        <thead>
          <tr style="background:var(--bg-hover)">
            <th style="text-align:left;padding:10px 12px;font-weight:600;color:var(--text-secondary);border-radius:6px 0 0 6px">候选人</th>
            <th style="text-align:left;padding:10px 12px;font-weight:600;color:var(--text-secondary)">申请岗位</th>
            <th style="text-align:left;padding:10px 12px;font-weight:600;color:var(--text-secondary)">申请时间</th>
            <th style="text-align:right;padding:10px 12px;font-weight:600;color:var(--text-secondary);border-radius:0 6px 6px 0">操作</th>
          </tr>
        </thead>
        <tbody>
          ${apps.map(a => {
            const t = Store.getTalent(a.talentId);
            const p = Store.getPosition(a.positionId);
            const st = (typeof APPLICATION_STATUS !== 'undefined' ? APPLICATION_STATUS : {})[a.status] || { label: a.status, class: '', color: '#888' };
            return `
              <tr style="border-top:1px solid var(--border-light);cursor:pointer" onmouseover="this.style.background='var(--bg-hover)'" onmouseout="this.style.background='transparent'" onclick="Manager.openAppDetail(${a.id})">
                <td style="padding:12px">
                  <div style="display:flex;align-items:center;gap:10px">
                    <div style="width:32px;height:32px;border-radius:50%;background:var(--primary-light);color:var(--primary-darker);display:flex;align-items:center;justify-content:center;font-weight:600;font-size:0.8rem;flex-shrink:0">${t?.name?.charAt(0) || '?'}</div>
                    <div>
                      <div style="font-weight:600">${t?.name || '未知'} <span style="font-size:0.72rem;color:var(--text-muted);font-weight:normal">· ${t?.currentDept || ''} · ${t?.level || ''}</span></div>
                      <div style="font-size:0.72rem;color:var(--text-muted);margin-top:2px"><span style="display:inline-block;padding:1px 6px;border-radius:8px;background:${st.color}15;color:${st.color}">${st.label}</span></div>
                    </div>
                  </div>
                </td>
                <td style="padding:12px">
                  <div style="font-weight:500">${p?.title || '已关闭'}</div>
                  <div style="font-size:0.72rem;color:var(--text-muted)">${p?.dept || ''} · ${p?.location || ''}</div>
                </td>
                <td style="padding:12px;color:var(--text-muted)">${a.applyDate}</td>
                <td style="padding:12px;text-align:right">
                  <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();Manager.openAppDetail(${a.id})">查看详情 →</button>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
  },

  // 点击申请行 → 跳到候选人管理并自动选中对应岗位
  openAppDetail(appId) {
    const app = Store.getApplications().find(a => a.id === appId);
    if (!app) return;
    this._selectedPositionId = app.positionId;
    App.navigate('mgr-candidates');
  },


  candidates() {
    const positions = Store.getPositions().filter(p => p.status === 'open');
    const c = document.getElementById('viewContainer');
    c.innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <h2>候选人管理</h2>
          <span class="page-subtitle">按智能匹配度排序，协同面试评价</span>
        </div>
      </div>
      <div class="filter-bar">
        <select id="candPosition" class="filter-select" style="min-width:260px">
          <option value="">选择岗位查看候选人...</option>
          ${positions.map(p => `<option value="${p.id}">${p.title} · ${p.dept} (${Store.getApplicationsByPosition(p.id).length}人)</option>`).join('')}
        </select>
      </div>
      <div id="candContent">
        <div class="empty-state">${App.icon('empty')}<p>请选择岗位查看候选人</p></div>
      </div>
    `;
    document.getElementById('candPosition').addEventListener('change', () => {
      this._selectedPositionId = parseInt(document.getElementById('candPosition').value) || null;
      this.renderCandidates();
    });
    if (this._selectedPositionId) {
      document.getElementById('candPosition').value = this._selectedPositionId;
      this.renderCandidates();
    }
  },

  selectPositionInCandidates(positionId) {
    this._selectedPositionId = positionId;
    const sel = document.getElementById('candPosition');
    if (sel) { sel.value = positionId; this.renderCandidates(); }
  },

  renderCandidates() {
    const content = document.getElementById('candContent');
    if (!this._selectedPositionId) {
      content.innerHTML = `<div class="empty-state">${App.icon('empty')}<p>请选择岗位查看候选人</p></div>`;
      return;
    }
    const position = Store.getPosition(this._selectedPositionId);
    const apps = Store.getApplicationsByPosition(this._selectedPositionId);
    // 同时展示主动申请者和系统推荐
    const applicants = apps.map(app => {
      const t = Store.getTalent(app.id ? app.talentId : null);
      const talent = Store.getTalent(app.talentId);
      const m = calculateMatch(talent, position);
      return { ...app, talent, ...m };
    });
    const recommended = recommendForPosition(this._selectedPositionId, 5)
      .filter(r => !apps.find(a => a.talentId === r.talent.id))
      .map(r => ({ ...r, isRecommended: true }));

    const all = [...applicants, ...recommended].sort((a, b) => b.score - a.score);

    content.innerHTML = `
      <div class="card section-gap">
        <div class="card-header">
          <h3>${position.title} · 候选人列表</h3>
          <span class="chart-badge">共 ${all.length} 人</span>
        </div>
        ${all.length === 0 ? '<div class="empty-state"><p>暂无候选人</p></div>' : all.map(item => this.candidateCard(item, position)).join('')}
      </div>
    `;
  },

  candidateCard(item, position) {
    const t = item.talent;
    const sc = App.scoreColor(item.score);
    const appStatus = item.status ? STATUS_MAP[item.status] : null;

    // 头像渐变色：根据性别 / 名字 hash 选色
    const avatarGrad = (() => {
      const code = (t.name || '?').charCodeAt(0);
      const grads = [
        'linear-gradient(135deg, #A8C4D4 0%, #7FA8BE 100%)',
        'linear-gradient(135deg, #9B8FD4 0%, #7B6FB8 100%)',
        'linear-gradient(135deg, #6BAED6 0%, #4A8FB8 100%)',
        'linear-gradient(135deg, #7ECEC0 0%, #5BA89A 100%)',
        'linear-gradient(135deg, #E8A838 0%, #C8851F 100%)',
        'linear-gradient(135deg, #4CAF7C 0%, #2F8B5C 100%)',
      ];
      return grads[code % grads.length];
    })();

    // 技能标签（只显示前 4 个，溢出 +N）
    const matchedTags = (item.matchedSkills || []).slice(0, 4).map(s =>
      `<span style="display:inline-flex;align-items:center;gap:3px;padding:3px 8px;border-radius:6px;background:#E8F6EE;color:#2F8B5C;font-size:0.72rem">✓ ${s}</span>`
    ).join('');
    const gapTags = (item.gapSkills || []).slice(0, 2).map(s =>
      `<span style="display:inline-flex;align-items:center;gap:3px;padding:3px 8px;border-radius:6px;background:#FCEAE9;color:#C84A43;font-size:0.72rem">✕ ${s}</span>`
    ).join('');
    const reasonTags = (item.reasons || []).slice(0, 2).map(r =>
      `<span style="display:inline-flex;align-items:center;gap:3px;padding:3px 8px;border-radius:6px;background:#EDF4F8;color:#5B8FA8;font-size:0.72rem">★ ${r}</span>`
    ).join('');

    // 项目经验（最多 2 条简短描述）
    const projects = (t.projects || []).slice(0, 2).map(p =>
      `<div style="font-size:0.78rem;color:var(--text-secondary);line-height:1.5;display:flex;gap:6px">
        <span style="color:var(--text-muted);flex-shrink:0">▸</span>
        <span>${p.name}${p.role ? ` · <span style="color:var(--text-muted)">${p.role}</span>` : ''}</span>
      </div>`
    ).join('');

    // 三维分项
    const hardPct = item.hardScore || 0;
    const potPct = item.potentialScore || 0;
    const culPct = item.cultureScore || 0;
    const dimsHtml = `
      <div style="display:flex;gap:14px;margin-top:8px;font-size:0.7rem">
        <div style="display:flex;flex-direction:column;align-items:center;gap:2px">
          <div style="font-weight:700;color:#6BAED6">${hardPct}</div>
          <div style="color:var(--text-muted)">硬性</div>
        </div>
        <div style="width:1px;background:var(--border-light)"></div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:2px">
          <div style="font-weight:700;color:#9B8FD4">${potPct}</div>
          <div style="color:var(--text-muted)">潜力</div>
        </div>
        <div style="width:1px;background:var(--border-light)"></div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:2px">
          <div style="font-weight:700;color:#4CAF7C">${culPct}</div>
          <div style="color:var(--text-muted)">文化</div>
        </div>
      </div>
    `;

    return `
      <div style="background:var(--bg-card);border:1px solid var(--border-light);border-radius:14px;padding:18px;margin-bottom:12px;display:flex;gap:18px;align-items:stretch;transition:box-shadow .2s,transform .2s,border-color .2s;cursor:pointer"
           onmouseover="this.style.boxShadow='0 6px 20px rgba(91,143,168,0.12)';this.style.borderColor='var(--primary)';this.style.transform='translateY(-1px)'"
           onmouseout="this.style.boxShadow='none';this.style.borderColor='var(--border-light)';this.style.transform='translateY(0)'"
           onclick="Manager.viewTalent(${t.id})">

        <!-- 左侧：头像 + 姓名 -->
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px;flex-shrink:0;min-width:84px">
          <div style="width:60px;height:60px;border-radius:14px;background:${avatarGrad};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:600;font-size:1.4rem;box-shadow:0 4px 12px rgba(0,0,0,0.08)">${t.avatar || t.name?.charAt(0) || '?'}</div>
          <div style="text-align:center">
            <div style="font-weight:600;font-size:0.9rem;color:var(--text-primary);line-height:1.2">${t.name}</div>
            <div style="font-size:0.7rem;color:var(--text-muted);margin-top:2px">${t.empId || ''}</div>
            ${(() => { const m = MBTI_TYPES[t.mbti]; return m ? `<span class="mbti-badge" style="background:${m.bg};color:${m.color}" title="${m.desc}">${t.mbti}</span>` : ''; })()}
          </div>
          ${item.isRecommended ? '<span style="font-size:0.65rem;padding:2px 8px;border-radius:10px;background:#EFEDF8;color:#7B6FB8;font-weight:500">系统推荐</span>' : ''}
        </div>

        <!-- 中间：信息区 -->
        <div style="flex:1;min-width:0;border-right:1px dashed var(--border-light);padding-right:18px">
          <!-- 岗位流转 -->
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;font-size:0.85rem">
            <span style="padding:3px 10px;border-radius:6px;background:var(--primary-lighter);color:var(--primary-darker);font-weight:500">${t.currentDept}</span>
            <span style="color:var(--text-muted)">${App.icon('arrow')}</span>
            <span style="padding:3px 10px;border-radius:6px;background:#EDF4F8;color:#5B8FA8;font-weight:500">${position.title}</span>
            ${appStatus ? `<span class="status-badge ${appStatus.class}" style="margin-left:auto">${appStatus.label}</span>` : '<span style="margin-left:auto;font-size:0.7rem;color:var(--text-muted)">已申请于 ' + (item.applyDate || '-') + '</span>'}
          </div>

          <!-- 技能标签 -->
          <div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:10px">
            ${matchedTags}
            ${gapTags}
            ${(item.matchedSkills || []).length > 4 ? `<span style="font-size:0.7rem;color:var(--text-muted);padding:3px 6px">+${(item.matchedSkills || []).length - 4}</span>` : ''}
          </div>

          <!-- 匹配理由 -->
          ${reasonTags ? `<div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:10px">${reasonTags}</div>` : ''}

          <!-- 项目经验 -->
          ${projects ? `<div style="background:var(--bg-hover);border-radius:8px;padding:8px 10px">${projects}</div>` : ''}
        </div>

        <!-- 右侧：匹配度 + 操作 -->
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:space-between;flex-shrink:0;min-width:120px;padding:4px 0">
          <div style="text-align:center">
            <div style="position:relative;width:90px;height:90px;margin:0 auto">
              <svg width="90" height="90" viewBox="0 0 90 90" style="transform:rotate(-90deg)">
                <circle cx="45" cy="45" r="40" fill="none" stroke="#EDF1F5" stroke-width="6"/>
                <circle cx="45" cy="45" r="40" fill="none" stroke="${sc}" stroke-width="6"
                        stroke-dasharray="${2 * Math.PI * 40}" stroke-dashoffset="${2 * Math.PI * 40 * (1 - item.score / 100)}"
                        stroke-linecap="round" style="transition:stroke-dashoffset 0.6s ease"/>
              </svg>
              <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center">
                <div style="font-size:1.4rem;font-weight:700;color:${sc};line-height:1">${item.score}</div>
                <div style="font-size:0.7rem;color:var(--text-muted);margin-top:1px">%</div>
              </div>
            </div>
            ${dimsHtml}
          </div>
          <div style="display:flex;flex-direction:column;gap:5px;width:100%">
            <button class="btn btn-sm btn-ghost" onclick="event.stopPropagation();Manager.viewTalent(${t.id})">查看详情</button>
            ${item.isRecommended
              ? `<button class="btn btn-sm btn-primary" onclick="event.stopPropagation();Manager.sendInvitation(${t.id},'${position.title}')">发起邀约</button>`
              : item.status === 'interviewing'
                ? `<button class="btn btn-sm btn-primary" onclick="event.stopPropagation();Manager.addInterview(${item.id})">添加评价</button>`
                : item.status === 'screening'
                  ? `<button class="btn btn-sm btn-success" onclick="event.stopPropagation();Manager.advanceStage(${item.id})">推进面试</button>`
                  : item.status === 'offer'
                    ? `<button class="btn btn-sm btn-success" onclick="event.stopPropagation();Manager.viewTalent(${t.id})">处理 Offer</button>`
                    : `<button class="btn btn-sm btn-primary" onclick="event.stopPropagation();Manager.sendInvitation(${t.id},'${position.title}')">主动邀约</button>`
            }
          </div>
        </div>
      </div>
    `;
  },

  advanceStage(appId) {
    const app = Store.getApplication(appId);
    Store.updateApplication(appId, {
      status: 'interviewing',
      timeline: app.timeline.map((t, i) => i === 0 ? { ...t, status: 'completed', date: new Date().toISOString().slice(0,10), note: '通过初筛' } : i === 1 ? { ...t, status: 'current', date: new Date().toISOString().slice(0,10), note: '已安排面试' } : t),
    });
    App.toast('已推进至面试阶段', 'success');
    this.renderCandidates();
  },

  addInterview(appId) {
    App.openModal('添加面试评价', `
      <div class="form-row">
        <div class="form-group">
          <label>面试轮次</label>
          <select id="ivRound">
            <option value="一面">一面</option>
            <option value="二面">二面</option>
            <option value="三面">三面</option>
            <option value="终面">终面</option>
          </select>
        </div>
        <div class="form-group">
          <label>面试官</label>
          <input type="text" id="ivInterviewer" value="${App.roleUsers.manager.name}">
        </div>
      </div>
      <div class="form-group">
        <label>评分（1-5）</label>
        <select id="ivRating">
          <option value="5">5 - 非常优秀</option>
          <option value="4.5" selected>4.5 - 推荐</option>
          <option value="4">4 - 良好</option>
          <option value="3">3 - 一般</option>
          <option value="2">2 - 不推荐</option>
        </select>
      </div>
      <div class="form-group">
        <label>评价</label>
        <textarea id="ivComment" rows="4" placeholder="面试评价..."></textarea>
      </div>
      <div class="form-group">
        <label>结果</label>
        <select id="ivResult">
          <option value="true" selected>通过</option>
          <option value="false">未通过</option>
        </select>
      </div>
      <div style="padding:12px;background:var(--warning-light);border-radius:var(--radius-md);font-size:0.78rem;color:var(--text-secondary);margin-bottom:16px">
        ⚠️ 敏感操作：如需发起录用，须经对方HRBP确认，流程对候选人当前主管严格保密。
      </div>
      <div class="modal-footer" style="border:none;padding:0">
        <button class="btn btn-ghost" onclick="App.closeModal()">取消</button>
        <button class="btn btn-primary" onclick="Manager.saveInterview(${appId})">提交评价</button>
      </div>
    `);
  },

  saveInterview(appId) {
    const app = Store.getApplication(appId);
    const passed = document.getElementById('ivResult').value === 'true';
    const interview = {
      round: document.getElementById('ivRound').value,
      interviewer: document.getElementById('ivInterviewer').value,
      date: new Date().toISOString().slice(0, 10),
      rating: parseFloat(document.getElementById('ivRating').value),
      comment: document.getElementById('ivComment').value.trim() || '综合表现良好',
      passed,
    };
    const interviews = [...(app.interviews || []), interview];
    let status = app.status;
    let timeline = app.timeline;
    if (!passed) {
      status = 'rejected';
      timeline = timeline.map((t, i) => i === 1 ? { ...t, status: 'completed', note: '面试未通过' } : t);
    } else {
      // 检查是否需要进入下一轮或offer
      if (interviews.filter(i => i.passed).length >= 2) {
        status = 'offer';
        timeline = timeline.map((t, i) => i <= 1 ? { ...t, status: 'completed' } : i === 2 ? { ...t, status: 'current', date: new Date().toISOString().slice(0,10), note: '进入录用沟通' } : t);
      }
    }
    Store.updateApplication(appId, { interviews, status, timeline });
    App.closeModal();
    App.toast('面试评价已提交', 'success');
    this.renderCandidates();
  },
};
