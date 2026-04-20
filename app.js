// ============================================
// 1. SETTINGS & AUTO-DEBUG
// ============================================
const DEBUG_MODE = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.protocol === "file:");
function log(msg, data = null) { if (!DEBUG_MODE) return; const time = new Date().toLocaleTimeString(); if (data) console.log(`[${time}] 🔧 ${msg}`, data); else console.log(`[${time}] 🔧 ${msg}`); }

let SUPABASE_URL = "";
let SUPABASE_KEY = "";

if (DEBUG_MODE) {
    log("Running in TEST MODE connected to Sandbox DB");
    SUPABASE_URL = "https://fqxturtabhbpgbizriss.supabase.co";
    SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxeHR1cnRhYmhicGdiaXpyaXNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2NTM5MzMsImV4cCI6MjA4NzIyOTkzM30.p9lIjSuiGRG84YlpXVe0B-rdd1-6tz4zU-uKzKjQNEQ";
} else {
    SUPABASE_URL = "https://qqrzlltwvvpowdigffsq.supabase.co";
    SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxcnpsbHR3dnZwb3dkaWdmZnNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzNTQ4MTUsImV4cCI6MjA4NTkzMDgxNX0.4C1CcwQ7BSx53Ofk284Mtc0TPxd3KoHfMR_qIm9WbZQ";
}
// ============================================
// 2. GLOBAL VARIABLES
// ============================================
let actualUserRole = 'tech';
let currentUserRole = 'admin';
let currentUserTeam = null;
let soData = [];
let DYNAMIC_TEAMS = new Set(["Team Bernie", "Team Randy"]);
let DYNAMIC_AREAS = new Set(["TAGAYTAY", "AMADEO", "MENDEZ", "BAILEN", "MARAGONDON", "ALFONSO", "MAGALLANES", "INDANG", "TERNATE"]);
let authTeamsList = [];

const BARANGAY_MAP = {
    "ALFONSO": ["AMUYONG", "BARANGAY I (POB.)", "BARANGAY II (POB.)", "BARANGAY III (POB.)", "BARANGAY IV (POB.)", "BARANGAY V (POB.)", "BILOG", "BUCK ESTATE", "ESPERANZA IBABA", "ESPERANZA ILAYA", "KAYSUYO", "KAYTITINGA I", "KAYTITINGA II", "KAYTITINGA III", "LUKSUHIN", "LUKSUHIN ILAYA", "MANGAS I", "MANGAS II", "MARAHAN I", "MARAHAN II", "MATAGBAK I", "MATAGBAK II", "PALUMLUM", "PAJO", "SIKAT", "SINALIW MALAKI", "SINALIW NA MUNTI", "SANTA TERESA", "SULSUGIN", "TAYWANAK IBABA", "TAYWANAK ILAYA", "UPLI"],
    "AMADEO": ["BANAYBANAY", "BARANGAY I (POB.)", "BARANGAY II (POB.)", "BARANGAY III (POB.)", "BARANGAY IV (POB.)", "BARANGAY V (POB.)", "BARANGAY VI (POB.)", "BARANGAY VII (POB.)", "BARANGAY VIII (POB.)", "BARANGAY IX (POB.)", "BARANGAY X (POB.)", "BARANGAY XI (POB.)", "BARANGAY XII (POB.)", "BUCAL", "BUHO", "DAGATAN", "HALANG", "LOMA", "MAYMANGGA", "MAITIM I", "MINANTOK KANLURAN", "MINANTOK SILANGAN", "PANGIL", "SALABAN", "TALON", "TAMACAN"],
    "BAILEN": ["A. DALUSAG", "BATAS DAO", "CASTAÑOS CERCA", "CASTAÑOS LEJOS", "KABULUSAN", "KAYMISAS", "KAYPAABA", "LUMIPA", "NARVAEZ", "POBLACION I", "POBLACION II", "POBLACION III", "POBLACION IV", "TABORA"],
    "INDANG": ["AGUS-US", "ALULOD", "BANABA CERCA", "BANABA LEJOS", "BANCOD", "BARANGAY 1 (POB.)", "BARANGAY 2 (POB.)", "BARANGAY 3 (POB.)", "BARANGAY 4 (POB.)", "BUNA CERCA", "BUNA LEJOS I", "BUNA LEJOS II", "CALUMPANG CERCA", "CALUMPANG LEJOS I", "CARASUCHI", "DAINE I", "DAINE II", "GUYAM MALAKI", "GUYAM MUNTI", "HARASAN", "KAYQUIT I", "KAYQUIT II", "KAYQUIT III", "KAYTAMBOG", "KAYTAPOS", "LIMBON", "LUMAMPONG BALAGBAG", "LUMAMPONG HALAYHAY", "MAHABANGKAHOY CERCA", "MAHABANGKAHOY LEJOS", "MATAAS NA LUPA", "PULO", "TAMBO BALAGBAG", "TAMBO ILAYA", "TAMBO KULIT", "TAMBO MALAKI"],
    "MAGALLANES": ["BALIWAG", "BENDITA I", "BENDITA II", "CALUANGAN", "KABULUSAN", "MEDINA", "PACHECO", "RAMIREZ", "SAN AGUSTIN", "TUA", "URDANETA", "BARANGAY 1 (POB.)", "BARANGAY 2 (POB.)", "BARANGAY 3 (POB.)", "BARANGAY 4 (POB.)", "BARANGAY 5 (POB.)"],
    "MARAGONDON": ["BUCAL I", "BUCAL II", "BUCAL III A", "BUCAL III B", "BUCAL IV A", "BUCAL IV B", "CAINGIN POB.", "GARITA I A", "GARITA I B", "LAYONG MABILOG", "MABATO", "PANTIHAN I", "PANTIHAN II", "PANTIHAN III", "PANTIHAN IV", "PATUNGAN", "PINAGSANHAN I A", "PINAGSANHAN I B", "POBLACION I A", "POBLACION I B", "POBLACION II A", "POBLACION II B", "SAN MIGUEL I A", "SAN MIGUEL I B", "TALIPUSNGO", "TULAY KANLURAN", "TULAY SILANGAN", "VILLAFRANCA"],
    "MENDEZ": ["ANULING CERCA I", "ANULING CERCA II", "ANULING LEJOS I", "ANULING LEJOS II", "ASIS I", "ASIS II", "ASIS III", "BANAYAD", "BUKAL", "GALICIA I", "GALICIA II", "GALICIA III", "MIGUEL MOJICA", "PALOCPOC I", "PALOCPOC II", "PANUNGYAN I", "PANUNGYAN II", "POBLACION I", "POBLACION II", "POBLACION III", "POBLACION IV", "POBLACION V", "POBLACION VI", "POBLACION VII"],
    "TAGAYTAY": ["ASISAN", "BAGONG TUBIG", "CALABUSO", "DAPDAP EAST", "DAPDAP WEST", "FRANCISCO", "GUINHAWA NORTH", "GUINHAWA SOUTH", "IRUHIN EAST", "IRUHIN SOUTH", "IRUHIN WEST", "KAYBAGAL EAST", "KAYBAGAL NORTH", "KAYBAGAL SOUTH (POB.)", "MAG-ASAWANG ILAT", "MAHARLIKA EAST", "MAHARLIKA WEST", "MAITIM 2ND CENTRAL", "MAITIM 2ND EAST", "MAITIM 2ND WEST", "MENDEZ CROSSING EAST", "MENDEZ CROSSING WEST", "NEOGAN", "PATUTONG MALAKI NORTH", "PATUTONG MALAKI SOUTH", "SAMBONG", "SAN JOSE", "SILANG JUNCTION NORTH", "SILANG JUNCTION SOUTH", "SUNGAY NORTH", "SUNGAY SOUTH", "TOLENTINO EAST", "TOLENTINO WEST", "ZAMBAL", "-"],
    "TERNATE": ["POBLACION I", "POBLACION I A", "POBLACION II", "POBLACION III", "BUCANA", "SAN JOSE", "SAN JUAN I", "SAN JUAN II", "SAPANG I", "SAPANG II", "-"]
};
// AUTO-TECH DEBUG BYPASS
if (DEBUG_MODE && window.location.search.includes('debug_tech=true')) {
    actualUserRole = 'tech';
    currentUserRole = 'tech';
    currentUserTeam = 'Team Bernie';
    setTimeout(() => {
        setupEventListeners();
        applyRBACUI();
        showApp();
    }, 500);
}

let currentTab = 'active';
let currentAppMode = 'SLR';
console.log("🚀 DISPATCHER LOGIC V2.1 ACTIVE - TERSER BUILD");
let renderLimit = 50;
let db = null;
let lineChartInstance = null;
let pieChartInstance = null;
let techTodayOnlyMode = true; // Feature 4: Techs default to today-only view

// ============================================
// TOAST NOTIFICATION UTILITY
// ============================================
function showToast(message, type = 'info', duration = 5000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const colors = {
        success: 'bg-green-600 border-green-700',
        warning: 'bg-amber-500 border-amber-600',
        error: 'bg-red-600 border-red-700',
        info: 'bg-blue-600 border-blue-700'
    };
    const icons = {
        success: 'fa-circle-check',
        warning: 'fa-triangle-exclamation',
        error: 'fa-circle-xmark',
        info: 'fa-circle-info'
    };

    const toast = document.createElement('div');
    toast.className = `pointer-events-auto flex items-start gap-3 text-white text-xs font-bold p-3 rounded-xl shadow-xl border ${colors[type] || colors.info} opacity-0 translate-y-4 transition-all duration-300`;
    toast.innerHTML = `<i class="fa-solid ${icons[type] || icons.info} mt-0.5 shrink-0"></i><span>${message}</span>`;
    container.appendChild(toast);

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            toast.classList.remove('opacity-0', 'translate-y-4');
        });
    });

    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-4');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// ============================================
// 3. UTILITIES & HELPERS (No Changes)
// ============================================
function parseDateInput(input) { if (!input) return null; const parts = input.split('-'); return new Date(parts[0], parts[1] - 1, parts[2]); }
function parseSafeDate(dateStr) {
    if (!dateStr) return new Date(0);
    if (dateStr instanceof Date) return dateStr;
    let d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d;
    if (typeof dateStr === 'string') {
        const parts = dateStr.split(/[-/]/);
        if (parts.length === 3) {
            if (parts[0].length === 4) return new Date(`${parts[0]}-${parts[1]}-${parts[2]}`);
            let p1 = parseInt(parts[0], 10), p2 = parseInt(parts[1], 10), y = parseInt(parts[2], 10);
            if (p1 > 12) { let t = p1; p1 = p2; p2 = t; }
            d = new Date(`${y}-${p1}-${p2}`);
        }
    }
    return isNaN(d.getTime()) ? new Date(0) : d;
}
function isSameDay(d1, d2) { if (!d1 || !d2) return false; const date1 = parseSafeDate(d1); const date2 = parseSafeDate(d2); return date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth() && date1.getDate() === date2.getDate(); }

