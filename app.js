// ============================================
// 1. SETTINGS & AUTO-DEBUG
// ============================================
const DEBUG_MODE = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.protocol === "file:");
function log(msg, data = null) { if (!DEBUG_MODE) return; const time = new Date().toLocaleTimeString(); if (data) console.log(`[${time}] 🔧 ${msg}`, data); else console.log(`[${time}] 🔧 ${msg}`); }

// ⚡ THE FIX: Environment-Aware Database Keys
let SUPABASE_URL = ""; 
let SUPABASE_KEY = "";

if (DEBUG_MODE) {
    // 🧪 TEST ENVIRONMENT (Runs only on your Mac / localhost)
    log("Running in TEST MODE connected to Sandbox DB");
    SUPABASE_URL = "https://fqxturtabhbpgbizriss.supabase.co"; // <-- Paste Test URL here
    SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxeHR1cnRhYmhicGdiaXpyaXNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2NTM5MzMsImV4cCI6MjA4NzIyOTkzM30.p9lIjSuiGRG84YlpXVe0B-rdd1-6tz4zU-uKzKjQNEQ";                // <-- Paste Test Key here
} else {
    // 🚨 PRODUCTION ENVIRONMENT (Runs only on Netlify / Live Web)
    // DO NOT change these. These are your real, live database keys.
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
let DYNAMIC_AREAS = new Set(["TAGAYTAY", "AMADEO", "MENDEZ", "BAILEN", "MARAGONDON", "ALFONSO", "MAGALLANES", "INDANG"]);

// ⚡ CHANGED: Default mode is now SLR, but default Tab can be active or pending.
let currentTab = 'active';
let currentAppMode = 'SLR'; 
let renderLimit = 50;
let db = null; 

// ============================================
// 3. UTILITIES & HELPERS (No Changes)
// ============================================
function parseDateInput(input) { if (!input) return null; const parts = input.split('-'); return new Date(parts[0], parts[1] - 1, parts[2]); }
function isSameDay(d1, d2) { if(!d1 || !d2) return false; const date1 = new Date(d1); const date2 = new Date(d2); return date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth() && date1.getDate() === date2.getDate(); }

function renderMiniCard(t,d,tot) {
    const isSLR = currentAppMode === 'SLR'; const color = isSLR ? 'green' : 'indigo'; const p = tot===0?0:Math.round((d/tot)*100); const c = p===100?`text-${color}-600`:(p>50?`text-${color}-600`:'text-orange-500');
    return `<div onclick="openTeamAnalytics('${t}')" class="bg-white p-3 rounded-xl shadow-sm border border-gray-100 cursor-pointer clickable-card hover:border-${color}-300 transition select-none dark-element dark-border"><div class="flex justify-between items-center mb-1"><h4 class="text-xs font-bold text-gray-500 uppercase truncate w-24 dark-text">${t}</h4><span class="${c} font-bold text-sm">${p}%</span></div><div class="w-full bg-gray-100 rounded-full h-1.5 mb-1 dark-bg-sub"><div class="bg-slate-800 h-1.5 rounded-full" style="width: ${p}%"></div></div><p class="text-xs text-gray-400 text-right dark-text">${d}/${tot}</p></div>`;
}
function renderAreaRow(t,d,tot) {
    const isSLR = currentAppMode === 'SLR'; const color = isSLR ? 'green' : 'indigo'; const p = tot===0?0:Math.round((d/tot)*100);
    return `<div class="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-100 dark-element dark-border"><span class="text-xs font-bold text-gray-700 w-1/3 dark-text">${t}</span><div class="w-1/3 px-2"><div class="w-full bg-gray-100 rounded-full h-2 dark-bg-sub"><div class="bg-${color}-600 h-2 rounded-full" style="width: ${p}%"></div></div></div><div class="w-1/3 text-right"><span class="text-xs font-bold text-gray-600 dark-text">${p}%</span><span class="text-[10px] text-gray-400 ml-1">(${d}/${tot})</span></div></div>`;
}
function buildOptions(set, selectedVal) {
    let html = `<option value="" disabled ${!selectedVal ? 'selected' : ''}>-- Select --</option>`; [...set].sort().forEach(val => { html += `<option value="${val}" ${selectedVal === val ? 'selected' : ''}>${val}</option>`; }); html += `<option value="NEW_ENTRY" class="font-bold text-blue-600 bg-blue-50">+ ADD NEW...</option>`; return html;
}

function generateUUID() {
    if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID();
    // Fallback for older browsers and Cypress automated testing
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
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
    if(btnSLR) btnSLR.className = isSLR ? "bg-white shadow text-green-700 px-4 py-1 rounded-md text-xs font-bold transition" : "px-4 py-1 rounded-md text-xs font-bold transition text-gray-400 hover:text-gray-600";
    if(btnSLI) btnSLI.className = !isSLR ? "bg-white shadow text-indigo-700 px-4 py-1 rounded-md text-xs font-bold transition" : "px-4 py-1 rounded-md text-xs font-bold transition text-gray-400 hover:text-gray-600";
    
    const primaryColor = isSLR ? 'bg-green-600' : 'bg-indigo-600'; const hoverColor = isSLR ? 'hover:bg-green-700' : 'hover:bg-indigo-700'; const shadowColor = isSLR ? 'shadow-green-600/30' : 'shadow-indigo-600/30'; const perfBg = isSLR ? 'bg-slate-800' : 'bg-indigo-900'; 
    const els = { 'btn-new': `${primaryColor} text-white px-3 py-1 rounded-lg text-sm font-bold ${hoverColor} shadow-md ${shadowColor} transition`, 'modal-btn': `w-full ${primaryColor} text-white py-3 rounded-xl font-bold shadow-md ${hoverColor} transition mt-2`, 'bulk-btn': `w-full ${primaryColor} text-white py-3 rounded-xl font-bold shadow-md ${hoverColor} transition mt-2`, 'btn-add-team': `${primaryColor} text-white px-3 py-2 rounded-lg font-bold text-xs ${hoverColor} transition` };
    for (const [id, cls] of Object.entries(els)) { const el = document.getElementById(id); if(el) el.className = cls; }
    
    const perfCard = document.getElementById('perf-card'); if(perfCard) perfCard.className = `${perfBg} text-white rounded-2xl p-5 shadow-xl relative overflow-hidden transition-colors duration-500`;
    const modalHeader = document.getElementById('team-modal-header'); if(modalHeader) modalHeader.className = `${perfBg} p-6 text-white shrink-0 transition-colors duration-500`;
    const icon = document.getElementById('filter-icon'); if(icon) icon.className = `fa-solid fa-magnifying-glass mr-2 ${isSLR ? 'text-green-500' : 'text-indigo-500'}`;
    const title = document.getElementById('app-title'); if(title) { title.innerText = `${mode} Dispatch`; title.className = `text-lg font-extrabold tracking-tight dark-text ${isSLR ? 'text-slate-800' : 'text-indigo-900'}`; }
    render(true);
}

// ⚡ CHANGED: Added 'pending' tab logic
window.switchTab = (tab) => {
    currentTab = tab; 
    const limitEl = document.getElementById('entries-limit');
    renderLimit = limitEl ? parseInt(limitEl.value) : 50;
    
    ['pending', 'active', 'history', 'performance'].forEach(t => { 
        const el = document.getElementById(`nav-${t}`); 
        if(el) {
            // ⚡ THE FIX: Remember if RBAC hid this tab, and re-apply it after changing classes
            const isHidden = el.classList.contains('hidden');
            el.className = t === tab ? "flex-1 py-3 text-center text-sm nav-active" : "flex-1 py-3 text-center text-sm nav-item relative"; 
            if (isHidden) el.classList.add('hidden'); 
        }
    });
    const listView = document.getElementById('view-list'); const perfView = document.getElementById('view-performance');
    if(tab === 'performance') { if(listView) listView.classList.add('hidden'); if(perfView) perfView.classList.remove('hidden'); } 
    else { 
        if(perfView) perfView.classList.add('hidden'); 
        if(listView) listView.classList.remove('hidden'); 
        const header = document.getElementById('list-header'); 
        
        // ⚡ CHANGED: Dynamic Header
        if(header) {
            if (tab === 'active') header.innerText = "Active Dispatches";
            else if (tab === 'history') header.innerText = "Accomplished Logs";
            else if (tab === 'pending') header.innerText = "Inbox (Pending Approval)";
        }
    }
    render(true);
};

window.clearAllFilters = () => { document.getElementById('global-date-filter').value = ''; document.getElementById('global-team-filter').value = ''; document.getElementById('global-area-filter').value = ''; document.getElementById('global-search').value = ''; render(true); }
window.toggleSettings = () => { toggleModal('settings-modal'); document.getElementById('team-list-settings').innerHTML = [...DYNAMIC_TEAMS].sort().map(t => `<div class="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-200 dark-bg-sub dark-border"><span class="text-sm font-medium text-gray-700 dark-text">${t}</span><div class="flex gap-2"><button onclick="renameTeam('${t}')" class="text-blue-400 hover:text-blue-600"><i class="fa-solid fa-pen"></i></button><button onclick="deleteTeam('${t}')" class="text-red-400 hover:text-red-600"><i class="fa-solid fa-trash-can"></i></button></div></div>`).join(''); }
window.addNewTeam = () => { const val = document.getElementById('new-team-name').value.trim(); if (val && !DYNAMIC_TEAMS.has(val)) { DYNAMIC_TEAMS.add(val); document.getElementById('new-team-name').value = ''; toggleSettings(); } }
window.toggleTheme = () => { document.body.classList.toggle('dark-mode'); const isDark = document.body.classList.contains('dark-mode'); localStorage.setItem('slrTheme', isDark ? 'dark' : 'light'); }
if(localStorage.getItem('slrTheme') === 'dark') document.body.classList.add('dark-mode');

window.exportCSV = () => {
    const dataToExport = soData.filter(i => (i.type || 'SLR') === currentAppMode);
    if(dataToExport.length === 0) return console.warn("No data to export.");
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

// ⚡ FIX: Hardcoded ALLOWED_EMAILS array is completely deleted!

// Helper function to check if the user is in the Supabase VIP table
async function verifyAndShowApp(userEmail) {
    try {
        const { data, error } = await db.from('authorized_emails').select('email, role, team').eq('email', userEmail);
        
        if (data && data.length > 0) {
            actualUserRole = data[0].role || 'tech';
            currentUserRole = actualUserRole; 
            currentUserTeam = data[0].team || null;
            
            // ⚡ SECURE CHECK: Only unhide Dev Tools if the database says you are a developer
            if (actualUserRole === 'developer') {
                document.getElementById('dev-tools').classList.remove('hidden');
            }
            
            applyRBACUI(); 
            showApp();
        } else {
            console.warn("Unauthorized entry attempt by:", userEmail);
            alert("Unauthorized Email Address: " + userEmail);
            logout(); 
        }
    } catch (err) {
        console.error("Verification error:", err);
        logout();
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
        // Re-apply if we are currently impersonating
        if (currentUserRole === 'tech') applyImpersonation();
    }
}

// ⚡ NEW: The UI Bouncer Function
function applyRBACUI() {
    const adminTabs = ['nav-pending', 'nav-history', 'nav-performance'];
    const adminBtns = ['btn-new', 'btn-bulk'];

    if (currentUserRole === 'tech') {
        // Lock it down
        adminTabs.forEach(id => document.getElementById(id)?.classList.add('hidden'));
        adminBtns.forEach(id => document.getElementById(id)?.classList.add('hidden'));
        if (['pending', 'history', 'performance'].includes(currentTab)) switchTab('active');
    } else {
        // Developer or Admin: Unlock everything
        adminTabs.forEach(id => document.getElementById(id)?.classList.remove('hidden'));
        adminBtns.forEach(id => document.getElementById(id)?.classList.remove('hidden'));
    }
    render(true);
}

if(db) {
    db.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session) {
            // Check database instead of hardcoded array
            verifyAndShowApp(session.user.email);
        } else if (event === 'SIGNED_OUT') {
            document.getElementById('login-screen').classList.remove('hidden'); 
            document.getElementById('main-app').classList.add('hidden');
        }
    });
    
    db.auth.getSession().then(({ data: { session } }) => {
        if (session) {
            // Check database instead of hardcoded array
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
    if(db) { await db.auth.signOut(); location.reload(); }
};

function showApp() { 
    document.getElementById('login-screen').classList.add('hidden'); 
    document.getElementById('main-app').classList.remove('hidden'); 
    if (db) startSupabaseListener(); 
    setTimeout(() => { if(window.switchAppMode) window.switchAppMode('SLR'); }, 100); 
}

// ============================================
// 6. DATA & REALTIME
// ============================================
async function startSupabaseListener() {
    try {
        const { data, error } = await db.from('service_orders').select('*');
        if(error) throw error;
        soData = data || [];
        extractDynamicOptions();
        document.getElementById('loading-screen').classList.add('hidden');
        
        // ⚡ CHANGED: Default to 'pending' if there are pending items, otherwise 'active'
        const hasPending = soData.some(i => i.status === 'pending');
        if (currentUserRole === 'admin') {
            window.switchTab(hasPending ? 'pending' : 'active');
        } else {
            window.switchTab('active');
        }

        db.channel('custom-all-channel')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'service_orders' }, (payload) => {
            if(payload.eventType === 'INSERT') { if (!soData.find(i => i.id === payload.new.id)) soData.push(payload.new); } 
            else if(payload.eventType === 'UPDATE') { const index = soData.findIndex(i => i.id === payload.new.id); if(index !== -1) soData[index] = payload.new; } 
            else if(payload.eventType === 'DELETE') { soData = soData.filter(i => i.id !== payload.old.id); }
            extractDynamicOptions();
            render(false);
        })
        .subscribe();
    } catch (err) { console.error("Data Error:", err); }
}
function extractDynamicOptions() {
    // ⚡ THE FIX: Re-initialize BOTH Sets with their default values so they never disappear!
    DYNAMIC_TEAMS = new Set(["Team Bernie", "Team Randy"]); 
    DYNAMIC_AREAS = new Set(["TAGAYTAY", "AMADEO", "MENDEZ", "BAILEN", "MARAGONDON", "ALFONSO", "MAGALLANES", "INDANG"]); 
    
    soData.forEach(item => { 
        if(item.team && item.team !== 'Unassigned') DYNAMIC_TEAMS.add(item.team); 
        if(item.area && item.area !== 'Unknown') DYNAMIC_AREAS.add(item.area); 
    });
    
    populateFilterDropdown('global-team-filter', DYNAMIC_TEAMS, "All Teams");
    populateFilterDropdown('global-area-filter', DYNAMIC_AREAS, "All Areas");
    updateDevTeamDropdown();
}

