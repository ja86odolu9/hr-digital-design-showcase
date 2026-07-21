/**
 * 员工端 — 人才发现与申请中心
 */
const Employee = {

  // ==================== 智能推荐首页 ====================
  home() {
    const c = document.getElementById('viewContainer');

    // ===== 调试信息采集 =====
    const dbg = {
      currentTalentId: App.currentTalentId,
      role: App.currentRole,
      dbKey: (typeof DB_KEY !== 'undefined') ? DB_KEY : '?',
      storeInited: !!Store._db,
      totalTalents: Store.getTalents().length,
      totalPositions: Store.getPositions().length,
      openPositions: Store.getPositions().filter(p => p.status === 'open').length,
      recommended: 0,
      samplePosition: null,
      error: null,
    };

    // 防御性：若 currentTalentId 无效，回退到第一个有 skills 的人才
    let talent = Store.getTalent(App.currentTalentId);
    if (!talent || !talent.skills) {
      const all = Store.getTalents();
      talent = all.find(t => t.skills && t.privacySettings !== undefined) || all[0];
      if (talent) App.currentTalentId = talent.id;
    }

    if (!talent) {
      c.innerHTML = `<div class="empty-state"><p>暂无数据，请刷新页面（控制台输入 localStorage.clear() 刷新）</p><pre style="text-align:left;background:#f5f5f5;padding:12px;border-radius:8px;font-size:0.75rem">${JSON.stringify(dbg, null, 2)}</pre></div>`;
      return;
    }

    let recommendations = [];
    try {
      recommendations = recommendForTalent(App.currentTalentId, 4);
    } catch (e) {
      dbg.error = e.message + ' | stack: ' + e.stack;
      dbg.recommendForTalentSrc = recommendForTalent.toString().slice(0, 500);
      dbg.calculateMatchSrc = (typeof calculateMatch !== 'undefined') ? calculateMatch.toString().slice(0, 1500) : 'NOT_DEFINED';
    }
    dbg.recommended = recommendations.length;
    dbg.samplePosition = Store.getPositions()[0] ? { id: Store.getPositions()[0].id, title: Store.getPositions()[0].title, status: Store.getPositions()[0].status, hasSkills: !!Store.getPositions()[0].skills, hasMobility: !!Store.getPositions()[0].mobilityInfo } : null;

    const positions = Store.getPositions().filter(p => p.status === 'open');
    // 猜你喜欢：同序列/热门/跨部门
    const sameSequence = positions.filter(p => p.sequence === talent.careerPreferences?.desiredDirection || p.dept === talent.desiredDept).slice(0, 3);
    const hotPositions = positions.filter(p => !recommendations.find(r => r.position.id === p.id) && !sameSequence.find(s => s.id === p.id)).slice(0, 3);
    const crossDept = positions.filter(p => p.dept !== talent.currentDept && p.dept !== talent.desiredDept).slice(0, 3);

    c.innerHTML = `
      <!-- 政策横幅 -->
      <div class="policy-banner">
        <div class="policy-banner-icon">${App.icon('shield')}</div>
        <div class="policy-banner-content">
          <div class="policy-banner-title">公司活水政策 <span class="policy-banner-tag">保密</span></div>
          <div class="policy-banner-text">${MOBILITY_POLICY.confidentiality} · 司龄满${MOBILITY_POLICY.minTenure}年可申请 · 最近绩效≥${MOBILITY_POLICY.minPerformance}级 · 试用期通过率${MOBILITY_POLICY.trialPassRate}%</div>
        </div>
      </div>

      <!-- 欢迎语 -->
      <div style="margin-bottom:24px">
        <h2 style="font-size:1.4rem;font-weight:700">你好，${talent.name} 👋</h2>
        <p style="font-size:0.85rem;color:var(--text-muted);margin-top:4px">根据你的技能、绩效和职业意愿，为你精选了以下内部机会</p>
      </div>

      <!-- 智能推荐 -->
      <div class="section-gap">
        <div class="card-header" style="margin-bottom:16px">
          <h3 style="font-size:1.1rem">🎯 为你推荐</h3>
          <span class="chart-badge">基于三维匹配算法</span>
        </div>
        <div class="opportunity-grid" id="recommendGrid"></div>
      </div>

      <!-- 猜你喜欢 -->
      <div class="section-gap">
        <div class="card-header" style="margin-bottom:8px">
          <h3 style="font-size:1.1rem">💡 猜你喜欢</h3>
        </div>
        <p style="font-size:0.82rem;color:var(--text-muted);margin:0 0 16px 0">基于你的技能、职业意愿和当前部门，匹配以下机会</p>
        <div class="chart-grid">
          <div class="chart-card">
            <div class="chart-header" style="margin-bottom:8px">
              <h3 style="font-size:0.95rem">→ 同序列发展路径</h3>
            </div>
            <p style="font-size:0.75rem;color:var(--text-muted);margin:0 0 8px 0">同岗位序列，纵深精进</p>
            <div id="sameSeqList"></div>
          </div>
          <div class="chart-card">
            <div class="chart-header" style="margin-bottom:8px">
              <h3 style="font-size:0.95rem">🔥 热门新岗位</h3>
            </div>
            <p style="font-size:0.75rem;color:var(--text-muted);margin:0 0 8px 0">近期浏览/申请最多的新机会</p>
            <div id="hotList"></div>
          </div>
        </div>
        <div class="chart-card chart-lg" style="margin-top:20px">
          <div class="chart-header" style="margin-bottom:8px">
            <h3 style="font-size:0.95rem">⇄ 跨部门机会</h3>
            <span class="chart-badge">跳出舒适区</span>
          </div>
          <p style="font-size:0.75rem;color:var(--text-muted);margin:0 0 8px 0">不同部门但技能可迁移的横向机会</p>
          <div id="crossDeptList"></div>
        </div>
      </div>

      <!-- 调试信息 -->
      <details style="margin-top:24px;padding:12px;background:#f5f5f5;border-radius:8px;font-size:0.75rem">
        <summary style="cursor:pointer;font-weight:600">🔧 调试信息（点击展开）</summary>
        <pre style="margin-top:8px;white-space:pre-wrap">${JSON.stringify(dbg, null, 2)}\n推荐结果数: ${recommendations.length}\n推荐[0]: ${recommendations[0] ? recommendations[0].position?.title + ' / score=' + recommendations[0].score : '无'}</pre>
      </details>
    `;

    // 渲染推荐
    document.getElementById('recommendGrid').innerHTML = recommendations.map(r => this.opportunityCard(r, true)).join('') || '<div class="empty-state"><p>暂无推荐岗位</p></div>';
    document.getElementById('sameSeqList').innerHTML = sameSequence.map(p => this.miniPositionItem(p, talent, 'sameSeq')).join('') || '<p style="color:var(--text-muted);font-size:0.85rem;padding:12px">暂无同序列岗位</p>';
    document.getElementById('hotList').innerHTML = hotPositions.map(p => this.miniPositionItem(p, talent, 'hot')).join('') || '<p style="color:var(--text-muted);font-size:0.85rem;padding:12px">暂无热门岗位</p>';
    document.getElementById('crossDeptList').innerHTML = crossDept.map(p => this.miniPositionItem(p, talent, 'cross')).join('') || '<p style="color:var(--text-muted);font-size:0.85rem;padding:12px">暂无跨部门岗位</p>';

    // 绑定卡片点击
    this.bindCardClicks();
  },

  opportunityCard(match, showBreakdown) {
    const p = match.position;
    const scoreColor = App.scoreColor(match.score);
    const skillsHtml = p.skills.map(s => `<span class="tag ${s.required ? 'tag-warning' : ''}">${s.name}${s.required ? '*' : ''}</span>`).join('');
    const breakdown = showBreakdown ? `
      <div style="display:flex;gap:8px;margin-top:8px">
        <span class="tag tag-info">硬性 ${match.hardScore}</span>
        <span class="tag tag-purple">潜力 ${match.potentialScore}</span>
        <span class="tag tag-success">文化 ${match.cultureScore}</span>
      </div>` : '';
    return `
      <div class="opportunity-card" data-position-id="${p.id}">
        <div class="opportunity-card-top">
          <div>
            <div class="opportunity-card-title">${p.title}</div>
            <span class="opportunity-card-dept">${p.dept} · ${p.level}</span>
          </div>
          <span class="status-badge status-open">招聘中</span>
        </div>
        <div class="opportunity-card-meta">
          <span>${App.icon('pin')} ${p.location}</span>
          <span>${App.icon('users')} ${p.headcount}人</span>
          <span>${App.icon('clock')} ${p.postedDate}</span>
        </div>
        <div class="opportunity-card-skills">${skillsHtml}</div>
        <p style="font-size:0.8rem;color:var(--text-secondary);margin-bottom:14px;line-height:1.6">${p.desc.slice(0, 60)}...</p>
        <div class="opportunity-card-match">
          <div class="match-score-display">
            <span class="match-score-num" style="color:${scoreColor}">${match.score}%</span>
            <span style="font-size:0.75rem;color:var(--text-muted)">匹配度</span>
          </div>
          <button class="btn btn-primary btn-sm" onclick="event.stopPropagation();Employee.applyPosition(${p.id})">立即申请</button>
        </div>
        ${breakdown}
      </div>
    `;
  },

  miniPositionItem(p, talent, hint) {
    const match = calculateMatch(talent, p);
    const scoreColor = App.scoreColor(match.score);
    const reasonTag = (() => {
      // 根据 hint 类型给出不同小标签
      if (hint === 'sameSeq') return { icon: '→', text: '同序列', color: 'var(--primary-darker)', bg: 'var(--primary-lighter)' };
      if (hint === 'hot') return { icon: '🔥', text: '热门', color: '#C95B2B', bg: '#FDF1E8' };
      if (hint === 'cross') return { icon: '⇄', text: '跨部门', color: 'var(--purple)', bg: 'var(--purple-light)' };
      return null;
    })();
    // 匹配理由文案：取分项中最高的一项
    const reasonText = (() => {
      const parts = (match.reasons || []).slice(0, 2);
      return parts.join(' · ');
    })();

    return `
      <div style="display:flex;align-items:center;gap:14px;padding:14px 12px;border-radius:10px;cursor:pointer;transition:background .15s,transform .15s;margin-bottom:4px"
           onmouseover="this.style.background='var(--bg-hover)';this.style.transform='translateX(2px)'"
           onmouseout="this.style.background='transparent';this.style.transform='translateX(0)'"
           onclick="Employee.viewPosition(${p.id})">
        <div style="width:40px;height:40px;border-radius:10px;background:var(--primary-light);color:var(--primary-darker);display:flex;align-items:center;justify-content:center;font-weight:600;font-size:0.95rem;flex-shrink:0">
          ${p.dept.charAt(0)}
        </div>
        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
            <strong style="font-size:0.95rem;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${p.title}</strong>
            ${reasonTag ? `<span style="font-size:0.7rem;padding:2px 8px;border-radius:10px;background:${reasonTag.bg};color:${reasonTag.color};white-space:nowrap">${reasonTag.icon} ${reasonTag.text}</span>` : ''}
          </div>
          <div style="font-size:0.78rem;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
            ${p.dept} · ${p.location} · ${p.level}
          </div>
          ${reasonText ? `<div style="font-size:0.72rem;color:var(--text-secondary);margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${reasonText}</div>` : ''}
        </div>
        <div style="text-align:right;flex-shrink:0">
          <div style="font-size:0.95rem;font-weight:700;color:${scoreColor}">${match.score}%</div>
          <div style="font-size:0.65rem;color:var(--text-muted);margin-top:2px">匹配度</div>
        </div>
      </div>
    `;
  },

  bindCardClicks() {
    document.querySelectorAll('.opportunity-card[data-position-id]').forEach(card => {
      card.addEventListener('click', () => {
        Employee.viewPosition(parseInt(card.dataset.positionId));
      });
    });
  },

  // ==================== 机会广场 ====================
  plaza() {
    const c = document.getElementById('viewContainer');
    c.innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <h2>内部机会广场</h2>
          <span class="page-subtitle">浏览所有开放岗位，找到你的下一个舞台</span>
        </div>
      </div>
      <div class="filter-bar">
        <div class="filter-item">
          <input type="text" id="plazaSearch" placeholder="搜索岗位名称 / 技能...">
        </div>
        <select id="plazaDept" class="filter-select"><option value="">全部部门</option></select>
        <select id="plazaCity" class="filter-select"><option value="">全部城市</option></select>
        <select id="plazaSeq" class="filter-select"><option value="">全部序列</option></select>
        <select id="plazaLevel" class="filter-select"><option value="">全部职级</option></select>
        <select id="plazaSort" class="filter-select">
          <option value="match">按匹配度排序</option>
          <option value="time">按发布时间排序</option>
        </select>
      </div>
      <div class="opportunity-grid" id="plazaGrid"></div>
    `;

    // 填充筛选器
    DEPARTMENTS.forEach(d => document.getElementById('plazaDept').add(new Option(d, d)));
    CITIES.forEach(c => document.getElementById('plazaCity').add(new Option(c, c)));
    SEQUENCES.forEach(s => document.getElementById('plazaSeq').add(new Option(s, s)));
    LEVELS.forEach(l => document.getElementById('plazaLevel').add(new Option(l, l)));

    const render = () => this.renderPlaza();
    ['plazaSearch', 'plazaDept', 'plazaCity', 'plazaSeq', 'plazaLevel', 'plazaSort'].forEach(id => {
      document.getElementById(id).addEventListener('input', render);
      document.getElementById(id).addEventListener('change', render);
    });
    render();
  },

  renderPlaza() {
    const talent = Store.getTalent(App.currentTalentId);
    let list = Store.getPositions().filter(p => p.status === 'open');
    const search = document.getElementById('plazaSearch').value.trim().toLowerCase();
    const dept = document.getElementById('plazaDept').value;
    const city = document.getElementById('plazaCity').value;
    const seq = document.getElementById('plazaSeq').value;
    const level = document.getElementById('plazaLevel').value;
    const sort = document.getElementById('plazaSort').value;

    if (search) list = list.filter(p => p.title.toLowerCase().includes(search) || p.skills.some(s => s.name.toLowerCase().includes(search)));
    if (dept) list = list.filter(p => p.dept === dept);
    if (city) list = list.filter(p => p.location === city);
    if (seq) list = list.filter(p => p.sequence === seq);
    if (level) list = list.filter(p => p.level === level);

    const matches = list.map(p => ({ position: p, ...calculateMatch(talent, p) }));
    if (sort === 'match') matches.sort((a, b) => b.score - a.score);
    else matches.sort((a, b) => b.position.postedDate.localeCompare(a.position.postedDate));

    const grid = document.getElementById('plazaGrid');
    if (matches.length === 0) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">${App.icon('empty')}<p>暂无匹配的岗位</p></div>`;
      return;
    }
    grid.innerHTML = matches.map(m => this.opportunityCard(m, false)).join('');
    this.bindCardClicks();
  },

  // ==================== 岗位详情 ====================
  viewPosition(positionId) {
    const p = Store.getPosition(positionId);
    if (!p) return;
    const talent = Store.getTalent(App.currentTalentId);
    const match = calculateMatch(talent, p);
    const scoreColor = App.scoreColor(match.score);
    const alreadyApplied = Store.getApplicationsByTalent(App.currentTalentId).some(a => a.positionId === positionId);

    const c = document.getElementById('viewContainer');
    c.innerHTML = `
      <div class="detail-back" onclick="App.navigate('emp-plaza')">${App.icon('back')} 返回机会广场</div>

      <!-- 岗位头部 -->
      <div class="detail-hero">
        <div class="detail-hero-top">
          <div>
            <div class="detail-hero-title">${p.title}</div>
            <div style="margin-top:6px">
              <span class="opportunity-card-dept">${p.dept}</span>
              <span class="status-badge status-open" style="margin-left:8px">${STATUS_MAP[p.status]?.label || '招聘中'}</span>
            </div>
          </div>
          <div style="text-align:right">
            <div style="font-size:2rem;font-weight:700;color:${scoreColor}">${match.score}%</div>
            <div style="font-size:0.75rem;color:var(--text-muted)">综合匹配度</div>
          </div>
        </div>
        <div class="detail-hero-meta">
          <div class="detail-hero-meta-item">${App.icon('pin')} ${p.location}</div>
          <div class="detail-hero-meta-item">${App.icon('users')} 招聘${p.headcount}人</div>
          <div class="detail-hero-meta-item">${App.icon('award')} 职级 ${p.level}</div>
          <div class="detail-hero-meta-item">${App.icon('clock')} 发布于 ${p.postedDate}</div>
          <div class="detail-hero-meta-item">${App.icon('book')} 序列 ${p.sequence}</div>
        </div>
        <div class="detail-hero-desc">${p.desc}</div>

        <!-- 匹配度分解 -->
        <div style="margin-top:20px">
          <div class="card-header" style="margin-bottom:12px"><h3>匹配度分析</h3></div>
          <div class="match-breakdown">
            <div class="match-breakdown-item">
              <div class="match-breakdown-label">硬性匹配</div>
              <div class="match-breakdown-score" style="color:${App.scoreColor(match.hardScore)}">${match.hardScore}</div>
              <div class="match-breakdown-bar"><div class="match-breakdown-fill" style="width:${match.hardScore}%;background:${App.scoreColor(match.hardScore)}"></div></div>
              <div style="font-size:0.7rem;color:var(--text-muted);margin-top:4px">学历·司龄·必备技能</div>
            </div>
            <div class="match-breakdown-item">
              <div class="match-breakdown-label">潜力匹配</div>
              <div class="match-breakdown-score" style="color:${App.scoreColor(match.potentialScore)}">${match.potentialScore}</div>
              <div class="match-breakdown-bar"><div class="match-breakdown-fill" style="width:${match.potentialScore}%;background:${App.scoreColor(match.potentialScore)}"></div></div>
              <div style="font-size:0.7rem;color:var(--text-muted);margin-top:4px">学习敏锐度·跨界经验</div>
            </div>
            <div class="match-breakdown-item">
              <div class="match-breakdown-label">文化匹配</div>
              <div class="match-breakdown-score" style="color:${App.scoreColor(match.cultureScore)}">${match.cultureScore}</div>
              <div class="match-breakdown-bar"><div class="match-breakdown-fill" style="width:${match.cultureScore}%;background:${App.scoreColor(match.cultureScore)}"></div></div>
              <div style="font-size:0.7rem;color:var(--text-muted);margin-top:4px">协作·创新·主人翁</div>
            </div>
          </div>
          <div style="margin-top:16px;display:flex;flex-wrap:wrap;gap:6px">
            ${match.reasons.map(r => `<span class="tag tag-success">${App.icon('check')} ${r}</span>`).join('')}
          </div>
          ${match.gapSkills.length > 0 ? `
            <div style="margin-top:12px">
              <span style="font-size:0.8rem;color:var(--text-muted)">技能差距：</span>
              ${match.gapSkills.map(s => `<span class="tag tag-danger">${s}</span>`).join('')}
            </div>` : ''}
        </div>

        <div style="margin-top:20px;display:flex;gap:10px">
          ${alreadyApplied
            ? '<button class="btn btn-ghost" disabled style="opacity:0.6">已申请，查看进度</button>'
            : `<button class="btn btn-primary btn-lg" onclick="Employee.applyPosition(${p.id})">${App.icon('send')} 立即申请</button>`
          }
          <button class="btn btn-ghost btn-lg" onclick="App.toast('已收藏岗位','success')">收藏岗位</button>
        </div>
      </div>

      <!-- 活水专属信息 -->
      <div class="section-gap">
        <div class="card">
          <div class="card-header">
            <h3>🌊 活水专属信息</h3>
            <span class="chart-badge">仅内部活水可见</span>
          </div>
          <div class="mobility-section">
            <div class="mobility-grid">
              <div class="mobility-item">
                <div class="mobility-item-label">团队氛围</div>
                <div class="mobility-item-value">${p.mobilityInfo.teamVibe}</div>
              </div>
              <div class="mobility-item">
                <div class="mobility-item-label">紧急招聘原因</div>
                <div class="mobility-item-value">${p.mobilityInfo.urgencyReason}</div>
              </div>
              <div class="mobility-item">
                <div class="mobility-item-label">原岗位人员去向</div>
                <div class="mobility-item-value">${p.mobilityInfo.predecessorDestination}</div>
              </div>
              <div class="mobility-item">
                <div class="mobility-item-label">入职前3个月关键目标</div>
                <div class="mobility-item-value">${p.mobilityInfo.firstThreeMonths}</div>
              </div>
            </div>
          </div>

          <!-- 团队直通车 -->
          ${p.managerIntro.bioText ? `
            <div style="margin-top:16px">
              <div class="card-header" style="margin-bottom:12px"><h3>☕ 团队直通车</h3></div>
              <div class="manager-intro-card">
                <div class="manager-avatar">${p.managerIntro.name.charAt(0)}</div>
                <div class="manager-info">
                  <div class="manager-name">${p.managerIntro.name} · ${p.managerIntro.title}</div>
                  <div class="manager-bio">"${p.managerIntro.bioText}"</div>
                </div>
                ${p.managerIntro.coffeeChatAvailable
                  ? `<button class="btn btn-text" onclick="App.toast('已发送咖啡聊天预约请求，负责人将在2个工作日内回复','success')">${App.icon('coffee')} 预约咖啡聊</button>`
                  : '<span class="tag" style="margin-right:16px">暂不可预约</span>'
                }
              </div>
            </div>` : ''}
        </div>
      </div>

      <!-- 技能要求 -->
      <div class="card">
        <div class="card-header"><h3>技能要求</h3></div>
        <div style="display:flex;flex-wrap:wrap;gap:8px">
          ${p.skills.map(s => `<span class="tag ${s.required ? 'tag-warning' : ''}">${s.name} <span style="opacity:0.7">· ${s.level}</span>${s.required ? ' · 必备' : ''}</span>`).join('')}
        </div>
      </div>
    `;
  },

  // ==================== 申请操作 ====================
  applyPosition(positionId) {
    const existing = Store.getApplicationsByTalent(App.currentTalentId).find(a => a.positionId === positionId);
    if (existing) {
      App.toast('您已申请过该岗位', 'warning');
      return;
    }
    const activeCount = Store.getApplicationsByTalent(App.currentTalentId).filter(a => !['completed', 'rejected'].includes(a.status)).length;
    if (activeCount >= MOBILITY_POLICY.maxConcurrent) {
      App.toast(`最多同时申请${MOBILITY_POLICY.maxConcurrent}个岗位`, 'warning');
      return;
    }
    const p = Store.getPosition(positionId);
    Store.addApplication({
      talentId: App.currentTalentId, positionId, status: 'screening', applyDate: new Date().toISOString().slice(0, 10),
      timeline: [
        { stage: 'HR初筛', status: 'current', date: null, note: 'HR正在审核您的申请' },
        { stage: '业务面试', status: 'pending', date: null, note: '' },
        { stage: '录用沟通', status: 'pending', date: null, note: '' },
        { stage: '转岗交接', status: 'pending', date: null, note: '' },
      ],
      interviews: [],
      notifications: [{ type: 'info', message: `您的申请已提交，HR将在3个工作日内审核`, time: '刚刚' }],
    });
    Store.updateTalent(App.currentTalentId, { status: 'matching' });
    App.toast(`已成功申请「${p.title}」`, 'success');
    App.renderSidebar();
    App.navigate('emp-applications');
  },

  // ==================== 个人活水档案 ====================
  profile() {
    const t = Store.getTalent(App.currentTalentId);
    const c = document.getElementById('viewContainer');
    const latestPerf = t.performanceHistory[t.performanceHistory.length - 1];

    c.innerHTML = `
      <!-- 档案头部 -->
      <div class="profile-header">
        <div class="profile-avatar-lg">${t.avatar}</div>
        <div class="profile-info" style="flex:1">
          <h2>${t.name}</h2>
          <div class="profile-meta">
            <span>${App.icon('briefcase')} ${t.currentDept} · ${t.currentPosition}</span>
            <span>${App.icon('award')} ${t.level}</span>
            <span>${App.icon('pin')} ${t.city}</span>
            <span>${App.icon('clock')} 司龄 ${t.tenure}年</span>
          </div>
          ${(() => { const m = MBTI_TYPES[t.mbti]; return m ? `<div style="margin-top:8px"><span class="mbti-badge" style="background:${m.bg};color:${m.color};font-size:0.78rem" title="${m.desc}">${t.mbti} · ${m.nickname}</span></div>` : ''; })()}
        </div>
        <span class="status-badge ${STATUS_MAP[t.status]?.class || 'status-available'}">${STATUS_MAP[t.status]?.label || '可流动'}</span>
      </div>

      <div class="chart-grid">
        <!-- 基本信息（HR系统同步） -->
        <div class="chart-card">
          <div class="card-header"><h3>📋 基本信息</h3><span class="chart-badge">HR系统同步</span></div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:0.85rem">
            <div><span style="color:var(--text-muted)">工号：</span>${t.empId}</div>
            <div><span style="color:var(--text-muted)">入职日期：</span>${t.joinDate}</div>
            <div><span style="color:var(--text-muted)">学历：</span>${t.education.degree} · ${t.education.major}</div>
            <div><span style="color:var(--text-muted)">毕业院校：</span>${t.education.school}</div>
            <div><span style="color:var(--text-muted)">最近绩效：</span><span class="tag tag-success">${latestPerf?.rating || '—'} (${latestPerf?.year || ''})</span></div>
            <div><span style="color:var(--text-muted)">联系方式：</span>${t.phone}</div>
            <div style="display:flex;align-items:center;gap:6px"><span style="color:var(--text-muted)">人格类型：</span>${(() => { const m = MBTI_TYPES[t.mbti]; return m ? `<span class="mbti-badge" style="background:${m.bg};color:${m.color}" title="${m.desc}">${t.mbti} · ${m.nickname}</span>` : '—'; })()}</div>
          </div>
          ${t.promotionRecords.length > 0 ? `
            <div style="margin-top:16px;padding-top:12px;border-top:1px solid var(--border-light)">
              <div style="font-size:0.8rem;font-weight:600;margin-bottom:8px">晋升记录</div>
              ${t.promotionRecords.map(r => `<div style="font-size:0.8rem;color:var(--text-secondary);padding:2px 0">${r.date} · ${r.from} → ${r.to}</div>`).join('')}
            </div>` : ''}
        </div>

        <!-- 能力标签云 -->
        <div class="chart-card">
          <div class="card-header"><h3>🏷️ 能力标签云</h3><button class="btn btn-text btn-sm" onclick="Employee.editSkills()">补充技能</button></div>
          <div class="skill-cloud">
            ${t.skills.map(s => `<span class="skill-cloud-item ${s.level}">${s.name}<span class="skill-source">${s.source === 'project' ? '项目' : '手动'}</span></span>`).join('')}
          </div>
          <div style="margin-top:16px;padding-top:12px;border-top:1px solid var(--border-light)">
            <div style="font-size:0.8rem;font-weight:600;margin-bottom:8px">项目经历</div>
            ${t.projects.map(p => `
              <div style="padding:8px 0;border-bottom:1px solid var(--border-light)">
                <div style="font-size:0.82rem;font-weight:500">${p.name} <span style="color:var(--text-muted);font-weight:400">· ${p.role}</span></div>
                <div style="font-size:0.75rem;color:var(--text-muted)">${p.period}</div>
                <div style="font-size:0.78rem;color:var(--text-secondary);margin-top:2px">${p.desc}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 职业意愿 -->
        <div class="chart-card">
          <div class="card-header"><h3>🎯 职业意愿</h3><button class="btn btn-text btn-sm" onclick="Employee.editPreferences()">编辑</button></div>
          <div style="font-size:0.85rem">
            <div style="padding:6px 0"><span style="color:var(--text-muted)">期望方向：</span>${t.careerPreferences.desiredDirection}</div>
            <div style="padding:6px 0"><span style="color:var(--text-muted)">期望岗位：</span>${t.careerPreferences.desiredRoles.join('、')}</div>
            <div style="padding:6px 0"><span style="color:var(--text-muted)">愿意城市：</span>${t.careerPreferences.willingCities.join('、')}</div>
            <div style="padding:6px 0"><span style="color:var(--text-muted)">接受异地：</span>${t.careerPreferences.openToRelocation ? '✅ 是' : '❌ 否'}</div>
          </div>
          <div style="margin-top:12px;padding:12px;background:var(--primary-lighter);border-radius:var(--radius-md);font-size:0.78rem;color:var(--text-secondary)">
            ${App.icon('lock')} 以上信息仅用于匹配算法，不对任何经理和HR公开
          </div>
        </div>

        <!-- 隐私控制面板 -->
        <div class="chart-card">
          <div class="card-header"><h3>🔒 隐私控制面板</h3></div>
          <div class="privacy-toggle">
            <div>
              <div class="privacy-toggle-label">对当前主管隐藏求职状态</div>
              <div class="privacy-toggle-desc">开启后，您的主管无法看到您的流动意愿</div>
            </div>
            <div class="toggle-switch ${t.privacySettings.hideFromManager ? 'on' : ''}" onclick="Employee.togglePrivacy('hideFromManager', this)"></div>
          </div>
          <div class="privacy-toggle">
            <div>
              <div class="privacy-toggle-label">部门白名单</div>
              <div class="privacy-toggle-desc">仅对这些部门可见：${t.privacySettings.deptWhitelist.join('、') || '未设置'}</div>
            </div>
            <button class="btn btn-text btn-sm" onclick="Employee.editDeptList('whitelist')">编辑</button>
          </div>
          <div class="privacy-toggle">
            <div>
              <div class="privacy-toggle-label">部门黑名单</div>
              <div class="privacy-toggle-desc">对这些部门不可见：${t.privacySettings.deptBlacklist.join('、') || '未设置'}</div>
            </div>
            <button class="btn btn-text btn-sm" onclick="Employee.editDeptList('blacklist')">编辑</button>
          </div>
        </div>
      </div>

      <!-- 画像评分 -->
      <div class="card">
        <div class="card-header"><h3>📊 职场画像评分</h3></div>
        <div class="match-breakdown">
          <div class="match-breakdown-item">
            <div class="match-breakdown-label">学习敏锐度</div>
            <div class="match-breakdown-score" style="color:${App.scoreColor(t.learningAgility)}">${t.learningAgility}</div>
            <div class="match-breakdown-bar"><div class="match-breakdown-fill" style="width:${t.learningAgility}%;background:${App.scoreColor(t.learningAgility)}"></div></div>
          </div>
          ${Object.entries(t.cultureFit).map(([key, val]) => `
            <div class="match-breakdown-item">
              <div class="match-breakdown-label">${({collaboration:'协作能力',innovation:'创新思维',ownership:'主人翁意识',adaptability:'适应能力'})[key]}</div>
              <div class="match-breakdown-score" style="color:${App.scoreColor(val)}">${val}</div>
              <div class="match-breakdown-bar"><div class="match-breakdown-fill" style="width:${val}%;background:${App.scoreColor(val)}"></div></div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  togglePrivacy(key, el) {
    const t = Store.getTalent(App.currentTalentId);
    const current = t.privacySettings[key];
    Store.updateTalent(App.currentTalentId, {
      privacySettings: { ...t.privacySettings, [key]: !current }
    });
    el.classList.toggle('on');
    App.toast(!current ? '已开启隐私保护' : '已关闭隐私保护', 'success');
  },

  _newSkills: [],

  editSkills() {
    const t = Store.getTalent(App.currentTalentId);
    this._newSkills = [];
    App.openModal('补充技能标签', `
      <div class="form-group">
        <label>当前技能</label>
        <div class="skill-cloud" style="margin-bottom:12px">
          ${t.skills.map(s => `<span class="skill-cloud-item ${s.level}">${s.name}</span>`).join('')}
        </div>
      </div>
      <div class="form-group">
        <label>添加新技能</label>
        <div class="tag-input-wrap" id="skillInputWrap">
          <div class="tag-list" id="skillTagList"></div>
          <input type="text" id="skillInput" placeholder="输入技能后回车添加">
        </div>
      </div>
      <div class="form-group">
        <label>熟练度</label>
        <select id="skillLevel">
          <option value="beginner">初级</option>
          <option value="intermediate" selected>中级</option>
          <option value="expert">高级</option>
        </select>
      </div>
      <div class="modal-footer" style="border:none;padding:0">
        <button class="btn btn-ghost" onclick="App.closeModal()">取消</button>
        <button class="btn btn-primary" onclick="Employee.saveSkills()">保存</button>
      </div>
    `);
    const input = document.getElementById('skillInput');
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && input.value.trim()) {
        e.preventDefault();
        this._newSkills.push({ name: input.value.trim(), level: document.getElementById('skillLevel').value, source: 'manual' });
        input.value = '';
        this._refreshSkillTags();
      }
    });
    this._refreshSkillTags();
  },

  _refreshSkillTags() {
    const container = document.getElementById('skillTagList');
    if (!container) return;
    container.innerHTML = this._newSkills.map((s, i) =>
      `<span class="tag-chip">${s.name}<button type="button" onclick="Employee._newSkills.splice(${i},1);Employee._refreshSkillTags()">×</button></span>`
    ).join('');
  },

  saveSkills() {
    const t = Store.getTalent(App.currentTalentId);
    const updated = [...t.skills, ...Employee._newSkills];
    Store.updateTalent(App.currentTalentId, { skills: updated });
    App.closeModal();
    App.toast('技能已更新', 'success');
    this.profile();
  },

  editPreferences() {
    const t = Store.getTalent(App.currentTalentId);
    const prefs = t.careerPreferences;
    App.openModal('编辑职业意愿', `
      <div class="form-group">
        <label>期望方向</label>
        <input type="text" id="prefDirection" value="${prefs.desiredDirection}">
      </div>
      <div class="form-group">
        <label>期望岗位（逗号分隔）</label>
        <input type="text" id="prefRoles" value="${prefs.desiredRoles.join(', ')}">
      </div>
      <div class="form-group">
        <label>愿意去的城市（逗号分隔）</label>
        <input type="text" id="prefCities" value="${prefs.willingCities.join(', ')}">
      </div>
      <div class="form-group">
        <label>是否接受异地转岗</label>
        <select id="prefRelocation">
          <option value="true" ${prefs.openToRelocation ? 'selected' : ''}>是</option>
          <option value="false" ${!prefs.openToRelocation ? 'selected' : ''}>否</option>
        </select>
      </div>
      <div style="padding:12px;background:var(--primary-lighter);border-radius:var(--radius-md);font-size:0.78rem;color:var(--text-secondary);margin-bottom:16px">
        ${App.icon('lock')} 以上信息仅用于匹配算法，不对任何经理和HR公开
      </div>
      <div class="modal-footer" style="border:none;padding:0">
        <button class="btn btn-ghost" onclick="App.closeModal()">取消</button>
        <button class="btn btn-primary" onclick="Employee.savePreferences()">保存</button>
      </div>
    `);
  },

  savePreferences() {
    const t = Store.getTalent(App.currentTalentId);
    Store.updateTalent(App.currentTalentId, {
      careerPreferences: {
        desiredDirection: document.getElementById('prefDirection').value.trim(),
        desiredRoles: document.getElementById('prefRoles').value.split(',').map(s => s.trim()).filter(Boolean),
        willingCities: document.getElementById('prefCities').value.split(',').map(s => s.trim()).filter(Boolean),
        openToRelocation: document.getElementById('prefRelocation').value === 'true',
      },
      desiredDept: t.careerPreferences.desiredDirection,
    });
    App.closeModal();
    App.toast('职业意愿已更新', 'success');
    this.profile();
  },

  editDeptList(type) {
    const t = Store.getTalent(App.currentTalentId);
    const current = t.privacySettings[`${type}`];
    App.openModal(`编辑部门${type === 'whitelist' ? '白名单' : '黑名单'}`, `
      <div class="form-group">
        <label>选择部门</label>
        <div style="display:flex;flex-wrap:wrap;gap:8px">
          ${DEPARTMENTS.map(d => `
            <label style="display:flex;align-items:center;gap:4px;font-size:0.85rem;cursor:pointer;padding:6px 12px;border:1.5px solid var(--border);border-radius:var(--radius-md)">
              <input type="checkbox" value="${d}" ${current.includes(d) ? 'checked' : ''} style="margin:0"> ${d}
            </label>
          `).join('')}
        </div>
      </div>
      <div class="modal-footer" style="border:none;padding:0">
        <button class="btn btn-ghost" onclick="App.closeModal()">取消</button>
        <button class="btn btn-primary" onclick="Employee.saveDeptList('${type}')">保存</button>
      </div>
    `);
  },

  saveDeptList(type) {
    const t = Store.getTalent(App.currentTalentId);
    const selected = Array.from(document.querySelectorAll('#modalBody input[type=checkbox]:checked')).map(cb => cb.value);
    Store.updateTalent(App.currentTalentId, {
      privacySettings: { ...t.privacySettings, [type]: selected }
    });
    App.closeModal();
    App.toast('已更新', 'success');
    this.profile();
  },

  // ==================== 申请中心 ====================
  applications() {
    const apps = Store.getApplicationsByTalent(App.currentTalentId);
    const c = document.getElementById('viewContainer');
    c.innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <h2>我的申请中心</h2>
          <span class="page-subtitle">追踪所有活水申请进度</span>
        </div>
      </div>
      ${apps.length === 0 ? `
        <div class="empty-state">
          ${App.icon('empty')}
          <p>暂无申请记录</p>
          <button class="btn btn-primary" style="margin-top:16px" onclick="App.navigate('emp-plaza')">浏览机会广场</button>
        </div>
      ` : apps.map(app => this.applicationCard(app)).join('')}
    `;
  },

  applicationCard(app) {
    const p = Store.getPosition(app.positionId);
    const status = STATUS_MAP[app.status] || STATUS_MAP.screening;
    const completedSteps = app.timeline.filter(t => t.status === 'completed').length;
    const totalSteps = app.timeline.length;
    const progress = Math.round((completedSteps / totalSteps) * 100);

    return `
      <div class="card section-gap">
        <div class="card-header">
          <div style="display:flex;align-items:center;gap:12px">
            <div class="cell-avatar" style="width:40px;height:40px;font-size:0.9rem">${p.dept.charAt(0)}</div>
            <div>
              <div style="font-weight:600;font-size:0.95rem">${p.title}</div>
              <div style="font-size:0.78rem;color:var(--text-muted)">${p.dept} · ${p.location} · 申请于 ${app.applyDate}</div>
            </div>
          </div>
          <span class="status-badge ${status.class}">${status.label}</span>
        </div>

        <!-- 进度条 -->
        <div style="margin-bottom:20px">
          <div style="display:flex;justify-content:space-between;font-size:0.78rem;color:var(--text-muted);margin-bottom:6px">
            <span>进度 ${progress}%</span>
            <span>${completedSteps}/${totalSteps} 步</span>
          </div>
          <div style="height:8px;background:var(--border);border-radius:4px;overflow:hidden">
            <div style="height:100%;width:${progress}%;background:var(--primary-darker);border-radius:4px;transition:width 0.5s"></div>
          </div>
        </div>

        <div class="chart-grid" style="grid-template-columns:1fr 1fr">
          <!-- 时间线 -->
          <div>
            <div style="font-weight:600;font-size:0.88rem;margin-bottom:16px">📋 流程进度</div>
            <div class="timeline">
              ${app.timeline.map(t => `
                <div class="timeline-item">
                  <div class="timeline-dot ${t.status}">${t.status === 'completed' ? '✓' : t.status === 'current' ? '●' : ''}</div>
                  <div class="timeline-title">${t.stage}</div>
                  <div class="timeline-date">${t.date || '待定'}</div>
                  ${t.note ? `<div class="timeline-note">${t.note}</div>` : ''}
                </div>
              `).join('')}
            </div>
          </div>

          <!-- 面试反馈 -->
          <div>
            <div style="font-weight:600;font-size:0.88rem;margin-bottom:16px">💬 面试反馈记录</div>
            ${app.interviews.length === 0
              ? '<p style="color:var(--text-muted);font-size:0.85rem;padding:12px 0">暂无面试记录</p>'
              : app.interviews.map(iv => `
                <div class="interview-card">
                  <div class="interview-card-header">
                    <span class="interview-round">${iv.round}</span>
                    <div class="interview-rating">
                      ${[1,2,3,4,5].map(i => `<span class="star ${i <= Math.round(iv.rating) ? '' : 'empty'}">${App.icon('star')}</span>`).join('')}
                      <span style="font-size:0.78rem;color:var(--text-muted);margin-left:4px">${iv.rating}</span>
                    </div>
                  </div>
                  <div class="interview-comment">"${iv.comment}"</div>
                  <div class="interview-meta">面试官：${iv.interviewer} · ${iv.date} · ${iv.passed ? '<span style="color:var(--success)">通过</span>' : '<span style="color:var(--danger)">未通过</span>'}</div>
                </div>
              `).join('')
            }
          </div>
        </div>

        <!-- 通知提醒 -->
        ${app.notifications && app.notifications.length > 0 ? `
          <div style="margin-top:16px;padding-top:16px;border-top:1px solid var(--border-light)">
            <div style="font-weight:600;font-size:0.85rem;margin-bottom:10px">🔔 状态提醒</div>
            ${app.notifications.map(n => `
              <div class="notif-item" style="border:1px solid var(--border-light);margin-bottom:6px">
                <div class="notif-icon ${n.type}">${n.type === 'success' ? '✓' : 'i'}</div>
                <div class="notif-content">
                  <div class="notif-text">${n.message}</div>
                  <div class="notif-time">${n.time}</div>
                </div>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <div style="margin-top:16px;display:flex;gap:8px">
          <button class="btn btn-ghost btn-sm" onclick="Employee.viewPosition(${p.id})">查看岗位详情</button>
          ${app.status === 'offer' ? `<button class="btn btn-success btn-sm" onclick="Employee.acceptOffer(${app.id})">接受 Offer</button>` : ''}
          ${!['completed', 'rejected'].includes(app.status) ? `<button class="btn btn-ghost btn-sm" onclick="Employee.withdrawApp(${app.id})" style="color:var(--danger)">撤回申请</button>` : ''}
        </div>
      </div>
    `;
  },

  acceptOffer(appId) {
    const app = Store.getApplication(appId);
    const p = Store.getPosition(app.positionId);
    App.confirm('确认接受 Offer？', `您将转入「${p.title}」岗位，转岗交接流程将启动。`, () => {
      Store.updateApplication(appId, {
        status: 'transfer',
        timeline: app.timeline.map((t, i) => i === 2 ? { ...t, status: 'completed', date: new Date().toISOString().slice(0, 10) } : i === 3 ? { ...t, status: 'current' } : t),
      });
      Store.updateTalent(app.talentId, { status: 'matched' });
      App.toast('已接受 Offer，转岗交接即将启动', 'success');
      this.applications();
    }, '确认接受');
  },

  withdrawApp(appId) {
    App.confirm('确认撤回申请？', '撤回后不可恢复，面试反馈将沉淀为您的成长记录。', () => {
      const apps = Store.getApplications();
      const app = apps.find(a => a.id === appId);
      Store.updateApplication(appId, { status: 'rejected' });
      // 如果没有其他活跃申请，恢复状态
      const active = Store.getApplicationsByTalent(app.talentId).filter(a => !['completed', 'rejected'].includes(a.status));
      if (active.length === 0) Store.updateTalent(app.talentId, { status: 'available' });
      App.toast('申请已撤回', 'success');
      this.applications();
    }, '确认撤回');
  },

  // ==================== 邀请好友 ====================
  invite() {
    const c = document.getElementById('viewContainer');
    const me = Store.getTalent(App.currentTalentId);
    const myInvites = Store.getInvitations().filter(i => i.createdBy === me.name);
    const baseUrl = `${location.origin}${location.pathname.replace(/index\.html$/, '')}invite.html`;

    c.innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <h2>邀请好友加入活水平台</h2>
          <span class="page-subtitle">生成专属邀请链接，邀请同事一起来探索内部机会</span>
        </div>
      </div>

      <div class="card" style="margin-bottom:20px">
        <div style="display:flex;align-items:flex-start;gap:16px;margin-bottom:16px">
          <div style="width:48px;height:48px;border-radius:50%;background:var(--primary-light);display:flex;align-items:center;justify-content:center;color:var(--primary-darker)">
            ${App.icon('invite').replace(/width="20" height="20"/, 'width="24" height="24"')}
          </div>
          <div>
            <h3 style="margin:0 0 6px;font-size:1.05rem">你的专属邀请</h3>
            <p style="margin:0;color:var(--text-secondary);font-size:0.85rem">每成功邀请 1 位好友加入，你们都将解锁更多活水匹配权益。</p>
          </div>
        </div>

        <div id="inviteLinkBox" style="display:none;flex-direction:column;gap:12px">
          <div style="display:flex;gap:8px;align-items:center">
            <input type="text" id="inviteLinkInput" readonly style="flex:1;padding:10px 12px;border:1px solid var(--border);border-radius:var(--radius-md);background:var(--bg-light);font-size:0.85rem">
            <button class="btn btn-primary" onclick="Employee.copyInviteLink()">复制链接</button>
          </div>
          <div style="display:flex;gap:8px;align-items:center">
            <span style="font-size:0.8rem;color:var(--text-muted)">邀请码：</span>
            <code id="inviteCodeDisplay" style="padding:4px 8px;background:var(--primary-light);color:var(--primary-darker);border-radius:var(--radius-sm);font-size:0.85rem"></code>
          </div>
        </div>

        <div id="inviteGenerateBox" style="display:flex;gap:12px;align-items:center;margin-top:8px">
          <button class="btn btn-primary" onclick="Employee.generateInvite()">生成邀请链接</button>
          <span style="font-size:0.8rem;color:var(--text-muted)">生成的链接有效期 7 天，可邀请 5 人</span>
        </div>
      </div>

      <div class="card">
        <h3 style="margin:0 0 16px;font-size:1rem">我邀请的好友</h3>
        ${myInvites.length === 0 ? `
          <div class="empty-state" style="padding:32px 0">
            ${App.icon('empty')}
            <p>还没有邀请记录</p>
          </div>
        ` : `
          <div class="table-wrap">
            <table class="data-table">
              <thead><tr><th>邀请码</th><th>生成时间</th><th>已使用/上限</th><th>状态</th><th>受邀人</th></tr></thead>
              <tbody>
                ${myInvites.map(i => `
                  <tr>
                    <td><code>${i.code}</code></td>
                    <td>${i.createdAt}</td>
                    <td>${i.usedCount}/${i.maxUses || '∞'}</td>
                    <td><span class="status-badge ${i.status === 'active' ? 'status-open' : i.status === 'expired' ? 'status-closed' : 'status-screening'}">${i.status === 'active' ? '有效' : i.status === 'expired' ? '已满' : '已撤销'}</span></td>
                    <td>${i.usedBy?.length ? i.usedBy.map(u => `员工#${u.talentId}`).join('、') : '—'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    `;
  },

  generateInvite() {
    const me = Store.getTalent(App.currentTalentId);
    const invite = Store.addInvitation({
      createdBy: me.name,
      inviterTalentId: me.id,
      role: 'employee',
      maxUses: 5,
      expireAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    });
    if (!invite) { App.toast('生成失败，请重试', 'error'); return; }

    const baseUrl = `${location.origin}${location.pathname.replace(/index\.html$/, '')}invite.html`;
    const link = `${baseUrl}?code=${invite.code}`;
    document.getElementById('inviteLinkInput').value = link;
    document.getElementById('inviteCodeDisplay').textContent = invite.code;
    document.getElementById('inviteLinkBox').style.display = 'flex';
    document.getElementById('inviteGenerateBox').style.display = 'none';
    App.toast('邀请链接已生成', 'success');
  },

  copyInviteLink() {
    const input = document.getElementById('inviteLinkInput');
    input.select();
    navigator.clipboard?.writeText(input.value).then(() => App.toast('链接已复制', 'success')).catch(() => App.toast('复制失败，请手动复制', 'warning'));
  },
};