function renderMiniCard(t, d, tot) {
    const isSLR = currentAppMode === 'SLR'; const color = isSLR ? 'green' : 'indigo'; const p = tot === 0 ? 0 : Math.round((d / tot) * 100); const c = p === 100 ? `text-${color}-600` : (p > 50 ? `text-${color}-600` : 'text-orange-500');
    return `<div onclick="openTeamAnalytics('${t}')" class="bg-white p-3 rounded-xl shadow-sm border border-gray-100 cursor-pointer clickable-card hover:border-${color}-300 transition select-none dark-element dark-border"><div class="flex justify-between items-center mb-1"><h4 class="text-xs font-bold text-gray-500 uppercase truncate w-24 dark-text">${t}</h4><span class="${c} font-bold text-sm">${p}%</span></div><div class="w-full bg-gray-100 rounded-full h-1.5 mb-1 dark-bg-sub"><div class="bg-slate-800 h-1.5 rounded-full" style="width: ${p}%"></div></div><p class="text-xs text-gray-400 text-right dark-text">${d}/${tot}</p></div>`;
}
function renderAreaRow(t, d, tot) {
    const isSLR = currentAppMode === 'SLR'; const color = isSLR ? 'green' : 'indigo'; const p = tot === 0 ? 0 : Math.round((d / tot) * 100);
    return `<div class="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-100 dark-element dark-border"><span class="text-xs font-bold text-gray-700 w-1/3 dark-text">${t}</span><div class="w-1/3 px-2"><div class="w-full bg-gray-100 rounded-full h-2 dark-bg-sub"><div class="bg-${color}-600 h-2 rounded-full" style="width: ${p}%"></div></div></div><div class="w-1/3 text-right"><span class="text-xs font-bold text-gray-600 dark-text">${p}%</span><span class="text-[10px] text-gray-400 ml-1">(${d}/${tot})</span></div></div>`;
}
function buildOptions(set, selectedVal) {
    let html = `<option value="" disabled ${!selectedVal ? 'selected' : ''}>-- Select --</option>`;[...set].sort().forEach(val => { html += `<option value="${val}" ${selectedVal === val ? 'selected' : ''}>${val}</option>`; }); html += `<option value="NEW_ENTRY" class="font-bold text-blue-600 bg-blue-50">+ ADD NEW...</option>`; return html;
}

window.updateBarangaysDropdown = (areaSelectId, brgySelectId, selectedBrgy = "") => {
    const areaVal = document.getElementById(areaSelectId)?.value;
    const brgySelect = document.getElementById(brgySelectId);
    if (!brgySelect) return;

    brgySelect.innerHTML = '<option value="">All Barangays</option>';
    if (brgySelectId.startsWith('input-') || brgySelectId.startsWith('bulk-')) {
        brgySelect.innerHTML = '<option value="" disabled selected>-- Select --</option>';
    }

    const areaKey = areaVal ? areaVal.toUpperCase() : null;
    if (!areaKey || !BARANGAY_MAP[areaKey]) {
        if (!brgySelectId.startsWith('global-')) {
            brgySelect.innerHTML = '<option value="" disabled selected>Select Area First</option>';
        }
        log(`Dropdown not updated: areaVal=${areaVal}, brgySelectId=${brgySelectId}`);
        return;
    }

    log(`Updating ${brgySelectId} for area ${areaKey}`);
    BARANGAY_MAP[areaKey].sort().forEach(b => {
        brgySelect.innerHTML += `<option value="${b}" ${selectedBrgy === b ? 'selected' : ''}>${b}</option>`;
    });
};

window.setupEventListeners = () => {
    log("Setting up Global Event Delegation...");

    // Use delegation on body to handle all current and future Area dropdowns
    document.body.addEventListener('change', (e) => {
        const id = e.target.id;
        if (id === 'input-area') {
            log("Delegated change for input-area detected.");
            setTimeout(() => window.updateBarangaysDropdown('input-area', 'input-barangay'), 20);
        } else if (id === 'global-bulk-area') {
            log("Delegated change for global-bulk-area detected.");
            setTimeout(() => window.updateBarangaysDropdown('global-bulk-area', 'global-bulk-barangay'), 20);
        }
    });
}

window.saveRemarks = async (id, val) => {
    const itemIndex = soData.findIndex(i => i.id == id);
    if (itemIndex === -1) return;

    const column = currentUserRole === 'tech' ? 'tech_remarks' : 'remarks';
    log(`Auto-saving ${column} for ${id}...`);

    try {
        await db.from('service_orders').update({ [column]: val }).eq('id', id);
        soData[itemIndex][column] = val;
    } catch (e) {
        console.error("Auto-save failed:", e);
    }
}

function generateUUID() {
    if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// ============================================
// 4. CORE FUNCTIONS
// ============================================
window.switchAppMode = (mode) => {
    currentAppMode = mode;
    const isSLR = mode === 'SLR';
    const btnSLR = document.getElementById('mode-slr'); const btnSLI = document.getElementById('mode-sli');
    if (btnSLR) btnSLR.className = isSLR ? "bg-white shadow text-green-700 px-4 py-1 rounded-md text-xs font-bold transition" : "px-4 py-1 rounded-md text-xs font-bold transition text-gray-400 hover:text-gray-600";
    if (btnSLI) btnSLI.className = !isSLR ? "bg-white shadow text-indigo-700 px-4 py-1 rounded-md text-xs font-bold transition" : "px-4 py-1 rounded-md text-xs font-bold transition text-gray-400 hover:text-gray-600";

    const primaryColor = isSLR ? 'bg-green-600' : 'bg-indigo-600'; const hoverColor = isSLR ? 'hover:bg-green-700' : 'hover:bg-indigo-700'; const shadowColor = isSLR ? 'shadow-green-600/30' : 'shadow-indigo-600/30'; const perfBg = isSLR ? 'bg-slate-800' : 'bg-indigo-900';
    const els = { 'btn-new': `${primaryColor} text-white px-3 py-1 rounded-lg text-sm font-bold ${hoverColor} shadow-md ${shadowColor} transition`, 'modal-btn': `w-full ${primaryColor} text-white py-3 rounded-xl font-bold shadow-md ${hoverColor} transition mt-2`, 'bulk-btn': `w-full ${primaryColor} text-white py-3 rounded-xl font-bold shadow-md ${hoverColor} transition mt-2`, 'btn-add-team': `${primaryColor} text-white px-3 py-2 rounded-lg font-bold text-xs ${hoverColor} transition` };
    for (const [id, cls] of Object.entries(els)) { const el = document.getElementById(id); if (el) { const isHidden = el.classList.contains('hidden'); el.className = cls; if (isHidden) el.classList.add('hidden'); } }

    const perfCard = document.getElementById('perf-card'); if (perfCard) perfCard.className = `${perfBg} text-white rounded-2xl p-5 shadow-xl relative overflow-hidden transition-colors duration-500`;
    const modalHeader = document.getElementById('team-modal-header'); if (modalHeader) modalHeader.className = `${perfBg} p-6 text-white shrink-0 transition-colors duration-500`;
    const icon = document.getElementById('filter-icon'); if (icon) icon.className = `fa-solid fa-magnifying-glass mr-2 ${isSLR ? 'text-green-500' : 'text-indigo-500'}`;
    const title = document.getElementById('app-title'); if (title) { title.innerText = `${mode} Dispatch`; title.className = `text-lg font-extrabold tracking-tight dark-text ${isSLR ? 'text-slate-800' : 'text-indigo-900'}`; }
    render(true);
}

window.switchTab = (tab) => {
    currentTab = tab;
    const limitEl = document.getElementById('entries-limit');
    renderLimit = limitEl ? parseInt(limitEl.value) : 50;

    ['pending', 'active', 'history', 'performance'].forEach(t => {
        const el = document.getElementById(`nav-${t}`);
        if (el) {
            const isHidden = el.classList.contains('hidden');
            el.className = t === tab ? "flex-1 py-3 text-center text-sm nav-active" : "flex-1 py-3 text-center text-sm nav-item relative";
            if (isHidden) el.classList.add('hidden');
        }
    });
    const listView = document.getElementById('view-list'); const perfView = document.getElementById('view-performance');
    if (tab === 'performance') { if (listView) listView.classList.add('hidden'); if (perfView) perfView.classList.remove('hidden'); }
    else {
        if (perfView) perfView.classList.add('hidden');
        if (listView) listView.classList.remove('hidden');
        const header = document.getElementById('list-header');

        if (header) {
            if (tab === 'active') header.innerText = "Dispatched";
            else if (tab === 'history') header.innerText = "Accomplished Logs";
            else if (tab === 'pending') header.innerText = "Inbox (Pending Approval)";
        }
    }
    render(true);
};

window.clearAllFilters = () => { document.getElementById('global-date-filter').value = ''; document.getElementById('global-team-filter').value = ''; document.getElementById('global-area-filter').value = ''; if (document.getElementById('global-barangay-filter')) document.getElementById('global-barangay-filter').innerHTML = '<option value="">All Barangays</option>'; document.getElementById('global-search').value = ''; render(true); }
window.toggleSettings = () => { toggleModal('settings-modal'); document.getElementById('team-list-settings').innerHTML = [...DYNAMIC_TEAMS].sort().map(t => `<div class="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-200 dark-bg-sub dark-border"><span class="text-sm font-medium text-gray-700 dark-text">${t}</span><div class="flex gap-2"><button onclick="renameTeam('${t}')" class="text-blue-400 hover:text-blue-600"><i class="fa-solid fa-pen"></i></button><button onclick="deleteTeam('${t}')" class="text-red-400 hover:text-red-600"><i class="fa-solid fa-trash-can"></i></button></div></div>`).join(''); }
window.addNewTeam = () => { alert("⚠️ To add a new permanent Team, please add a technician with that team name directly in the database first. Contact the developer if you need assistance."); document.getElementById('new-team-name').value = ''; }
window.toggleTheme = () => { document.body.classList.toggle('dark-mode'); const isDark = document.body.classList.contains('dark-mode'); localStorage.setItem('slrTheme', isDark ? 'dark' : 'light'); }
if (localStorage.getItem('slrTheme') === 'dark') document.body.classList.add('dark-mode');

window.exportCSV = () => {
    const dataToExport = soData.filter(i => (i.type || 'SLR') === currentAppMode);
    if (dataToExport.length === 0) return console.warn("No data to export.");
    let csvContent = "data:text/csv;charset=utf-8,ID,Name,Team,Area,Status,Date Added,Date Done,Type,Remarks\n";
    dataToExport.forEach(row => {
        const safeName = (row.name || "").replace(/,/g, " "); const safeRem = (row.remarks || "").replace(/,/g, " ");
        let csvRow = `${row.id},${safeName},${row.team},${row.area},${row.status},${row.dateAdded},${row.dateDone || ""},${row.type || "SLR"},${safeRem}`;
        csvContent += csvRow + "\n";
    });
    const encodedUri = encodeURI(csvContent); const link = document.createElement("a"); link.setAttribute("href", encodedUri); link.setAttribute("download", `Dispatch_Export_${currentAppMode}_${new Date().toLocaleDateString()}.csv`); document.body.appendChild(link); link.click();
}

// ============================================
// 5. SECURITY & AUTH
// ============================================
try {
    if (!window.supabase) console.error("Supabase SDK not loaded.");
    else {
        db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        window.db = db; // Required for Cypress
        log("Supabase Client Initialized");
    }
} catch (err) { console.error("Init Error:", err); }

let appShown = false;
let isVerifying = false;

// Helper function to check if the user is in the Supabase VIP table
async function verifyAndShowApp(userEmail) {
    if (appShown || isVerifying) return;
    isVerifying = true;
    window.currentUserEmail = userEmail;

    // ⚡ CYPRESS TEST BYPASS: Allow test users in DEBUG_MODE even if Sandbox DB is unseeded
    if (DEBUG_MODE && userEmail.includes('cypress')) {
        actualUserRole = userEmail.includes('tech') ? 'tech' : 'developer';
        currentUserRole = actualUserRole;
        currentUserTeam = userEmail.includes('tech') ? 'Team Bernie' : null;
        if (actualUserRole === 'developer') document.getElementById('dev-tools').classList.remove('hidden');
        setupEventListeners();
        applyRBACUI();
        showApp();
        return;
    }

    try {
        const { data, error } = await db.from('authorized_emails').select('email, role, team').eq('email', userEmail);

        if (error) {
            console.error("Verification Network Error:", error);
            alert("Network error: Could not verify your account. Please check your connection and refresh the page.");
            isVerifying = false;
            return;
        }

        if (data && data.length > 0) {
            actualUserRole = data[0].role || 'tech';
            currentUserRole = actualUserRole;
            currentUserTeam = data[0].team || null;

            // ⚡ SECURE CHECK: Only unhide Dev Tools if the database says you are a developer
            if (actualUserRole === 'developer') {
                document.getElementById('dev-tools').classList.remove('hidden');
            }

            setupEventListeners();
            applyRBACUI();
            showApp();
        } else {
            console.warn("Unauthorized entry attempt by:", userEmail);
            alert("Unauthorized Email Address: " + userEmail);
            logout();
        }
    } catch (err) {
        console.error("Verification Exception:", err);
        alert("System error: Could not verify your account. Please check your connection and refresh the page.");
        isVerifying = false;
    }
}

// Powers the Dev Panel Dropdowns
window.applyImpersonation = () => {
    if (actualUserRole !== 'developer') return; // Double security check

    const role = document.getElementById('dev-role').value;
    const team = document.getElementById('dev-team').value;

    currentUserRole = role;

    if (role === 'tech') {
        document.getElementById('dev-team-container').classList.remove('hidden');
        currentUserTeam = team;
    } else {
        document.getElementById('dev-team-container').classList.add('hidden');
        currentUserTeam = null;
    }
    applyRBACUI();
};

function updateDevTeamDropdown() {
    const devSelect = document.getElementById('dev-team');
    if (devSelect && actualUserRole === 'developer') {
        devSelect.innerHTML = [...DYNAMIC_TEAMS].sort().map(t => `<option value="${t}">${t}</option>`).join('');
        if (currentUserRole === 'tech') applyImpersonation();
    }
}
function applyRBACUI() {
    const adminTabs = ['nav-pending'];
    const adminBtns = ['btn-new', 'btn-bulk'];
    const techToggleBtn = document.getElementById('tech-date-toggle');

    if (currentUserRole === 'tech') {
        adminTabs.forEach(id => document.getElementById(id)?.classList.add('hidden'));
        adminBtns.forEach(id => document.getElementById(id)?.classList.add('hidden'));
        if (['pending'].includes(currentTab)) switchTab('active');
        // Show tech date toggle
        if (techToggleBtn) {
            techToggleBtn.classList.remove('hidden');
            techToggleBtn.classList.add('flex');
            updateTechToggleStyle();
        }
    } else {
        adminTabs.forEach(id => document.getElementById(id)?.classList.remove('hidden'));
        adminBtns.forEach(id => document.getElementById(id)?.classList.remove('hidden'));
        // Hide tech date toggle for admins
        if (techToggleBtn) {
            techToggleBtn.classList.add('hidden');
            techToggleBtn.classList.remove('flex');
        }
    }
    render(true);
}

if (db) {
    db.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session) {
            verifyAndShowApp(session.user.email);
        } else if (event === 'SIGNED_OUT') {
            document.getElementById('login-screen').classList.remove('hidden');
            document.getElementById('main-app').classList.add('hidden');
        }
    });

    db.auth.getSession().then(({ data: { session } }) => {
        if (session) {
            verifyAndShowApp(session.user.email);
        }
    });
}

