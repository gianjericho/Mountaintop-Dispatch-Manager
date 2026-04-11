const { createClient } = require('@supabase/supabase-js');
const db = createClient(
    "https://fqxturtabhbpgbizriss.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxeHR1cnRhYmhicGdiaXpyaXNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2NTM5MzMsImV4cCI6MjA4NzIyOTkzM30.p9lIjSuiGRG84YlpXVe0B-rdd1-6tz4zU-uKzKjQNEQ"
);

async function seed() {
    const users = [
        { email: 'cypress@mountaintopcatv.com', role: 'developer' },
        { email: 'tech_cypress@mountaintopcatv.com', role: 'tech', team: 'Team Bernie' }
    ];

    console.log("Seeding test users into Sandbox authorized_emails...");
    const { data, error } = await db.from('authorized_emails').upsert(users, { onConflict: 'email' });
    
    if (error) {
        console.error("❌ Seed Failed:", error.message);
    } else {
        console.log("✅ Seed Successful! Users added to Sandbox.");
    }
}
seed();