function populateFilterDropdown(id, set, label) {
    const el = document.getElementById(id); if(!el) return;
    const currentVal = el.value; let html = `<option value="">${label}</option>`;
    [...set].sort().forEach(val => { html += `<option value="${val}">${val}</option>`; });
    el.innerHTML = html; el.value = currentVal; 
}

// ============================================
// 7. CRUD ACTIONS
// ============================================
window.saveSO = async () => {
    if(!db) return alert("Database disconnected");
    const id = document.getElementById('edit-id').value; 
    const name = document.getElementById('input-name').value;
    
    let team = document.getElementById('input-team').value; 
    if (team === "NEW_ENTRY") team = document.getElementById('input-team-custom').value.trim();
    
    let area = document.getElementById('input-area').value; 
    if (area === "NEW_ENTRY") area = document.getElementById('input-area-custom').value.trim();
    
    if(!name || !team || !area) return alert("All fields required");
    
    let remarksToSave = "";
    if (id) {
        const remInput = document.getElementById(`rem-${id}`);
        if (remInput) {
            remarksToSave = remInput.value;
        } else {
            const existingItem = soData.find(i => i.id === id);
            if (existingItem && existingItem.remarks) remarksToSave = existingItem.remarks;
        }
    }
    
    // ⚡ THE FIX: Grab all the new additional details from the inputs
    const payload = { 
        name, 
        team, 
        area, 
        type: currentAppMode, 
        status: 'active',
        ticket_no: document.getElementById('input-ticket').value.trim(),
        account_no: document.getElementById('input-account').value.trim(),
        contact_number: document.getElementById('input-contact').value.trim(),
        facility: document.getElementById('input-facility').value.trim(),
        address: document.getElementById('input-address').value.trim(),
        trouble_report: document.getElementById('input-trouble').value.trim(),
        long_lat: document.getElementById('input-longlat').value.trim()
    }; 
    
    if (remarksToSave !== "") {
        payload.remarks = remarksToSave;
    }

    try {
        if(!id) {
            payload.id = generateUUID(); 
            const todayStr = new Date().toLocaleDateString();
            payload.dateAdded = todayStr; 
            payload.date_reported = todayStr; // Auto-stamp reported date for manual entries
            payload.pic = false; 
            payload.pwr = false; 
            payload.speed = false; 
            payload.rpt = false;
            
            const { error } = await db.from('service_orders').insert([payload]); 
            if(error) throw error; 
            soData.push(payload); 
        } else {
            const { error } = await db.from('service_orders').update(payload).eq('id', id); 
            if(error) throw error;
            const index = soData.findIndex(i => i.id === id); 
            if(index !== -1) soData[index] = { ...soData[index], ...payload };
        }
        extractDynamicOptions(); 
        render(false); 
        toggleModal('form-modal');
    } catch (e) { 
        alert("Save Failed: " + e.message); 
    }
}

