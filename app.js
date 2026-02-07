// ============================================
// 1. SETTINGS & CONFIG
// ============================================
const DEBUG_MODE = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.protocol === "file:");
function log(msg, data = null) { if (!DEBUG_MODE) return; const time = new Date().toLocaleTimeString(); if (data) console.log(`[${time}] 🔧 ${msg}`, data); else console.log(`[${time}] 🔧 ${msg}`); }

const SUPABASE_URL = "https://qqrzlltwvvpowdigffsq.supabase.co"; 
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxcnpsbHR3dnZwb3dkaWdmZnNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzNTQ4MTUsImV4cCI6MjA4NTkzMDgxNX0.4C1CcwQ7BSx53Ofk284Mtc0TPxd3KoHfMR_qIm9WbZQ";

// ============================================
// 2. GLOBAL VARIABLES
// ============================================
let soData = [];
let DYNAMIC_TEAMS = new Set(["Team Bernie", "Team Randy"]); 
let DYNAMIC_AREAS = new Set(["TAGAYTAY", "AMADEO", "MENDEZ", "BAILEN", "MARAGONDON", "ALFONSO", "MAGALLANES", "INDANG"]);

let currentTab = 'active';
let currentAppMode = 'SLR'; // 'SLR' or 'SLI'
let renderLimit = 50;
let db = null; 

// ============================================
// 3. CORE FUNCTIONS (Defined FIRST to prevent errors)
// ============================================

// --- A. Mode Switcher ---
window.switchAppMode = (mode) => {
    currentAppMode = mode;
    const isSLR = mode === 'SLR';
    
    // 1. Update Buttons
    const btnSLR = document.getElementById('mode-slr');
    const btnSLI = document.getElementById('mode-sli');
    
    if(btnSLR) btnSLR.className = isSLR ? "bg-white shadow text-green-700 px-4 py-1 rounded-md text-xs font-bold transition" : "px-4 py-1 rounded-md text-xs font-bold transition text-gray-400 hover:text-gray-600";
    if(btnSLI) btnSLI.className = !isSLR ? "bg-white shadow text-indigo-700 px-4 py-1 rounded-md text-xs font-bold transition" : "px-4 py-1 rounded-md text-xs font-bold transition text-gray-400 hover:text-gray-600";

    // 2. Update Theme Colors
    const primaryColor = isSLR ? 'bg-green-600' : 'bg-indigo-600';
    const hoverColor = isSLR ? 'hover:bg-green-700' : 'hover:bg-indigo-700';
    const shadowColor = isSLR ? 'shadow-green-200' : 'shadow-indigo-200';
    const perfBg = isSLR ? 'bg-slate-800' : 'bg-indigo-900'; 
    
    const els = {
        'btn-new': `${primaryColor} text-white px-3 py-1 rounded-lg text-sm font-bold ${hoverColor} shadow-lg ${shadowColor} transition`,
        'modal-btn': `w-full ${primaryColor} text-white py-3 rounded-xl font-bold shadow-lg ${hoverColor} transition mt-2`,
        'bulk-btn': `w-full ${primaryColor} text-white py-3 rounded-xl font-bold shadow-lg ${hoverColor} transition mt-2`,
        'btn-add-team': `${primaryColor} text-white px-3 py-2 rounded-lg font-bold text-xs ${hoverColor} transition`
    };

    for (const [id, cls] of Object.entries(els)) {
        const el = document.getElementById(id);
        if(el) el.className = cls;
    }
    
    const perfCard = document.getElementById('perf-card');
    if(perfCard) perfCard.className = `${perfBg} text-white rounded-2xl p-5 shadow-xl relative overflow-hidden transition-colors duration-500`;
    
    const modalHeader = document.getElementById('team-modal-header');
    if(modalHeader) modalHeader.className = `${perfBg} p-6 text-white shrink-0 transition-colors duration-500`;

    const icon = document.getElementById('filter-icon');
    if(icon) icon.className = `fa-solid fa-filter mr-2 ${isSLR ? 'text-green-500' : 'text-indigo-500'}`;

    const title = document.getElementById('app-title');
    if(title) {
        title.innerText = `${mode} Dispatch`;
        title.className = `text-lg font-extrabold tracking-tight ${isSLR ? 'text-slate-800' : 'text-indigo-900'}`;
    }

    render(true);
}

