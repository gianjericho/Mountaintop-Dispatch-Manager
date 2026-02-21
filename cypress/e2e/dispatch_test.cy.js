describe('Dispatch Manager - Pre-Deployment Verification', () => {

  // 1. SETUP: Programmatic Login & Load Live Data
  beforeEach(() => {
    cy.visit('http://127.0.0.1:5500/index.html');
    
    // ⚡ NEW: Wait for the login screen to physically render first.
    // This guarantees app.min.js has finished loading before we try to grab 'db'
    cy.get('#login-screen', { timeout: 10000 }).should('be.visible');
    
    cy.window().then(async (win) => {
      // If this fails, your app.min.js wasn't updated!
      expect(win.db).to.not.be.undefined; 

      // Programmatically log into Supabase
      const { data, error } = await win.db.auth.signInWithPassword({
        email: Cypress.env('TEST_EMAIL'), 
        password: Cypress.env('TEST_PASSWORD')          
      });
      
      if (error) console.error("Cypress Login Failed:", error);
      
      // Reveal the app UI now that we have a secure token
      win.showApp();
    });

    // Wait for the app to be visible and data to finish loading
    cy.get('#main-app', { timeout: 10000 }).should('be.visible');
    cy.get('#loading-screen', { timeout: 15000 }).should('have.class', 'hidden');
    
    // Force close any lingering modals
    cy.get('.fixed.inset-0').invoke('addClass', 'hidden'); 
  });

  // ----------------------------------------------------
  // TEST 1: MANUAL DISPATCH WITH OPTIONAL DETAILS
  // ----------------------------------------------------
  it('1. Create Rich Manual Dispatch & Delete', () => {
    const testName = 'Cy Rich User ' + Date.now().toString().slice(-5);
    
    // Open Modal
    cy.get('#btn-new').click();
    
    // Fill Required
    cy.get('#input-name').type(testName);
    cy.get('#input-area').select('TAGAYTAY');
    cy.get('#input-team').select('Team Bernie');
    
    // Fill Optional Rich Data
    cy.get('#input-ticket').type('TCKT-9999');
    cy.get('#input-account').type('ACCT-0000');
    cy.get('#input-address').type('123 Cypress Testing Avenue');
    cy.get('#input-trouble').type('LOS Red Light');
    
    // Save
    cy.get('#modal-btn').click();

    // Verify it appeared in Active Tab
    cy.get('#nav-active').click();
    cy.contains(testName, { timeout: 10000 }).should('be.visible');
    cy.contains('TCKT-9999').should('be.visible');
    cy.contains('123 Cypress Testing Avenue').should('be.visible');

    // Clean up DB
    cy.window().then((win) => { cy.stub(win, 'confirm').returns(true); });
    cy.contains('.bg-white', testName).find('.fa-trash').click();
    cy.contains(testName).should('not.exist');
  });

  // ----------------------------------------------------
  // TEST 2: SPREADSHEET BULK DISPATCH
  // ----------------------------------------------------
  it('2. Bulk Dispatch (Spreadsheet Table UI)', () => {
    const bulkName = 'Cy Bulk User ' + Date.now().toString().slice(-5);
    
    cy.get('#btn-bulk').click();
    
    // Select Global Dropdowns
    cy.get('#global-bulk-area').select('AMADEO');
    cy.get('#global-bulk-team').select('Team Randy');
    
    // Type into the first dynamic row
    cy.get('.bulk-name').first().type(bulkName);
    cy.get('.bulk-ticket').first().type('BULK-TCKT-1');
    cy.get('.bulk-contact').first().type('09123456789');

    // Dispatch
    cy.get('#bulk-btn').click();

    // Verify in Active Tab
    cy.get('#nav-active').click(); 
    cy.contains(bulkName, { timeout: 10000 }).should('be.visible');

    // Clean up DB
    cy.window().then((win) => { cy.stub(win, 'confirm').returns(true); });
    cy.contains('.bg-white', bulkName).find('.fa-trash').click();
  });

  // ----------------------------------------------------
  // TEST 3: DYNAMIC LIMITS & SHOW MORE
  // ----------------------------------------------------
  it('3. Pagination: Dropdown and Show More', () => {
    cy.get('#nav-active').click();
    
    // Test the dropdown change
    cy.get('#entries-limit').select('25');
    cy.get('#entries-limit').should('have.value', '25');

    // If there are more than 25 items in your DB, the button will appear. Let's test it dynamically.
    cy.get('body').then($body => {
      const showMoreBtn = $body.find('#show-more-btn');
      if (showMoreBtn.length > 0 && !showMoreBtn.hasClass('hidden')) {
          cy.wrap(showMoreBtn).should('contain', 'Show 25 More').click();
      }
    });
  });

  // ----------------------------------------------------
  // TEST 4: INBOX TRIAGE (UI CHECK)
  // ----------------------------------------------------
  it('4. Inbox Triage Action Bar Exists', () => {
    cy.get('#nav-pending').click();
    
    // If there is data in the inbox, the Bulk Action bar should render
    cy.get('body').then($body => {
      if ($body.find('.pending-cb').length > 0) {
        cy.get('#inbox-bulk-team').should('be.visible');
        cy.get('#select-all-pending').should('be.visible');
        cy.contains('button', 'Send').should('be.visible');
      } else {
        // If empty, it should gracefully show the empty message
        cy.get('#empty-msg').should('not.have.class', 'hidden');
      }
    });
  });

  // ----------------------------------------------------
  // TEST 5: FILTERS & SEARCH
  // ----------------------------------------------------
  it('5. Search & Filters', () => {
    cy.get('#nav-active').click();
    
    // Type a random string that definitely doesn't exist
    cy.get('#global-search').type('XQZQJ123');
    cy.get('#empty-msg').should('not.have.class', 'hidden');
    
    // Clear filters using the reset button
    cy.get('#clear-filters-btn').should('be.visible').click();
    cy.get('#global-search').should('have.value', '');
  });

});