// ⚡ NEW: Approve function (Moves Pending -> Active)
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
    const todayStr = new Date().toLocaleDateString(); // ⚡ FIX: Get today's date

    try {
        // Send status, remarks, AND the fresh dispatch date to Supabase
        await db.from('service_orders').update({ 
            status: 'active', 
            remarks: currentRemarks,
            dateAdded: todayStr // ⚡ FIX: Stamp the date it was actually dispatched
        }).eq('id', id);
        
        // Optimistic update locally
        item.status = 'active';
        item.remarks = currentRemarks;
        item.dateAdded = todayStr; // ⚡ FIX: Update local UI state
        
        render(false);
    } catch(e) { 
        console.error("Approval Error:", e); 
    }
}

window.deleteSO = async (id) => { if(!confirm("Delete this record permanently?")) return; try { const { error } = await db.from('service_orders').delete().eq('id', id); if(error) throw error; soData = soData.filter(i => i.id !== id); render(false); } catch (e) { alert("Delete Failed: " + e.message); } }
window.renameTeam = async (oldName) => { const newName = prompt(`Rename "${oldName}" to:`, oldName); if (!newName || newName === oldName) return; if (!confirm(`Rename "${oldName}" to "${newName}" everywhere?`)) return; try { const { error } = await db.from('service_orders').update({ team: newName }).eq('team', oldName); if(error) throw error; soData.forEach(item => { if(item.team === oldName) item.team = newName; }); extractDynamicOptions(); render(false); toggleSettings(); } catch (e) { alert("Rename Failed: " + e.message); } }
window.deleteTeam = async (teamName) => { if(!confirm(`Delete ALL records for "${teamName}"?`)) return; try { const { error } = await db.from('service_orders').delete().eq('team', teamName); if(error) throw error; soData = soData.filter(item => item.team !== teamName); extractDynamicOptions(); render(false); toggleSettings(); } catch (e) { alert("Delete Failed: " + e.message); } }
window.markDone = async (id) => { const itemIndex = soData.findIndex(i => i.id == id); if(itemIndex === -1) return; const rem = document.getElementById(`rem-${id}`).value || soData[itemIndex].remarks || ""; const dateDone = new Date().toLocaleDateString(); try { await db.from('service_orders').update({ status: 'done', remarks: rem, dateDone: dateDone }).eq('id', id); soData[itemIndex].status = 'done'; soData[itemIndex].remarks = rem; soData[itemIndex].dateDone = dateDone; render(false); } catch(e) { console.error(e); } }
window.toggleCheck = async (id, key) => { const index = soData.findIndex(i => i.id == id); if(index === -1) return; const newVal = !soData[index][key]; soData[index][key] = newVal; render(false); const updateObj = {}; updateObj[key] = newVal; await db.from('service_orders').update(updateObj).eq('id', id); }
document.addEventListener('paste', function(e) {
    // Only intercept if pasting inside the bulk table
    if (!e.target.closest('#bulk-table-body')) return;
    
    const pasteData = (e.clipboardData || window.clipboardData).getData('text');
    if (!pasteData) return;
    
    // Check if it's multi-cell data (contains a tab or a newline)
    if (pasteData.indexOf('\t') === -1 && pasteData.indexOf('\n') === -1) return; // Standard single-word paste, let browser handle it naturally
    
    e.preventDefault(); // Stop standard pasting

    // Split clipboard into rows, remove trailing empty row if present
    const rows = pasteData.split(/\r?\n/);
    if(rows.length > 0 && rows[rows.length - 1] === "") rows.pop();

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
        
        // If we run out of rows while pasting, automatically create new ones!
        while (tbody.children.length <= currentRowIdx) {
            window.addBulkRow();
        }
        
        const tr = tbody.children[currentRowIdx];
        
        cols.forEach((cellData, cIdx) => {
            const currentColIdx = startColIdx + cIdx;
            // Ensure we don't paste past the 5th column (the delete button)
            if (currentColIdx < 5) {
                const input = tr.children[currentColIdx].querySelector('input');
                if (input) {
                    input.value = cellData.trim();
                }
            }
        });
    });
});