// --- B. Tab Switcher ---
window.switchTab = (tab) => {
    currentTab = tab; renderLimit = 50;
    ['active', 'history', 'performance'].forEach(t => {
        const el = document.getElementById(`nav-${t}`);
        if(el) el.className = t === tab ? "flex-1 py-3 text-center text-sm nav-active" : "flex-1 py-3 text-center text-sm nav-item";
    });
    const listView = document.getElementById('view-list');
    const perfView = document.getElementById('view-performance');
    
    if(tab === 'performance') { 
        if(listView) listView.classList.add('hidden'); 
        if(perfView) perfView.classList.remove('hidden'); 
    } else { 
        if(perfView) perfView.classList.add('hidden'); 
        if(listView) listView.classList.remove('hidden'); 
        const header = document.getElementById('list-header');
        if(header) header.innerText = tab === 'active' ? "Active Dispatches" : "Accomplished Logs"; 
    }
    render(true);
};

// --- C. Utils ---
window.clearAllFilters = () => { 
    document.getElementById('global-date-filter').value = ''; 
    document.getElementById('global-team-filter').value = ''; 
    document.getElementById('global-area-filter').value = ''; 
    render(true); 
}

window.logout = () => { localStorage.removeItem('slrLoggedIn'); location.reload(); };
window.toggleSettings = () => { 
    toggleModal('settings-modal'); 
    document.getElementById('team-list-settings').innerHTML = [...DYNAMIC_TEAMS].sort().map(t => `
        <div class="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-200">
            <span class="text-sm font-medium text-gray-700">${t}</span>
            <div class="flex gap-2">
                <button onclick="renameTeam('${t}')" class="text-blue-400 hover:text-blue-600"><i class="fa-solid fa-pen"></i></button>
                <button onclick="deleteTeam('${t}')" class="text-red-400 hover:text-red-600"><i class="fa-solid fa-trash-can"></i></button>
            </div>
        </div>`).join(''); 
}

window.addNewTeam = () => {
    const val = document.getElementById('new-team-name').value.trim();
    if (val && !DYNAMIC_TEAMS.has(val)) {
        DYNAMIC_TEAMS.add(val);
        document.getElementById('new-team-name').value = '';
        toggleSettings();
    }
}

// ============================================
// 4. INIT LOGIC (Runs after functions exist)
// ============================================
try {
    if (!window.supabase) console.error("Supabase SDK not loaded.");
    else { db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY); log("Supabase Client Initialized"); }
} catch (err) { console.error("Init Error:", err); }

// Check Login
if(localStorage.getItem('slrLoggedIn') === 'true') { showApp(); }

function showApp() { 
    document.getElementById('login-screen').classList.add('hidden'); 
    document.getElementById('main-app').classList.remove('hidden'); 
    
    // Safely initialize
    if (db) startSupabaseListener(); 
    // Now switchAppMode exists, so we can call it safely
    setTimeout(() => window.switchAppMode('SLR'), 100); 
}

async function startSupabaseListener() {
    try {
        const { data, error } = await db.from('service_orders').select('*');
        if(error) throw error;
        soData = data || [];
        
        extractDynamicOptions();
        
        document.getElementById('loading-screen').classList.add('hidden');
        window.switchTab('active'); // Safe call

        db.channel('custom-all-channel')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'service_orders' }, (payload) => {
            if(payload.eventType === 'INSERT') {
                if (!soData.find(i => i.id === payload.new.id)) soData.push(payload.new);
            } else if(payload.eventType === 'UPDATE') {
                const index = soData.findIndex(i => i.id === payload.new.id);
                if(index !== -1) soData[index] = payload.new;
            } else if(payload.eventType === 'DELETE') {
                soData = soData.filter(i => i.id !== payload.old.id);
            }
            extractDynamicOptions();
            render(false);
        })
        .subscribe();
    } catch (err) { console.error("Data Error:", err); }
}

