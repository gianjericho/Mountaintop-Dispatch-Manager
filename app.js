// ============================================
// 1. SETTINGS & DEBUG MODE
// ============================================
// Automatically detects if you are running locally
const DEBUG_MODE = (
    window.location.hostname === "localhost" || 
    window.location.hostname === "127.0.0.1" || 
    window.location.protocol === "file:"
);
// Helper: Only log if debug is ON
function log(msg, data = null) {
    if (!DEBUG_MODE) return;
    const time = new Date().toLocaleTimeString();
    if (data) console.log(`[${time}] 🔧 ${msg}`, data);
    else console.log(`[${time}] 🔧 ${msg}`);
}

// ============================================
// 2. CONFIGURATION (KEYS)
// ============================================
const SUPABASE_URL = "https://qqrzlltwvvpowdigffsq.supabase.co"; 
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxcnpsbHR3dnZwb3dkaWdmZnNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzNTQ4MTUsImV4cCI6MjA4NTkzMDgxNX0.4C1CcwQ7BSx53Ofk284Mtc0TPxd3KoHfMR_qIm9WbZQ";

// ============================================
// 3. GLOBAL VARIABLES
// ============================================
let soData = [];
const AREAS = ["TAGAYTAY", "AMADEO", "MENDEZ", "BAILEN", "MARAGONDON", "ALFONSO", "MAGALLANES", "INDANG"];
let teams = JSON.parse(localStorage.getItem('slrTeams')) || ["Team Bernie", "Team Randy"]; 
let currentTab = 'active';
let renderLimit = 50;
let db = null; 

// ============================================
// 4. LOGIN SYSTEM
// ============================================
function attemptLogin() {
    log("Login Button Clicked");
    const u = document.getElementById('login-user').value.trim();
    const p = document.getElementById('login-pass').value.trim();
    
    if(u === "mountaintop" && p === "mountaintopadmin") { 
        log("Credentials valid. Redirecting...");
        localStorage.setItem('slrLoggedIn', 'true'); 
        showApp(); 
    } else { 
        log("Invalid credentials");
        document.getElementById('login-error').classList.remove('hidden'); 
    }
}

function logout() { 
    localStorage.removeItem('slrLoggedIn'); 
    location.reload(); 
}

function showApp() { 
    document.getElementById('login-screen').classList.add('hidden'); 
    document.getElementById('main-app').classList.remove('hidden'); 
    
    if (db) {
        startSupabaseListener(); 
    } else {
        log("CRITICAL: Database object missing on app load");
        document.getElementById('loading-screen').innerHTML = `<p class="text-red-500 font-bold">Error: Connection Failed.<br>Check console (F12) for logs.</p>`;
    }
}

// ============================================
// 5. DATABASE CONNECTION
// ============================================
try {
    if (!window.supabase) {
        console.error("Supabase SDK not found. Check your internet connection.");
    } else {
        db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        log("Supabase Client Initialized");
    }
} catch (err) {
    console.error("Init Error:", err);
}

// Auto-Login check
if(localStorage.getItem('slrLoggedIn') === 'true') { showApp(); }

async function startSupabaseListener() {
    try {
        log("Fetching initial data...");
        const { data, error } = await db.from('service_orders').select('*');
        if(error) throw error;
        
        soData = data || [];
        log(`Loaded ${soData.length} records`);
        
        document.getElementById('loading-screen').classList.add('hidden');
        if(currentTab !== 'performance') document.getElementById('view-list').classList.remove('hidden');
        render(true);

        // Realtime Subscription
        db.channel('custom-all-channel')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'service_orders' }, (payload) => {
            log("Realtime Update Recieved", payload);
            if(payload.eventType === 'INSERT') soData.push(payload.new);
            else if(payload.eventType === 'UPDATE') {
                const index = soData.findIndex(i => i.id === payload.new.id);
                if(index !== -1) soData[index] = payload.new;
            } else if(payload.eventType === 'DELETE') {
                soData = soData.filter(i => i.id !== payload.old.id);
            }
            render(false);
        })
        .subscribe();
    } catch (err) {
        console.error("Data Load Error:", err);
        document.getElementById('loading-screen').innerHTML = `<p class="text-red-500">Data Error: ${err.message}</p>`;
    }
}

