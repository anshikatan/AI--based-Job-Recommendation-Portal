/* ============================================
   NEXWORK – Complete JavaScript
   ============================================ */

'use strict';

// ── Storage Keys ──────────────────────────────
const KEYS = {
  USERS:      'nw_users',
  CURRENT:    'nw_current_user',
  APPLIED:    'nw_applied_jobs',
  DARK:       'nw_dark_mode',
  CUSTOM_JOBS:'nw_custom_jobs',
};

// ── Helpers ───────────────────────────────────
const $ = id => document.getElementById(id);
const get = key => { try { return JSON.parse(localStorage.getItem(key)) || null; } catch { return null; } };
const set = (key, val) => localStorage.setItem(key, JSON.stringify(val));

// ── Toast System ──────────────────────────────
function showToast(message, type = 'info', duration = 3500) {
  const icons = { success: 'fa-circle-check', error: 'fa-circle-xmark', info: 'fa-circle-info', warning: 'fa-triangle-exclamation' };
  const container = $('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div class="toast-icon"><i class="fa-solid ${icons[type] || icons.info}"></i></div>
    <div class="toast-message">${message}</div>
    <button class="toast-close" onclick="dismissToast(this.parentElement)"><i class="fa-solid fa-xmark"></i></button>
  `;
  container.appendChild(toast);

  setTimeout(() => dismissToast(toast), duration);
}

function dismissToast(toast) {
  if (!toast || !toast.parentElement) return;
  toast.classList.add('exit');
  setTimeout(() => toast.remove(), 300);
}

// ── Password Toggle ───────────────────────────
function togglePass(inputId, btn) {
  const input = $(inputId);
  const isPass = input.type === 'password';
  input.type = isPass ? 'text' : 'password';
  btn.innerHTML = `<i class="fa-solid ${isPass ? 'fa-eye-slash' : 'fa-eye'}"></i>`;
}

// ── Password Strength ─────────────────────────
(function initPasswordStrength() {
  const passInput = $('signupPassword');
  if (!passInput) return;
  passInput.addEventListener('input', function () {
    const val = this.value;
    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;
    const fill = $('strengthFill');
    const label = $('strengthLabel');
    const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e'];
    const labels = ['Weak', 'Fair', 'Good', 'Strong'];
    fill.style.width = (score / 4 * 100) + '%';
    fill.style.background = colors[score - 1] || '#e5e7eb';
    label.textContent = score > 0 ? labels[score - 1] : 'Strength';
    label.style.color = colors[score - 1] || 'var(--text-3)';
  });
})();

// ── Tab Switching (Auth) ──────────────────────
function switchTab(tab) {
  const loginForm  = $('loginForm');
  const signupForm = $('signupForm');
  const loginTab   = $('loginTab');
  const signupTab  = $('signupTab');
  const indicator  = document.querySelector('.tab-indicator');

  if (tab === 'login') {
    loginForm.classList.add('active');
    signupForm.classList.remove('active');
    loginTab.classList.add('active');
    signupTab.classList.remove('active');
    indicator && indicator.classList.remove('right');
  } else {
    signupForm.classList.add('active');
    loginForm.classList.remove('active');
    signupTab.classList.add('active');
    loginTab.classList.remove('active');
    indicator && indicator.classList.add('right');
  }
}

// ── Auth: Login ───────────────────────────────
function handleLogin(e) {
  e.preventDefault();
  const email    = $('loginEmail').value.trim();
  const password = $('loginPassword').value;
  const emailErr = $('loginEmailErr');
  const passErr  = $('loginPassErr');
  emailErr.textContent = '';
  passErr.textContent  = '';

  const users = get(KEYS.USERS) || {};
  if (!users[email]) { emailErr.textContent = 'No account found with this email.'; return; }
  if (users[email].password !== btoa(password)) { passErr.textContent = 'Incorrect password.'; return; }

  set(KEYS.CURRENT, users[email]);
  showToast(`Welcome back, ${users[email].firstName}! 👋`, 'success');
  setTimeout(() => window.location.href = 'dashboard.html', 800);
}

// ── Auth: Demo Login ──────────────────────────
function demoLogin() {
  const demo = { firstName: 'Alex', lastName: 'Morgan', email: 'demo@nexwork.io', role: 'Frontend Developer', joinedDate: new Date().toISOString(), profileViews: 42 };
  set(KEYS.CURRENT, demo);
  showToast('Entering demo mode 🚀', 'info');
  setTimeout(() => window.location.href = 'dashboard.html', 800);
}

// ── Auth: Signup ──────────────────────────────
function handleSignup(e) {
  e.preventDefault();
  const first    = $('signupFirst').value.trim();
  const last     = $('signupLast').value.trim();
  const email    = $('signupEmail').value.trim();
  const role     = $('signupRole').value.trim();
  const password = $('signupPassword').value;
  const terms    = $('termsCheck').checked;
  const emailErr = $('signupEmailErr');
  emailErr.textContent = '';

  if (!terms) { showToast('Please agree to the Terms of Service', 'warning'); return; }
  if (password.length < 8) { showToast('Password must be at least 8 characters', 'warning'); return; }

  const users = get(KEYS.USERS) || {};
  if (users[email]) { emailErr.textContent = 'An account already exists with this email.'; return; }

  const user = { firstName: first, lastName: last, email, role, password: btoa(password), joinedDate: new Date().toISOString(), profileViews: 0, about: '', skills: [], location: '' };
  users[email] = user;
  set(KEYS.USERS, users);
  set(KEYS.CURRENT, user);

  showToast(`Account created! Welcome, ${first}! 🎉`, 'success');
  setTimeout(() => window.location.href = 'dashboard.html', 800);
}

// ── Auth Guard ────────────────────────────────
function requireAuth() {
  if (!get(KEYS.CURRENT)) { window.location.href = 'index.html'; return false; }
  return true;
}

function logout() {
  localStorage.removeItem(KEYS.CURRENT);
  showToast('Signed out successfully', 'info');
  setTimeout(() => window.location.href = 'index.html', 700);
}

// ── Dark Mode ─────────────────────────────────
function toggleDark() {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  set(KEYS.DARK, isDark);
  const icon = $('darkIcon');
  if (icon) icon.className = isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
}

function applyDark() {
  const isDark = get(KEYS.DARK);
  if (isDark) {
    document.body.classList.add('dark-mode');
    const icon = $('darkIcon');
    if (icon) icon.className = 'fa-solid fa-sun';
  }
}

// ── Job Data ──────────────────────────────────
const BASE_JOBS = [
  { id: 'j1',  title: 'Senior Frontend Developer', company: 'Stripe',       logo: '💳', location: 'Remote',     salary: '$120K – $160K', category: 'Engineering', type: 'Full-time',  exp: 'Senior',   tags: ['React','TypeScript','CSS'],    featured: true,  posted: '2h ago',   desc: 'We are looking for a Senior Frontend Developer to build beautiful, scalable products used by millions of businesses worldwide. You will collaborate closely with designers and backend engineers to create exceptional user experiences.', requirements: ['5+ years React experience', 'Deep TypeScript knowledge', 'Strong CSS/animation skills', 'Experience with testing (Jest, Cypress)', 'Familiarity with performance optimization'] },
  { id: 'j2',  title: 'Data Scientist',            company: 'Netflix',      logo: '🎬', location: 'Los Angeles', salary: '$140K – $190K', category: 'Data Science', type: 'Full-time',  exp: 'Senior',   tags: ['Python','ML','SQL'],           featured: true,  posted: '5h ago',   desc: 'Join Netflix\'s data science team to power personalized recommendations and content strategy for 250M+ subscribers worldwide.', requirements: ['PhD or MS in Statistics/CS', '4+ years industry experience', 'Proficiency in Python & R', 'Experience with ML pipelines', 'Strong communication skills'] },
  { id: 'j3',  title: 'Product Designer',          company: 'Figma',        logo: '🎨', location: 'San Francisco', salary: '$110K – $145K', category: 'Design',     type: 'Full-time',  exp: 'Mid-level',tags: ['Figma','UX','Prototyping'],    featured: false, posted: '1d ago',   desc: 'Shape the future of design tools. Work on core product features used by millions of designers globally.', requirements: ['4+ years product design experience', 'Expert-level Figma skills', 'Strong portfolio', 'User research experience', 'Cross-functional collaboration'] },
  { id: 'j4',  title: 'DevOps Engineer',           company: 'AWS',          logo: '☁️', location: 'Seattle',     salary: '$130K – $170K', category: 'Engineering', type: 'Full-time',  exp: 'Senior',   tags: ['Kubernetes','Terraform','CI/CD'],featured: false, posted: '2d ago',  desc: 'Build and maintain cloud infrastructure at massive scale. Own reliability, performance, and cost optimization across AWS services.', requirements: ['5+ years DevOps/SRE experience', 'Strong Kubernetes skills', 'IaC expertise (Terraform)', 'On-call experience', 'AWS certifications preferred'] },
  { id: 'j5',  title: 'iOS Developer',             company: 'Apple',        logo: '🍎', location: 'Cupertino',   salary: '$135K – $175K', category: 'Engineering', type: 'Full-time',  exp: 'Mid-level',tags: ['Swift','SwiftUI','Xcode'],     featured: true,  posted: '3h ago',   desc: 'Create incredible iPhone and iPad apps that delight millions of users. Contribute to Apple\'s ecosystem with cutting-edge SwiftUI development.', requirements: ['3+ years iOS development', 'Proficiency in Swift & SwiftUI', 'App Store shipping experience', 'Understanding of Human Interface Guidelines', 'Performance optimization skills'] },
  { id: 'j6',  title: 'Marketing Manager',         company: 'HubSpot',      logo: '📈', location: 'Boston',      salary: '$85K – $115K',  category: 'Marketing',   type: 'Full-time',  exp: 'Mid-level',tags: ['SEO','Content','Analytics'],   featured: false, posted: '3d ago',  desc: 'Lead growth marketing initiatives for HubSpot\'s SMB segment. Own campaigns from strategy through execution and measurement.', requirements: ['4+ years B2B marketing', 'Strong analytical mindset', 'Demand gen experience', 'Content strategy skills', 'CRM/marketing automation proficiency'] },
  { id: 'j7',  title: 'Backend Engineer (Python)', company: 'Spotify',      logo: '🎵', location: 'Remote',      salary: '$115K – $155K', category: 'Engineering', type: 'Full-time',  exp: 'Mid-level',tags: ['Python','Django','PostgreSQL'], featured: false, posted: '1d ago',  desc: 'Power the APIs and microservices that serve music to 500M+ listeners. Work on high-scale distributed systems.', requirements: ['4+ years Python backend', 'REST API design', 'Database optimization', 'Microservices architecture', 'Experience with high-traffic systems'] },
  { id: 'j8',  title: 'UI/UX Designer',            company: 'Airbnb',       logo: '🏠', location: 'San Francisco', salary: '$105K – $140K', category: 'Design',     type: 'Full-time',  exp: 'Mid-level',tags: ['Figma','Research','Design Systems'],featured: false, posted: '2d ago', desc: 'Design experiences that help people belong anywhere. Join a world-class design team pushing the boundaries of hospitality.', requirements: ['3+ years UX design', 'Strong portfolio with case studies', 'User research methodology', 'Design systems experience', 'Cross-platform design'] },
  { id: 'j9',  title: 'Machine Learning Engineer', company: 'OpenAI',       logo: '🤖', location: 'San Francisco', salary: '$180K – $250K', category: 'Data Science', type: 'Full-time',  exp: 'Senior',   tags: ['PyTorch','LLMs','CUDA'],       featured: true,  posted: '6h ago',   desc: 'Work on frontier AI models. Help train and deploy the next generation of language models that benefit humanity.', requirements: ['MS/PhD in ML or related', '5+ years ML experience', 'Deep learning expertise', 'Large-scale training experience', 'Strong research background'] },
  { id: 'j10', title: 'Content Writer',            company: 'Medium',       logo: '✍️', location: 'Remote',      salary: '$55K – $75K',   category: 'Marketing',   type: 'Part-time',  exp: 'Junior',   tags: ['Writing','SEO','Research'],    featured: false, posted: '4d ago',  desc: 'Craft compelling stories and articles that inform and inspire millions of readers on Medium\'s platform.', requirements: ['2+ years content writing', 'Strong editorial skills', 'SEO knowledge', 'Ability to work independently', 'Diverse topic research capability'] },
  { id: 'j11', title: 'Finance Analyst',           company: 'Goldman Sachs',logo: '💰', location: 'New York',    salary: '$95K – $130K',  category: 'Finance',     type: 'Full-time',  exp: 'Junior',   tags: ['Excel','Financial Modeling','SQL'],featured: false,posted: '5d ago', desc: 'Analyze financial data to support strategic business decisions. Work with senior partners on high-profile client engagements.', requirements: ['Finance/Economics degree', '2+ years analyst experience', 'Advanced Excel skills', 'Financial modeling expertise', 'CFA progress preferred'] },
  { id: 'j12', title: 'React Native Developer',    company: 'Discord',      logo: '💬', location: 'Remote',      salary: '$100K – $135K', category: 'Engineering', type: 'Contract',   exp: 'Mid-level',tags: ['React Native','TypeScript','Redux'],featured: false,posted: '1d ago', desc: 'Build the mobile experience for Discord\'s 150M+ users. Optimize performance and ship features on iOS and Android simultaneously.', requirements: ['3+ years React Native', 'Strong TypeScript skills', 'Redux/state management', 'Native module bridging', 'Performance debugging'] },
  { id: 'j13', title: 'UX Researcher',             company: 'Google',       logo: '🔍', location: 'Mountain View',salary: '$115K – $150K', category: 'Design',      type: 'Full-time',  exp: 'Mid-level',tags: ['Research','Interviews','Usability'],featured: false,posted: '3h ago', desc: 'Conduct research that shapes products used by billions. Define user needs and translate insights into impactful product decisions at Google.', requirements: ['4+ years UX research', 'Qualitative & quantitative methods', 'Survey design expertise', 'Strong presentation skills', 'Statistics knowledge'] },
  { id: 'j14', title: 'Sales Development Rep',     company: 'Salesforce',   logo: '☁', location: 'Chicago',      salary: '$60K – $90K',   category: 'Sales',       type: 'Full-time',  exp: 'Junior',   tags: ['CRM','Outreach','B2B'],        featured: false, posted: '2d ago',  desc: 'Drive top-of-funnel pipeline for Salesforce\'s enterprise segment. Master consultative selling while growing your career in tech sales.', requirements: ['1+ year SDR experience', 'Excellent communication skills', 'CRM experience (Salesforce preferred)', 'Target-driven mindset', 'Strong organizational skills'] },
  { id: 'j15', title: 'Product Manager',           company: 'Notion',       logo: '📝', location: 'Remote',      salary: '$125K – $165K', category: 'Product',     type: 'Full-time',  exp: 'Senior',   tags: ['Roadmap','Agile','Analytics'],  featured: true,  posted: '8h ago',   desc: 'Define and drive the product vision for Notion\'s collaboration features. Obsess over user delight and business impact in equal measure.', requirements: ['5+ years product management', 'Strong analytical skills', 'Technical literacy', 'Excellent written communication', 'Experience with B2B SaaS'] },
  { id: 'j16', title: 'Full Stack Intern',         company: 'Vercel',       logo: '▲', location: 'Remote',       salary: '$30/hr',        category: 'Engineering', type: 'Internship', exp: 'Entry',    tags: ['Next.js','React','Node.js'],   featured: false, posted: '6h ago',   desc: 'Work directly with Vercel\'s engineering team building the future of frontend deployment. Real work, real impact on millions of developers.', requirements: ['Currently enrolled CS student', 'Next.js/React knowledge', 'Curiosity and passion', 'Strong problem-solving skills', 'Good communication'] },
];

const CATEGORIES = [
  { name: 'Engineering',  icon: '💻', color: '#dbeafe' },
  { name: 'Design',       icon: '🎨', color: '#fce7f3' },
  { name: 'Marketing',    icon: '📣', color: '#dcfce7' },
  { name: 'Data Science', icon: '📊', color: '#fef3c7' },
  { name: 'Product',      icon: '🚀', color: '#ede9fe' },
  { name: 'Finance',      icon: '💰', color: '#d1fae5' },
  { name: 'Sales',        icon: '🤝', color: '#fee2e2' },
  { name: 'Operations',   icon: '⚙️', color: '#e0f2fe' },
];

// ── Get all jobs (base + custom) ──────────────
function getAllJobs() {
  const custom = get(KEYS.CUSTOM_JOBS) || [];
  return [...BASE_JOBS, ...custom];
}

// ── Applied Jobs ──────────────────────────────
function getApplied() { return get(KEYS.APPLIED) || []; }

function isApplied(jobId) { return getApplied().some(a => a.jobId === jobId); }

function applyJob(jobId) {
  const jobs = getAllJobs();
  const job  = jobs.find(j => j.id === jobId);
  if (!job) return;
  if (isApplied(jobId)) { showToast('You\'ve already applied to this job', 'warning'); return; }

  const applied = getApplied();
  const statuses = ['Pending Review', 'Viewed', 'Shortlisted'];
  applied.push({ jobId, jobTitle: job.title, company: job.company, logo: job.logo, location: job.location, salary: job.salary, appliedAt: new Date().toISOString(), status: 'Pending Review' });
  set(KEYS.APPLIED, applied);

  updateAppliedBadge();
  showToast(`Applied to ${job.title} at ${job.company}! 🎉`, 'success');

  // Refresh UI
  const btn = document.querySelector(`[data-apply="${jobId}"]`);
  if (btn) { btn.classList.add('applied'); btn.textContent = 'Applied'; }

  if ($('appliedSection') && !$('appliedSection').classList.contains('hidden')) renderApplied();
}

function removeApplication(jobId) {
  let applied = getApplied().filter(a => a.jobId !== jobId);
  set(KEYS.APPLIED, applied);
  updateAppliedBadge();
  renderApplied();
  showToast('Application removed', 'info');

  // Update button if visible
  const btn = document.querySelector(`[data-apply="${jobId}"]`);
  if (btn) { btn.classList.remove('applied'); btn.textContent = 'Apply Now'; }
}

function updateAppliedBadge() {
  const count = getApplied().length;
  const badge = $('navAppliedBadge');
  if (!badge) return;
  badge.textContent = count;
  badge.classList.toggle('hidden', count === 0);
}

// ── Job Card Builder ──────────────────────────
function buildJobCard(job, delay = 0) {
  const applied = isApplied(job.id);
  const tags = (job.tags || []).slice(0, 3).map(t => `<span class="job-tag">${t}</span>`).join('');
  const featured = job.featured ? '<span class="badge-pill badge-featured">⭐ Featured</span>' : '';
  const isNew = job.posted && job.posted.includes('h') ? '<span class="badge-pill badge-new">New</span>' : '';

  return `
    <div class="job-card" style="animation-delay:${delay}ms" onclick="openJobModal('${job.id}')">
      <div class="job-card-top">
        <div class="company-logo">${job.logo}</div>
        <div class="job-badges">${featured}${isNew}</div>
      </div>
      <div class="job-title">${job.title}</div>
      <div class="job-company">${job.company}</div>
      <div class="job-meta">
        <span class="job-meta-item"><i class="fa-solid fa-location-dot"></i> ${job.location}</span>
        <span class="job-meta-item"><i class="fa-solid fa-briefcase"></i> ${job.type}</span>
        <span class="job-meta-item"><i class="fa-solid fa-clock"></i> ${job.posted}</span>
      </div>
      ${job.salary ? `<div class="job-salary"><i class="fa-solid fa-money-bill-wave"></i> ${job.salary}</div>` : ''}
      <div class="job-tags">${tags}</div>
      <div class="job-card-actions" onclick="event.stopPropagation()">
        <button class="btn-apply ${applied ? 'applied' : ''}" data-apply="${job.id}" onclick="applyJob('${job.id}')">
          ${applied ? '✓ Applied' : 'Apply Now'}
        </button>
        <button class="btn-details" onclick="openJobModal('${job.id}')" title="View details">
          <i class="fa-solid fa-arrow-up-right-from-square"></i>
        </button>
      </div>
    </div>
  `;
}

// ── Job Detail Modal ──────────────────────────
function openJobModal(jobId) {
  const job = getAllJobs().find(j => j.id === jobId);
  if (!job) return;
  const applied = isApplied(jobId);
  const reqList = (job.requirements || []).map(r => `<li>${r}</li>`).join('');
  const tags = (job.tags || []).map(t => `<span class="job-tag">${t}</span>`).join('');

  $('modalContent').innerHTML = `
    <div class="modal-job-header">
      <div class="modal-job-logo-row">
        <div class="modal-logo">${job.logo}</div>
        <div>
          <div class="modal-job-title">${job.title}</div>
          <div class="modal-job-company">${job.company}</div>
        </div>
      </div>
      ${job.salary ? `<div class="modal-salary-badge"><i class="fa-solid fa-money-bill-trend-up"></i> ${job.salary}</div>` : ''}
      <div class="modal-job-meta">
        <span class="job-meta-item"><i class="fa-solid fa-location-dot"></i> ${job.location}</span>
        <span class="job-meta-item"><i class="fa-solid fa-briefcase"></i> ${job.type}</span>
        <span class="job-meta-item"><i class="fa-solid fa-layer-group"></i> ${job.exp}</span>
        <span class="job-meta-item"><i class="fa-solid fa-clock"></i> ${job.posted}</span>
        <span class="job-meta-item"><i class="fa-solid fa-tag"></i> ${job.category}</span>
      </div>
      <div class="job-tags">${tags}</div>
    </div>
    <div class="modal-section">
      <h4><i class="fa-solid fa-file-lines"></i> About This Role</h4>
      <p>${job.desc || 'No description provided.'}</p>
    </div>
    ${reqList ? `<div class="modal-section"><h4><i class="fa-solid fa-list-check"></i> Requirements</h4><ul>${reqList}</ul></div>` : ''}
    <div class="modal-section">
      <h4><i class="fa-solid fa-building"></i> About ${job.company}</h4>
      <p>Join ${job.company} and work alongside world-class talent to build products that matter. ${job.company} offers competitive benefits, flexible work, and an inclusive culture.</p>
    </div>
    <div class="modal-actions">
      <button class="btn-primary ${applied ? 'applied' : ''}" onclick="applyJob('${job.id}'); this.classList.add('applied'); this.textContent='✓ Applied'">
        ${applied ? '✓ Already Applied' : '<i class="fa-solid fa-paper-plane"></i> Apply Now'}
      </button>
      <button class="btn-outline" onclick="closeJobModal()">Close</button>
    </div>
  `;

  $('jobModal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeJobModal() {
  $('jobModal').classList.add('hidden');
  document.body.style.overflow = '';
}

function closeModal(e) {
  if (e.target === e.currentTarget) closeJobModal();
}

// ── Category Grid ─────────────────────────────
function renderCategories() {
  const grid = $('categoryGrid');
  if (!grid) return;
  const jobs = getAllJobs();
  grid.innerHTML = CATEGORIES.map(cat => {
    const count = jobs.filter(j => j.category === cat.name).length;
    return `
      <div class="category-card" onclick="filterByCategory('${cat.name}')" style="--cat-color:${cat.color}">
        <div class="cat-icon" style="background:${cat.color}">${cat.icon}</div>
        <div class="cat-name">${cat.name}</div>
        <div class="cat-count">${count} jobs</div>
      </div>
    `;
  }).join('');
}

function filterByCategory(cat) {
  showSection('jobs');
  setTimeout(() => {
    document.querySelectorAll('#categoryFilters .filter-check input').forEach(cb => {
      cb.checked = cb.parentElement.querySelector('span') && cb.parentElement.querySelector('span').textContent.trim().startsWith(cat);
    });
    applyFilters();
  }, 100);
}

// ── Featured Jobs ─────────────────────────────
function renderFeatured() {
  const grid = $('featuredGrid');
  if (!grid) return;
  const featured = getAllJobs().filter(j => j.featured).slice(0, 6);
  grid.innerHTML = featured.map((j, i) => buildJobCard(j, i * 60)).join('');
}

// ── Jobs Section ──────────────────────────────
let currentView = 'grid';
let currentSort = 'recent';
let filteredJobs = [];

function renderFilters() {
  const jobs = getAllJobs();
  renderFilterGroup('locationFilters', [...new Set(jobs.map(j => j.location))], jobs, 'location');
  renderFilterGroup('categoryFilters', [...new Set(jobs.map(j => j.category))], jobs, 'category');
  renderFilterGroup('typeFilters', [...new Set(jobs.map(j => j.type))], jobs, 'type');
  renderFilterGroup('expFilters', [...new Set(jobs.map(j => j.exp))], jobs, 'exp');
}

function renderFilterGroup(containerId, values, jobs, field) {
  const container = $(containerId);
  if (!container) return;
  container.innerHTML = values.map(val => {
    const count = jobs.filter(j => j[field] === val).length;
    return `
      <label class="filter-check">
        <input type="checkbox" value="${val}" onchange="applyFilters()"/>
        <span>${val}</span>
        <span class="filter-check-count">${count}</span>
      </label>
    `;
  }).join('');
}

function getCheckedValues(containerId) {
  const container = $(containerId);
  if (!container) return [];
  return [...container.querySelectorAll('input:checked')].map(cb => cb.value);
}

function applyFilters() {
  const query    = ($('searchInput') ? $('searchInput').value : '').toLowerCase();
  const locs     = getCheckedValues('locationFilters');
  const cats     = getCheckedValues('categoryFilters');
  const types    = getCheckedValues('typeFilters');
  const exps     = getCheckedValues('expFilters');

  filteredJobs = getAllJobs().filter(job => {
    const matchQuery = !query || job.title.toLowerCase().includes(query) || job.company.toLowerCase().includes(query) || (job.tags || []).some(t => t.toLowerCase().includes(query));
    const matchLoc   = !locs.length  || locs.includes(job.location);
    const matchCat   = !cats.length  || cats.includes(job.category);
    const matchType  = !types.length || types.includes(job.type);
    const matchExp   = !exps.length  || exps.includes(job.exp);
    return matchQuery && matchLoc && matchCat && matchType && matchExp;
  });

  sortJobs(currentSort, false);
  renderJobsGrid();
  updateResultCount();
}

function sortJobs(val, rerender = true) {
  currentSort = val;
  if (val === 'salary') {
    filteredJobs.sort((a, b) => {
      const getNum = s => s ? parseInt(s.replace(/[^0-9]/g, '')) : 0;
      return getNum(b.salary) - getNum(a.salary);
    });
  } else if (val === 'az') {
    filteredJobs.sort((a, b) => a.title.localeCompare(b.title));
  }
  if (rerender) renderJobsGrid();
}

function renderJobsGrid() {
  const grid = $('jobsGrid');
  const noResults = $('noResults');
  if (!grid) return;

  if (filteredJobs.length === 0) {
    grid.innerHTML = '';
    noResults && noResults.classList.remove('hidden');
  } else {
    noResults && noResults.classList.add('hidden');
    grid.innerHTML = filteredJobs.map((j, i) => buildJobCard(j, i * 40)).join('');
    grid.className = `jobs-grid ${currentView === 'list' ? 'list-view' : ''}`;
  }
}

function updateResultCount() {
  const el = $('jobsResultCount');
  if (el) el.textContent = `${filteredJobs.length} job${filteredJobs.length !== 1 ? 's' : ''} found`;
}

function setView(view) {
  currentView = view;
  $('gridViewBtn') && $('gridViewBtn').classList.toggle('active', view === 'grid');
  $('listViewBtn') && $('listViewBtn').classList.toggle('active', view === 'list');
  renderJobsGrid();
}

function clearFilters() {
  document.querySelectorAll('.filter-checkboxes input[type=checkbox]').forEach(cb => cb.checked = false);
  if ($('searchInput')) $('searchInput').value = '';
  filteredJobs = [...getAllJobs()];
  renderJobsGrid();
  updateResultCount();
}

function toggleFilterPanel() {
  const panel = $('filtersPanel');
  if (panel) panel.classList.toggle('mobile-open');
}

// ── Applied Section ───────────────────────────
function renderApplied() {
  const grid    = $('appliedGrid');
  const noEl    = $('noApplied');
  const count   = $('appliedCount');
  const stats   = $('appliedStats');
  const applied = getApplied();

  if (count) count.textContent = `${applied.length} application${applied.length !== 1 ? 's' : ''}`;

  if (applied.length === 0) {
    grid && (grid.innerHTML = '');
    noEl && noEl.classList.remove('hidden');
    stats && (stats.innerHTML = '');
    return;
  }

  noEl && noEl.classList.add('hidden');

  if (stats) {
    const pending     = applied.filter(a => a.status === 'Pending Review').length;
    const shortlisted = applied.filter(a => a.status === 'Shortlisted').length;
    stats.innerHTML = `
      <div class="applied-stat-chip"><strong>${applied.length}</strong>Total</div>
      <div class="applied-stat-chip"><strong>${pending}</strong>Pending</div>
      <div class="applied-stat-chip"><strong>${shortlisted}</strong>Shortlisted</div>
    `;
  }

  if (grid) {
    grid.innerHTML = applied.map((a, i) => {
      const date = new Date(a.appliedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const statusClass = { 'Pending Review': 'status-pending', 'Viewed': 'status-viewed', 'Shortlisted': 'status-shortlisted' }[a.status] || 'status-pending';
      return `
        <div class="applied-card" style="animation-delay:${i * 50}ms">
          <div class="applied-company-logo">${a.logo || '🏢'}</div>
          <div class="applied-info">
            <div class="applied-title">${a.jobTitle}</div>
            <div class="applied-company">${a.company}</div>
            <div class="applied-details">
              <span class="applied-detail"><i class="fa-solid fa-location-dot"></i> ${a.location || '—'}</span>
              ${a.salary ? `<span class="applied-detail"><i class="fa-solid fa-money-bill-wave"></i> ${a.salary}</span>` : ''}
            </div>
          </div>
          <div class="applied-actions">
            <span class="applied-date">Applied ${date}</span>
            <span class="applied-status ${statusClass}">${a.status}</span>
            <button class="btn-remove" onclick="removeApplication('${a.jobId}')"><i class="fa-solid fa-trash-can"></i> Remove</button>
          </div>
        </div>
      `;
    }).join('');
  }
}

// ── Profile Section ───────────────────────────
function renderProfile() {
  const user = get(KEYS.CURRENT);
  if (!user) return;

  const fullName = `${user.firstName} ${user.lastName}`;
  const initial  = (user.firstName || 'U')[0].toUpperCase();
  const joined   = user.joinedDate ? new Date(user.joinedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—';
  const applied  = getApplied();

  setText('profileFullName', fullName);
  setText('profileRole', user.role || 'Job Seeker');
  setText('profileEmail', user.email || '—');
  setText('profileField', user.role || '—');
  setText('profileJoined', `Joined ${joined}`);
  setText('profileAbout', user.about || 'No bio added yet. Tell employers about yourself!');
  setText('pStatApplied', applied.length);
  setText('pStatViews', user.profileViews || '—');

  const avatarEl = $('profileAvatarLg');
  if (avatarEl) avatarEl.textContent = initial;

  const skillsEl = $('profileSkills');
  if (skillsEl) {
    const skills = user.skills && user.skills.length ? user.skills : [];
    skillsEl.innerHTML = skills.length
      ? skills.map(s => `<span class="skill-chip">${s}</span>`).join('')
      : '<span class="skill-chip" style="background:var(--surface-2);color:var(--text-3)">Add skills...</span>';
  }

  const recentEl = $('recentApplied');
  if (recentEl) {
    const recent = applied.slice(-3).reverse();
    recentEl.innerHTML = recent.length
      ? recent.map(a => `
          <div class="recent-applied-item">
            <div class="recent-applied-icon">${a.logo || '🏢'}</div>
            <div class="recent-applied-info">
              <strong>${a.jobTitle}</strong>
              <span>${a.company}</span>
            </div>
            <span class="applied-status status-pending" style="font-size:0.7rem;">${a.status}</span>
          </div>
        `).join('')
      : '<p style="color:var(--text-3);font-size:0.875rem;">No applications yet.</p>';
  }
}

function setText(id, val) { const el = $(id); if (el) el.textContent = val; }

// ── Edit Profile Modal ────────────────────────
function openEditProfile() {
  const user = get(KEYS.CURRENT);
  if (!user) return;
  if ($('editFirst'))    $('editFirst').value    = user.firstName || '';
  if ($('editLast'))     $('editLast').value     = user.lastName  || '';
  if ($('editRole'))     $('editRole').value     = user.role      || '';
  if ($('editAbout'))    $('editAbout').value    = user.about     || '';
  if ($('editSkills'))   $('editSkills').value   = (user.skills || []).join(', ');
  if ($('editLocation')) $('editLocation').value = user.location  || '';
  $('editProfileModal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeEditModal(e) {
  if (e && e.target !== e.currentTarget) return;
  $('editProfileModal').classList.add('hidden');
  document.body.style.overflow = '';
}

function saveProfile(e) {
  e.preventDefault();
  const user = get(KEYS.CURRENT);
  if (!user) return;

  user.firstName = $('editFirst').value.trim();
  user.lastName  = $('editLast').value.trim();
  user.role      = $('editRole').value.trim();
  user.about     = $('editAbout').value.trim();
  user.skills    = $('editSkills').value.split(',').map(s => s.trim()).filter(Boolean);
  user.location  = $('editLocation').value.trim();

  set(KEYS.CURRENT, user);

  // Update in users store too
  const users = get(KEYS.USERS) || {};
  if (users[user.email]) {
    Object.assign(users[user.email], user);
    set(KEYS.USERS, users);
  }

  $('editProfileModal').classList.add('hidden');
  document.body.style.overflow = '';
  renderProfile();
  updateNavUser();
  showToast('Profile updated successfully! 🎉', 'success');
}

// ── Admin Panel ───────────────────────────────
function showAdminPanel() {
  $('adminModal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeAdminModal(e) {
  if (e && e.target !== e.currentTarget) return;
  $('adminModal').classList.add('hidden');
  document.body.style.overflow = '';
}

function addNewJob(e) {
  e.preventDefault();
  const newJob = {
    id: 'c' + Date.now(),
    title:    $('adminTitle').value.trim(),
    company:  $('adminCompany').value.trim(),
    location: $('adminLocation').value.trim(),
    salary:   $('adminSalary').value.trim() || null,
    category: $('adminCategory').value,
    type:     $('adminType').value,
    exp: 'Mid-level',
    tags: [$('adminCategory').value],
    desc: $('adminDesc').value.trim(),
    requirements: $('adminReqs').value.split('\n').filter(Boolean),
    logo: '🏢',
    featured: false,
    posted: 'Just now',
  };

  const custom = get(KEYS.CUSTOM_JOBS) || [];
  custom.push(newJob);
  set(KEYS.CUSTOM_JOBS, custom);

  $('adminModal').classList.add('hidden');
  document.body.style.overflow = '';
  showToast(`Job "${newJob.title}" posted successfully! ✅`, 'success');

  // Refresh
  renderCategories();
  renderFeatured();
  filteredJobs = getAllJobs();
  renderFilters();
  renderJobsGrid();
  updateResultCount();
}

// ── Navigation ────────────────────────────────
function showSection(name, linkEl) {
  ['home','jobs','applied','profile'].forEach(s => {
    const el = $(`${s}Section`);
    if (el) el.classList.toggle('hidden', s !== name);
  });

  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  if (linkEl) linkEl.classList.add('active');
  else {
    const matching = document.querySelector(`[data-section="${name}"]`);
    if (matching) matching.classList.add('active');
  }

  // Close mobile menu
  const navLinks = $('navLinks');
  if (navLinks) navLinks.classList.remove('mobile-open');

  // Lazy-render sections
  if (name === 'applied') renderApplied();
  if (name === 'profile') renderProfile();
  if (name === 'jobs' && filteredJobs.length === 0) {
    filteredJobs = getAllJobs();
    renderJobsGrid();
    updateResultCount();
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleMenu() {
  const nav = $('navLinks');
  const ham = $('hamburger');
  if (!nav) return;
  nav.classList.toggle('mobile-open');
  const isOpen = nav.classList.contains('mobile-open');
  ham.innerHTML = isOpen
    ? '<span style="transform:rotate(45deg) translate(5px,6px);display:block;width:22px;height:2px;background:var(--text);border-radius:99px"></span><span style="opacity:0;display:block;width:22px;height:2px;background:var(--text);border-radius:99px"></span><span style="transform:rotate(-45deg) translate(5px,-6px);display:block;width:22px;height:2px;background:var(--text);border-radius:99px"></span>'
    : '<span></span><span></span><span></span>';
}

// ── Hero Search ───────────────────────────────
function heroSearch() {
  const q = $('heroSearchInput') ? $('heroSearchInput').value : '';
  if ($('searchInput')) $('searchInput').value = q;
  applyFilters();
}

function quickSearch(term) {
  if ($('heroSearchInput')) $('heroSearchInput').value = term;
  if ($('searchInput'))     $('searchInput').value     = term;
  showSection('jobs');
  applyFilters();
}

// ── Navbar User Info ──────────────────────────
function updateNavUser() {
  const user = get(KEYS.CURRENT);
  if (!user) return;
  const initial  = (user.firstName || 'U')[0].toUpperCase();
  const navName  = $('navUserName');
  const navAv    = $('navAvatar');
  const heroName = $('heroName');

  if (navName) navName.textContent = user.firstName || 'User';
  if (navAv)   navAv.textContent   = initial;
  if (heroName) heroName.textContent = user.firstName || 'Friend';
}

// ── Navbar Scroll Effect ──────────────────────
window.addEventListener('scroll', () => {
  const nav = $('navbar');
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 20);
});

// ── Dashboard Init ────────────────────────────
function initDashboard() {
  if (!requireAuth()) return;
  applyDark();
  updateNavUser();
  updateAppliedBadge();
  renderCategories();
  renderFeatured();
  renderFilters();
  filteredJobs = getAllJobs();
  updateResultCount();
}

// ── Auth Page Init ────────────────────────────
function initAuth() {
  applyDark();
  if (get(KEYS.CURRENT)) window.location.href = 'dashboard.html';
}

// ── Page Detection ────────────────────────────
(function boot() {
  const path = window.location.pathname;
  if (path.includes('dashboard.html')) {
    initDashboard();
  } else {
    initAuth();
  }
})();