window.saveBulkSO = async () => { 
    // ⚡ Grab Team and Area globally
    const team = document.getElementById('global-bulk-team').value; 
    const area = document.getElementById('global-bulk-area').value; 

    if(!area || area === "NEW_ENTRY") return alert("⚠️ Please select an Area."); 
    if(!team || team === "NEW_ENTRY") return alert("⚠️ Please select a Team."); 
    
    const rows = document.querySelectorAll('.bulk-row');
    const payload = [];
    const todayStr = new Date().toLocaleDateString();
    let hasError = false;

    rows.forEach(row => {
        const name = row.querySelector('.bulk-name').value.trim();
        const ticket = row.querySelector('.bulk-ticket').value.trim();
        const acct = row.querySelector('.bulk-acct').value.trim();
        const contact = row.querySelector('.bulk-contact').value.trim();
        const address = row.querySelector('.bulk-address').value.trim();

        // Skip completely empty rows
        if (!name && !ticket && !acct && !contact && !address) return;

        // Ensure required Name field is filled
        if (!name) {
            hasError = true;
            row.querySelector('.bulk-name').classList.add('border-red-500', 'bg-red-50');
            return;
        } else {
            row.querySelector('.bulk-name').classList.remove('border-red-500', 'bg-red-50');
        }

        payload.push({ 
            id: generateUUID(),
            name: name, 
            team: team,   // From global dropdown
            area: area,   // From global dropdown
            type: currentAppMode, 
            status: 'active', 
            dateAdded: todayStr,
            date_reported: todayStr, 
            ticket_no: ticket,
            account_no: acct,
            contact_number: contact,
            address: address,
            pic: false, pwr: false, speed: false, rpt: false 
        });
    });

    if (hasError) return alert("⚠️ Please provide a Subscriber Name for all active rows (or click the trash can to delete the row).");
    if (payload.length === 0) return alert("⚠️ No data entered to dispatch.");

    document.getElementById('bulk-btn').innerText = "Processing Data..."; 
    
    try { 
        const { error } = await db.from('service_orders').insert(payload); 
        if(error) throw error; 
        
        soData.push(...payload); 
        render(false); 
        toggleModal('bulk-modal'); 
        
        document.getElementById('bulk-btn').innerText = "Dispatch All Rows"; 
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
    if(badge) {
        badge.innerText = pendingCount;
        badge.classList.toggle('hidden', pendingCount === 0);
    }

    const dateInput = document.getElementById('global-date-filter').value;
    const teamFilter = document.getElementById('global-team-filter').value;
    const areaFilter = document.getElementById('global-area-filter').value;
    const searchInput = document.getElementById('global-search').value.toLowerCase();
    const perfFilter = document.getElementById('perf-filter').value;
    let selectedDate = dateInput ? parseDateInput(dateInput) : null;

    const hasFilters = selectedDate || teamFilter || areaFilter || searchInput;
    const resetBtn = document.getElementById('clear-filters-btn');
    if(resetBtn) resetBtn.className = hasFilters ? "text-[10px] bg-red-100 hover:bg-red-200 text-red-600 px-3 py-1 rounded-full font-bold transition" : "hidden";

    if(selectedDate || searchInput) document.getElementById('perf-preset-container').classList.add('hidden');
    else document.getElementById('perf-preset-container').classList.remove('hidden');

    let filtered = soData.filter(item => {
        const itemType = item.type || 'SLR'; 
        if(itemType !== currentAppMode) return false;
        if (currentUserRole === 'tech' && item.team !== currentUserTeam) return false;
        if(searchInput && !item.name.toLowerCase().includes(searchInput)) return false;
        if(teamFilter && item.team !== teamFilter) return false;
        if(areaFilter && item.area !== areaFilter) return false;
        
        // ⚡ UPGRADED DATE FILTER LOGIC
        if(selectedDate) {
            let itemDateToCompare = null;
            
            if (currentTab === 'pending') {
                // If in Inbox, filter by the Google Sheet date
                itemDateToCompare = item.date_reported; 
            } else if (currentTab === 'active') {
                // If in Dispatch, filter by the day it was accepted/created
                itemDateToCompare = item.dateAdded;
            } else {
                // If in History, filter by the day it was completed
                itemDateToCompare = item.dateDone;
            }
            
            return isSameDay(itemDateToCompare, selectedDate);
        }
        
        if(currentTab === 'performance' && !selectedDate && !searchInput) {
            const now = new Date();
            const d = new Date(item.dateAdded); 
            if(perfFilter === 'all') return true;
            if(perfFilter === 'today') return isSameDay(d, now);
            if(perfFilter === 'week') return (now - d) < 7 * 86400000;
            if(perfFilter === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            return true;
        }
        return true;
    });

    if(currentTab === 'performance') { 
        renderPerformance(filtered.filter(i => i.status !== 'pending')); 
        return; 
    }

    // ⚡ CHANGED: List Logic
    let listItems = [];
    if (currentTab === 'pending') {
        listItems = filtered.filter(i => i.status === 'pending');
    } else if (currentTab === 'active') {
        listItems = filtered.filter(i => i.status === 'active');
    } else {
        listItems = filtered.filter(i => i.status === 'done');
    }
    
    renderList(listItems);
}

function renderList(items) {
    const container = document.getElementById('card-container');
    if(!container) return;
    document.getElementById('list-count').innerText = items.length;
    document.getElementById('empty-msg').className = items.length === 0 ? "text-center py-16 text-gray-400" : "hidden";
    
    // ⚡ NEW: Generate the Bulk Action Bar for the Inbox
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

    const groups = {};
    items.forEach(item => { const dateKey = currentTab === 'active' ? item.dateAdded : (item.dateDone || "Pending Requests"); if(!groups[dateKey]) groups[dateKey] = []; groups[dateKey].push(item); });
    const sortedDates = Object.keys(groups).sort((a,b) => new Date(b) - new Date(a));
    
    let html = '';
    let count = 0;
    for(const date of sortedDates) {
        if (currentTab !== 'pending') {
            html += `<div class="sticky-date py-2 px-1 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase flex justify-between items-center mt-4"><span><i class="fa-regular fa-calendar mr-1"></i> ${date}</span><span class="bg-gray-200 text-gray-600 px-2 rounded-full text-[10px]">${groups[date].length}</span></div>`;
        }
        for(const item of groups[date]) {
            if(count >= renderLimit) break;
            html += createCardHTML(item);
            count++;
        }
        if(count >= renderLimit) break;
    }
    
    // ⚡ Inject the Bulk Bar at the top of the cards
    container.innerHTML = bulkBar + html;
    const btn = document.getElementById('show-more-btn');
    if(btn) { 
        if(items.length > renderLimit) { 
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

    // Action Button Logic (Animations removed)
    let actionBtn = '';
    if (isPending) {
        actionBtn = `<button onclick="approveSO('${item.id}')" class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow uppercase tracking-wide transition flex items-center"><i class="fa-solid fa-thumbs-up mr-1"></i> Accept</button>`;
    } else if (isDone) {
        actionBtn = `<span class="text-xs font-bold text-${color}-600"><i class="fa-solid fa-check-double mr-1"></i>Completed</span>`;
    } else {
        actionBtn = `<button onclick="markDone('${item.id}')" class="bg-${color}-600 hover:bg-${color}-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow uppercase tracking-wide transition flex items-center"><i class="fa-solid fa-check mr-1"></i> Done</button>`;
    }

    // Team color logic (Animations removed)
    const teamColorClass = (isPending && item.team === 'Unassigned') ? 'text-red-500 font-extrabold' : 'text-gray-500 font-bold';
    const borderColor = (isPending) ? 'border-yellow-400' : (item.team && item.team.toLowerCase().includes('bernie') ? 'border-orange-400' : border);

    // Google Maps Link Logic
    let mapElement = '';
    let extraNote = '';

    if (item.long_lat && item.long_lat.trim() !== '') {
        const rawText = item.long_lat.trim();
        const isCoordinate = /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/.test(rawText);

        if (isCoordinate) {
            const safeCoords = encodeURIComponent(rawText.replace(/\s/g, ''));
            // Official Google Maps Directions API link
            const mapUrl = `https://www.google.com/maps/dir/?api=1&destination=${safeCoords}`;
            mapElement = `<a href="${mapUrl}" target="_blank" class="shrink-0 ml-2 bg-blue-100 hover:bg-blue-200 text-blue-700 text-[10px] px-2 py-1 rounded-md font-bold transition shadow-sm border border-blue-200"><i class="fa-solid fa-route mr-1"></i>ROUTE</a>`;
        } else {
            extraNote = `<div class="mt-1 text-slate-500 italic text-[10px]"><i class="fa-solid fa-thumbtack mr-1 text-slate-400"></i>Note: ${rawText}</div>`;
        }
    }

    // Aging Calculator Logic (Animations removed)
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
                    <i class="fa-solid fa-ticket text-slate-400 mr-1"></i>${item.ticket_no || 'No Ticket'} 
                    <span class="ml-1 font-mono text-slate-500 font-normal">(${item.account_no || 'No Acct'})</span>
                </span>
                
                <div class="flex items-center gap-1">
                    ${agingBadge}
                    <span class="font-mono text-[9px] text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-100 dark-element dark-border" title="Date Reported">
                        <i class="fa-regular fa-calendar mr-1"></i>${reportedDateDisplay}
                    </span>
                </div>
            </div>
            
            <div class="flex justify-between items-center mb-1.5">
                <div class="truncate font-medium flex-1" title="${item.address || ''}">
                    <i class="fa-solid fa-location-dot mr-1.5 text-slate-400"></i>${item.address || 'No Address Provided'}
                </div>
                ${mapElement}
            </div>
            ${extraNote}
            
            <div class="flex items-center mt-1.5 mb-1.5">
                <i class="fa-solid fa-phone mr-1.5 text-slate-400"></i>
                <span class="font-medium">${item.contact_number || 'No Contact'}</span>
            </div>
            
            ${item.trouble_report ? `
            <div class="mt-2 pt-1.5 border-t border-slate-200 dark-border text-orange-600 font-bold flex items-start">
                <i class="fa-solid fa-triangle-exclamation mt-0.5 mr-1.5"></i>
                <span class="leading-tight">${item.trouble_report}</span>
            </div>` : ''}
        </div>
    `;

    // Removed 'fade-in' class from the main div wrapper below
    return `
    <div class="bg-white rounded-xl shadow-sm p-4 border-l-4 ${borderColor} mb-3 dark-element">
        <div class="flex justify-between items-start mb-1">
            <div class="flex items-start gap-2">
                ${isPending ? `<input type="checkbox" class="pending-cb w-4 h-4 mt-0.5 accent-blue-600 cursor-pointer rounded" value="${item.id}">` : ''}
                <div>
                    <span class="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded mb-1 inline-block border border-slate-200 dark-bg-sub dark-text dark-border">${item.area}</span>
                    <h3 class="font-bold text-gray-800 text-lg leading-tight dark-text">${item.name}</h3>
                    <p class="text-xs ${teamColorClass} mt-0.5 uppercase tracking-wide dark-text">${item.team}</p>
                </div>
            </div>
            <div class="flex gap-1 shrink-0">
                <button onclick="openModal('${item.id}')" class="text-gray-300 hover:text-${color}-600 p-1"><i class="fa-solid fa-pen"></i></button>
                ${currentUserRole === 'admin' ? `<button onclick="deleteSO('${item.id}')" class="text-gray-300 hover:text-red-500 p-1"><i class="fa-solid fa-trash"></i></button>` : ''}
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
        
        <div class="flex items-center justify-between gap-3">
            <input type="text" id="rem-${item.id}" value="${item.remarks || ''}" ${isDone ? 'readonly' : ''} placeholder="Remarks..." class="flex-1 bg-white text-sm px-3 py-2 rounded border border-gray-200 focus:outline-none focus:border-${color}-500 dark-input">
            ${actionBtn}
        </div>
    </div>`;
}

function renderPerformance(data) {
    const stats = { total: data.length, done: 0, teams: {}, areas: {} };
    data.forEach(item => { if(!stats.teams[item.team]) stats.teams[item.team] = { total: 0, done: 0 }; if(!stats.areas[item.area]) stats.areas[item.area] = { total: 0, done: 0 }; stats.teams[item.team].total++; if(item.status === 'done') stats.teams[item.team].done++; stats.areas[item.area].total++; if(item.status === 'done') stats.areas[item.area].done++; });
    const percent = stats.total === 0 ? 0 : Math.round((stats.done / stats.total) * 100);
    document.getElementById('global-percent').innerText = percent + '%'; document.getElementById('global-done').innerText = stats.done; document.getElementById('global-total').innerText = stats.total; document.getElementById('global-bar').style.width = percent + '%';
    document.getElementById('team-stats-container').innerHTML = Object.entries(stats.teams).map(([n,d]) => renderMiniCard(n,d.done,d.total)).join('');
    document.getElementById('area-stats-container').innerHTML = Object.entries(stats.areas).map(([n,d]) => renderAreaRow(n,d.done,d.total)).join('');
}

window.handleDropdownChange = (type) => {
    const val = document.getElementById(`input-${type}`).value;
    const customInput = document.getElementById(`input-${type}-custom`);
    if (val === "NEW_ENTRY") { customInput.classList.remove('hidden'); customInput.focus(); } else { customInput.classList.add('hidden'); }
}

window.openModal = (editId = null) => { 
    const teamContainer = document.getElementById('input-team').parentNode;
    if(!document.getElementById('input-team-custom')) { teamContainer.innerHTML += `<input type="text" id="input-team-custom" placeholder="Enter New Team Name" class="hidden w-full border border-blue-300 bg-blue-50 rounded-lg p-2.5 mt-2 outline-none fade-in dark-input">`; document.getElementById('input-team').setAttribute('onchange', "handleDropdownChange('team')"); }
    const areaContainer = document.getElementById('input-area').parentNode;
    if(!document.getElementById('input-area-custom')) { areaContainer.innerHTML += `<input type="text" id="input-area-custom" placeholder="Enter New Area Name" class="hidden w-full border border-blue-300 bg-blue-50 rounded-lg p-2.5 mt-2 outline-none fade-in dark-input">`; document.getElementById('input-area').setAttribute('onchange', "handleDropdownChange('area')"); }
    
    document.getElementById('input-team-custom').classList.add('hidden'); 
    document.getElementById('input-team-custom').value = ''; 
    document.getElementById('input-area-custom').classList.add('hidden'); 
    document.getElementById('input-area-custom').value = '';
    
    let editItem = null; 
    if(editId) editItem = soData.find(i => i.id == editId);
    
    document.getElementById('input-team').innerHTML = buildOptions(DYNAMIC_TEAMS, editItem ? editItem.team : null); 
    document.getElementById('input-area').innerHTML = buildOptions(DYNAMIC_AREAS, editItem ? editItem.area : null);
    
    const btn = document.getElementById('modal-btn');
    
    if(editItem) { 
        // ⚡ EDIT MODE: Load existing data into the form
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
        document.getElementById('input-longlat').value = editItem.long_lat || "";
    } else { 
        // ⚡ NEW DISPATCH MODE: Clear all fields
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
        document.getElementById('input-longlat').value = "";
    } 
    toggleModal('form-modal'); 
}

window.openBulkModal = () => { 
    // Load Global Dropdowns
    document.getElementById('global-bulk-team').innerHTML = buildOptions(DYNAMIC_TEAMS, null); 
    document.getElementById('global-bulk-area').innerHTML = buildOptions(DYNAMIC_AREAS, null); 
    
    // Clear old table rows and inject default rows
    const tbody = document.getElementById('bulk-table-body');
    tbody.innerHTML = '';
    for(let i=0; i<5; i++) { window.addBulkRow(); }
    
    document.getElementById('bulk-btn').innerText = 'Dispatch All Rows'; 
    toggleModal('bulk-modal'); 
}

window.addBulkRow = () => {
    const tbody = document.getElementById('bulk-table-body');
    const tr = document.createElement('tr');
    tr.className = 'border-b border-gray-100 dark-border hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors bulk-row bg-white dark:bg-slate-800/50';
    
    // Area dropdown removed from here
    tr.innerHTML = `
        <td class="p-1.5"><input type="text" class="bulk-name w-full p-2 text-sm border border-gray-200 rounded outline-none focus:border-blue-500 dark-input placeholder-gray-300" placeholder="Name..."></td>
        <td class="p-1.5"><input type="text" class="bulk-ticket w-full p-2 text-sm border border-gray-200 rounded outline-none focus:border-blue-500 dark-input placeholder-gray-300" placeholder="Ticket..."></td>
        <td class="p-1.5"><input type="text" class="bulk-acct w-full p-2 text-sm border border-gray-200 rounded outline-none focus:border-blue-500 dark-input placeholder-gray-300" placeholder="Account..."></td>
        <td class="p-1.5"><input type="text" class="bulk-contact w-full p-2 text-sm border border-gray-200 rounded outline-none focus:border-blue-500 dark-input placeholder-gray-300" placeholder="Contact..."></td>
        <td class="p-1.5"><input type="text" class="bulk-address w-full p-2 text-sm border border-gray-200 rounded outline-none focus:border-blue-500 dark-input placeholder-gray-300" placeholder="Address..."></td>
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
        await Promise.all(updatePromises);
        console.log(`✅ Bulk dispatched ${updatePromises.length} tickets.`);
    } catch (e) {
        console.error("Bulk Approve Error:", e);
        alert("Bulk update failed. Check console.");
    }
}