// ============================================
// 6. RENDER LOGIC
// ============================================
function switchTab(tab) {
    log("Switching tab to:", tab);
    currentTab = tab; renderLimit = 50;
    ['active', 'history', 'performance'].forEach(t => {
        document.getElementById(`nav-${t}`).className = t === tab ? "flex-1 py-3 text-center text-sm nav-active" : "flex-1 py-3 text-center text-sm nav-item";
    });
    const listView = document.getElementById('view-list');
    const perfView = document.getElementById('view-performance');
    if(tab === 'performance') { listView.classList.add('hidden'); perfView.classList.remove('hidden'); } 
    else { perfView.classList.add('hidden'); listView.classList.remove('hidden'); document.getElementById('list-header').innerText = tab === 'active' ? "Active Dispatches" : "Accomplished Logs"; }
    render(true);
}

function clearDateFilter() { document.getElementById('global-date-filter').value = ''; render(true); }
function showMore() { renderLimit += 50; render(false); }

function isSameDay(d1, d2) {
    if(!d1 || !d2) return false;
    const date1 = new Date(d1); const date2 = new Date(d2);
    return date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth() && date1.getDate() === date2.getDate();
}

function render(resetLimit = false) {
    if(resetLimit) renderLimit = 50;
    const dateInput = document.getElementById('global-date-filter').value;
    const clearBtn = document.getElementById('clear-date-btn');
    
    let selectedDate = null;
    if(dateInput) {
        const parts = dateInput.split('-');
        selectedDate = new Date(parts[0], parts[1] - 1, parts[2]); 
        clearBtn.classList.remove('hidden');
        document.getElementById('perf-preset-container').classList.add('hidden');
    } else {
        clearBtn.classList.add('hidden');
        document.getElementById('perf-preset-container').classList.remove('hidden');
    }

    let filteredData = soData;

    if(selectedDate) {
        filteredData = soData.filter(item => {
            const checkDate = item.status === 'active' ? item.dateAdded : item.dateDone;
            return isSameDay(checkDate, selectedDate);
        });
    } else if (currentTab === 'performance') {
        const filterType = document.getElementById('perf-filter').value;
        const now = new Date();
        filteredData = soData.filter(item => {
            if(filterType === 'all') return true;
            const d = new Date(item.dateAdded);
            if(filterType === 'today') return isSameDay(d, now);
            if(filterType === 'week') return (now - d) < 7 * 86400000;
            if(filterType === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            return true;
        });
    }

    const stats = { total: filteredData.length, done: 0, teams: {}, areas: {} };
    teams.forEach(t => stats.teams[t] = { total: 0, done: 0 });
    AREAS.forEach(a => stats.areas[a] = { total: 0, done: 0 });

    filteredData.forEach(item => {
        if(item.status === 'done') stats.done++;
        if(stats.teams[item.team]) { stats.teams[item.team].total++; if(item.status === 'done') stats.teams[item.team].done++; }
        if(stats.areas[item.area]) { stats.areas[item.area].total++; if(item.status === 'done') stats.areas[item.area].done++; }
    });

    if(currentTab === 'performance') {
        const globalPercent = stats.total === 0 ? 0 : Math.round((stats.done / stats.total) * 100);
        document.getElementById('global-percent').innerText = globalPercent + '%';
        document.getElementById('global-done').innerText = stats.done;
        document.getElementById('global-total').innerText = stats.total;
        document.getElementById('global-bar').style.width = globalPercent + '%';
        document.getElementById('team-stats-container').innerHTML = Object.entries(stats.teams).filter(([_,d])=>d.total>0).map(([n,d]) => renderMiniCard(n,d.done,d.total)).join('');
        document.getElementById('area-stats-container').innerHTML = Object.entries(stats.areas).filter(([_,d])=>d.total>0).map(([n,d]) => renderAreaRow(n,d.done,d.total)).join('');
        return;
    }

    const container = document.getElementById('card-container');
    let listItems = currentTab === 'active' ? filteredData.filter(i => i.status === 'active') : filteredData.filter(i => i.status === 'done');
    document.getElementById('list-count').innerText = listItems.length;
    document.getElementById('empty-msg').className = listItems.length === 0 ? "text-center py-16 text-gray-400" : "hidden";

    const groups = {};
    listItems.forEach(item => {
        const dateKey = currentTab === 'active' ? item.dateAdded : item.dateDone; 
        const safeDate = dateKey || "Unknown Date"; 
        if(!groups[safeDate]) groups[safeDate] = [];
        groups[safeDate].push(item);
    });
    const sortedDates = Object.keys(groups).sort((a,b) => new Date(b) - new Date(a));

    let visibleCards = 0;
    let htmlBuffer = ''; 
    for(const date of sortedDates) {
        htmlBuffer += `<div class="sticky-date py-2 px-1 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase flex justify-between items-center mt-4"><span><i class="fa-regular fa-calendar mr-1"></i> ${date}</span><span class="bg-gray-200 text-gray-600 px-2 rounded-full text-[10px]">${groups[date].length}</span></div>`;
        for(const item of groups[date]) {
            if(visibleCards >= renderLimit) break;
            const isDone = item.status === 'done';
            const actionHTML = isDone ? `<button onclick="markDone('${item.id}')" class="hidden"></button>` : `<button onclick="markDone('${item.id}')" class="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow uppercase tracking-wide transition flex items-center"><i class="fa-solid fa-check mr-1"></i> Done</button>`;
            
            htmlBuffer += `
            <div class="bg-white rounded-xl shadow-sm p-4 border-l-4 ${item.team && item.team.includes('Bernie') ? 'border-orange-400' : 'border-green-500'} fade-in mb-3">
                <div class="flex justify-between items-start mb-2">
                    <div><span class="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded mb-1 inline-block border border-slate-200">${item.area}</span><h3 class="font-bold text-gray-800 text-lg leading-tight">${item.name}</h3><p class="text-xs text-gray-500 font-bold mt-0.5 uppercase tracking-wide">${item.team}</p></div>
                    <div class="flex gap-1"><button onclick="openModal('${item.id}')" class="text-gray-300 hover:text-green-500 p-1"><i class="fa-solid fa-pen"></i></button><button onclick="deleteSO('${item.id}')" class="text-gray-300 hover:text-red-500 p-1"><i class="fa-solid fa-trash"></i></button></div>
                </div>
                <div class="grid grid-cols-2 gap-2 mb-3 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                    <label class="flex items-center space-x-2"><input type="checkbox" ${item.pic ? 'checked' : ''} onclick="toggleCheck('${item.id}', 'pic')" ${isDone ? 'disabled' : ''} class="accent-green-600"><span>Trouble Pic</span></label>
                    <label class="flex items-center space-x-2"><input type="checkbox" ${item.pwr ? 'checked' : ''} onclick="toggleCheck('${item.id}', 'pwr')" ${isDone ? 'disabled' : ''} class="accent-green-600"><span>Optical Pwr</span></label>
                    <label class="flex items-center space-x-2"><input type="checkbox" ${item.speed ? 'checked' : ''} onclick="toggleCheck('${item.id}', 'speed')" ${isDone ? 'disabled' : ''} class="accent-green-600"><span>Speedtest</span></label>
                    <label class="flex items-center space-x-2"><input type="checkbox" ${item.rpt ? 'checked' : ''} onclick="toggleCheck('${item.id}', 'rpt')" ${isDone ? 'disabled' : ''} class="accent-green-600"><span>Service Rpt</span></label>
                </div>
                <div class="flex items-center justify-between gap-3"><input type="text" id="rem-${item.id}" value="${item.remarks || ''}" ${isDone ? 'readonly' : ''} placeholder="Remarks..." class="flex-1 bg-white text-sm px-3 py-2 rounded border border-gray-200 focus:outline-none focus:border-green-500">${actionHTML}</div>
            </div>`;
            visibleCards++;
        }
        if(visibleCards >= renderLimit) break;
    }
    container.innerHTML = htmlBuffer;
    if (listItems.length > renderLimit) { document.getElementById('show-more-btn').classList.remove('hidden'); document.getElementById('show-more-btn').innerText = `Show More (${listItems.length - renderLimit} remaining)`; } 
    else { document.getElementById('show-more-btn').classList.add('hidden'); }
}

// ============================================
// 7. ACTIONS (CRUD)
// ============================================
function openBulkModal() { document.getElementById('bulk-team').innerHTML = teams.map(t => `<option value="${t}">${t}</option>`).join(''); document.getElementById('bulk-area').innerHTML = AREAS.map(a => `<option value="${a}">${a}</option>`).join(''); document.getElementById('bulk-names').value = ''; document.getElementById('bulk-btn').innerText = 'Dispatch All'; toggleModal('bulk-modal'); }
function openModal(editId = null) { const teamSel = document.getElementById('input-team'); const areaSel = document.getElementById('input-area'); teamSel.innerHTML = teams.map(t => `<option value="${t}">${t}</option>`).join(''); areaSel.innerHTML = AREAS.map(a => `<option value="${a}">${a}</option>`).join(''); if(editId) { const item = soData.find(i => i.id == editId); document.getElementById('modal-title').innerText = "Edit Details"; document.getElementById('modal-btn').innerText = "Save Changes"; document.getElementById('edit-id').value = editId; document.getElementById('input-name').value = item.name; teamSel.value = item.team; areaSel.value = item.area; } else { document.getElementById('modal-title').innerText = "New Dispatch"; document.getElementById('modal-btn').innerText = "Confirm Dispatch"; document.getElementById('edit-id').value = ""; document.getElementById('input-name').value = ""; } toggleModal('form-modal'); }
function toggleModal(id) { const m = document.getElementById(id); m.classList.contains('hidden') ? (m.classList.remove('hidden'), m.classList.add('flex')) : (m.classList.add('hidden'), m.classList.remove('flex')); }
function toggleSettings() { toggleModal('settings-modal'); document.getElementById('team-list-settings').innerHTML = teams.map(t => `<div class="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-200"><span class="text-sm font-medium text-gray-700">${t}</span><button onclick="removeTeam('${t}')" class="text-red-400 hover:text-red-600"><i class="fa-solid fa-trash-can"></i></button></div>`).join(''); }
function addNewTeam() { const val = document.getElementById('new-team-name').value.trim(); if (val && !teams.includes(val)) { teams.push(val); localStorage.setItem('slrTeams', JSON.stringify(teams)); toggleSettings(); } }
function removeTeam(val) { if(confirm('Delete?')) { teams = teams.filter(t=>t!==val); localStorage.setItem('slrTeams', JSON.stringify(teams)); toggleSettings(); } }

async function saveSO() { 
    if(!db) return alert("Database not connected!"); 
    try { 
        const id = document.getElementById('edit-id').value; 
        const name = document.getElementById('input-name').value; 
        const team = document.getElementById('input-team').value; 
        const area = document.getElementById('input-area').value; 
        if(!name) return alert("Name required"); 
        
        const today = new Date().toLocaleDateString();
        const isDup = soData.some(i => i.name.toLowerCase() === name.toLowerCase() && i.dateAdded === today && i.id !== id);
        if(isDup) return alert("DUPLICATE DETECTED!");

        const payload = { name, team, area }; 
        if(!id) { 
            payload.id = crypto.randomUUID(); 
            payload.status = 'active'; 
            payload.dateAdded = new Date().toLocaleDateString(); 
            payload.pic = false; payload.pwr = false; payload.speed = false; payload.rpt = false; 
            const { error } = await db.from('service_orders').insert([payload]); 
            if(error) throw error; 
        } else { 
            const { error } = await db.from('service_orders').update(payload).eq('id', id); 
            if(error) throw error; 
        } 
        toggleModal('form-modal'); 
    } catch (e) { alert("Save Error: " + e.message); } 
}

async function saveBulkSO() { 
    if(!db) return alert("Database not connected!"); 
    try { 
        const rawText = document.getElementById('bulk-names').value; 
        const team = document.getElementById('bulk-team').value; 
        const area = document.getElementById('bulk-area').value; 
        const names = rawText.split(/\r?\n/).map(n => n.trim()).filter(n => n.length > 0); 
        if(names.length === 0) return alert("No names entered"); 
        
        const rows = names.map(name => ({ id: crypto.randomUUID(), name, team, area, status: 'active', dateAdded: new Date().toLocaleDateString(), pic: false, pwr: false, speed: false, rpt: false })); 
        document.getElementById('bulk-btn').innerText = "Processing..."; 
        const { error } = await db.from('service_orders').insert(rows); 
        if(error) throw error; 
        document.getElementById('bulk-btn').innerText = "Dispatch All"; 
        toggleModal('bulk-modal'); 
    } catch (e) { alert("Bulk Error: " + e.message); document.getElementById('bulk-btn').innerText = "Dispatch All"; } 
}

async function deleteSO(id) { if(confirm("Delete forever?")) { const { error } = await db.from('service_orders').delete().eq('id', id); if(error) alert(error.message); } }
async function markDone(id) { const item = soData.find(i => i.id == id); const rem = document.getElementById(`rem-${id}`).value || item.remarks || ""; await db.from('service_orders').update({ status: 'done', remarks: rem, dateDone: new Date().toLocaleDateString() }).eq('id', id); }
async function toggleCheck(id, key) { const item = soData.find(i => i.id == id); const newVal = !item[key]; const updateObj = {}; updateObj[key] = newVal; await db.from('service_orders').update(updateObj).eq('id', id); }

function openTeamAnalytics(teamName) { 
    const dateInput = document.getElementById('global-date-filter').value; 
    let selectedDate = null; 
    if(dateInput) { const parts = dateInput.split('-'); selectedDate = new Date(parts[0], parts[1] - 1, parts[2]); } 
    let teamData = soData.filter(i => i.team === teamName); 
    if(selectedDate) { teamData = teamData.filter(item => { const itemDate = new Date(item.status === 'active' ? item.dateAdded : item.dateDone); return isSameDay(itemDate, selectedDate); }); } 
    const doneData = teamData.filter(i => i.status === 'done'); 
    const total = teamData.length; 
    const done = doneData.length; 
    const percent = total === 0 ? 0 : Math.round((done / total) * 100); 
    const areaCounts = {}; 
    teamData.forEach(item => { areaCounts[item.area] = (areaCounts[item.area] || 0) + 1; }); 
    const sortedAreas = Object.entries(areaCounts).sort((a,b) => b[1] - a[1]).slice(0, 3); 
    document.getElementById('team-modal-name').innerText = teamName; 
    document.getElementById('team-modal-percent').innerText = percent + "%"; 
    document.getElementById('team-modal-total').innerText = total; 
    document.getElementById('team-modal-done').innerText = done; 
    document.getElementById('team-modal-areas').innerHTML = sortedAreas.length === 0 ? '<p class="text-xs text-gray-400 italic">No data</p>' : sortedAreas.map(([area, count]) => `<div class="flex justify-between items-center bg-gray-50 p-2 rounded text-xs"><span class="font-bold text-gray-600">${area}</span><span class="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold">${count}</span></div>`).join(''); 
    document.getElementById('team-modal-history').innerHTML = ""; 
    toggleModal('team-analytics-modal'); 
}

function renderMiniCard(t,d,tot) { const p = tot===0?0:Math.round((d/tot)*100); const c = p===100?'text-green-600':(p>50?'text-green-600':'text-orange-500'); return `<div onclick="openTeamAnalytics('${t}')" class="bg-white p-3 rounded-xl shadow-sm border border-gray-100 cursor-pointer clickable-card hover:border-green-300 transition select-none"><div class="flex justify-between items-center mb-1"><h4 class="text-xs font-bold text-gray-500 uppercase truncate w-24">${t}</h4><span class="${c} font-bold text-sm">${p}%</span></div><div class="w-full bg-gray-100 rounded-full h-1.5 mb-1"><div class="bg-slate-800 h-1.5 rounded-full" style="width: ${p}%"></div></div><p class="text-xs text-gray-400 text-right">${d}/${tot}</p></div>`; }
function renderAreaRow(t,d,tot) { const p = tot===0?0:Math.round((d/tot)*100); return `<div class="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-100"><span class="text-xs font-bold text-gray-700 w-1/3">${t}</span><div class="w-1/3 px-2"><div class="w-full bg-gray-100 rounded-full h-2"><div class="bg-green-500 h-2 rounded-full" style="width: ${p}%"></div></div></div><div class="w-1/3 text-right"><span class="text-xs font-bold text-gray-600">${p}%</span><span class="text-[10px] text-gray-400 ml-1">(${d}/${tot})</span></div></div>`; }