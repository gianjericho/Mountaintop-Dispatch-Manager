const { createClient } = require('@supabase/supabase-js');
const db = createClient(
    "https://fqxturtabhbpgbizriss.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxeHR1cnRhYmhicGdiaXpyaXNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2NTM5MzMsImV4cCI6MjA4NzIyOTkzM30.p9lIjSuiGRG84YlpXVe0B-rdd1-6tz4zU-uKzKjQNEQ"
);

async function check() {
    const { data, error } = await db.from('authorized_emails').select('*');
    if (error) console.error("Error fetching authorized_emails:", error);
    else console.log("Authorized Emails in Sandbox:", data.map(u => ({ email: u.email, role: u.role })));
}
check();
