const { createClient } = require('@supabase/supabase-js');
const db = createClient(
    "https://qqrzlltwvvpowdigffsq.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxcnpsbHR3dnZwb3dkaWdmZnNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzNTQ4MTUsImV4cCI6MjA4NTkzMDgxNX0.4C1CcwQ7BSx53Ofk284Mtc0TPxd3KoHfMR_qIm9WbZQ"
);

async function check() {
    const { data, error } = await db.from('service_orders').select('*').limit(50);
    if (error) console.error(error);
    const target = data.find(i => i.name && i.name.includes('LIBIRAN'));
    if (target) {
        console.log("FOUND TARGET:", target);
    } else {
        const active = data.find(i => i.status === 'active');
        console.log("SAMPLE ACTIVE:", active);
    }
}
check();