window.attemptGoogleLogin = async () => {
    const errorMsg = document.getElementById('login-error');
    errorMsg.classList.add('hidden');

    const { data, error } = await db.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin + window.location.pathname }
    });

    if (error) {
        log("Auth Error", error);
        errorMsg.innerText = "Login Failed: " + error.message;
        errorMsg.classList.remove('hidden');
    }
};

window.logout = async () => {
    if (db) { await db.auth.signOut(); location.reload(); }
};

function showApp() {
    appShown = true;
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('main-app').classList.remove('hidden');
    if (db) startSupabaseListener();
    setTimeout(() => { if (window.switchAppMode) window.switchAppMode('SLR'); }, 100);
}

// ============================================
// 6. DATA & REALTIME
// ============================================
async function startSupabaseListener() {
    try {
        const { data, error } = await db.from('service_orders').select('*');
        if (error) throw error;
        soData = data || [];

        try {
            const { data: authData } = await db.rpc('get_all_teams');
            if (authData) {
                const rawTeams = authData.map(r => r.team).filter(t => t && t.trim() !== '' && t.trim() !== 'Unassigned');
                authTeamsList = [...new Set(rawTeams)];
            }
        } catch (e) { console.error("Auth teams load error", e); }

        extractDynamicOptions();
        document.getElementById('loading-screen').classList.add('hidden');

        const hasPending = soData.some(i => i.status === 'pending');
        if (currentUserRole === 'admin') {
            window.switchTab(hasPending ? 'pending' : 'active');
        } else {
            window.switchTab('active');
        }

        db.channel('custom-all-channel')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'service_orders' }, (payload) => {
                if (payload.eventType === 'INSERT') { if (!soData.find(i => i.id === payload.new.id)) soData.push(payload.new); }
                else if (payload.eventType === 'UPDATE') { const index = soData.findIndex(i => i.id === payload.new.id); if (index !== -1) soData[index] = { ...soData[index], ...payload.new }; }
                else if (payload.eventType === 'DELETE') { soData = soData.filter(i => i.id !== payload.old.id); }
                extractDynamicOptions();
                render(false);
            })
            .subscribe();
    } catch (err) { console.error("Data Error:", err); }
}
function extractDynamicOptions() {
    DYNAMIC_TEAMS = new Set(["Team Bernie", "Team Randy"]);
    DYNAMIC_AREAS = new Set(["TAGAYTAY", "AMADEO", "MENDEZ", "BAILEN", "MARAGONDON", "ALFONSO", "MAGALLANES", "INDANG", "TERNATE"]);

    if (typeof authTeamsList !== 'undefined') authTeamsList.forEach(t => DYNAMIC_TEAMS.add(t));

    soData.forEach(item => {
        if (item.team && item.team !== 'Unassigned') DYNAMIC_TEAMS.add(item.team);
    });

    populateFilterDropdown('global-team-filter', DYNAMIC_TEAMS, "All Teams");
    populateFilterDropdown('global-area-filter', DYNAMIC_AREAS, "All Areas");
    updateDevTeamDropdown();
}

function populateFilterDropdown(id, set, label) {
    const el = document.getElementById(id); if (!el) return;
    const currentVal = el.value; let html = `<option value="">${label}</option>`;
    [...set].sort().forEach(val => { html += `<option value="${val}">${val}</option>`; });
    el.innerHTML = html; el.value = currentVal;
}

// ============================================
// 7. CRUD ACTIONS
// ============================================

// ─── Deduplication Helpers ───────────────────────────────────────────────────

/**
 * SLR: checks name + account_no vs today's records.
 * Returns { inboxMatch (item|null), activeMatch (item|null) }
 */
function checkSLRDuplicate(name, acct, ticket) {
    const today = new Date();
    const normName = (name || '').trim().toLowerCase();
    const normAcct = (acct || '').trim().toLowerCase();
    const normTicket = (ticket || '').trim().toLowerCase();
    // Only run check when we have name/acct OR a ticket
    if (!(normName && normAcct) && !normTicket) return { inboxMatch: null, activeMatch: null };

    const allSLR = soData.filter(i => (i.type || 'SLR') === 'SLR');
    const todaySLR = allSLR.filter(i => isSameDay(i.date_reported || i.dateAdded, today));

    let inboxMatch = null;
    let activeMatch = null;

    if (normTicket) {
        activeMatch = allSLR.find(i => (i.status === 'active' || i.status === 'done') && (i.ticket_no || '').trim().toLowerCase() === normTicket) || null;
        inboxMatch = allSLR.find(i => i.status === 'pending' && (i.ticket_no || '').trim().toLowerCase() === normTicket) || null;
    }

    if (!activeMatch && normName && normAcct) {
        activeMatch = todaySLR.find(i =>
            (i.status === 'active' || i.status === 'done') &&
            (i.name || '').trim().toLowerCase() === normName &&
            (i.account_no || '').trim().toLowerCase() === normAcct
        ) || null;
    }

    if (!inboxMatch && normName && normAcct) {
        inboxMatch = allSLR.find(i =>
            i.status === 'pending' &&
            (i.name || '').trim().toLowerCase() === normName &&
            (i.account_no || '').trim().toLowerCase() === normAcct
        ) || null;
    }

    return { inboxMatch, activeMatch };
}

/**
 * SLI: checks ticket_no (JO number) vs ALL SLI records (all-time).
 * Returns { inboxMatch (item|null), activeMatch (item|null) }
 */
function checkSLIDuplicate(joNumber) {
    const normJO = (joNumber || '').trim().toLowerCase();
    if (!normJO) return { inboxMatch: null, activeMatch: null };

    const allSLI = soData.filter(i => (i.type || 'SLR') === 'SLI');

    const inboxMatch = allSLI.find(i =>
        i.status === 'pending' &&
        (i.ticket_no || '').trim().toLowerCase() === normJO
    ) || null;

    const activeMatch = allSLI.find(i =>
        (i.status === 'active' || i.status === 'done') &&
        (i.ticket_no || '').trim().toLowerCase() === normJO
    ) || null;

    return { inboxMatch, activeMatch };
}

// ─── Feature 4: Tech Toggle ───────────────────────────────────────────────────

function updateTechToggleStyle() {
    const btn = document.getElementById('tech-date-toggle');
    const label = document.getElementById('tech-toggle-label');
    if (!btn || !label) return;
    if (techTodayOnlyMode) {
        btn.className = btn.className.replace(/bg-\S+/g, '').replace(/text-\S+/g, '').replace(/border-\S+/g, '');
        btn.classList.add('bg-blue-100', 'text-blue-700', 'border-blue-300');
        label.textContent = 'Today Only';
    } else {
        btn.className = btn.className.replace(/bg-\S+/g, '').replace(/text-\S+/g, '').replace(/border-\S+/g, '');
        btn.classList.add('bg-gray-100', 'text-gray-500', 'border-gray-300');
        label.textContent = 'Show All';
    }
}

