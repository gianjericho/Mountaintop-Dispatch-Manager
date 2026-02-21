describe('Dispatch Manager - Pre-Deployment Verification', () => {

  // ⚡ CATCH SILENT ERRORS: If the app throws an alert(), fail the test instantly and show us!
  Cypress.on('window:alert', (msg) => {
    throw new Error(`🚨 CAUGHT SILENT APP ERROR: ${msg}`);
  });

  beforeEach(() => {
    cy.visit('http://127.0.0.1:5500/index.html');
    cy.get('#login-screen', { timeout: 10000 }).should('be.visible');
    
    cy.window().then(async (win) => {
      expect(win.db).to.not.be.undefined; 
      const { data, error } = await win.db.auth.signInWithPassword({
        email: Cypress.env('TEST_EMAIL'), 
        password: Cypress.env('TEST_PASSWORD')          
      });
      
      // ⚡ THE FIX: Throw a hard error if login fails so we don't test as an anonymous user!
      if (error) throw new Error(`🚨 SUPABASE LOGIN FAILED: ${error.message}`);
      
      win.showApp();
    });

    cy.get('#main-app', { timeout: 10000 }).should('be.visible');
    cy.get('#loading-screen', { timeout: 15000 }).should('have.class', 'hidden');
    cy.get('.fixed.inset-0').invoke('addClass', 'hidden'); 
  });

  it('1. Create Rich Manual Dispatch & Delete', () => {
    const testName = 'Cy Rich User ' + Date.now().toString().slice(-5);
    
    cy.get('#btn-new').click();
    
    cy.get('#input-name').type(testName);
    cy.get('#input-area').select('TAGAYTAY');
    cy.get('#input-team').select('Team Bernie');
    cy.get('#input-ticket').type('TCKT-9999');
    cy.get('#input-account').type('ACCT-0000');
    cy.get('#input-address').type('123 Cypress Testing Avenue');
    cy.get('#input-trouble').type('LOS Red Light');
    
    cy.get('#modal-btn').click();

    // ⚡ NEW: Wait for the database to confirm the save and close the modal FIRST
    cy.get('#form-modal', { timeout: 10000 }).should('have.class', 'hidden');

    cy.get('#nav-active').click({ force: true });
    cy.contains(testName, { timeout: 10000 }).should('be.visible');
    cy.contains('TCKT-9999').should('be.visible');
    cy.contains('123 Cypress Testing Avenue').should('be.visible');

    cy.window().then((win) => { cy.stub(win, 'confirm').returns(true); });
    cy.contains('.bg-white', testName).find('.fa-trash').click();
    cy.contains(testName).should('not.exist');
  });

  it('2. Bulk Dispatch (Spreadsheet Table UI)', () => {
    const bulkName = 'Cy Bulk User ' + Date.now().toString().slice(-5);
    
    cy.get('#btn-bulk').click();
    
    cy.get('#global-bulk-area').select('AMADEO');
    cy.get('#global-bulk-team').select('Team Randy');
    
    cy.get('.bulk-name').first().type(bulkName);
    cy.get('.bulk-ticket').first().type('BULK-TCKT-1');
    cy.get('.bulk-contact').first().type('09123456789');

    cy.get('#bulk-btn').click();

    // ⚡ NEW: Wait for the database to confirm the bulk save and close the modal FIRST
    cy.get('#bulk-modal', { timeout: 10000 }).should('have.class', 'hidden');

    cy.get('#nav-active').click({ force: true });
    cy.contains(bulkName, { timeout: 10000 }).should('be.visible');

    cy.window().then((win) => { cy.stub(win, 'confirm').returns(true); });
    cy.contains('.bg-white', bulkName).find('.fa-trash').click();
  });

  it('3. Pagination: Dropdown and Show More', () => {
    cy.get('#nav-active').click({ force: true });
    cy.get('#entries-limit').select('25');
    cy.get('#entries-limit').should('have.value', '25');

    cy.get('body').then($body => {
      const showMoreBtn = $body.find('#show-more-btn');
      if (showMoreBtn.length > 0 && !showMoreBtn.hasClass('hidden')) {
          cy.wrap(showMoreBtn).should('contain', 'Show 25 More').click();
      }
    });
  });

  it('4. Inbox Triage Action Bar Exists', () => {
    cy.get('#nav-pending').click({ force: true });
    
    cy.get('body').then($body => {
      if ($body.find('.pending-cb').length > 0) {
        cy.get('#inbox-bulk-team').should('be.visible');
        cy.get('#select-all-pending').should('be.visible');
        cy.contains('button', 'Send').should('be.visible');
      } else {
        cy.get('#empty-msg').should('not.have.class', 'hidden');
      }
    });
  });

  it('5. Search & Filters', () => {
    cy.get('#nav-active').click({ force: true });
    cy.get('#global-search').type('XQZQJ123');
    cy.get('#empty-msg').should('not.have.class', 'hidden');
    cy.get('#clear-filters-btn').should('be.visible').click();
    cy.get('#global-search').should('have.value', '');
  });
});