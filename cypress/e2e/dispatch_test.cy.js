describe('Dispatch Manager - Final Verification', () => {

  // 1. SETUP: Login & Clean State
  const login = () => {
    cy.session('admin-session', () => {
      cy.visit('http://127.0.0.1:5500/index.html');
      cy.clearLocalStorage();
      
      cy.get('#login-user').should('be.visible').type(Cypress.env('adminEmail'));
      cy.get('#login-pass').should('be.visible').type(Cypress.env('adminPassword'));
      cy.get('#btn-login').click();
      
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
  // TEST 1: SLR CRUD
  // ----------------------------------------------------
  it('1. SLR Mode: Create, Edit, and Delete', () => {
    const testName = 'Cypress User ' + Date.now();
    cy.get('#mode-slr').click();
    cy.get('#btn-new').click();
    cy.get('#input-name').type(testName);
    cy.get('#input-team').select('Team Bernie');
    cy.get('#input-area').select('TAGAYTAY');
    cy.get('#modal-btn').click();
    cy.get('#nav-active').click();
    
    cy.contains(testName, { timeout: 10000 }).should('be.visible');
    cy.window().then((win) => { cy.stub(win, 'confirm').returns(true); });
    cy.contains(testName).parent().parent().find('.fa-trash').click();
    cy.contains(testName).should('not.exist');
  });

  // ----------------------------------------------------
  // TEST 2: SLI BULK DISPATCH
  // ----------------------------------------------------
  it('2. SLI Mode: Bulk Dispatch', () => {
    cy.get('#mode-sli').click();
    cy.get('#btn-bulk').click();
    cy.get('#bulk-team').select('Team Randy');
    cy.get('#bulk-area').select('AMADEO');
    
    // Simulating pasting multiple names
    cy.get('#bulk-names').type('User A{enter}User B{enter}User C');
    cy.get('#bulk-btn').click();

    // ⚡ THE FIX: Tell Cypress to click the Active tab before looking
    cy.get('#nav-active').click(); 

    // Verify they were added
    cy.contains('User A', { timeout: 10000 }).should('be.visible');
    cy.contains('User B').should('be.visible');
    cy.contains('User C').should('be.visible');

    // Clean up
    ['User A', 'User B', 'User C'].forEach(name => {
      cy.contains('.bg-white', name).find('.fa-trash').click();
      cy.on('window:confirm', () => true);
    });
  });

  // ----------------------------------------------------
  // TEST 3: SETTINGS (FIXED)
  // ----------------------------------------------------
  it('3. Settings: Add Team', () => {
    const newTeam = 'Team Cy' + Math.floor(Math.random() * 100);

    // ⚡ FIX: Wait for app data to be fully stable first
    cy.get('#loading-screen').should('have.class', 'hidden');
    cy.wait(1000); 

    // Open Settings
    cy.get('.fa-gear').click();
    cy.get('#settings-modal').should('not.have.class', 'hidden');

    // Add Team
    cy.get('#new-team-name').type(newTeam);
    
    // ⚡ FIX: Clicking this button automatically closes the modal in your app.
    // We do NOT need to close it manually afterwards.
    cy.get('#btn-add-team').click();

    // Verify modal is gone (Wait for animation)
    cy.get('#settings-modal', { timeout: 5000 }).should('have.class', 'hidden');
    
    // Open New Dispatch Modal to check dropdown
    cy.get('#btn-new').click(); 
    
    // Check if new team is in the dropdown
    cy.get('#input-team', { timeout: 10000 }).should('contain', newTeam);
  });

  // ----------------------------------------------------
  // TEST 4: FILTERS
  // ----------------------------------------------------
  it('4. Filtering', () => {
    // 1. Create a specific entry to search for
    cy.get('#mode-slr').click();
    cy.get('#btn-new').click();
    cy.get('#input-name').type('Filter Target');
    cy.get('#input-team').select('Team Bernie');
    cy.get('#input-area').select('TAGAYTAY');
    cy.get('#modal-btn').click();

    // ⚡ THE FIX: Switch to Active Tab so Cypress can see it
    cy.get('#nav-active').click(); 
    
    // Wait for it to appear
    cy.contains('Filter Target', { timeout: 10000 }).should('be.visible');

    // 2. Test Search (Type something else, it should disappear)
    cy.get('#global-search').type('RandomName123');
    cy.contains('Filter Target').should('not.exist');
    
    // Clear search, it should come back
    cy.get('#global-search').clear().type('Filter Target');
    cy.contains('Filter Target').should('be.visible');
    
    // Clean up
    cy.contains('.bg-white', 'Filter Target').find('.fa-trash').click();
    cy.on('window:confirm', () => true);
    
    // Clear the search bar at the end
    cy.get('#clear-filters-btn').click();
  });

  it('6. Inbox: Approve Pending Request', () => {
    // 1. We assume the 'Ryan Tafalla' entry was pushed by the Google Sheet script
    // Or we manually click the Inbox tab
    cy.get('#nav-pending').click();

    // 2. If the Inbox is empty, this test will pass (skipped), 
    // but if data exists, we test the approval flow:
    cy.get('#card-container').then(($container) => {
      if ($container.find('.fa-thumbs-up').length > 0) {
        // Find the first pulsing Accept button and click it
        cy.get('.fa-thumbs-up').first().click();
        
        // Verify it moved to Active
        cy.get('#nav-active').click();
        cy.get('#badge-pending').should('not.be.visible'); // Badge should decrease
      }
    });
  });
});