window.toggleTechDateMode = () => {
    techTodayOnlyMode = !techTodayOnlyMode;
    updateTechToggleStyle();
    render(false);
};
window.saveSO = async () => {
    if (!db) return alert("Database disconnected");
    const id = document.getElementById('edit-id').value;
    const name = document.getElementById('input-name').value;

    let team = document.getElementById('input-team').value;
    if (team === "NEW_ENTRY") team = document.getElementById('input-team-custom').value.trim();

    let area = document.getElementById('input-area').value;
    if (area === "NEW_ENTRY") area = document.getElementById('input-area-custom').value.trim();

    let barangay = document.getElementById('input-barangay').value;

    if (!name || !team || !area || !barangay) return alert("All fields required");

    let remarksToSave = "";
    const modalRemarks = document.getElementById('input-remarks') ? document.getElementById('input-remarks').value.trim() : "";

    if (modalRemarks) {
        remarksToSave = modalRemarks;
    } else if (id) {
        const remInput = document.getElementById(`rem-${id}`);
        if (remInput && remInput.value.trim() !== "") {
            remarksToSave = remInput.value.trim();
        } else {
            const existingItem = soData.find(i => i.id === id);
            if (existingItem && existingItem.remarks) remarksToSave = existingItem.remarks;
        }
    }

    const payload = {
        name,
        team,
        area,
        barangay,
        type: currentAppMode,
        status: 'active',
        ticket_no: document.getElementById('input-ticket').value.trim(),
        account_no: document.getElementById('input-account').value.trim(),
        contact_number: document.getElementById('input-contact').value.trim(),
        facility: document.getElementById('input-facility').value.trim(),
        address: document.getElementById('input-address').value.trim(),
        trouble_report: document.getElementById('input-trouble').value.trim(),
        long_lat: document.getElementById('input-longlat').value.trim(),
        dispatched_by: window.currentUserEmail
    };

    if (remarksToSave !== "") {
        payload.remarks = remarksToSave;
    }

    try {
        if (!id) {
            // ─── Deduplication check (new records only) ───────────────────
            if (currentAppMode === 'SLR') {
                const acct = document.getElementById('input-account').value.trim();
                const ticket = document.getElementById('input-ticket') ? document.getElementById('input-ticket').value.trim() : "";
                const { inboxMatch, activeMatch } = checkSLRDuplicate(name, acct, ticket);
                if (activeMatch) {
                    showToast(`⛔ Duplicate: "${name}" (Acct: ${acct}) was already dispatched today. Dispatch blocked.`, 'error', 7000);
                    toggleModal('form-modal');
                    return;
                }
                if (inboxMatch) {
                    // Auto-remove from inbox
                    await db.from('service_orders').delete().eq('id', inboxMatch.id);
                    soData = soData.filter(i => i.id !== inboxMatch.id);
                    showToast(`✅ "${name}" was in the Inbox and has been removed. Dispatch went through successfully!`, 'success', 8000);
                }
            } else if (currentAppMode === 'SLI') {
                const joNum = document.getElementById('input-ticket').value.trim();
                const { inboxMatch, activeMatch } = checkSLIDuplicate(joNum);
                if (activeMatch) {
                    showToast(`⛔ Duplicate JO: "${joNum}" already exists in SLI records. Dispatch blocked.`, 'error', 7000);
                    toggleModal('form-modal');
                    return;
                }
                if (inboxMatch) {
                    await db.from('service_orders').delete().eq('id', inboxMatch.id);
                    soData = soData.filter(i => i.id !== inboxMatch.id);
                    showToast(`✅ JO "${joNum}" was in the Inbox and has been removed. Dispatch went through successfully!`, 'success', 8000);
                }
            }
            // ─────────────────────────────────────────────────────────────

            payload.id = generateUUID();
            const todayStr = new Date().toLocaleDateString();
            payload.dateAdded = todayStr;
            payload.date_reported = todayStr;
            payload.pic = false;
            payload.pwr = false;
            payload.speed = false;
            payload.rpt = false;

            const { error } = await db.from('service_orders').insert([payload]);
            if (error) throw error;
            soData.push(payload);
        } else {
            const { error } = await db.from('service_orders').update(payload).eq('id', id);
            if (error) throw error;
            const index = soData.findIndex(i => i.id === id);
            if (index !== -1) soData[index] = { ...soData[index], ...payload };
        }
        extractDynamicOptions();
        render(false);
        toggleModal('form-modal');
    } catch (e) {
        alert("Save Failed: " + e.message);
    }
}

window.approveSO = async (id) => {
    const item = soData.find(i => i.id === id);
    if (!item) return;

    // Validation: Don't allow "Unassigned" teams to be approved
    if (item.team === "Unassigned" || !item.team) {
        alert("⚠️ Please assign a valid Team before approving.");
        openModal(id); // Open edit modal
        return;
    }

    // Grab the value from the remarks input box right before we save
    const remInput = document.getElementById(`rem-${id}`);
    const currentRemarks = remInput ? remInput.value : (item.remarks || "");
    const todayStr = new Date().toLocaleDateString();

    try {
        // Send status, remarks, AND the fresh dispatch date to Supabase
        const { error } = await db.from('service_orders').update({
            status: 'active',
            remarks: currentRemarks,
            dateAdded: todayStr,
            dispatched_by: window.currentUserEmail
        }).eq('id', id);

        if (error) throw error;

        // Optimistic update locally
        item.status = 'active';
        item.remarks = currentRemarks;
        item.dateAdded = todayStr; // ⚡ FIX: Update local UI state
        item.dispatched_by = window.currentUserEmail;

        render(false);
    } catch (e) {
        console.error("Approval Error:", e);
        alert("Network or database error: Could not approve ticket. " + e.message);
    }
}

window.deleteSO = async (id) => { if (!confirm("Delete this record permanently?")) return; try { const { error } = await db.from('service_orders').delete().eq('id', id); if (error) throw error; soData = soData.filter(i => i.id !== id); render(false); } catch (e) { alert("Delete Failed: " + e.message); } }
window.rescheduleSO = async (id) => { if (!confirm("Return this ticket to the Inbox for rescheduling?")) return; try { const { error } = await db.from('service_orders').update({ status: 'pending', dateAdded: null }).eq('id', id); if (error) throw error; const index = soData.findIndex(i => i.id === id); if (index !== -1) { soData[index].status = 'pending'; soData[index].dateAdded = null; } render(false); } catch (e) { alert("Reschedule Failed: " + e.message); } }
window.renameTeam = async (oldName) => { const newName = prompt(`Rename "${oldName}" to:`, oldName); if (!newName || newName === oldName) return; if (!confirm(`Rename "${oldName}" to "${newName}" everywhere?`)) return; try { const { error } = await db.from('service_orders').update({ team: newName }).eq('team', oldName); if (error) throw error; soData.forEach(item => { if (item.team === oldName) item.team = newName; }); extractDynamicOptions(); render(false); toggleSettings(); } catch (e) { alert("Rename Failed: " + e.message); } }
window.deleteTeam = async (teamName) => { if (!confirm(`Delete ALL records for "${teamName}"?`)) return; try { const { error } = await db.from('service_orders').delete().eq('team', teamName); if (error) throw error; soData = soData.filter(item => item.team !== teamName); extractDynamicOptions(); render(false); toggleSettings(); } catch (e) { alert("Delete Failed: " + e.message); } }
window.markDone = async (id) => { const itemIndex = soData.findIndex(i => i.id == id); if (itemIndex === -1) return; const rem = document.getElementById(`rem-${id}`).value || soData[itemIndex].tech_remarks || ""; const dateDone = new Date().toLocaleDateString(); try { await db.from('service_orders').update({ status: 'done', tech_remarks: rem, dateDone: dateDone }).eq('id', id); soData[itemIndex].status = 'done'; soData[itemIndex].tech_remarks = rem; soData[itemIndex].dateDone = dateDone; render(false); } catch (e) { console.error(e); } }
window.toggleCheck = async (id, key) => { const index = soData.findIndex(i => i.id == id); if (index === -1) return; const newVal = !soData[index][key]; soData[index][key] = newVal; render(false); const updateObj = {}; updateObj[key] = newVal; await db.from('service_orders').update(updateObj).eq('id', id); }
document.addEventListener('paste', function (e) {
    // Only intercept if pasting inside the bulk table
    if (!e.target.closest('#bulk-table-body')) return;

    const pasteData = (e.clipboardData || window.clipboardData).getData('text');
    if (!pasteData) return;

    // Check if it's multi-cell data (contains a tab or a newline)
    if (pasteData.indexOf('\t') === -1 && pasteData.indexOf('\n') === -1) return; // Standard single-word paste, let browser handle it naturally

    e.preventDefault(); // Stop standard pasting

    // Split clipboard into rows, remove trailing empty row if present
    const rows = pasteData.split(/\r?\n/);
    if (rows.length > 0 && rows[rows.length - 1] === "") rows.pop();

    const targetInput = e.target;
    const startTd = targetInput.closest('td');
    const startTr = startTd.closest('tr');
    const tbody = document.getElementById('bulk-table-body');

    // Calculate where to start placing data
    const startColIdx = Array.from(startTr.children).indexOf(startTd);
    const startRowIdx = Array.from(tbody.children).indexOf(startTr);

    rows.forEach((rowData, rIdx) => {
        const cols = rowData.split('\t'); // Split row by Tabs (Excel formatting)
        const currentRowIdx = startRowIdx + rIdx;

        // If we run out of rows while pasting, automatically create new ones
        while (tbody.children.length <= currentRowIdx) {
            window.addBulkRow();
        }

        const tr = tbody.children[currentRowIdx];

        cols.forEach((cellData, cIdx) => {
            const currentColIdx = startColIdx + cIdx;
            // Ensure we don't paste past the 8th column (the delete button) — Barangay added as col 1
            if (currentColIdx < 8) {
                const input = tr.children[currentColIdx].querySelector('input');
                if (input) {
                    input.value = cellData.trim();
                }
            }
        });
    });
});

