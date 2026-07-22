/**
 * 管理驾驶舱 — 运营中心与数据洞察
 * 包含：健康仪表盘、流动热力图、规则配置、运营促活、成长赋能、活水社区
 */
const Admin = {

  // ==================== 健康驾驶舱 ====================
  dashboard() {
    const m = Store.getMetrics();
    const talents = Store.getTalents();
    const positions = Store.getPositions();
    const apps = Store.getApplications();
    const c = document.getElementById('viewContainer');

    c.innerHTML = `
      <!-- 核心指标 -->
      <div class="stat-cards" id="statCards"></div>

      <!-- 图表区 -->
      <div class="chart-grid">
        <div class="chart-card chart-lg">
          <div class="chart-header"><h3>月度活水趋势</h3><span class="chart-badge">近6个月</span></div>
          <div class="chart-body"><canvas id="trendChart"></canvas></div>
        </div>
        <div class="chart-card">
          <div class="chart-header"><h3>匹配状态分布</h3></div>
          <div class="chart-body"><canvas id="statusChart"></canvas></div>
        </div>
        <div class="chart-card chart-lg">
          <div class="chart-header"><h3>各部门人才分布</h3></div>
          <div class="chart-body"><canvas id="deptChart"></canvas></div>
        </div>
        <div class="chart-card">
          <div class="chart-header"><h3>热门技能 TOP5</h3></div>
          <div class="chart-body"><canvas id="skillChart"></canvas></div>
        </div>
      </div>

      <!-- 最近动态 -->
      <div class="card">
        <div class="card-header"><h3>最近匹配动态</h3></div>
        <div id="activityList"></div>
      </div>
    `;

    // 渲染指标卡
    const cards = [
      { label: '内部申请率', value: m.internalApplyRate + '%', icon: 'trend', accent: '#5B8FA8', bg: '#EDF4F8', trend: '+3.2%', up: true },
      { label: '活水渗透率', value: m.mobilityPenetration + '%', icon: 'link', accent: '#4CAF7C', bg: '#E8F6EE', trend: '+1.8%', up: true },
      { label: '平均转岗周期', value: m.avgTransferCycle + '天', icon: 'clock', accent: '#E8A838', bg: '#FDF3E2', trend: '-3天', up: true },
      { label: '试用期通过率', value: m.trialPassRate + '%', icon: 'check', accent: '#4CAF7C', bg: '#E8F6EE', trend: '+1%', up: true },
      { label: '一年留存率', value: m.retentionRate + '%', icon: 'people', accent: '#6BAED6', bg: '#E8F2FA', trend: '+2%', up: true },
      { label: '累计活水人次', value: m.totalMobility, icon: 'award', accent: '#9B8FD4', bg: '#EFEDF8', trend: '+22', up: true },
    ];
    document.getElementById('statCards').innerHTML = cards.map(card => `
      <div class="stat-card" style="--card-accent:${card.accent};--card-icon-bg:${card.bg}">
        <div class="stat-card-icon" style="color:${card.accent}">${App.icon(card.icon)}</div>
        <div class="stat-card-label">${card.label}</div>
        <div class="stat-card-value">${card.value}</div>
        <div class="stat-card-trend ${card.up ? 'trend-up' : 'trend-down'}">${card.up ? '↑' : '↓'} ${card.trend} 较上月</div>
      </div>
    `).join('');

    // 图表
    this.renderTrendChart(m);
    this.renderStatusChart(talents);
    this.renderDeptChart(talents);
    this.renderSkillChart(talents);
    this.renderActivityList(apps);
  },

  renderTrendChart(m) {
    const ctx = document.getElementById('trendChart').getContext('2d');
    App.charts.trend = new Chart(ctx, {
      type: 'line',
      data: {
        labels: m.trends.months,
        datasets: [
          { label: '申请人数', data: m.trends.applied, borderColor: '#A8C4D4', backgroundColor: 'rgba(168,196,212,0.15)', fill: true, tension: 0.4, borderWidth: 2.5, pointRadius: 4, pointBackgroundColor: '#fff', pointBorderColor: '#5B8FA8', pointBorderWidth: 2 },
          { label: '成功匹配', data: m.trends.matched, borderColor: '#4CAF7C', backgroundColor: 'rgba(76,175,124,0.1)', fill: true, tension: 0.4, borderWidth: 2.5, pointRadius: 4, pointBackgroundColor: '#fff', pointBorderColor: '#4CAF7C', pointBorderWidth: 2 },
          { label: '完成转岗', data: m.trends.completed, borderColor: '#E8A838', backgroundColor: 'rgba(232,168,56,0.08)', fill: true, tension: 0.4, borderWidth: 2.5, pointRadius: 4, pointBackgroundColor: '#fff', pointBorderColor: '#E8A838', pointBorderWidth: 2 },
        ]
      },
      options: this.chartOpts({ legend: true })
    });
  },

  renderStatusChart(talents) {
    const ctx = document.getElementById('statusChart').getContext('2d');
    const counts = { available: 0, matching: 0, matched: 0, completed: 0 };
    talents.forEach(t => { if (counts[t.status] !== undefined) counts[t.status]++; });
    App.charts.status = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['可流动', '匹配中', '已匹配', '已转岗'],
        datasets: [{ data: [counts.available, counts.matching, counts.matched, counts.completed], backgroundColor: ['#6BAED6', '#E8A838', '#5B8FA8', '#4CAF7C'], borderWidth: 0, spacing: 4 }]
      },
      options: { responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { position: 'bottom', labels: { padding: 12, font: { size: 12, family: 'Noto Sans SC' } } } } }
    });
  },

  renderDeptChart(talents) {
    const ctx = document.getElementById('deptChart').getContext('2d');
    const deptCount = {};
    talents.forEach(t => { deptCount[t.currentDept] = (deptCount[t.currentDept] || 0) + 1; });
    App.charts.dept = new Chart(ctx, {
      type: 'bar',
      data: { labels: Object.keys(deptCount), datasets: [{ data: Object.values(deptCount), backgroundColor: '#A8C4D4', hoverBackgroundColor: '#7FA8BE', borderRadius: 6, maxBarThickness: 40 }] },
      options: this.chartOpts({ legend: false, indexAxis: 'y' })
    });
  },

  renderSkillChart(talents) {
    const ctx = document.getElementById('skillChart').getContext('2d');
    const skillCount = {};
    talents.forEach(t => t.skills.forEach(s => { skillCount[s.name] = (skillCount[s.name] || 0) + 1; }));
    const sorted = Object.entries(skillCount).sort((a, b) => b[1] - a[1]).slice(0, 5);
    App.charts.skill = new Chart(ctx, {
      type: 'bar',
      data: { labels: sorted.map(s => s[0]), datasets: [{ data: sorted.map(s => s[1]), backgroundColor: ['#5B8FA8', '#7FA8BE', '#A8C4D4', '#C5DCE8', '#D4E5EE'], borderRadius: 6, maxBarThickness: 36 }] },
      options: this.chartOpts({ legend: false })
    });
  },

  chartOpts({ legend = false, indexAxis = 'x' } = {}) {
    return {
      responsive: true, maintainAspectRatio: false, indexAxis,
      plugins: { legend: legend ? { display: true, position: 'top', labels: { padding: 12, font: { size: 12, family: 'Noto Sans SC' }, usePointStyle: true } } : { display: false } },
      scales: {
        x: { grid: { display: indexAxis === 'y' }, ticks: { font: { size: 11, family: 'Noto Sans SC' }, color: '#8A99A8' } },
        y: { grid: { color: '#EDF1F5' }, ticks: { font: { size: 11, family: 'Noto Sans SC' }, color: '#8A99A8', precision: 0 } }
      }
    };
  },

  renderActivityList(apps) {
    const list = document.getElementById('activityList');
    // 按申请时间倒序，最多 6 条
    const recent = apps
      .slice()
      .sort((a, b) => (b.applyDate || '').localeCompare(a.applyDate || ''))
      .slice(0, 6);
    if (recent.length === 0) {
      list.innerHTML = '<div class="activity-empty">暂无匹配动态</div>';
      return;
    }
    // 头像渐变色：按姓名 hash 选 6 种之一，避免单调
    const avatarGradients = [
      'linear-gradient(135deg, #5B8FA8 0%, #7FA8BE 100%)',
      'linear-gradient(135deg, #4CAF7C 0%, #6BC992 100%)',
      'linear-gradient(135deg, #E8A838 0%, #F0C26C 100%)',
      'linear-gradient(135deg, #9B8FD4 0%, #B8AEE3 100%)',
      'linear-gradient(135deg, #6BAED6 0%, #8FC4E0 100%)',
      'linear-gradient(135deg, #D88A7E 0%, #E5A89C 100%)',
    ];

    list.innerHTML = recent.map(app => {
      const t = Store.getTalent(app.talentId);
      const p = Store.getPosition(app.positionId);
      const status = STATUS_MAP[app.status] || STATUS_MAP.screening;
      const match = (t && p) ? calculateMatch(t, p) : { score: 0, hardScore: 0, potentialScore: 0, cultureScore: 0, reasons: [] };
      const sc = App.scoreColor(match.score);
      const statusBg = status.color + '1A';
      const statusColor = status.color;
      const avatarBg = t ? avatarGradients[(t.name.charCodeAt(0) || 0) % avatarGradients.length] : 'var(--primary)';
      const reasonTag = match.reasons && match.reasons[0] ? match.reasons[0] : '需关注';
      const actionLabel = ({
        screening: '查看初筛', interviewing: '安排面试', offer: '推进 Offer', transfer: '跟进交接', rejected: '查看详情',
      })[app.status] || '查看详情';

      return `
        <div class="activity-item" onclick="Manager.openAppDetail(${app.id})">
          <div class="activity-avatar" style="background:${avatarBg}">${t?.avatar || '?'}</div>
          <div class="activity-content">
            <div class="activity-row1">
              <span class="activity-name">${t?.name || '未知'}</span>
              <span class="activity-empid">${t?.empId || ''}</span>
              ${(() => { const m = t?.mbti ? MBTI_TYPES[t.mbti] : null; return m ? `<span class="mbti-badge" style="background:${m.bg};color:${m.color};font-size:0.65rem;padding:1px 6px" title="${m.desc}">${t.mbti}</span>` : ''; })()}
              <span class="activity-status" style="color:${statusColor};background:${statusBg}">${status.label}</span>
            </div>
            <div class="activity-flow">
              ${t?.currentDept || '未知部门'} · ${t?.currentPosition || ''}
              <span class="flow-arrow">→</span>
              ${p?.title || '未知岗位'}
            </div>
            <div class="activity-row2">
              <span class="activity-time">申请于 ${app.applyDate}</span>
              <span style="color:var(--text-muted)">·</span>
              <span style="color:var(--primary-darker)">${reasonTag}</span>
            </div>
          </div>
          <div class="activity-dim" title="硬性 / 潜力 / 文化">
            <div class="activity-dim-row">
              <span>硬性</span>
              <div class="activity-dim-bar"><div class="activity-dim-fill" style="width:${match.hardScore}%;background:#5B8FA8"></div></div>
              <span class="activity-dim-val">${match.hardScore}</span>
            </div>
            <div class="activity-dim-row">
              <span>潜力</span>
              <div class="activity-dim-bar"><div class="activity-dim-fill" style="width:${match.potentialScore}%;background:#4CAF7C"></div></div>
              <span class="activity-dim-val">${match.potentialScore}</span>
            </div>
            <div class="activity-dim-row">
              <span>文化</span>
              <div class="activity-dim-bar"><div class="activity-dim-fill" style="width:${match.cultureScore}%;background:#E8A838"></div></div>
              <span class="activity-dim-val">${match.cultureScore}</span>
            </div>
          </div>
          <div class="activity-score" style="color:${sc};background:${sc}12">
            <div class="activity-score-num">${match.score}</div>
            <div class="activity-score-label">综合分</div>
          </div>
          <button class="activity-action" onclick="event.stopPropagation();Manager.openAppDetail(${app.id})">${actionLabel}</button>
        </div>
      `;
    }).join('');
  },

  // ==================== 流动热力图 ====================
  heatmap() {
    const flow = Store.getDeptFlow();
    const c = document.getElementById('viewContainer');

    // 构建部门间流动矩阵
    const matrix = {};
    DEPARTMENTS.forEach(d1 => {
      DEPARTMENTS.forEach(d2 => {
        if (d1 !== d2) {
          const item = flow.matrix.find(m => m.from === d1 && m.to === d2);
          matrix[`${d1}-${d2}`] = item ? item.count : 0;
        }
      });
    });

    const maxCount = Math.max(...Object.values(matrix), 1);

    const getColor = (count) => {
      if (count === 0) return 'var(--border-light)';
      const intensity = count / maxCount;
      if (intensity > 0.75) return '#5B8FA8';
      if (intensity > 0.5) return '#7FA8BE';
      if (intensity > 0.25) return '#A8C4D4';
      return '#D4E5EE';
    };

    c.innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <h2>人才流动热力图</h2>
          <span class="page-subtitle">各部门人才流入/流出情况，识别人才流失风险与积压</span>
        </div>
      </div>

      <!-- 流入流出概览 -->
      <div class="stat-cards" style="margin-bottom:20px">
        ${flow.summary.map(s => {
          const isRisk = s.net < 0;
          const isSurplus = s.net > 2;
          return `
            <div class="stat-card" style="--card-accent:${isRisk ? 'var(--danger)' : isSurplus ? 'var(--warning)' : 'var(--success)'};--card-icon-bg:${isRisk ? 'var(--danger-light)' : isSurplus ? 'var(--warning-light)' : 'var(--success-light)'}">
              <div class="stat-card-icon" style="color:${isRisk ? 'var(--danger)' : isSurplus ? 'var(--warning)' : 'var(--success)'}">${App.icon('people')}</div>
              <div class="stat-card-label">${s.dept}</div>
              <div style="display:flex;gap:16px;margin:4px 0">
                <div><span style="font-size:0.75rem;color:var(--text-muted)">流入</span><div style="font-size:1.3rem;font-weight:700;color:var(--success)">${s.inflow}</div></div>
                <div><span style="font-size:0.75rem;color:var(--text-muted)">流出</span><div style="font-size:1.3rem;font-weight:700;color:var(--danger)">${s.outflow}</div></div>
              </div>
              <div class="stat-card-trend ${s.net >= 0 ? 'trend-up' : 'trend-down'}">净${s.net >= 0 ? '流入' : '流出'} ${Math.abs(s.net)}人 ${isRisk ? '⚠️ 流失风险' : isSurplus ? '📦 人才积压' : ''}</div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- 热力图矩阵 -->
      <div class="card section-gap">
        <div class="card-header">
          <h3>部门间流动矩阵</h3>
          <span class="chart-badge">行=来源部门，列=目标部门</span>
        </div>
        <div style="overflow-x:auto">
          <div class="heatmap-grid" style="min-width:900px">
            <div class="heatmap-header">来源 \ 目标</div>
            ${DEPARTMENTS.map(d => `<div class="heatmap-header">${d.slice(0, 2)}</div>`).join('')}
            ${DEPARTMENTS.map(d1 => `
              <div class="heatmap-row-label">${d1}</div>
              ${DEPARTMENTS.map(d2 => {
                if (d1 === d2) return '<div class="heatmap-cell empty">—</div>';
                const count = matrix[`${d1}-${d2}`];
                return `<div class="heatmap-cell" style="background:${getColor(count)};color:${count > 0 ? '#fff' : 'transparent'}" title="${d1} → ${d2}: ${count}人">${count || ''}</div>`;
              }).join('')}
            `).join('')}
          </div>
        </div>
        <div class="heatmap-legend">
          <span>低</span>
          <div class="heatmap-legend-bar">
            <span style="background:#D4E5EE"></span>
            <span style="background:#A8C4D4"></span>
            <span style="background:#7FA8BE"></span>
            <span style="background:#5B8FA8"></span>
          </div>
          <span>高</span>
        </div>
      </div>

      <!-- 关键流动路径 -->
      <div class="card">
        <div class="card-header"><h3>关键流动路径 TOP5</h3></div>
        ${flow.matrix.sort((a, b) => b.count - a.count).slice(0, 5).map(m => `
          <div class="activity-item">
            <div class="activity-avatar" style="background:var(--primary-light);color:var(--primary-darker)">${m.from.charAt(0)}</div>
            <div class="activity-content">
              <div class="activity-text"><strong>${m.from}</strong> → <strong>${m.to}</strong></div>
              <div class="activity-time">${m.count} 人流动</div>
            </div>
            <div style="width:120px;height:8px;background:var(--border);border-radius:4px;overflow:hidden;margin-right:12px">
              <div style="height:100%;width:${(m.count / maxCount) * 100}%;background:var(--primary-darker);border-radius:4px"></div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  // ==================== 规则配置中心 ====================
  rules() {
    const c = document.getElementById('viewContainer');
    c.innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <h2>规则配置中心</h2>
          <span class="page-subtitle">灵活设置活水规则、保密策略与竞业脱敏期</span>
        </div>
      </div>

      <div class="chart-grid">
        <!-- 准入规则 -->
        <div class="chart-card">
          <div class="card-header"><h3>📋 准入规则</h3></div>
          <div class="privacy-toggle">
            <div>
              <div class="privacy-toggle-label">最低司龄要求</div>
              <div class="privacy-toggle-desc">员工需满足最低司龄方可申请活水</div>
            </div>
            <select class="filter-select" style="width:80px" id="ruleTenure">
              <option ${MOBILITY_POLICY.minTenure === 1 ? 'selected' : ''}>1年</option>
              <option ${MOBILITY_POLICY.minTenure === 2 ? 'selected' : ''}>2年</option>
              <option ${MOBILITY_POLICY.minTenure === 3 ? 'selected' : ''}>3年</option>
            </select>
          </div>
          <div class="privacy-toggle">
            <div>
              <div class="privacy-toggle-label">最低绩效要求</div>
              <div class="privacy-toggle-desc">最近一次绩效需达到此等级</div>
            </div>
            <select class="filter-select" style="width:80px" id="rulePerf">
              <option value="A">A</option>
              <option value="B" ${MOBILITY_POLICY.minPerformance === 'B' ? 'selected' : ''}>B</option>
              <option value="C">C</option>
            </select>
          </div>
          <div class="privacy-toggle">
            <div>
              <div class="privacy-toggle-label">最大同时申请数</div>
              <div class="privacy-toggle-desc">员工同时可申请的岗位数量上限</div>
            </div>
            <select class="filter-select" style="width:80px" id="ruleMaxApp">
              <option ${MOBILITY_POLICY.maxConcurrent === 2 ? 'selected' : ''}>2</option>
              <option ${MOBILITY_POLICY.maxConcurrent === 3 ? 'selected' : ''}>3</option>
              <option ${MOBILITY_POLICY.maxConcurrent === 5 ? 'selected' : ''}>5</option>
            </select>
          </div>
        </div>

        <!-- 保密规则 -->
        <div class="chart-card">
          <div class="card-header"><h3>🔒 保密规则</h3></div>
          <div class="privacy-toggle">
            <div>
              <div class="privacy-toggle-label">申请对直属上级保密</div>
              <div class="privacy-toggle-desc">在员工确认接受offer前，申请信息对当前主管严格保密</div>
            </div>
            <div class="toggle-switch on" onclick="this.classList.toggle('on');App.toast('保密规则已更新','success')"></div>
          </div>
          <div class="privacy-toggle">
            <div>
              <div class="privacy-toggle-label">面试反馈仅本人可见</div>
              <div class="privacy-toggle-desc">面试评价仅对候选人本人和HR可见，不对任何经理公开</div>
            </div>
            <div class="toggle-switch on" onclick="this.classList.toggle('on');App.toast('保密规则已更新','success')"></div>
          </div>
          <div class="privacy-toggle">
            <div>
              <div class="privacy-toggle-label">录用需HRBP确认</div>
              <div class="privacy-toggle-desc">发起录用前须经对方HRBP确认，避免挖角冲突</div>
            </div>
            <div class="toggle-switch on" onclick="this.classList.toggle('on');App.toast('保密规则已更新','success')"></div>
          </div>
          <div class="privacy-toggle">
            <div>
              <div class="privacy-toggle-label">离职员工脱敏期</div>
              <div class="privacy-toggle-desc">离职后一定期限内不可查看内部岗位</div>
            </div>
            <select class="filter-select" style="width:100px"><option>3个月</option><option selected>6个月</option><option>12个月</option></select>
          </div>
        </div>

        <!-- 竞业与脱敏 -->
        <div class="chart-card chart-lg">
          <div class="card-header"><h3>🛡️ 竞业与脱敏期配置</h3></div>
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr><th>岗位类型</th><th>脱敏期</th><th>竞业限制</th><th>特殊审批</th><th>操作</th></tr>
              </thead>
              <tbody>
                <tr><td>核心研发岗位</td><td>3个月</td><td><span class="tag tag-warning">限制</span></td><td><span class="tag tag-danger">VP审批</span></td><td><button class="action-btn">${App.icon('edit')}</button></td></tr>
                <tr><td>管理岗位 (M2+)</td><td>2个月</td><td><span class="tag tag-warning">限制</span></td><td><span class="tag tag-danger">VP审批</span></td><td><button class="action-btn">${App.icon('edit')}</button></td></tr>
                <tr><td>财务/法务岗位</td><td>1个月</td><td><span class="tag">无</span></td><td><span class="tag tag-info">HR审批</span></td><td><button class="action-btn">${App.icon('edit')}</button></td></tr>
                <tr><td>一般职能岗位</td><td>无</td><td><span class="tag">无</span></td><td><span class="tag tag-success">免审批</span></td><td><button class="action-btn">${App.icon('edit')}</button></td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div style="margin-top:20px;display:flex;justify-content:flex-end;gap:10px">
        <button class="btn btn-ghost" onclick="App.toast('已重置为默认规则','info')">重置默认</button>
        <button class="btn btn-primary" onclick="App.toast('规则配置已保存','success')">保存配置</button>
      </div>
    `;
  },

  // ==================== 运营促活 ====================
  operations() {
    const c = document.getElementById('viewContainer');
    const community = Store.getCommunity();
    c.innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <h2>运营促活工具</h2>
          <span class="page-subtitle">定向推送、活动管理、标杆人物运营</span>
        </div>
      </div>

      <div class="chart-grid">
        <!-- 定向推送 -->
        <div class="chart-card chart-lg">
          <div class="card-header"><h3>📨 定向推送</h3></div>
          <div class="form-row">
            <div class="form-group">
              <label>推送渠道</label>
              <div style="display:flex;gap:8px;flex-wrap:wrap">
                <label style="display:flex;align-items:center;gap:4px;font-size:0.85rem;cursor:pointer;padding:6px 12px;border:1.5px solid var(--border);border-radius:var(--radius-md)"><input type="checkbox" checked> 站内信</label>
                <label style="display:flex;align-items:center;gap:4px;font-size:0.85rem;cursor:pointer;padding:6px 12px;border:1.5px solid var(--border);border-radius:var(--radius-md)"><input type="checkbox" checked> 企业微信</label>
                <label style="display:flex;align-items:center;gap:4px;font-size:0.85rem;cursor:pointer;padding:6px 12px;border:1.5px solid var(--border);border-radius:var(--radius-md)"><input type="checkbox"> 邮件</label>
                <label style="display:flex;align-items:center;gap:4px;font-size:0.85rem;cursor:pointer;padding:6px 12px;border:1.5px solid var(--border);border-radius:var(--radius-md)"><input type="checkbox"> 短信</label>
              </div>
            </div>
            <div class="form-group">
              <label>目标人群</label>
              <select class="filter-select"><option>全部员工</option><option>司龄≥1年</option><option>绩效A级员工</option><option>特定部门</option><option>特定序列</option></select>
            </div>
          </div>
          <div class="form-group">
            <label>推送内容</label>
            <textarea rows="3" placeholder="如：🔥 内部招聘节来啦！20+优质岗位开放申请，匹配度最高达95%...">🔥 7月内部招聘节来啦！${Store.getPositions().filter(p => p.status === 'open').length}个优质岗位开放申请，智能匹配你的职业方向，快来机会广场看看吧！</textarea>
          </div>
          <div style="display:flex;justify-content:flex-end">
            <button class="btn btn-primary" onclick="App.toast('推送已发送至 1,238 名员工','success')">${App.icon('send')} 立即推送</button>
          </div>
        </div>

        <!-- 活动管理 -->
        <div class="chart-card">
          <div class="card-header"><h3>🎪 活动管理</h3><button class="btn btn-text btn-sm">${App.icon('plus')} 新建</button></div>
          <div class="activity-item" style="padding:12px;border:1px solid var(--border-light);border-radius:var(--radius-md);margin-bottom:8px">
            <div class="activity-avatar" style="background:var(--warning)">🔥</div>
            <div class="activity-content">
              <div class="activity-text"><strong>7月内部招聘节</strong></div>
              <div class="activity-time">2025.07.01-07.15 · 参与 ${Store.getPositions().filter(p => p.status === 'open').length} 岗位</div>
            </div>
            <span class="status-badge status-open">进行中</span>
          </div>
          <div class="activity-item" style="padding:12px;border:1px solid var(--border-light);border-radius:var(--radius-md)">
            <div class="activity-avatar" style="background:var(--primary-light);color:var(--primary-darker)">📊</div>
            <div class="activity-content">
              <div class="activity-text"><strong>Q2活水数据报告会</strong></div>
              <div class="activity-time">2025.07.05 · 全公司直播</div>
            </div>
            <span class="status-badge status-matching">待开始</span>
          </div>
        </div>
      </div>

      <!-- 活水标杆人物 -->
      <div class="card section-gap">
        <div class="card-header">
          <h3>🌟 活水标杆人物管理</h3>
          <button class="btn btn-text btn-sm">${App.icon('plus')} 添加标杆</button>
        </div>
        <div class="chart-grid">
          ${community.stories.map(s => `
            <div class="story-card">
              <div class="story-header">
                <div class="story-avatar" style="background:var(--primary-darker)">${s.avatar}</div>
                <div>
                  <div class="story-name">${s.name}</div>
                  <div class="story-transition">${s.fromDept} ${s.fromRole} → ${s.toDept} ${s.toRole}</div>
                </div>
                <span class="tag tag-success" style="margin-left:auto">${s.date}</span>
              </div>
              <div class="story-quote">${s.quote}</div>
              <div style="margin-top:12px">${s.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
              <div style="margin-top:12px;display:flex;gap:6px">
                <button class="btn btn-ghost btn-sm" onclick="App.toast('已编辑','success')">${App.icon('edit')} 编辑</button>
                <button class="btn btn-text btn-sm" onclick="App.toast('已置顶','success')">置顶</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  // ==================== 成长赋能专区 ====================
  growth() {
    const growth = Store.getGrowth();
    const talent = App.currentRole === 'employee' ? Store.getTalent(App.currentTalentId) : null;
    const c = document.getElementById('viewContainer');

    c.innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <h2>成长赋能专区</h2>
          <span class="page-subtitle">${talent ? '根据你的技能差距，推荐学习资源、导师和挑战项目' : '管理学习资源、导师库和挑战项目'}</span>
        </div>
      </div>

      ${talent ? `
      <!-- 技能差距分析 -->
      <div class="card section-gap">
        <div class="card-header"><h3>📊 你的技能差距分析</h3></div>
        <div id="gapAnalysis"></div>
      </div>
      ` : ''}

      <!-- 学习课程 -->
      <div class="section-gap">
        <div class="card-header" style="margin-bottom:16px"><h3>📚 推荐课程</h3></div>
        <div class="opportunity-grid">
          ${growth.courses.map(course => `
            <div class="growth-card" onclick="App.toast('已加入学习计划','success')">
              <span class="growth-card-tag" style="background:${course.category === '技术' ? 'var(--info-light)' : course.category === '产品' ? 'var(--primary-lighter)' : course.category === '设计' ? 'var(--purple-light)' : 'var(--success-light)'};color:${course.category === '技术' ? 'var(--info)' : course.category === '产品' ? 'var(--primary-darker)' : course.category === '设计' ? 'var(--purple)' : 'var(--success)'}">${course.category}</span>
              <div class="growth-card-title">${course.title}</div>
              <div class="growth-card-meta">
                <span>${App.icon('clock')} ${course.duration}</span>
                <span>${App.icon('award')} ${course.level}</span>
                <span>${App.icon('people')} ${course.students}人学过</span>
              </div>
              <div style="font-size:0.78rem;color:var(--text-muted);margin-bottom:8px">涉及技能：${course.skills.map(s => `<span class="tag" style="font-size:0.68rem">${s}</span>`).join('')}</div>
              <div class="growth-card-footer">
                <div style="display:flex;align-items:center;gap:4px">
                  ${App.icon('star')}<span style="font-size:0.82rem;font-weight:600">${course.rating}</span>
                </div>
                ${course.matchGap && talent ? '<span class="gap-badge">补差距</span>' : '<button class="btn btn-text btn-sm">学习</button>'}
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- 导师推荐 -->
      <div class="section-gap">
        <div class="card-header" style="margin-bottom:16px"><h3>🎓 导师推荐</h3></div>
        <div class="chart-grid">
          ${growth.mentors.map(mentor => `
            <div class="card" style="cursor:pointer" onclick="App.toast('已发送导师预约请求','success')">
              <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
                <div class="manager-avatar">${mentor.name.charAt(0)}</div>
                <div style="flex:1">
                  <div style="font-weight:600">${mentor.name}</div>
                  <div style="font-size:0.78rem;color:var(--text-muted)">${mentor.title} · ${mentor.dept}</div>
                </div>
                ${mentor.available ? '<span class="tag tag-success">可预约</span>' : '<span class="tag">已满</span>'}
              </div>
              <div style="font-size:0.8rem;color:var(--text-secondary);margin-bottom:8px">擅长领域：${mentor.expertise.map(e => `<span class="tag">${e}</span>`).join('')}</div>
              <div style="display:flex;justify-content:space-between;font-size:0.78rem;color:var(--text-muted);padding-top:10px;border-top:1px solid var(--border-light)">
                <span>已辅导 ${mentor.sessions} 次</span>
                <span style="display:flex;align-items:center;gap:4px">${App.icon('star')} ${mentor.rating}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- 挑战性项目 -->
      <div>
        <div class="card-header" style="margin-bottom:16px"><h3>🚀 挑战性项目</h3></div>
        <div class="chart-grid">
          ${growth.challenges.map(ch => `
            <div class="card" style="cursor:pointer" onclick="App.toast('已报名挑战项目','success')">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
                <div style="font-weight:600;font-size:0.95rem">${ch.title}</div>
                <span class="tag ${ch.difficulty === '高' ? 'tag-danger' : 'tag-warning'}">${ch.difficulty}</span>
              </div>
              <p style="font-size:0.82rem;color:var(--text-secondary);margin-bottom:12px;line-height:1.6">${ch.desc}</p>
              <div style="font-size:0.78rem;color:var(--text-muted);margin-bottom:10px">涉及技能：${ch.skills.map(s => `<span class="tag" style="font-size:0.68rem">${s}</span>`).join('')}</div>
              <div class="growth-card-footer">
                <div style="font-size:0.78rem;color:var(--text-muted)">
                  <span style="margin-right:8px">${App.icon('clock')} ${ch.duration}</span>
                  <span>${App.icon('people')} ${ch.participants}人参与</span>
                </div>
                <span class="tag tag-success">${ch.reward}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // 渲染技能差距分析
    if (talent) {
      const recs = recommendForTalent(App.currentTalentId, 3);
      const allGaps = new Set();
      recs.forEach(r => r.gapSkills.forEach(s => allGaps.add(s)));
      document.getElementById('gapAnalysis').innerHTML = allGaps.size > 0 ? `
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px">
          ${[...allGaps].map(s => `<span class="tag tag-danger">${s}</span>`).join('')}
        </div>
        <p style="font-size:0.82rem;color:var(--text-secondary)">基于你的推荐岗位，以上是当前技能与目标岗位的差距。建议通过下方课程和导师辅导进行提升，形成"意向 → 差距 → 发展"的闭环。</p>
      ` : '<p style="font-size:0.85rem;color:var(--text-muted)">你的技能已覆盖所有推荐岗位的要求，非常优秀！</p>';
    }
  },

  // ==================== 活水社区 ====================
  community() {
    const community = Store.getCommunity();
    const c = document.getElementById('viewContainer');

    c.innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <h2>活水文化社区</h2>
          <span class="page-subtitle">活水代言人故事 · 答疑FAQ · 匿名交流广场</span>
        </div>
      </div>

      <!-- 活水代言人 -->
      <div class="section-gap">
        <div class="card-header" style="margin-bottom:16px"><h3>🌟 活水代言人故事</h3></div>
        <div class="chart-grid">
          ${community.stories.map(s => `
            <div class="story-card">
              <div class="story-header">
                <div class="story-avatar" style="background:var(--primary-darker)">${s.avatar}</div>
                <div>
                  <div class="story-name">${s.name}</div>
                  <div class="story-transition">${s.fromDept} ${s.fromRole} → ${s.toDept} ${s.toRole}</div>
                </div>
              </div>
              <div class="story-quote">${s.quote}</div>
              <div style="margin-top:12px">${s.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="chart-grid">
        <!-- FAQ -->
        <div class="chart-card">
          <div class="card-header"><h3>❓ 活水答疑 FAQ</h3></div>
          <div id="faqList">
            ${community.faqs.map((f, i) => `
              <div class="faq-item ${i === 0 ? 'open' : ''}">
                <div class="faq-q" onclick="this.parentElement.classList.toggle('open')">
                  ${f.q}
                  <span class="faq-icon">▾</span>
                </div>
                <div class="faq-a">${f.a}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 匿名交流广场 -->
        <div class="chart-card">
          <div class="card-header"><h3>💬 匿名交流广场</h3></div>
          <div style="margin-bottom:16px">
            <textarea id="postInput" rows="2" placeholder="匿名分享你的想法或问题..." style="width:100%;padding:10px;border:1.5px solid var(--border);border-radius:var(--radius-md);font-size:0.85rem;font-family:inherit;resize:none;outline:none"></textarea>
            <div style="display:flex;justify-content:flex-end;margin-top:8px">
              <button class="btn btn-primary btn-sm" onclick="Admin.submitPost()">${App.icon('send')} 发布</button>
            </div>
          </div>
          <div id="postList">
            ${community.posts.map(p => `
              <div class="post-item">
                <div class="post-header">
                  <span class="post-author">${p.author}</span>
                  <span class="post-time">${p.time}</span>
                </div>
                <div class="post-content">${p.content}</div>
                <div class="post-actions">
                  <span class="post-action" onclick="Admin.likePost(${p.id});this.innerHTML='${App.icon('heart')} ${p.likes + 1}'">${App.icon('heart')} ${p.likes}</span>
                  <span class="post-action">${App.icon('chat')} ${p.replies}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- 活水政策 -->
      <div class="card">
        <div class="card-header"><h3>📜 活水政策公开承诺</h3></div>
        <div class="mobility-section">
          <div class="mobility-grid">
            <div class="mobility-item">
              <div class="mobility-item-label">司龄要求</div>
              <div class="mobility-item-value">满 ${MOBILITY_POLICY.minTenure} 年可申请</div>
            </div>
            <div class="mobility-item">
              <div class="mobility-item-label">绩效要求</div>
              <div class="mobility-item-value">最近绩效 ≥ ${MOBILITY_POLICY.minPerformance} 级</div>
            </div>
            <div class="mobility-item">
              <div class="mobility-item-label">保密承诺</div>
              <div class="mobility-item-value">${MOBILITY_POLICY.confidentiality}</div>
            </div>
            <div class="mobility-item">
              <div class="mobility-item-label">薪资政策</div>
              <div class="mobility-item-value">${MOBILITY_POLICY.salaryPolicy}</div>
            </div>
            <div class="mobility-item">
              <div class="mobility-item-label">适应期</div>
              <div class="mobility-item-value">${MOBILITY_POLICY.adaptationPeriod}，不通过可回原岗位</div>
            </div>
            <div class="mobility-item">
              <div class="mobility-item-label">试用期通过率</div>
              <div class="mobility-item-value">${MOBILITY_POLICY.trialPassRate}% · 一年留存率 ${MOBILITY_POLICY.retentionRate}%</div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  submitPost() {
    const input = document.getElementById('postInput');
    const content = input.value.trim();
    if (!content) { App.toast('请输入内容', 'warning'); return; }
    Store.addCommunityPost(content);
    App.toast('已发布', 'success');
    this.community();
  },

  likePost(id) {
    Store.likePost(id);
  },

  // ==================== 邀请管理 ====================
  inviteMgmt() {
    const c = document.getElementById('viewContainer');
    const invites = Store.getInvitations();
    const baseUrl = `${location.origin}${location.pathname.replace(/index\.html$/, '')}invite.html`;

    c.innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <h2>邀请码管理</h2>
          <span class="page-subtitle">管理平台全量邀请记录，生成各角色入驻邀请</span>
        </div>
        <button class="btn btn-primary" onclick="Admin.showInviteGenerator()">+ 生成邀请</button>
      </div>

      <div class="card" style="margin-bottom:20px">
        <div class="stat-row" style="display:flex;gap:16px;flex-wrap:wrap">
          <div class="stat-card" style="flex:1;min-width:140px">
            <div class="stat-value">${invites.length}</div>
            <div class="stat-label">累计邀请码</div>
          </div>
          <div class="stat-card" style="flex:1;min-width:140px">
            <div class="stat-value">${invites.filter(i => i.status === 'active').length}</div>
            <div class="stat-label">有效邀请码</div>
          </div>
          <div class="stat-card" style="flex:1;min-width:140px">
            <div class="stat-value">${invites.reduce((sum, i) => sum + i.usedCount, 0)}</div>
            <div class="stat-label">已邀请人数</div>
          </div>
        </div>
      </div>

      <div class="card">
        ${invites.length === 0 ? `
          <div class="empty-state" style="padding:40px 0">
            ${App.icon('empty')}
            <p>暂无邀请记录</p>
          </div>
        ` : `
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>邀请码</th>
                  <th>生成人</th>
                  <th>角色</th>
                  <th>创建时间</th>
                  <th>有效期至</th>
                  <th>已使用/上限</th>
                  <th>状态</th>
                  <th>受邀人</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                ${invites.map(i => `
                  <tr>
                    <td><code>${i.code}</code></td>
                    <td>${i.createdBy || '系统'}</td>
                    <td>${i.role === 'admin' ? 'HR管理员' : i.role === 'manager' ? '业务经理' : '员工'}</td>
                    <td>${i.createdAt}</td>
                    <td>${i.expireAt || '长期'}</td>
                    <td>${i.usedCount}/${i.maxUses || '∞'}</td>
                    <td><span class="status-badge ${i.status === 'active' ? 'status-open' : i.status === 'expired' ? 'status-closed' : 'status-screening'}">${i.status === 'active' ? '有效' : i.status === 'expired' ? '已满/过期' : '已撤销'}</span></td>
                    <td>${i.usedBy?.length ? i.usedBy.map(u => `员工#${u.talentId}`).join('、') : '—'}</td>
                    <td>
                      <button class="btn btn-ghost btn-sm" onclick="Admin.copyInviteLink('${i.code}')">复制链接</button>
                      ${i.status === 'active' ? `<button class="btn btn-ghost btn-sm" style="color:var(--danger)" onclick="Admin.revokeInvite(${i.id})">撤销</button>` : ''}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    `;
  },

  showInviteGenerator() {
    const baseUrl = `${location.origin}${location.pathname.replace(/index\.html$/, '')}invite.html`;
    App.openModal('生成邀请码', `
      <div style="display:flex;flex-direction:column;gap:16px">
        <div>
          <label style="display:block;font-size:0.85rem;color:var(--text-secondary);margin-bottom:6px">入驻角色</label>
          <select id="inviteRole" style="width:100%;padding:10px 12px;border:1px solid var(--border);border-radius:var(--radius-md);font-size:0.9rem">
            <option value="employee">员工端</option>
            <option value="manager">业务管理端</option>
            <option value="admin">管理驾驶舱</option>
          </select>
        </div>
        <div>
          <label style="display:block;font-size:0.85rem;color:var(--text-secondary);margin-bottom:6px">使用上限</label>
          <input type="number" id="inviteMaxUses" value="5" min="1" max="100" style="width:100%;padding:10px 12px;border:1px solid var(--border);border-radius:var(--radius-md);font-size:0.9rem">
        </div>
        <div>
          <label style="display:block;font-size:0.85rem;color:var(--text-secondary);margin-bottom:6px">有效期（天）</label>
          <input type="number" id="inviteExpireDays" value="7" min="1" max="90" style="width:100%;padding:10px 12px;border:1px solid var(--border);border-radius:var(--radius-md);font-size:0.9rem">
        </div>
        <div class="modal-footer" style="border:none;padding:0;margin-top:8px">
          <button class="btn btn-ghost" onclick="App.closeModal()">取消</button>
          <button class="btn btn-primary" onclick="Admin.createInvite()">生成</button>
        </div>
      </div>
    `, 'sm');
  },

  createInvite() {
    const role = document.getElementById('inviteRole').value;
    const maxUses = parseInt(document.getElementById('inviteMaxUses').value, 10) || 5;
    const expireDays = parseInt(document.getElementById('inviteExpireDays').value, 10) || 7;
    const invite = Store.addInvitation({
      createdBy: '系统管理员',
      role,
      maxUses,
      expireAt: new Date(Date.now() + expireDays * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    });
    if (!invite) { App.toast('生成失败，邀请码冲突', 'error'); return; }
    App.closeModal();
    App.toast('邀请码已生成', 'success');
    this.inviteMgmt();
  },

  copyInviteLink(code) {
    const baseUrl = `${location.origin}${location.pathname.replace(/index\.html$/, '')}invite.html`;
    navigator.clipboard?.writeText(`${baseUrl}?code=${code}`).then(() => App.toast('链接已复制', 'success')).catch(() => App.toast('复制失败', 'warning'));
  },

  revokeInvite(id) {
    App.confirm('确认撤销该邀请码？', '撤销后该邀请码将立即失效，未使用的次数也将作废。', () => {
      Store.revokeInvitation(id);
      App.toast('已撤销', 'success');
      this.inviteMgmt();
    }, '确认撤销');
  },

  // ==================== Skills 引擎 ====================
  skillsEngine() {
    const c = document.getElementById('viewContainer');
    const skills = [
      {
        num: '01', name: '内部活水三维匹配引擎', enName: 'Internal Talent Matching Engine',
        icon: '\u{1F9E0}', accent: '#5B8FA8', bg: '#EDF4F8',
        desc: '从技能能力 × 职业意愿 × 岗位需求三个维度精准计算人岗匹配度，输出 0–100 综合匹配分，解决"人才想动找不到机会、岗位缺人找不到人"的信息错配。',
        tags: ['人岗匹配', '权重调优', '匹配报告', '批量排名'],
        trigger: '"帮我算一下这个员工和岗位的匹配度" · "谁最适合这个岗位？" · "调整匹配权重，更看重技能"',
        details: [
          { label: '匹配维度', value: '技能能力 40% · 职业意愿 30% · 岗位需求 30%' },
          { label: '核心特性', value: '硬性条件一票否决 · 核心技能一票否决 · 主动意愿保底 60%' },
          { label: '输出物', value: '结构化匹配报告 · 分项得分明细 · 改进建议' },
        ],
      },
      {
        num: '02', name: 'HR 人力资源管理助手', enName: 'HR Management Assistant',
        icon: '\u{1F4BC}', accent: '#4CAF7C', bg: '#E8F6EE',
        desc: '覆盖制度、招聘、绩效、薪酬、合规、人才盘点、活水流动、体系规划八大模块的全场景 HR 智能体，活水平台专属深度适配。',
        tags: ['活水制度设计', '人才盘点九宫格', '绩效薪酬', '劳动合规'],
        trigger: '"帮我写一份活水管理制度" · "设计一个调岗薪酬衔接方案" · "这个调动有什么合规风险？"',
        details: [
          { label: '覆盖模块', value: '制度 · 招聘 · 绩效 · 薪酬 · 合规 · 盘点 · 活水 · 体系' },
          { label: '活水专属', value: '活水制度全流程 · 调动薪酬衔接 · 合规风险防控 · 漏斗分析' },
          { label: '联动模块', value: '竞聘评估 ↔ 人才盘点 ↔ 薪酬合规，横向打通' },
        ],
      },
      {
        num: '03', name: '智能招聘大师', enName: 'Smart Recruitment Master',
        icon: '\u{1F465}', accent: '#9B8FD4', bg: '#EFEDF8',
        desc: '集团招聘全流程 AI 助手——JD 定制、人才画像、简历筛选、笔面试方案、成绩统计、流程可视化，以图表驱动招聘决策。',
        tags: ['JD 定制', '人才画像', '笔面试方案', '成绩分析'],
        trigger: '"帮我为算法工程师岗位生成 JD" · "这批简历帮我筛选并排名" · "设计一套综合笔试题"',
        details: [
          { label: '六大能力', value: 'JD定制 · 人才画像 · 简历筛选 · 笔面试方案 · 成绩统计 · 流程管理' },
          { label: '可视化', value: '雷达图 · 柱状图 · 饼图 · 流程图 · 进度条 · 星级评分' },
          { label: '输出格式', value: '图表展示 + Word 文档导出，考题自动生成' },
        ],
      },
      {
        num: '04', name: '活水竞争力排行榜', enName: 'Talent Competitiveness Ranking',
        icon: '\u{1F3C6}', accent: '#E8A838', bg: '#FDF3E2',
        desc: '基于活跃度 × 成功率 × 影响力三维计分模型，量化员工活水竞争力，生成个人/部门多维度排行榜，让人才活水健康度可感知、可对比。',
        tags: ['PCI 个人指数', 'DHI 部门健康度', '周期刷新', '管理驾驶舱'],
        trigger: '"查看我的活水竞争力排名" · "技术部的活水健康度怎么样？" · "本月 TOP10 活水达人"',
        details: [
          { label: '计分模型', value: '活跃度 30% · 成功率 40% · 影响力 30%' },
          { label: '排行维度', value: '全公司 / 部门内 / 岗位序列 · 月/季/年刷新' },
          { label: '可视化', value: '三维雷达图 · 热力图 · 趋势折线图 · TOP 卡片' },
        ],
      },
      {
        num: '05', name: 'AI Team Ops', enName: 'Team Performance & Meeting Intelligence',
        icon: '\u{2699}\u{FE0F}', accent: '#E5655E', bg: '#FCEAE9',
        desc: 'Elon Algorithm 五步团队绩效审计 + 会议智能提取——识别 A/B/C 玩家、冗余角色、瓶颈环节，自动从会议记录中提取行动项与决策。',
        tags: ['绩效审计', 'A/B/C 分级', '会议行动提取', '自动化建议'],
        trigger: '"审计我的团队绩效" · "谁是团队里的 A 级员工？" · "从会议记录里提取所有待办事项"',
        details: [
          { label: 'Elon 算法', value: '质疑需求 → 删除冗余 → 简化流程 → 加速瓶颈 → 自动化' },
          { label: '会议智能', value: '决策 · 行动项 · 待解决问题 · 关键洞察 · 隐式承诺' },
          { label: '评分维度', value: '速度 · 质量 · 独立性 · 主动性 → Stack Rank' },
        ],
      },
    ];

    c.innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <h2>Skills 引擎中心</h2>
          <span class="page-subtitle">五大 AI Skills 驱动活水平台全流程智能化</span>
        </div>
      </div>

      <!-- 概览统计 -->
      <div class="stat-cards" style="margin-bottom:24px">
        <div class="stat-card" style="--card-accent:#5B8FA8;--card-icon-bg:#EDF4F8">
          <div class="stat-card-icon" style="color:#5B8FA8">${App.icon('book')}</div>
          <div class="stat-card-label">封装 Skills</div>
          <div class="stat-card-value">5 个</div>
          <div class="stat-card-trend trend-up">↑ 全流程覆盖</div>
        </div>
        <div class="stat-card" style="--card-accent:#4CAF7C;--card-icon-bg:#E8F6EE">
          <div class="stat-card-icon" style="color:#4CAF7C">${App.icon('check')}</div>
          <div class="stat-card-label">可独立调用</div>
          <div class="stat-card-value">5 / 5</div>
          <div class="stat-card-trend trend-up">↑ 彼此支持</div>
        </div>
        <div class="stat-card" style="--card-accent:#E8A838;--card-icon-bg:#FDF3E2">
          <div class="stat-card-icon" style="color:#E8A838">${App.icon('link')}</div>
          <div class="stat-card-label">联动模块</div>
          <div class="stat-card-value">3 组</div>
          <div class="stat-card-trend trend-up">↑ 横向打通</div>
        </div>
        <div class="stat-card" style="--card-accent:#9B8FD4;--card-icon-bg:#EFEDF8">
          <div class="stat-card-icon" style="color:#9B8FD4">${App.icon('award')}</div>
          <div class="stat-card-label">优化轮次</div>
          <div class="stat-card-value">2 轮</div>
          <div class="stat-card-trend trend-up">↑ 达尔文/盘古</div>
        </div>
      </div>

      <!-- Skills 卡片列表 -->
      <div class="chart-grid" style="grid-template-columns:1fr;gap:20px">
        ${skills.map(sk => `
          <div class="card" style="border-left:4px solid ${sk.accent};overflow:hidden">
            <div style="display:flex;gap:20px;align-items:flex-start;padding:4px">
              <!-- 图标区 -->
              <div style="width:64px;height:64px;border-radius:14px;background:${sk.bg};display:flex;align-items:center;justify-content:center;font-size:1.8rem;flex-shrink:0">
                ${sk.icon}
              </div>
              <!-- 内容区 -->
              <div style="flex:1;min-width:0">
                <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:4px">
                  <span style="font-size:0.7rem;font-weight:700;color:${sk.accent};background:${sk.bg};padding:2px 10px;border-radius:20px;letter-spacing:1px">SKILL ${sk.num}</span>
                  <h3 style="font-size:1.1rem;font-weight:700;margin:0">${sk.name}</h3>
                </div>
                <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:10px;letter-spacing:0.5px">${sk.enName}</div>
                <p style="font-size:0.85rem;color:var(--text-secondary);line-height:1.65;margin-bottom:12px">${sk.desc}</p>
                <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px">
                  ${sk.tags.map(t => `<span class="tag" style="background:${sk.bg};color:${sk.accent};font-size:0.72rem;font-weight:500;padding:3px 10px;border-radius:20px">${t}</span>`).join('')}
                </div>
                <!-- 详细信息 -->
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px;padding-top:12px;border-top:1px solid var(--border-light)">
                  ${sk.details.map(d => `
                    <div>
                      <div style="font-size:0.68rem;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:3px">${d.label}</div>
                      <div style="font-size:0.8rem;color:var(--text-secondary);line-height:1.5">${d.value}</div>
                    </div>
                  `).join('')}
                </div>
                <!-- 触发词 -->
                <div style="margin-top:12px;padding:10px 14px;background:var(--bg-body);border-radius:var(--radius-md);display:flex;align-items:flex-start;gap:8px">
                  <span style="font-size:0.9rem;flex-shrink:0">\u{1F4AC}</span>
                  <span style="font-size:0.78rem;color:var(--text-muted);line-height:1.5">${sk.trigger}</span>
                </div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- 联动关系说明 -->
      <div class="card section-gap">
        <div class="card-header"><h3>\u{1F504} Skills 联动关系</h3></div>
        <div style="padding:16px 0">
          <div style="display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap;font-size:0.82rem">
            <span style="padding:8px 16px;background:#EDF4F8;color:#5B8FA8;border-radius:20px;font-weight:600">三维匹配引擎</span>
            <span style="color:var(--text-muted)">\u2194</span>
            <span style="padding:8px 16px;background:#E8F6EE;color:#4CAF7C;border-radius:20px;font-weight:600">HR 管理助手</span>
            <span style="color:var(--text-muted)">\u2194</span>
            <span style="padding:8px 16px;background:#FDF3E2;color:#E8A838;border-radius:20px;font-weight:600">竞争力排行榜</span>
          </div>
          <p style="text-align:center;font-size:0.8rem;color:var(--text-muted);margin-top:12px">竞聘评估 \u2194 人才盘点 \u2194 薪酬合规，三大 Skills 横向打通，形成活水全闭环</p>
          <div style="display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap;font-size:0.82rem;margin-top:16px">
            <span style="padding:8px 16px;background:#EFEDF8;color:#9B8FD4;border-radius:20px;font-weight:600">智能招聘大师</span>
            <span style="color:var(--text-muted)">+</span>
            <span style="padding:8px 16px;background:#FCEAE9;color:#E5655E;border-radius:20px;font-weight:600">AI Team Ops</span>
            <span style="color:var(--text-muted)">\u2192</span>
            <span style="font-size:0.78rem;color:var(--text-secondary)">外部招聘与团队效能赋能</span>
          </div>
        </div>
      </div>
    `;
  },

  // ==================== 竞争力排行榜 ====================
  ranking() {
    const c = document.getElementById('viewContainer');
    const talents = Store.getTalents();
    const flow = Store.getDeptFlow();

    // 计算 PCI（个人竞争力指数）
    const levelScore = { 'P4': 55, 'P5': 70, 'P6': 85, 'P7': 100, 'M1': 80, 'M2': 90, 'M3': 95 };
    const statusActivity = { 'available': 90, 'matching': 75, 'matched': 55, 'completed': 35 };
    const statusSuccess = { 'available': 40, 'matching': 60, 'matched': 85, 'completed': 100 };

    const pciData = talents.map(t => {
      const activity = statusActivity[t.status] || 50;
      const success = statusSuccess[t.status] || 50;
      const latestPerf = t.performanceHistory[t.performanceHistory.length - 1]?.rating || 'B';
      const perfBonus = { 'A': 10, 'B': 5, 'C': 0, 'D': -5 }[latestPerf] || 5;
      const influence = Math.min(100, (levelScore[t.level] || 60) + perfBonus);
      const pci = Math.round(activity * 0.3 + success * 0.4 + influence * 0.3);
      return { ...t, activity, success, influence, pci, latestPerf };
    }).sort((a, b) => b.pci - a.pci);

    // 计算 DHI（部门健康度指数）
    const deptStats = {};
    DEPARTMENTS.forEach(d => { deptStats[d] = { dept: d, members: [], totalPCI: 0, count: 0, inflow: 0, outflow: 0, net: 0 }; });
    pciData.forEach(t => {
      if (deptStats[t.currentDept]) {
        deptStats[t.currentDept].members.push(t);
        deptStats[t.currentDept].totalPCI += t.pci;
        deptStats[t.currentDept].count++;
      }
    });
    flow.summary.forEach(s => {
      if (deptStats[s.dept]) {
        deptStats[s.dept].inflow = s.inflow;
        deptStats[s.dept].outflow = s.outflow;
        deptStats[s.dept].net = s.net;
      }
    });

    const dhiData = Object.values(deptStats)
      .filter(d => d.count > 0)
      .map(d => {
        const avgPCI = d.count > 0 ? d.totalPCI / d.count : 0;
        const flowHealth = Math.min(100, 60 + d.net * 8);
        const participation = Math.min(100, d.count * 15);
        const dhi = Math.round(avgPCI * 0.5 + flowHealth * 0.3 + participation * 0.2);
        return { ...d, avgPCI: Math.round(avgPCI), flowHealth, participation, dhi };
      })
      .sort((a, b) => b.dhi - a.dhi);

    const pciTop3 = pciData.slice(0, 3);
    const dhiTop3 = dhiData.slice(0, 3);
    const medalColors = ['#E8A838', '#B0B8C0', '#CD7F32'];
    const medalLabels = ['\u{1F947}', '\u{1F948}', '\u{1F949}'];

    c.innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <h2>活水竞争力排行榜</h2>
          <span class="page-subtitle">基于活跃度 \u00D7 成功率 \u00D7 影响力三维计分模型 · PCI 个人指数 + DHI 部门健康度</span>
        </div>
      </div>

      <!-- 模型说明 -->
      <div class="card" style="margin-bottom:20px;background:linear-gradient(135deg,#EDF4F8,#D4E5EE);border:none">
        <div style="display:flex;align-items:center;gap:20px;flex-wrap:wrap;padding:8px 0">
          <div style="display:flex;align-items:center;gap:8px">
            <div style="width:36px;height:36px;border-radius:10px;background:#fff;display:flex;align-items:center;justify-content:center;font-size:1.1rem">\u{1F4CA}</div>
            <div>
              <div style="font-size:0.85rem;font-weight:700">三维计分模型</div>
              <div style="font-size:0.72rem;color:var(--text-muted)">活跃度 30% \u00D7 成功率 40% \u00D7 影响力 30%</div>
            </div>
          </div>
          <div style="height:28px;width:1px;background:var(--border)"></div>
          <div style="display:flex;gap:16px;flex-wrap:wrap">
            <div><span style="font-size:0.7rem;color:var(--text-muted)">PCI</span><span style="font-size:0.85rem;font-weight:700;color:var(--primary-darker);margin-left:4px">个人竞争力指数</span></div>
            <div><span style="font-size:0.7rem;color:var(--text-muted)">DHI</span><span style="font-size:0.85rem;font-weight:700;color:var(--warning);margin-left:4px">部门健康度指数</span></div>
          </div>
          <div style="margin-left:auto">
            <select class="filter-select" style="font-size:0.82rem" onchange="App.toast('周期已切换','info')">
              <option>本月</option><option>本季度</option><option>本年度</option>
            </select>
          </div>
        </div>
      </div>

      <!-- TOP3 个人 -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-bottom:24px">
        ${pciTop3.map((t, i) => `
          <div class="card" style="text-align:center;border-top:3px solid ${medalColors[i]};position:relative;overflow:hidden">
            <div style="position:absolute;top:8px;right:12px;font-size:1.8rem;opacity:0.15">${medalLabels[i]}</div>
            <div style="font-size:2rem;margin:8px 0">${medalLabels[i]}</div>
            <div class="manager-avatar" style="margin:0 auto 8px;width:48px;height:48px;font-size:1.2rem;background:${medalColors[i]}">${t.avatar}</div>
            <div style="font-weight:700;font-size:0.95rem">${t.name}</div>
            <div style="font-size:0.72rem;color:var(--text-muted);margin-bottom:8px">${t.currentDept} \u00B7 ${t.currentPosition}</div>
            <div style="font-size:1.8rem;font-weight:800;color:${medalColors[i]}">${t.pci}</div>
            <div style="font-size:0.72rem;color:var(--text-muted)">PCI 指数</div>
          </div>
        `).join('')}
      </div>

      <div class="chart-grid">
        <!-- PCI 个人排行 -->
        <div class="chart-card chart-lg">
          <div class="card-header">
            <h3>PCI 个人竞争力排行</h3>
            <span class="chart-badge">全公司 \u00B7 ${pciData.length} 人</span>
          </div>
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr><th>排名</th><th>姓名</th><th>部门</th><th>岗位</th><th>级别</th><th>活跃度</th><th>成功率</th><th>影响力</th><th>PCI</th></tr>
              </thead>
              <tbody>
                ${pciData.map((t, i) => `
                  <tr>
                    <td style="font-weight:700;color:${i < 3 ? medalColors[i] : 'var(--text-muted)'}">${i < 3 ? medalLabels[i] : '#' + (i + 1)}</td>
                    <td class="cell-name">${t.name}</td>
                    <td>${t.currentDept}</td>
                    <td style="font-size:0.8rem">${t.currentPosition}</td>
                    <td><span class="tag" style="font-size:0.68rem">${t.level}</span></td>
                    <td>
                      <div style="display:flex;align-items:center;gap:6px">
                        <div style="width:40px;height:5px;background:var(--border-light);border-radius:3px;overflow:hidden"><div style="height:100%;width:${t.activity}%;background:#6BAED6;border-radius:3px"></div></div>
                        <span style="font-size:0.75rem;color:var(--text-muted)">${t.activity}</span>
                      </div>
                    </td>
                    <td>
                      <div style="display:flex;align-items:center;gap:6px">
                        <div style="width:40px;height:5px;background:var(--border-light);border-radius:3px;overflow:hidden"><div style="height:100%;width:${t.success}%;background:#4CAF7C;border-radius:3px"></div></div>
                        <span style="font-size:0.75rem;color:var(--text-muted)">${t.success}</span>
                      </div>
                    </td>
                    <td>
                      <div style="display:flex;align-items:center;gap:6px">
                        <div style="width:40px;height:5px;background:var(--border-light);border-radius:3px;overflow:hidden"><div style="height:100%;width:${t.influence}%;background:#E8A838;border-radius:3px"></div></div>
                        <span style="font-size:0.75rem;color:var(--text-muted)">${t.influence}</span>
                      </div>
                    </td>
                    <td><span style="font-size:1rem;font-weight:800;color:${App.scoreColor(t.pci)}">${t.pci}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- DHI 部门排行 -->
        <div class="chart-card">
          <div class="card-header">
            <h3>DHI 部门健康度排行</h3>
            <span class="chart-badge">${dhiData.length} 个部门</span>
          </div>
          <div id="dhiChart" style="height:280px;padding:12px"></div>
          <div style="padding:0 12px 12px">
            ${dhiData.slice(0, 5).map((d, i) => `
              <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border-light)">
                <span style="font-weight:700;color:${i < 3 ? medalColors[i] : 'var(--text-muted)'};width:24px;text-align:center">${i < 3 ? medalLabels[i] : '#' + (i + 1)}</span>
                <div style="flex:1">
                  <div style="font-weight:600;font-size:0.85rem">${d.dept}</div>
                  <div style="font-size:0.7rem;color:var(--text-muted)">${d.count} 人 \u00B7 均值 PCI ${d.avgPCI} \u00B7 净${d.net >= 0 ? '流入' : '流出'} ${Math.abs(d.net)}</div>
                </div>
                <div style="text-align:right">
                  <div style="font-size:1.2rem;font-weight:800;color:${App.scoreColor(d.dhi)}">${d.dhi}</div>
                  <div style="font-size:0.65rem;color:var(--text-muted)">DHI</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- DHI 详细表格 -->
      <div class="card section-gap">
        <div class="card-header"><h3>DHI 部门健康度明细</h3></div>
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr><th>排名</th><th>部门</th><th>人数</th><th>均 PCI</th><th>流入</th><th>流出</th><th>净流动</th><th>流动健康度</th><th>参与度</th><th>DHI</th></tr>
            </thead>
            <tbody>
              ${dhiData.map((d, i) => `
                <tr>
                  <td style="font-weight:700;color:${i < 3 ? medalColors[i] : 'var(--text-muted)'}">${i < 3 ? medalLabels[i] : '#' + (i + 1)}</td>
                  <td class="cell-name">${d.dept}</td>
                  <td>${d.count}</td>
                  <td>${d.avgPCI}</td>
                  <td style="color:var(--success);font-weight:600">+${d.inflow}</td>
                  <td style="color:var(--danger);font-weight:600">-${d.outflow}</td>
                  <td style="color:${d.net >= 0 ? 'var(--success)' : 'var(--danger)'};font-weight:700">${d.net >= 0 ? '+' : ''}${d.net}</td>
                  <td>
                    <div style="display:flex;align-items:center;gap:6px">
                      <div style="width:50px;height:5px;background:var(--border-light);border-radius:3px;overflow:hidden"><div style="height:100%;width:${d.flowHealth}%;background:#5B8FA8;border-radius:3px"></div></div>
                      <span style="font-size:0.75rem;color:var(--text-muted)">${d.flowHealth}</span>
                    </div>
                  </td>
                  <td>
                    <div style="display:flex;align-items:center;gap:6px">
                      <div style="width:50px;height:5px;background:var(--border-light);border-radius:3px;overflow:hidden"><div style="height:100%;width:${d.participation}%;background:#9B8FD4;border-radius:3px"></div></div>
                      <span style="font-size:0.75rem;color:var(--text-muted)">${d.participation}</span>
                    </div>
                  </td>
                  <td><span style="font-size:1rem;font-weight:800;color:${App.scoreColor(d.dhi)}">${d.dhi}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- 图表区 -->
      <div class="chart-grid" style="margin-top:20px">
        <div class="chart-card chart-lg">
          <div class="card-header"><h3>PCI 分布雷达图（TOP10）</h3></div>
          <div class="chart-body"><canvas id="pciRadarChart"></canvas></div>
        </div>
        <div class="chart-card">
          <div class="card-header"><h3>DHI 部门对比</h3></div>
          <div class="chart-body"><canvas id="dhiBarChart"></canvas></div>
        </div>
      </div>
    `;

    // 渲染雷达图
    const top10 = pciData.slice(0, 10);
    const radarCtx = document.getElementById('pciRadarChart').getContext('2d');
    App.charts.pciRadar = new Chart(radarCtx, {
      type: 'radar',
      data: {
        labels: top10.map(t => t.name),
        datasets: [
          { label: '活跃度', data: top10.map(t => t.activity), borderColor: '#6BAED6', backgroundColor: 'rgba(107,174,214,0.1)', borderWidth: 2 },
          { label: '成功率', data: top10.map(t => t.success), borderColor: '#4CAF7C', backgroundColor: 'rgba(76,175,124,0.1)', borderWidth: 2 },
          { label: '影响力', data: top10.map(t => t.influence), borderColor: '#E8A838', backgroundColor: 'rgba(232,168,56,0.1)', borderWidth: 2 },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'top', labels: { padding: 12, font: { size: 12, family: 'Noto Sans SC' }, usePointStyle: true } } },
        scales: { r: { beginAtZero: true, max: 100, ticks: { stepSize: 25, font: { size: 10 } }, grid: { color: '#EDF1F5' }, pointLabels: { font: { size: 11, family: 'Noto Sans SC' } } } },
      },
    });

    // 渲染部门柱状图
    const barCtx = document.getElementById('dhiBarChart').getContext('2d');
    App.charts.dhiBar = new Chart(barCtx, {
      type: 'bar',
      data: {
        labels: dhiData.map(d => d.dept),
        datasets: [{
          label: 'DHI',
          data: dhiData.map(d => d.dhi),
          backgroundColor: dhiData.map(d => App.scoreColor(d.dhi)),
          borderRadius: 6,
          maxBarThickness: 36,
        }],
      },
      options: this.chartOpts({ legend: false, indexAxis: 'y' }),
    });
  },
};
