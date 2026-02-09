describe('Dispatch Manager - Final Verification', () => {

  // 1. SETUP: Login & Clean State
  const login = () => {
    cy.session('admin-session', () => {
      cy.visit('http://127.0.0.1:5500/index.html');
      
      // Clear storage to force a clean login
      cy.clearLocalStorage();
      
      // Use your exact IDs from index.html
      cy.get('#login-user').should('be.visible').type(Cypress.env('adminEmail'));
      cy.get('#login-pass').should('be.visible').type(Cypress.env('adminPassword'));
      cy.get('#btn-login').click();
      
      // Wait for #main-app to lose 'hidden' class
      cy.get('#main-app', { timeout: 15000 }).should('be.visible');
    });
  };

  beforeEach(() => {
    login();
    cy.visit('http://127.0.0.1:5500/index.html');
    cy.get('#main-app').should('be.visible');
    // Force close any open modals to prevent "element covered" errors
    cy.get('.fixed.inset-0').invoke('addClass', 'hidden'); 
  });

  // ----------------------------------------------------
  // TEST 1: SLR CRUD (Create, Edit, Delete)
  // ----------------------------------------------------
  it('1. SLR Mode: Create, Edit, and Delete', () => {
    const testName = 'Cypress User ' + Date.now();

    // Ensure we are in SLR mode
    cy.get('#mode-slr').click();
    
    // Open Modal
    cy.get('#btn-new').click();
    
    // Fill Form
    cy.get('#input-name').type(testName);
    cy.get('#input-team').select('Team Bernie');
    cy.get('#input-area').select('TAGAYTAY');
    
    // Save
    cy.get('#modal-btn').click();

    // WAIT for Supabase to return the new row
    cy.contains(testName, { timeout: 10000 }).should('be.visible');
    
    // Stub Confirm Popup
    cy.window().then((win) => { cy.stub(win, 'confirm').returns(true); });

    // Click Delete Trash Icon
    cy.contains(testName).parent().parent().find('.fa-trash').click();

    // Verify it's gone
    cy.contains(testName).should('not.exist');
  });

  // ----------------------------------------------------
  // TEST 2: SLI BULK DISPATCH
  // ----------------------------------------------------
  it('2. SLI Mode: Bulk Dispatch', () => {
    cy.get('#mode-sli').click();
    
    // Open Bulk Modal
    cy.get('#btn-bulk').click();
    cy.get('#bulk-modal').should('not.have.class', 'hidden');

    // Fill Data
    cy.get('#bulk-names').type('User A\nUser B');
    cy.get('#bulk-team').select('Team Randy');
    cy.get('#bulk-area').select('AMADEO');
    
    // Click Dispatch
    cy.get('#bulk-btn').click();

    // Wait for rows to appear
    cy.contains('User A', { timeout: 10000 }).should('be.visible');
    
    // Cleanup
    cy.window().then((win) => { cy.stub(win, 'confirm').returns(true); });
    cy.wait(500); 
    cy.contains('User A').parent().parent().find('.fa-trash').click();
    cy.contains('User B').parent().parent().find('.fa-trash').click();
  });

  // ----------------------------------------------------
  // TEST 3: SETTINGS (Add New Team)
  // ----------------------------------------------------
  it('3. Settings: Add Team', () => {
    const newTeam = 'Team Cy' + Math.floor(Math.random() * 100);

    // Open Settings
    cy.get('.fa-gear').click();
    cy.get('#settings-modal').should('not.have.class', 'hidden');

    // Add Team
    cy.get('#new-team-name').type(newTeam);
    cy.get('#btn-add-team').click();

    // Close Modal
    cy.get('#settings-modal').click('topLeft', { force: true });
    
    // ⚡ FIX: DO NOT RELOAD. 
    // Your app adds the team to memory (RAM), not Database. 
    // Reloading would delete it. We check it immediately instead.
    
    // Open New Dispatch Modal
    cy.get('#btn-new').click(); 
    
    // Check if new team is in the dropdown
    cy.get('#input-team', { timeout: 10000 }).should('contain', newTeam);
  });

  // ----------------------------------------------------
  // TEST 4: FILTERS
  // ----------------------------------------------------
  it('4. Filtering', () => {
    cy.reload();
    const targetName = 'Filter Target';
    
    // Create target user
    cy.get('#btn-new').click();
    cy.get('#input-name').type(targetName);
    cy.get('#input-team').select('Team Bernie');
    cy.get('#input-area').select('MENDEZ');
    cy.get('#modal-btn').click();

    // Wait for it to appear
    cy.contains(targetName, { timeout: 10000 }).should('be.visible');

    // Type in Search
    cy.get('#global-search').type('Filter Target{enter}');
    cy.contains(targetName).should('be.visible');
    
    // Verify Reset Button appears
    cy.get('#clear-filters-btn').should('not.have.class', 'hidden');
    cy.get('#clear-filters-btn').click();

    // Clear Search
    cy.get('#global-search').clear().type('{enter}');
    
    // Cleanup
    cy.window().then((win) => { cy.stub(win, 'confirm').returns(true); });
    cy.contains(targetName).parent().parent().find('.fa-trash').click();
  });

  // ----------------------------------------------------
  // TEST 5: PERFORMANCE TAB
  // ----------------------------------------------------
  it('5. UI Features', () => {
    cy.reload();
    cy.wait(2000); 

    // Click Performance Tab
    cy.get('#nav-performance').click();
    cy.wait(1000);

    // Verify container
    cy.get('#view-performance').should('not.have.class', 'hidden');
    
    // Verify content
    cy.get('#perf-card').should('be.visible');
    cy.contains('Efficiency Score').should('be.visible'); 

    // Test Dark Mode
    cy.get('.fa-moon').click();
    cy.get('body').should('have.class', 'dark-mode');
  });

});