window.saveBulkSO = async () => {
    // Grab global Team and Area (Barangay is now per-row)
    const team = document.getElementById('global-bulk-team').value;
    const area = document.getElementById('global-bulk-area').value;

    if (!area || area === "NEW_ENTRY") return alert("⚠️ Please select an Area.");
    if (!team || team === "NEW_ENTRY") return alert("⚠️ Please select a Team.");

    const rows = document.querySelectorAll('.bulk-row');
    const payload = [];
    const todayStr = new Date().toLocaleDateString();
    let hasError = false;
    const inboxIdsToDelete = []; // IDs of inbox items to auto-remove
    const skippedNames = [];     // Names blocked as already-dispatched duplicates

    rows.forEach(row => {
        const name = row.querySelector('.bulk-name').value.trim();
        const barangay = row.querySelector('.bulk-barangay').value.trim();
        const ticket = row.querySelector('.bulk-ticket').value.trim();
        const acct = row.querySelector('.bulk-acct').value.trim();
        const contact = row.querySelector('.bulk-contact').value.trim();
        const address = row.querySelector('.bulk-address').value.trim();
        const trouble = row.querySelector('.bulk-trouble').value.trim();
        const remarks = row.querySelector('.bulk-remarks').value.trim();

        // Skip completely empty rows
        if (!name && !barangay && !ticket && !acct && !contact && !address && !trouble && !remarks) return;

        // Ensure required Name field is filled
        if (!name) {
            hasError = true;
            row.querySelector('.bulk-name').classList.add('border-red-500', 'bg-red-50');
            return;
        } else {
            row.querySelector('.bulk-name').classList.remove('border-red-500', 'bg-red-50');
        }

        // Validate Barangay per row
        if (!barangay) {
            hasError = true;
            row.querySelector('.bulk-barangay').classList.add('border-red-500', 'bg-red-50');
            return;
        } else {
            row.querySelector('.bulk-barangay').classList.remove('border-red-500', 'bg-red-50');
        }

        // ─── Deduplication check per row ──────────────────────────────────
        if (currentAppMode === 'SLR') {
            const { inboxMatch, activeMatch } = checkSLRDuplicate(name, acct, ticket);
            if (activeMatch) {
                skippedNames.push(name);
                return; // Skip this row silently
            }
            if (inboxMatch) {
                inboxIdsToDelete.push(inboxMatch.id);
            }
        } else if (currentAppMode === 'SLI') {
            const { inboxMatch, activeMatch } = checkSLIDuplicate(ticket);
            if (activeMatch) {
                skippedNames.push(`JO: ${ticket}`);
                return; // Skip this row silently
            }
            if (inboxMatch) {
                inboxIdsToDelete.push(inboxMatch.id);
            }
        }
        // ──────────────────────────────────────────────────────────────────

        payload.push({
            id: generateUUID(),
            name: name,
            team: team,
            area: area,
            barangay: barangay, // Now per-row
            type: currentAppMode,
            status: 'active',
            dateAdded: todayStr,
            date_reported: todayStr,
            ticket_no: ticket,
            account_no: acct,
            contact_number: contact,
            address: address,
            trouble_report: trouble,
            remarks: remarks,
            pic: false, pwr: false, speed: false, rpt: false,
            dispatched_by: window.currentUserEmail
        });
    });

    if (hasError) return alert("⚠️ Please provide a Subscriber Name and Barangay for all active rows (or click the trash can to delete the row).");
    if (payload.length === 0 && skippedNames.length === 0) return alert("⚠️ No data entered to dispatch.");
    if (payload.length === 0 && skippedNames.length > 0) {
        showToast(`⛔ All rows were duplicates already dispatched. Nothing was saved. (${skippedNames.length} skipped)`, 'error', 8000);
        return;
    }

    document.getElementById('bulk-btn').innerText = "Processing Data...";

    try {
        // Step 1: Delete inbox duplicates
        if (inboxIdsToDelete.length > 0) {
            await Promise.all(inboxIdsToDelete.map(id => db.from('service_orders').delete().eq('id', id)));
            soData = soData.filter(i => !inboxIdsToDelete.includes(i.id));
        }

        // Step 2: Insert the valid payload
        const { error } = await db.from('service_orders').insert(payload);
        if (error) throw error;

        soData.push(...payload);
        render(false);
        toggleModal('bulk-modal');
        document.getElementById('bulk-btn').innerText = "Dispatch All Rows";

        // Step 3: Show consolidated toast feedback
        if (inboxIdsToDelete.length > 0 && skippedNames.length > 0) {
            showToast(`✅ ${payload.length} dispatched. ${inboxIdsToDelete.length} removed from Inbox. ⛔ ${skippedNames.length} duplicate(s) skipped.`, 'warning', 9000);
        } else if (inboxIdsToDelete.length > 0) {
            showToast(`✅ ${payload.length} dispatched. ${inboxIdsToDelete.length} existing Inbox record(s) were automatically removed.`, 'success', 8000);
        } else if (skippedNames.length > 0) {
            showToast(`✅ ${payload.length} dispatched. ⛔ ${skippedNames.length} duplicate(s) already dispatched were skipped.`, 'warning', 8000);
        }
    } catch (e) {
        alert("Bulk Error: " + e.message);
        document.getElementById('bulk-btn').innerText = "Dispatch All Rows";
    }
}