function extractDynamicOptions() {
    DYNAMIC_TEAMS.clear(); DYNAMIC_AREAS.clear(); 
    soData.forEach(item => {
        if(item.team) DYNAMIC_TEAMS.add(item.team);
        if(item.area) DYNAMIC_AREAS.add(item.area);
    });
    populateFilterDropdown('global-team-filter', DYNAMIC_TEAMS, "All Teams");
    populateFilterDropdown('global-area-filter', DYNAMIC_AREAS, "All Areas");
}

function populateFilterDropdown(id, set, label) {
    const el = document.getElementById(id);
    if(!el) return;
    const currentVal = el.value; 
    let html = `<option value="">${label}</option>`;
    [...set].sort().forEach(val => { html += `<option value="${val}">${val}</option>`; });
    el.innerHTML = html;
    el.value = currentVal; 
}

// ============================================
// 5. CRUD ACTIONS
// ============================================
window.attemptLogin = () => { const u = document.getElementById('login-user').value.trim(); const p = document.getElementById('login-pass').value.trim(); if(u === "mountaintop" && p === "mountaintopadmin") { localStorage.setItem('slrLoggedIn', 'true'); showApp(); } else { document.getElementById('login-error').classList.remove('hidden'); } };

window.saveSO = async () => {
    if(!db) return alert("Database disconnected");
    const id = document.getElementById('edit-id').value;
    const name = document.getElementById('input-name').value;
    let team = document.getElementById('input-team').value;
    if (team === "NEW_ENTRY") team = document.getElementById('input-team-custom').value.trim();
    let area = document.getElementById('input-area').value;
    if (area === "NEW_ENTRY") area = document.getElementById('input-area-custom').value.trim();
    
    if(!name || !team || !area) return alert("All fields required");
    const payload = { name, team, area, type: currentAppMode }; 

    try {
        if(!id) {
            payload.id = crypto.randomUUID();
            payload.status = 'active';
            payload.dateAdded = new Date().toLocaleDateString();
            payload.pic = false; payload.pwr = false; payload.speed = false; payload.rpt = false;
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
    } catch (e) { alert("Save Failed: " + e.message); }
}

window.deleteSO = async (id) => {
    if(!confirm("Delete this record permanently?")) return;
    try {
        const { error } = await db.from('service_orders').delete().eq('id', id);
        if(error) throw error;
        soData = soData.filter(i => i.id !== id);
        render(false);
    } catch (e) { alert("Delete Failed: " + e.message); }
}

window.renameTeam = async (oldName) => {
    const newName = prompt(`Rename "${oldName}" to:`, oldName);
    if (!newName || newName === oldName) return;
    if (!confirm(`Rename "${oldName}" to "${newName}" everywhere?`)) return;
    try {
        const { error } = await db.from('service_orders').update({ team: newName }).eq('team', oldName);
        if(error) throw error;
        soData.forEach(item => { if(item.team === oldName) item.team = newName; });
        extractDynamicOptions(); render(false); toggleSettings(); 
    } catch (e) { alert("Rename Failed: " + e.message); }
}

window.deleteTeam = async (teamName) => {
    if(!confirm(`Delete ALL records for "${teamName}"?`)) return;
    try {
        const { error } = await db.from('service_orders').delete().eq('team', teamName);
        if(error) throw error;
        soData = soData.filter(item => item.team !== teamName);
        extractDynamicOptions(); render(false); toggleSettings();
    } catch (e) { alert("Delete Failed: " + e.message); }
}

window.markDone = async (id) => {
    const itemIndex = soData.findIndex(i => i.id == id);
    if(itemIndex === -1) return;
    const rem = document.getElementById(`rem-${id}`).value || soData[itemIndex].remarks || "";
    const dateDone = new Date().toLocaleDateString();
    try {
        await db.from('service_orders').update({ status: 'done', remarks: rem, dateDone: dateDone }).eq('id', id);
        soData[itemIndex].status = 'done'; soData[itemIndex].remarks = rem; soData[itemIndex].dateDone = dateDone;
        render(false);
    } catch(e) { console.error(e); }
}

window.toggleCheck = async (id, key) => {
    const index = soData.findIndex(i => i.id == id);
    if(index === -1) return;
    const newVal = !soData[index][key];
    soData[index][key] = newVal;
    render(false); 
    const updateObj = {}; updateObj[key] = newVal;
    await db.from('service_orders').update(updateObj).eq('id', id);
}

window.saveBulkSO = async () => {
    const rawText = document.getElementById('bulk-names').value;
    let team = document.getElementById('bulk-team').value;
    let area = document.getElementById('bulk-area').value;
    if(team === "NEW_ENTRY" || area === "NEW_ENTRY") return alert("Please select an existing Team/Area for Bulk.");
    const names = rawText.split(/\r?\n/).map(n => n.trim()).filter(n => n.length > 0);
    if(names.length === 0) return alert("No names entered");
    const rows = names.map(name => ({ id: crypto.randomUUID(), name, team, area, type: currentAppMode, status: 'active', dateAdded: new Date().toLocaleDateString(), pic: false, pwr: false, speed: false, rpt: false }));
    document.getElementById('bulk-btn').innerText = "Processing...";
    try {
        const { error } = await db.from('service_orders').insert(rows);
        if(error) throw error;
        soData.push(...rows);
        render(false);
        toggleModal('bulk-modal');
        document.getElementById('bulk-btn').innerText = "Dispatch All";
    } catch (e) { alert("Bulk Error: " + e.message); document.getElementById('bulk-btn').innerText = "Dispatch All"; }
}

// ============================================
// 6. RENDER LOGIC
// ============================================
function render(resetLimit = false) {
    if(resetLimit) renderLimit = 50;
    
    const dateInput = document.getElementById('global-date-filter').value;
    const teamFilter = document.getElementById('global-team-filter').value;
    const areaFilter = document.getElementById('global-area-filter').value;
    const perfFilter = document.getElementById('perf-filter').value;
    let selectedDate = dateInput ? parseDateInput(dateInput) : null;

    const hasFilters = selectedDate || teamFilter || areaFilter;
    const resetBtn = document.getElementById('clear-filters-btn');
    if(resetBtn) {
        if(hasFilters) resetBtn.classList.remove('hidden');
        else resetBtn.classList.add('hidden');
    }

    const presetContainer = document.getElementById('perf-preset-container');
    if(presetContainer) {
        if(selectedDate) presetContainer.classList.add('hidden');
        else presetContainer.classList.remove('hidden');
    }

    let filtered = soData.filter(item => {
        const itemType = item.type || 'SLR'; 
        if(itemType !== currentAppMode) return false;

        if(teamFilter && item.team !== teamFilter) return false;
        if(areaFilter && item.area !== areaFilter) return false;
        if(selectedDate) {
            const itemDate = item.status === 'active' ? item.dateAdded : item.dateDone;
            return isSameDay(itemDate, selectedDate);
        }
        if(currentTab === 'performance' && !selectedDate) {
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

    if(currentTab === 'performance') { renderPerformance(filtered); return; }
    let listItems = currentTab === 'active' ? filtered.filter(i => i.status === 'active') : filtered.filter(i => i.status === 'done');
    renderList(listItems);
}

function renderList(items) {
    const container = document.getElementById('card-container');
    if(!container) return;
    
    const countEl = document.getElementById('list-count');
    if(countEl) countEl.innerText = items.length;
    
    const msgEl = document.getElementById('empty-msg');
    if(msgEl) msgEl.className = items.length === 0 ? "text-center py-16 text-gray-400" : "hidden";
    
    const groups = {};
    items.forEach(item => {
        const dateKey = currentTab === 'active' ? item.dateAdded : (item.dateDone || "Unknown"); 
        if(!groups[dateKey]) groups[dateKey] = [];
        groups[dateKey].push(item);
    });
    const sortedDates = Object.keys(groups).sort((a,b) => new Date(b) - new Date(a));
    let html = '';
    let count = 0;
    for(const date of sortedDates) {
        html += `<div class="sticky-date py-2 px-1 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase flex justify-between items-center mt-4"><span><i class="fa-regular fa-calendar mr-1"></i> ${date}</span><span class="bg-gray-200 text-gray-600 px-2 rounded-full text-[10px]">${groups[date].length}</span></div>`;
        for(const item of groups[date]) {
            if(count >= renderLimit) break;
            html += createCardHTML(item);
            count++;
        }
        if(count >= renderLimit) break;
    }
    container.innerHTML = html;
    const btn = document.getElementById('show-more-btn');
    if(btn) {
        if(items.length > renderLimit) { btn.classList.remove('hidden'); btn.innerText = `Show More (${items.length - renderLimit} remaining)`; } 
        else { btn.classList.add('hidden'); }
    }
}

function createCardHTML(item) {
    const isDone = item.status === 'done';
    const isSLR = currentAppMode === 'SLR';
    const color = isSLR ? 'green' : 'indigo'; 
    const border = isSLR ? 'border-green-500' : 'border-indigo-500';
    const check = (val) => val ? 'checked' : '';
    const actionBtn = isDone 
        ? `<span class="text-xs font-bold text-${color}-600"><i class="fa-solid fa-check-double mr-1"></i>Completed</span>` 
        : `<button onclick="markDone('${item.id}')" class="bg-${color}-600 hover:bg-${color}-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow uppercase tracking-wide transition flex items-center"><i class="fa-solid fa-check mr-1"></i> Done</button>`;
    
    return `
    <div class="bg-white rounded-xl shadow-sm p-4 border-l-4 ${item.team && item.team.toLowerCase().includes('bernie') ? 'border-orange-400' : border} fade-in mb-3">
        <div class="flex justify-between items-start mb-2">
            <div><span class="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded mb-1 inline-block border border-slate-200">${item.area}</span><h3 class="font-bold text-gray-800 text-lg leading-tight">${item.name}</h3><p class="text-xs text-gray-500 font-bold mt-0.5 uppercase tracking-wide">${item.team}</p></div>
            <div class="flex gap-1"><button onclick="openModal('${item.id}')" class="text-gray-300 hover:text-${color}-600 p-1"><i class="fa-solid fa-pen"></i></button><button onclick="deleteSO('${item.id}')" class="text-gray-300 hover:text-red-500 p-1"><i class="fa-solid fa-trash"></i></button></div>
        </div>
        <div class="grid grid-cols-2 gap-2 mb-3 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
            <label class="flex items-center space-x-2"><input type="checkbox" ${check(item.pic)} onclick="toggleCheck('${item.id}', 'pic')" ${isDone ? 'disabled' : ''} class="accent-${color}-600"><span>Trouble Pic</span></label>
            <label class="flex items-center space-x-2"><input type="checkbox" ${check(item.pwr)} onclick="toggleCheck('${item.id}', 'pwr')" ${isDone ? 'disabled' : ''} class="accent-${color}-600"><span>Optical Pwr</span></label>
            <label class="flex items-center space-x-2"><input type="checkbox" ${check(item.speed)} onclick="toggleCheck('${item.id}', 'speed')" ${isDone ? 'disabled' : ''} class="accent-${color}-600"><span>Speedtest</span></label>
            <label class="flex items-center space-x-2"><input type="checkbox" ${check(item.rpt)} onclick="toggleCheck('${item.id}', 'rpt')" ${isDone ? 'disabled' : ''} class="accent-${color}-600"><span>Service Rpt</span></label>
        </div>
        <div class="flex items-center justify-between gap-3"><input type="text" id="rem-${item.id}" value="${item.remarks || ''}" ${isDone ? 'readonly' : ''} placeholder="Remarks..." class="flex-1 bg-white text-sm px-3 py-2 rounded border border-gray-200 focus:outline-none focus:border-${color}-500">${actionBtn}</div>
    </div>`;
}

function renderPerformance(data) {
    const stats = { total: data.length, done: 0, teams: {}, areas: {} };
    
    data.forEach(item => {
        if(!stats.teams[item.team]) stats.teams[item.team] = { total: 0, done: 0 };
        if(!stats.areas[item.area]) stats.areas[item.area] = { total: 0, done: 0 };
        stats.teams[item.team].total++;
        if(item.status === 'done') stats.teams[item.team].done++;
        stats.areas[item.area].total++;
        if(item.status === 'done') stats.areas[item.area].done++;
    });

    const percent = stats.total === 0 ? 0 : Math.round((stats.done / stats.total) * 100);
    document.getElementById('global-percent').innerText = percent + '%';
    document.getElementById('global-done').innerText = stats.done;
    document.getElementById('global-total').innerText = stats.total;
    document.getElementById('global-bar').style.width = percent + '%';
    document.getElementById('team-stats-container').innerHTML = Object.entries(stats.teams).map(([n,d]) => renderMiniCard(n,d.done,d.total)).join('');
    document.getElementById('area-stats-container').innerHTML = Object.entries(stats.areas).map(([n,d]) => renderAreaRow(n,d.done,d.total)).join('');
}

// ============================================
// 7. UTILITIES
// ============================================
function parseDateInput(input) { const parts = input.split('-'); return new Date(parts[0], parts[1] - 1, parts[2]); }
function isSameDay(d1, d2) { if(!d1 || !d2) return false; const date1 = new Date(d1); const date2 = new Date(d2); return date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth() && date1.getDate() === date2.getDate(); }

function buildOptions(set, selectedVal) {
    let html = `<option value="" disabled ${!selectedVal ? 'selected' : ''}>-- Select --</option>`;
    [...set].sort().forEach(val => { html += `<option value="${val}" ${selectedVal === val ? 'selected' : ''}>${val}</option>`; });
    html += `<option value="NEW_ENTRY" class="font-bold text-blue-600 bg-blue-50">+ ADD NEW...</option>`;
    return html;
}

window.handleDropdownChange = (type) => {
    const val = document.getElementById(`input-${type}`).value;
    const customInput = document.getElementById(`input-${type}-custom`);
    if (val === "NEW_ENTRY") { customInput.classList.remove('hidden'); customInput.focus(); } else { customInput.classList.add('hidden'); }
}

window.openModal = (editId = null) => { 
    const teamContainer = document.getElementById('input-team').parentNode;
    if(!document.getElementById('input-team-custom')) {
        teamContainer.innerHTML += `<input type="text" id="input-team-custom" placeholder="Enter New Team Name" class="hidden w-full border border-blue-300 bg-blue-50 rounded-lg p-2.5 mt-2 outline-none fade-in">`;
        document.getElementById('input-team').setAttribute('onchange', "handleDropdownChange('team')");
    }
    const areaContainer = document.getElementById('input-area').parentNode;
    if(!document.getElementById('input-area-custom')) {
        areaContainer.innerHTML += `<input type="text" id="input-area-custom" placeholder="Enter New Area Name" class="hidden w-full border border-blue-300 bg-blue-50 rounded-lg p-2.5 mt-2 outline-none fade-in">`;
        document.getElementById('input-area').setAttribute('onchange', "handleDropdownChange('area')");
    }
    document.getElementById('input-team-custom').classList.add('hidden'); document.getElementById('input-team-custom').value = '';
    document.getElementById('input-area-custom').classList.add('hidden'); document.getElementById('input-area-custom').value = '';

    let editItem = null;
    if(editId) editItem = soData.find(i => i.id == editId);
    document.getElementById('input-team').innerHTML = buildOptions(DYNAMIC_TEAMS, editItem ? editItem.team : null);
    document.getElementById('input-area').innerHTML = buildOptions(DYNAMIC_AREAS, editItem ? editItem.area : null);
    
    if(editItem) { 
        document.getElementById('modal-title').innerText = "Edit Details"; document.getElementById('modal-btn').innerText = "Save Changes"; document.getElementById('edit-id').value = editId; document.getElementById('input-name').value = editItem.name; 
    } else { 
        document.getElementById('modal-title').innerText = "New Dispatch"; document.getElementById('modal-btn').innerText = "Confirm Dispatch"; document.getElementById('edit-id').value = ""; document.getElementById('input-name').value = ""; 
    } 
    toggleModal('form-modal'); 
}

window.openBulkModal = () => { 
    document.getElementById('bulk-team').innerHTML = buildOptions(DYNAMIC_TEAMS, null); 
    document.getElementById('bulk-area').innerHTML = buildOptions(DYNAMIC_AREAS, null); 
    document.getElementById('bulk-names').value = ''; document.getElementById('bulk-btn').innerText = 'Dispatch All'; toggleModal('bulk-modal'); 
}

window.toggleModal = (id) => { const m = document.getElementById(id); m.classList.toggle('hidden'); m.classList.toggle('flex'); }

window.openTeamAnalytics = (teamName) => { 
    let teamData = soData.filter(i => i.team === teamName && (i.type || 'SLR') === currentAppMode);
    const done = teamData.filter(i => i.status === 'done').length;
    const total = teamData.length;
    const percent = total === 0 ? 0 : Math.round((done / total) * 100);
    document.getElementById('team-modal-name').innerText = teamName; document.getElementById('team-modal-percent').innerText = percent + "%"; document.getElementById('team-modal-total').innerText = total; document.getElementById('team-modal-done').innerText = done; document.getElementById('team-modal-areas').innerHTML = ""; document.getElementById('team-modal-history').innerHTML = ""; 
    toggleModal('team-analytics-modal'); 
};

window.clearDateFilter = () => { document.getElementById('global-date-filter').value = ''; render(true); }
window.showMore = () => { renderLimit += 50; render(false); }

function renderMiniCard(t,d,tot) { const isSLR = currentAppMode === 'SLR'; const color = isSLR ? 'green' : 'indigo'; const p = tot===0?0:Math.round((d/tot)*100); const c = p===100?`text-${color}-600`:(p>50?`text-${color}-600`:'text-orange-500'); return `<div onclick="openTeamAnalytics('${t}')" class="bg-white p-3 rounded-xl shadow-sm border border-gray-100 cursor-pointer clickable-card hover:border-${color}-300 transition select-none"><div class="flex justify-between items-center mb-1"><h4 class="text-xs font-bold text-gray-500 uppercase truncate w-24">${t}</h4><span class="${c} font-bold text-sm">${p}%</span></div><div class="w-full bg-gray-100 rounded-full h-1.5 mb-1"><div class="bg-slate-800 h-1.5 rounded-full" style="width: ${p}%"></div></div><p class="text-xs text-gray-400 text-right">${d}/${tot}</p></div>`; }
function renderAreaRow(t,d,tot) { const isSLR = currentAppMode === 'SLR'; const color = isSLR ? 'green' : 'indigo'; const p = tot===0?0:Math.round((d/tot)*100); return `<div class="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-100"><span class="text-xs font-bold text-gray-700 w-1/3">${t}</span><div class="w-1/3 px-2"><div class="w-full bg-gray-100 rounded-full h-2"><div class="bg-${color}-600 h-2 rounded-full" style="width: ${p}%"></div></div></div><div class="w-1/3 text-right"><span class="text-xs font-bold text-gray-600">${p}%</span><span class="text-[10px] text-gray-400 ml-1">(${d}/${tot})</span></div></div>`; }