// ============================================
// 8. RENDER LOGIC
// ============================================
function render(resetLimit = false) {
    if (resetLimit) {
        const limitEl = document.getElementById('entries-limit');
        renderLimit = limitEl ? parseInt(limitEl.value) : 50;
    }

    const pendingCount = soData.filter(i => i.status === 'pending' && (i.type || 'SLR') === currentAppMode).length;
    const badge = document.getElementById('badge-pending');
    if (badge) {
        badge.innerText = pendingCount;
        badge.classList.toggle('hidden', pendingCount === 0);
    }

    const dateInput = document.getElementById('global-date-filter').value;
    const teamFilter = document.getElementById('global-team-filter').value;
    const areaFilter = document.getElementById('global-area-filter').value;
    const barangayFilter = document.getElementById('global-barangay-filter') ? document.getElementById('global-barangay-filter').value : "";
    const searchInput = document.getElementById('global-search').value.toLowerCase().trim();
    const perfFilter = document.getElementById('perf-filter').value;
    let selectedDate = dateInput ? parseDateInput(dateInput) : null;

    const hasFilters = selectedDate || teamFilter || areaFilter || barangayFilter || searchInput;
    const resetBtn = document.getElementById('clear-filters-btn');
    if (resetBtn) resetBtn.className = hasFilters ? "text-[10px] bg-red-100 hover:bg-red-200 text-red-600 px-3 py-1 rounded-full font-bold transition" : "hidden";

    if (selectedDate || searchInput) document.getElementById('perf-preset-container').classList.add('hidden');
    else document.getElementById('perf-preset-container').classList.remove('hidden');

    let filtered = soData.filter(item => {
        const itemType = item.type || 'SLR';
        if (itemType !== currentAppMode) return false;
        if (currentUserRole === 'tech' && item.team !== currentUserTeam) return false;
        if (searchInput) {
            const searchField = document.getElementById('search-field') ? document.getElementById('search-field').value : 'name';

            const sName = String(item.name || '').toLowerCase();
            const sTicket = String(item.ticket_no || '').toLowerCase();
            const sAcct = String(item.account_no || '').toLowerCase();

            const matchName = sName.includes(searchInput);
            const matchTicket = sTicket.includes(searchInput);
            const matchAccount = sAcct.includes(searchInput);

            if (searchField === 'name' && !matchName) return false;
            if (searchField === 'ticket' && !matchTicket) return false;
            if (searchField === 'account' && !matchAccount) return false;
        }
        if (teamFilter && (!item.team || String(item.team).trim().toUpperCase() !== String(teamFilter).trim().toUpperCase())) return false;
        if (areaFilter && (!item.area || String(item.area).trim().toUpperCase() !== String(areaFilter).trim().toUpperCase())) return false;
        if (barangayFilter && (!item.barangay || String(item.barangay).trim().toUpperCase() !== String(barangayFilter).trim().toUpperCase())) return false;

        if (selectedDate) {
            let itemDateToCompare = null;

            if (currentTab === 'pending') {
                // If in Inbox, filter by the Google Sheet date
                itemDateToCompare = item.date_reported;
            } else if (currentTab === 'active') {
                // If in Dispatch, filter by the day it was accepted/created
                itemDateToCompare = item.dateAdded;
            } else if (currentTab === 'performance') {
                // For performance, mirror the period filter logic
                itemDateToCompare = item.status === 'done' ? (item.dateDone || item.dateAdded || item.date_reported) : (item.dateAdded || item.date_reported);
            } else {
                // If in History, filter by the day it was completed
                itemDateToCompare = item.dateDone;
            }

            return isSameDay(itemDateToCompare, selectedDate);
        }

        if (currentTab === 'performance' && !selectedDate && !searchInput) {
            const now = new Date();
            const dStr = item.status === 'done' ? (item.dateDone || item.dateAdded || item.date_reported) : (item.dateAdded || item.date_reported);
            const d = parseSafeDate(dStr);
            if (perfFilter === 'all') return true;
            if (perfFilter === 'today') return isSameDay(d, now);
            if (perfFilter === 'week') return (now - d) < 7 * 86400000;
            if (perfFilter === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            return true;
        }
        return true;
    });

    if (currentTab === 'performance') {
        renderPerformance(filtered.filter(i => i.status !== 'pending'));
        return;
    }

    let listItems = [];
    if (currentTab === 'pending') {
        listItems = filtered.filter(i => i.status === 'pending');
    } else if (currentTab === 'active') {
        listItems = filtered.filter(i => i.status === 'active');
        // Feature 4: Apply tech today-only filter on Active tab (not on History/Performance)
        if (currentUserRole === 'tech' && techTodayOnlyMode && !selectedDate && !searchInput) {
            const today = new Date();
            listItems = listItems.filter(i => isSameDay(i.dateAdded, today));
        }
    } else {
        listItems = filtered.filter(i => i.status === 'done');
    }

    renderList(listItems);
}

function renderList(items) {
    const container = document.getElementById('card-container');
    if (!container) return;
    document.getElementById('list-count').innerText = items.length;
    document.getElementById('empty-msg').className = items.length === 0 ? "text-center py-16 text-gray-400" : "hidden";

    let bulkBar = '';
    if (currentTab === 'pending' && items.length > 0) {
        // Build team dropdown excluding 'Unassigned'
        let teamOptions = `<option value="" disabled selected>Assign team to selected...</option>`;
        [...DYNAMIC_TEAMS].sort().forEach(t => teamOptions += `<option value="${t}">${t}</option>`);

        bulkBar = `
        <div class="bg-blue-50 border border-blue-200 p-3 rounded-xl mb-4 flex gap-3 items-center dark-bg-sub dark-border shadow-sm">
            <div class="flex flex-col items-center justify-center shrink-0">
                <input type="checkbox" id="select-all-pending" onchange="toggleAllPending(this)" class="w-5 h-5 accent-blue-600 cursor-pointer rounded">
                <label class="text-[8px] font-bold text-blue-600 mt-1 uppercase">All</label>
            </div>
            <select id="inbox-bulk-team" class="flex-1 p-2.5 rounded-lg border border-blue-200 text-sm outline-none dark-input font-bold text-slate-700 cursor-pointer">
                ${teamOptions}
            </select>
            <button onclick="bulkApprovePending()" class="bg-blue-600 text-white px-4 py-2.5 rounded-lg font-bold text-sm shadow-md hover:bg-blue-700 transition shrink-0 uppercase tracking-wide">
                <i class="fa-solid fa-paper-plane mr-1"></i> Send
            </button>
        </div>`;
    }

    const sortBy = document.getElementById('sort-by') ? document.getElementById('sort-by').value : 'default';

    let html = '';
    let count = 0;

    if (sortBy === 'aging') {
        const itemsWithIndex = items.map((item, index) => ({ ...item, _listIndex: index }));
        const sortedItems = itemsWithIndex.sort((a, b) => {
            let timeA = parseSafeDate(a.date_reported || a.dateAdded).getTime();
            let timeB = parseSafeDate(b.date_reported || b.dateAdded).getTime();

            if (a.created_at) timeA = new Date(a.created_at).getTime();
            if (b.created_at) timeB = new Date(b.created_at).getTime();

            if (timeA !== timeB) return timeA - timeB; // Ascending -> Oldest First
            return a._listIndex - b._listIndex;
        });

        html += `<div class="sticky-date py-2 px-1 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase flex justify-between items-center mt-4"><span><i class="fa-solid fa-clock-rotate-left mr-1"></i> Aging Tickets (Oldest First)</span><span class="bg-gray-200 text-gray-600 px-2 rounded-full text-[10px]">${sortedItems.length}</span></div>`;
        for (const item of sortedItems) {
            if (count >= renderLimit) break;
            html += createCardHTML(item);
            count++;
        }
    } else if (sortBy === 'date') {
        const itemsWithIndex = items.map((item, index) => ({ ...item, _listIndex: index }));
        const sortedItems = itemsWithIndex.sort((a, b) => {
            let timeA = parseSafeDate(a.date_reported || a.dateAdded).getTime();
            let timeB = parseSafeDate(b.date_reported || b.dateAdded).getTime();
            if (timeA !== timeB) return timeB - timeA; // Descending -> Newest First
            return a._listIndex - b._listIndex;
        });

        html += `<div class="sticky-date py-2 px-1 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase flex justify-between items-center mt-4"><span><i class="fa-regular fa-calendar mr-1"></i> Sorted by Date</span><span class="bg-gray-200 text-gray-600 px-2 rounded-full text-[10px]">${sortedItems.length}</span></div>`;
        for (const item of sortedItems) {
            if (count >= renderLimit) break;
            html += createCardHTML(item);
            count++;
        }
    } else if (sortBy === 'dispatch') {
        const itemsWithIndex = items.map((item, index) => ({ ...item, _listIndex: index }));
        const sortedItems = itemsWithIndex.sort((a, b) => {
            let timeA = parseSafeDate(a.dateAdded || a.date_reported || a.dateDone).getTime();
            let timeB = parseSafeDate(b.dateAdded || b.date_reported || b.dateDone).getTime();
            if (timeA !== timeB) return timeB - timeA; // Descending -> Newest First
            return b._listIndex - a._listIndex;
        });

        html += `<div class="sticky-date py-2 px-1 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase flex justify-between items-center mt-4"><span><i class="fa-solid fa-truck-fast mr-1"></i> Sorted by Dispatch Date</span><span class="bg-gray-200 text-gray-600 px-2 rounded-full text-[10px]">${sortedItems.length}</span></div>`;
        for (const item of sortedItems) {
            if (count >= renderLimit) break;
            html += createCardHTML(item);
            count++;
        }
    } else {
        // Default Grouping by Date
        const groups = {};
        items.forEach(item => {
            const dateKey = currentTab === 'active' ? item.dateAdded : (item.dateDone || "Pending Requests");
            if (!groups[dateKey]) groups[dateKey] = [];
            groups[dateKey].push(item);
        });
        const sortedDates = Object.keys(groups).sort((a, b) => {
            if (a === "Pending Requests" || a === "Unknown Date") return 1;
            if (b === "Pending Requests" || b === "Unknown Date") return -1;
            return new Date(b) - new Date(a); // Newest group first
        });

        for (const date of sortedDates) {
            if (currentTab !== 'pending') {
                html += `<div class="sticky-date py-2 px-1 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase flex justify-between items-center mt-4"><span><i class="fa-regular fa-calendar mr-1"></i> ${date}</span><span class="bg-gray-200 text-gray-600 px-2 rounded-full text-[10px]">${groups[date].length}</span></div>`;
            }
            for (const item of groups[date]) {
                if (count >= renderLimit) break;
                html += createCardHTML(item);
                count++;
            }
            if (count >= renderLimit) break;
        }
    }

    // Inject the Bulk Bar at the top of the cards
    container.innerHTML = bulkBar + html;
    const btn = document.getElementById('show-more-btn');
    if (btn) {
        if (items.length > renderLimit) {
            const step = parseInt(document.getElementById('entries-limit').value);
            const remaining = items.length - renderLimit;
            // Tell the user exactly what will happen
            const nextLoad = remaining < step ? remaining : step;

            btn.classList.remove('hidden');
            btn.innerText = `Show ${nextLoad} More (${remaining} left)`;
        } else {
            btn.classList.add('hidden');
        }
    }
}

function createCardHTML(item) {
    const isDone = item.status === 'done';
    const isPending = item.status === 'pending';
    const isSLR = currentAppMode === 'SLR';
    const color = isSLR ? 'green' : 'indigo';
    const border = isSLR ? 'border-green-500' : 'border-indigo-500';
    const check = (val) => val ? 'checked' : '';

    // Action Button Logic
    let actionBtn = '';
    if (isPending) {
        actionBtn = `<button onclick="approveSO('${item.id}')" class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow uppercase tracking-wide transition flex items-center"><i class="fa-solid fa-thumbs-up mr-1"></i> Accept</button>`;
    } else if (isDone) {
        actionBtn = `<span class="text-xs font-bold text-${color}-600"><i class="fa-solid fa-check-double mr-1"></i>Completed</span>`;
    } else {
        actionBtn = `<button onclick="markDone('${item.id}')" class="bg-${color}-600 hover:bg-${color}-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow uppercase tracking-wide transition flex items-center"><i class="fa-solid fa-check mr-1"></i> Done</button>`;
    }

    // Team color logic
    const teamColorClass = (isPending && item.team === 'Unassigned') ? 'text-red-500 font-extrabold' : 'text-gray-500 font-bold';
    const borderColor = (isPending) ? 'border-yellow-400' : (item.team && item.team.toLowerCase().includes('bernie') ? 'border-orange-400' : border);

    // Mode-specific labels and icons
    const ticketLabel = (currentAppMode === 'SLI') ? 'JO' : 'Ticket No.';
    const ticketIcon = (currentAppMode === 'SLI') ? 'fa-clipboard-list' : 'fa-ticket';
    const troubleLabel = (currentAppMode === 'SLI') ? 'Package' : 'Reported Trouble';
    const troubleIcon = (currentAppMode === 'SLI') ? 'fa-box' : 'fa-triangle-exclamation';
    const troubleColor = (currentAppMode === 'SLI') ? 'text-indigo-600' : 'text-orange-600';

    // Google Maps Link Logic
    let mapElement = '';
    let extraNote = '';

    if (item.long_lat && item.long_lat.trim() !== '') {
        const rawText = item.long_lat.trim();
        const isCoordinate = /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/.test(rawText);

        if (isCoordinate) {
            const safeCoords = encodeURIComponent(rawText.replace(/\s/g, ''));
            const mapUrl = `https://www.google.com/maps/dir/?api=1&destination=${safeCoords}`;
            mapElement = `<a href="${mapUrl}" target="_blank" class="shrink-0 ml-2 bg-blue-100 hover:bg-blue-200 text-blue-700 text-[10px] px-2 py-1 rounded-md font-bold transition shadow-sm border border-blue-200"><i class="fa-solid fa-route mr-1"></i>ROUTE</a>`;
        } else {
            extraNote = `<div class="mt-1 text-slate-500 italic text-[10px]"><i class="fa-solid fa-thumbtack mr-1 text-slate-400"></i>Note: ${rawText}</div>`;
        }
    }

    // Aging Calculator Logic
    let agingBadge = '';
    let reportedDateDisplay = item.date_reported || 'Unknown Date';

    if (item.date_reported && !isDone) {
        const rDate = new Date(item.date_reported);
        const today = new Date();
        const diffDays = Math.floor((today - rDate) / (1000 * 60 * 60 * 24));

        if (diffDays >= 2) {
            agingBadge = `<span class="text-[9px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded shadow-sm border border-red-200">⚠️ ${diffDays} DAYS OLD</span>`;
        } else if (diffDays === 1) {
            agingBadge = `<span class="text-[9px] font-bold bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded shadow-sm border border-orange-200">1 DAY OLD</span>`;
        }
    }

    const detailsBlock = `
        <div class="mt-2 mb-3 p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 dark-bg-sub dark-text dark-border">
            <div class="flex justify-between items-center border-b border-slate-200 pb-1.5 mb-1.5 dark-border">
                <span class="font-bold text-slate-700 dark-text text-[11px]">
                    <i class="fa-solid ${ticketIcon} text-slate-400 mr-1"></i>${ticketLabel}: ${item.ticket_no || 'No Ticket'} 
                    <span class="ml-1 font-mono text-slate-500 font-normal">(${item.account_no || 'No Acct'})</span>
                </span>
                
                <div class="flex items-center gap-1">
                    ${agingBadge}
                    <span class="font-mono text-[9px] text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-100 dark-element dark-border" title="Date Reported">
                        <i class="fa-regular fa-calendar mr-1"></i>${reportedDateDisplay}
                    </span>
                </div>
            </div>
            
            <div class="flex justify-between items-start mb-1.5">
                <div class="font-medium flex-1 break-words leading-tight" title="${item.address || ''}">
                    <i class="fa-solid fa-location-dot mr-1.5 text-slate-400"></i>${item.address || 'No Address Provided'}
                </div>
                ${mapElement}
            </div>
            ${extraNote}
            
            <div class="flex items-center mt-1.5 mb-1.5">
                <i class="fa-solid fa-phone mr-1.5 text-slate-400"></i>
                <span class="font-medium">${item.contact_number || 'No Contact'}</span>
            </div>
            ${item.facility ? `
            <div class="flex items-center mt-1 mb-1">
                <i class="fa-solid fa-tower-broadcast mr-1.5 text-slate-400"></i>
                <span class="font-medium text-slate-500">${item.facility}</span>
            </div>` : ''}
            
            ${item.trouble_report ? `
            <div class="mt-2 pt-1.5 border-t border-slate-200 dark-border ${troubleColor} font-bold flex items-start">
                <i class="fa-solid ${troubleIcon} mt-0.5 mr-1.5"></i>
                <span class="leading-tight">${troubleLabel}: ${item.trouble_report}</span>
            </div>
            ` : ''}
        </div>
    `;

    return `
    <div class="service-order-card bg-white rounded-xl shadow-sm p-4 border-l-4 ${borderColor} mb-3 dark-element">
        <div class="flex justify-between items-start mb-1">
            <div class="flex items-start gap-2">
                ${isPending ? `<input type="checkbox" class="pending-cb w-4 h-4 mt-0.5 accent-blue-600 cursor-pointer rounded" value="${item.id}">` : ''}
                <div>
                    <span class="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded mb-1 inline-block border border-slate-200 dark-bg-sub dark-text dark-border">${item.area}${item.barangay ? ` • ${item.barangay}` : ''}</span>
                    <h3 class="font-bold text-gray-800 text-lg leading-tight dark-text">${item.name}</h3>
                    <p class="text-xs ${teamColorClass} mt-0.5 uppercase tracking-wide dark-text">${item.team}</p>
                    <div class="text-[10px] text-gray-400 mt-1 tracking-wider"><i class="fa-solid fa-headset mr-1"></i> Dispatched by: ${item.dispatched_by || 'Unknown'}</div>
                </div>
            </div>
            <div class="flex gap-1 shrink-0">
                <button onclick="openModal('${item.id}')" class="text-gray-300 hover:text-${color}-600 p-1"><i class="fa-solid fa-pen"></i></button>
                ${(!isPending && !isDone && ['admin', 'developer'].includes(currentUserRole)) ? `<button onclick="rescheduleSO('${item.id}')" class="text-gray-300 hover:text-amber-500 p-1" title="Reschedule (Return to Inbox)"><i class="fa-solid fa-rotate-left"></i></button>` : ''}
                ${['admin', 'developer'].includes(currentUserRole) ? `<button onclick="deleteSO('${item.id}')" class="text-gray-300 hover:text-red-500 p-1"><i class="fa-solid fa-trash"></i></button>` : ''}
            </div>
        </div>

        ${detailsBlock} 
        
        ${!isPending ? `
        <div class="grid grid-cols-2 gap-2 mb-3 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg dark-bg-sub dark-text">
            <label class="flex items-center space-x-2"><input type="checkbox" ${check(item.pic)} onclick="toggleCheck('${item.id}', 'pic')" ${isDone ? 'disabled' : ''} class="accent-${color}-600"><span>Trouble Pic</span></label>
            <label class="flex items-center space-x-2"><input type="checkbox" ${check(item.pwr)} onclick="toggleCheck('${item.id}', 'pwr')" ${isDone ? 'disabled' : ''} class="accent-${color}-600"><span>Optical Pwr</span></label>
            <label class="flex items-center space-x-2"><input type="checkbox" ${check(item.speed)} onclick="toggleCheck('${item.id}', 'speed')" ${isDone ? 'disabled' : ''} class="accent-${color}-600"><span>Speedtest</span></label>
            <label class="flex items-center space-x-2"><input type="checkbox" ${check(item.rpt)} onclick="toggleCheck('${item.id}', 'rpt')" ${isDone ? 'disabled' : ''} class="accent-${color}-600"><span>Service Rpt</span></label>
        </div>` : ''}
        
        ${(item.remarks || (currentUserRole !== 'tech' && !isPending && !isDone)) ? `<div class="bg-yellow-50 border-l-4 border-yellow-400 p-2.5 mb-2.5 rounded-r shadow-sm dark-bg-sub dark-border text-left"><span class="text-[9px] font-extrabold text-yellow-700 uppercase tracking-widest mb-0.5 block"><i class="fa-solid fa-user-shield mr-1"></i> Dispatcher Note</span><span class="text-xs text-yellow-800 dark-text font-medium">${item.remarks || 'No remarks provided'}</span></div>` : ''}
        ${(item.tech_remarks && (currentUserRole !== 'tech' || isDone)) ? `<div class="bg-indigo-50 border-l-4 border-indigo-400 p-2.5 mb-2.5 rounded-r shadow-sm dark-bg-sub dark-border text-left"><span class="text-[9px] font-extrabold text-indigo-700 uppercase tracking-widest mb-0.5 block"><i class="fa-solid fa-wrench mr-1"></i> Technician Note</span><span class="text-xs text-indigo-800 dark-text font-medium">${item.tech_remarks}</span></div>` : ''}

        ${!isDone ? (
            (currentUserRole !== 'tech' && !isPending) ? '' :
                `<div class="flex items-center justify-between gap-3 mt-3 border-t border-slate-100 pt-3 dark-border">
                <input type="text" id="rem-${item.id}" onchange="saveRemarks('${item.id}', this.value)" value="${currentUserRole === 'tech' ? (item.tech_remarks || '') : (item.remarks || '')}" placeholder="${currentUserRole === 'tech' ? 'Add technician remarks' : 'Add dispatch remarks'}" class="flex-1 bg-slate-50 text-sm px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-${color}-500 dark-input focus:ring-2 focus:ring-${color}-500/20 transition-all font-medium text-slate-700 placeholder-slate-400">
                ${actionBtn}
            </div>`
        ) : `
        <div class="flex justify-end mt-2 pb-1 border-t border-slate-100 pt-2 dark-border">${actionBtn}</div>
        `}
    </div>`;
}

function renderPerformance(data) {
    if (currentTab !== 'performance') return;
    const stats = { total: data.length, done: 0, teams: {}, areas: {} };
    data.forEach(item => {
        if (!stats.teams[item.team]) stats.teams[item.team] = { total: 0, done: 0 };
        if (!stats.areas[item.area]) stats.areas[item.area] = { total: 0, done: 0 };
        stats.teams[item.team].total++;
        if (item.status === 'done') {
            stats.teams[item.team].done++;
            stats.done++;
        }
        stats.areas[item.area].total++;
        if (item.status === 'done') stats.areas[item.area].done++;
    });
    const percent = stats.total === 0 ? 0 : Math.round((stats.done / stats.total) * 100);
    document.getElementById('global-percent').innerText = percent + '%'; document.getElementById('global-done').innerText = stats.done; document.getElementById('global-total').innerText = stats.total; document.getElementById('global-bar').style.width = percent + '%';
    document.getElementById('team-stats-container').innerHTML = Object.entries(stats.teams).map(([n, d]) => renderMiniCard(n, d.done, d.total)).join('');
    document.getElementById('area-stats-container').innerHTML = Object.entries(stats.areas).map(([n, d]) => renderAreaRow(n, d.done, d.total)).join('');
    renderCharts(data);
}

function renderCharts(data) {
    if (!window.Chart) return;
    const isSLR = currentAppMode === 'SLR';
    const primaryColor = isSLR ? '#16a34a' : '#4f46e5';
    const primaryBg = isSLR ? 'rgba(22, 163, 74, 0.2)' : 'rgba(79, 70, 229, 0.2)';

    // Always derive the chart time range from the actual filtered data — not DOM filters.
    // This ensures team/area/search/time filters all reflect correctly in charts.
    const dateInput = document.getElementById('global-date-filter').value;
    const searchInput = document.getElementById('global-search').value;
    const perfFilter = document.getElementById('perf-filter').value;

    let minDate = new Date();
    let maxDate = new Date();
    let minTime = Infinity;
    let maxTime = -Infinity;

    data.forEach(item => {
        const dStr = item.status === 'done'
            ? (item.dateDone || item.dateAdded || item.date_reported)
            : (item.dateAdded || item.date_reported);
        if (dStr) {
            const t = parseSafeDate(dStr).getTime();
            if (t < minTime) minTime = t;
            if (t > maxTime) maxTime = t;
        }
    });

    if (minTime !== Infinity) minDate = new Date(minTime);
    if (maxTime !== -Infinity) maxDate = new Date(maxTime);

    minDate.setHours(0, 0, 0, 0);
    maxDate.setHours(23, 59, 59, 999);

    const labelsData = [];
    const resolvedCountsData = [];

    let diffDays = 0;
    if (minDate <= maxDate) {
        diffDays = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24));
    }

    if (diffDays > 60) {
        const grouped = {};
        data.forEach(item => {
            if (item.status === 'done') {
                const d = parseSafeDate(item.dateDone || item.dateAdded || item.date_reported);
                const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                grouped[k] = (grouped[k] || 0) + 1;
            }
        });
        const sortedK = Object.keys(grouped).sort();
        sortedK.forEach(k => {
            const [y, m] = k.split('-');
            labelsData.push(`${m}/${y}`);
            resolvedCountsData.push(grouped[k]);
        });
    } else {
        const grouped = {};
        data.forEach(item => {
            if (item.status === 'done') {
                const d = parseSafeDate(item.dateDone || item.dateAdded || item.date_reported);
                const k = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
                grouped[k] = (grouped[k] || 0) + 1;
            }
        });

        const safeDiff = isNaN(diffDays) ? 0 : Math.min(diffDays, 60);
        for (let i = 0; i <= safeDiff; i++) {
            const d = new Date(minDate);
            d.setDate(d.getDate() + i);
            const k = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
            labelsData.push(`${d.getMonth() + 1}/${d.getDate()}`);
            resolvedCountsData.push(grouped[k] || 0);
        }
    }

    const lineTitle = document.getElementById('line-chart-title');
    if (lineTitle) {
        let filterText = 'All Time';
        if (dateInput) filterText = 'Filtered Date';
        else if (searchInput) filterText = 'Search Results';
        else {
            const sel = document.getElementById('perf-filter');
            if (sel && sel.options[sel.selectedIndex]) filterText = sel.options[sel.selectedIndex].text;
        }
        lineTitle.innerText = `Tickets Resolved (${filterText})`;
    }

    const ctxLine = document.getElementById('lineChart');
    if (ctxLine) {
        if (lineChartInstance) lineChartInstance.destroy();
        lineChartInstance = new Chart(ctxLine, {
            type: 'line',
            data: {
                labels: labelsData,
                datasets: [{
                    label: 'Resolved Tickets',
                    data: resolvedCountsData,
                    borderColor: primaryColor,
                    backgroundColor: primaryBg,
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3,
                    pointRadius: diffDays > 30 ? 1 : 3
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }
        });
    }

    const troubleCounts = {};
    data.forEach(item => {
        const t = (item.trouble_report && item.trouble_report.trim() !== '') ? item.trouble_report : 'Unspecified';
        troubleCounts[t] = (troubleCounts[t] || 0) + 1;
    });

    const troubleLabels = Object.keys(troubleCounts);
    const troubleData = Object.values(troubleCounts);
    const bgColors = ['#f87171', '#fb923c', '#fbbf24', '#a3e635', '#4ade80', '#34d399', '#2dd4bf', '#38bdf8', '#60a5fa', '#818cf8', '#a78bfa', '#c084fc', '#e879f9', '#f472b6', '#fb7185'];

    const pieTitle = document.getElementById('pie-chart-title');
    if (pieTitle) {
        let filterText = 'All Time';
        if (dateInput) filterText = 'Filtered Date';
        else if (searchInput) filterText = 'Search Results';
        else {
            const sel = document.getElementById('perf-filter');
            if (sel && sel.options[sel.selectedIndex]) filterText = sel.options[sel.selectedIndex].text;
        }
        pieTitle.innerText = `Trouble Types (${filterText})`;
    }

    const ctxPie = document.getElementById('pieChart');
    if (ctxPie) {
        if (pieChartInstance) pieChartInstance.destroy();
        const isDark = document.body.classList.contains('dark-mode');
        pieChartInstance = new Chart(ctxPie, {
            type: 'doughnut',
            data: {
                labels: troubleLabels,
                datasets: [{
                    data: troubleData,
                    backgroundColor: bgColors.slice(0, troubleLabels.length),
                    borderWidth: 1,
                    borderColor: isDark ? '#1e293b' : '#ffffff'
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { boxWidth: 10, font: { size: 10 }, color: isDark ? '#94a3b8' : '#64748b' } } } }
        });
    }
}

window.handleDropdownChange = (type) => {
    const val = document.getElementById(`input-${type}`).value;
    const customInput = document.getElementById(`input-${type}-custom`);
    if (val === "NEW_ENTRY") { customInput.classList.remove('hidden'); customInput.focus(); } else { customInput.classList.add('hidden'); }
}

window.openModal = (editId = null) => {
    const teamContainer = document.getElementById('input-team').parentNode;
    if (!document.getElementById('input-team-custom')) { teamContainer.innerHTML += `<input type="text" id="input-team-custom" placeholder="Enter New Team Name" class="hidden w-full border border-blue-300 bg-blue-50 rounded-lg p-2.5 mt-2 outline-none fade-in dark-input">`; document.getElementById('input-team').setAttribute('onchange', "handleDropdownChange('team')"); }
    const areaContainer = document.getElementById('input-area').parentNode;
    if (!document.getElementById('input-area-custom')) { areaContainer.innerHTML += `<input type="text" id="input-area-custom" placeholder="Enter New Area Name" class="hidden w-full border border-blue-300 bg-blue-50 rounded-lg p-2.5 mt-2 outline-none fade-in dark-input">`; document.getElementById('input-area').setAttribute('onchange', "handleDropdownChange('area')"); }

    document.getElementById('input-team-custom').classList.add('hidden');
    document.getElementById('input-team-custom').value = '';
    document.getElementById('input-area-custom').classList.add('hidden');
    document.getElementById('input-area-custom').value = '';

    let editItem = null;
    if (editId) editItem = soData.find(i => i.id == editId);

    document.getElementById('input-team').innerHTML = buildOptions(DYNAMIC_TEAMS, editItem ? editItem.team : null);
    document.getElementById('input-area').innerHTML = buildOptions(DYNAMIC_AREAS, editItem ? editItem.area : null);
    updateBarangaysDropdown('input-area', 'input-barangay', editItem ? editItem.barangay : "");

    const btn = document.getElementById('modal-btn');

    if (editItem) {
        // EDIT MODE: Load existing data into the form
        document.getElementById('modal-title').innerText = editItem.status === 'pending' ? "Assign Team" : "Edit Details";
        btn.innerText = "Save Changes";
        document.getElementById('edit-id').value = editId;
        document.getElementById('input-name').value = editItem.name;

        document.getElementById('input-ticket').value = editItem.ticket_no || "";
        document.getElementById('input-account').value = editItem.account_no || "";
        document.getElementById('input-contact').value = editItem.contact_number || "";
        document.getElementById('input-facility').value = editItem.facility || "";
        document.getElementById('input-address').value = editItem.address || "";
        document.getElementById('input-trouble').value = editItem.trouble_report || "";
        document.getElementById('input-remarks').value = editItem.remarks || "";
        document.getElementById('input-longlat').value = editItem.long_lat || "";
    } else {
        // NEW DISPATCH MODE: Clear all fields
        document.getElementById('modal-title').innerText = "New Dispatch";
        btn.innerText = "Confirm Dispatch";
        document.getElementById('edit-id').value = "";
        document.getElementById('input-name').value = "";

        document.getElementById('input-ticket').value = "";
        document.getElementById('input-account').value = "";
        document.getElementById('input-contact').value = "";
        document.getElementById('input-facility').value = "";
        document.getElementById('input-address').value = "";
        document.getElementById('input-trouble').value = "";
        document.getElementById('input-remarks').value = "";
        document.getElementById('input-longlat').value = "";
    }

    const troubleInput = document.getElementById('input-trouble');
    const ticketInput = document.getElementById('input-ticket');
    const ticketAccountContainer = document.getElementById('ticket-account-container');

    if (currentAppMode === 'SLI') {
        troubleInput.placeholder = "Package Details";
        if (ticketInput) {
            ticketInput.placeholder = "JO No.";
            ticketInput.classList.remove('hidden');
        }
        if (ticketAccountContainer) {
            ticketAccountContainer.classList.remove('grid-cols-1');
            ticketAccountContainer.classList.add('grid-cols-2');
        }
    } else {
        troubleInput.placeholder = "Reported Trouble";
        if (ticketInput) {
            ticketInput.placeholder = "Ticket No.";
            ticketInput.classList.remove('hidden');
        }
        if (ticketAccountContainer) {
            ticketAccountContainer.classList.remove('grid-cols-1');
            ticketAccountContainer.classList.add('grid-cols-2');
        }
    }

    toggleModal('form-modal');
}

window.openBulkModal = () => {
    // Load Global Dropdowns
    document.getElementById('global-bulk-team').innerHTML = buildOptions(DYNAMIC_TEAMS, null);
    document.getElementById('global-bulk-area').innerHTML = buildOptions(DYNAMIC_AREAS, null);

    // ⚡ Logic Sync: Update headers based on mode
    const isSLI = (currentAppMode === 'SLI');
    const ticketHeader = document.getElementById('bulk-header-ticket');
    const troubleHeader = document.getElementById('bulk-header-trouble');

    if (ticketHeader) ticketHeader.innerText = isSLI ? 'JO No.' : 'Ticket No.';
    if (troubleHeader) troubleHeader.innerText = isSLI ? 'Package' : 'Trouble';

    // Clear old table rows and inject default rows
    const tbody = document.getElementById('bulk-table-body');
    tbody.innerHTML = '';
    for (let i = 0; i < 5; i++) { window.addBulkRow(); }

    document.getElementById('bulk-btn').innerText = 'Dispatch All Rows';
    toggleModal('bulk-modal');
}

window.addBulkRow = () => {
    const tbody = document.getElementById('bulk-table-body');
    const tr = document.createElement('tr');
    tr.className = 'border-b border-gray-100 dark-border hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors bulk-row bg-white dark:bg-slate-800/50';

    tr.innerHTML = `
        <td class="p-1.5"><input type="text" class="bulk-name w-full p-2 text-sm border border-gray-200 rounded outline-none focus:border-blue-500 dark-input placeholder-gray-300" placeholder="Name..."></td>
        <td class="p-1.5"><input type="text" class="bulk-barangay w-full p-2 text-sm border border-gray-200 rounded outline-none focus:border-blue-500 dark-input placeholder-gray-300" placeholder="Barangay..."></td>
        <td class="p-1.5"><input type="text" class="bulk-ticket w-full p-2 text-sm border border-gray-200 rounded outline-none focus:border-blue-500 dark-input placeholder-gray-300" placeholder="Ticket..."></td>
        <td class="p-1.5"><input type="text" class="bulk-acct w-full p-2 text-sm border border-gray-200 rounded outline-none focus:border-blue-500 dark-input placeholder-gray-300" placeholder="Account..."></td>
        <td class="p-1.5"><input type="text" class="bulk-contact w-full p-2 text-sm border border-gray-200 rounded outline-none focus:border-blue-500 dark-input placeholder-gray-300" placeholder="Contact..."></td>
        <td class="p-1.5"><input type="text" class="bulk-address w-full p-2 text-sm border border-gray-200 rounded outline-none focus:border-blue-500 dark-input placeholder-gray-300" placeholder="Address..."></td>
        <td class="p-1.5"><input type="text" class="bulk-trouble w-full p-2 text-sm border border-gray-200 rounded outline-none focus:border-blue-500 dark-input placeholder-gray-300" placeholder="Trouble..."></td>
        <td class="p-1.5"><input type="text" class="bulk-remarks w-full p-2 text-sm border border-gray-200 rounded outline-none focus:border-blue-500 dark-input placeholder-gray-300" placeholder="Remarks..."></td>
        <td class="p-1.5 text-center"><button onclick="this.closest('tr').remove()" class="text-red-400 hover:text-red-600 p-1"><i class="fa-solid fa-trash"></i></button></td>
    `;
    tbody.appendChild(tr);
}

window.toggleModal = (id) => { const m = document.getElementById(id); m.classList.toggle('hidden'); m.classList.toggle('flex'); }
window.openTeamAnalytics = (teamName) => { let teamData = soData.filter(i => i.team === teamName && (i.type || 'SLR') === currentAppMode); const done = teamData.filter(i => i.status === 'done').length; const total = teamData.length; const percent = total === 0 ? 0 : Math.round((done / total) * 100); document.getElementById('team-modal-name').innerText = teamName; document.getElementById('team-modal-percent').innerText = percent + "%"; document.getElementById('team-modal-total').innerText = total; document.getElementById('team-modal-done').innerText = done; document.getElementById('team-modal-areas').innerHTML = ""; document.getElementById('team-modal-history').innerHTML = ""; toggleModal('team-analytics-modal'); };
window.clearDateFilter = () => { document.getElementById('global-date-filter').value = ''; render(true); }
window.changeRenderLimit = () => {
    renderLimit = parseInt(document.getElementById('entries-limit').value);
    render(false);
}
window.showMore = () => {
    // Add the dropdown's "step" value to the current limit
    const step = parseInt(document.getElementById('entries-limit').value);
    renderLimit += step;
    render(false);
}

// ============================================
// 9. INBOX BULK ACTIONS
// ============================================
window.toggleAllPending = (el) => {
    const cbs = document.querySelectorAll('.pending-cb');
    cbs.forEach(cb => cb.checked = el.checked);
}

window.bulkApprovePending = async () => {
    const team = document.getElementById('inbox-bulk-team').value;
    if (!team) return alert("⚠️ Please select a team from the dropdown first.");

    const checkedNodes = document.querySelectorAll('.pending-cb:checked');
    if (checkedNodes.length === 0) return alert("⚠️ Please select at least one ticket using the checkboxes.");

    if (!confirm(`Dispatch ${checkedNodes.length} tickets to ${team}?`)) return;

    const idsToApprove = Array.from(checkedNodes).map(cb => cb.value);
    const updatePromises = [];
    const todayStr = new Date().toLocaleDateString();

    idsToApprove.forEach(id => {
        const item = soData.find(i => i.id === id);
        if (item) {
            const remInput = document.getElementById(`rem-${id}`);
            const currentRemarks = remInput && remInput.value ? remInput.value : (item.remarks || "");

            // Update local memory
            item.status = 'active';
            item.team = team;
            item.remarks = currentRemarks;
            item.dateAdded = todayStr;

            // Prep individual safe updates for Supabase
            updatePromises.push(
                db.from('service_orders').update({
                    status: 'active',
                    team: team,
                    remarks: currentRemarks,
                    dateAdded: todayStr
                }).eq('id', id)
            );
        }
    });

    // Optimistically render UI
    render(false);

    try {
        // Fire all updates to the database safely
        const results = await Promise.all(updatePromises);
        const errors = results.filter(r => r && r.error);
        if (errors.length > 0) throw errors[0].error;

        console.log(`✅ Bulk dispatched ${updatePromises.length} tickets.`);
    } catch (e) {
        console.error("Bulk Approve Error:", e);
        alert("Bulk update failed on database. Refreshing to original state. Error: " + e.message);
    }
}