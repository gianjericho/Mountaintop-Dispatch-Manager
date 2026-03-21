describe('RBAC Verification - Field Tech Role', () => {

  // ⚡ CATCH SILENT ERRORS: If the app throws an alert(), fail the test instantly and show us!
  Cypress.on('window:alert', (msg) => {
    throw new Error(`🚨 CAUGHT SILENT APP ERROR: ${msg}`);
  });

  // 1. SETUP: Log in specifically as the TECH user
  beforeEach(() => {
    cy.visit('http://127.0.0.1:5500/index.html');
    
    cy.get('#login-screen', { timeout: 10000 }).should('be.visible');
    
    cy.window().then(async (win) => {
      expect(win.db).to.not.be.undefined; 

      // ⚡ Log in using the TECH credentials
      const { data, error } = await win.db.auth.signInWithPassword({
        email: Cypress.env('TECH_TEST_EMAIL'), 
        password: Cypress.env('TECH_TEST_PASSWORD')          
      });
      // ⚡ THE FIX: Throw a hard error if login fails so we don't test as an anonymous user!
      if (error) throw new Error(`🚨 SUPABASE LOGIN FAILED: ${error.message}`);
      win.showApp();
    });

    cy.get('#main-app', { timeout: 10000 }).should('be.visible');
    cy.get('#loading-screen', { timeout: 15000 }).should('have.class', 'hidden');
  });

  // ----------------------------------------------------
  // TEST 1: VERIFY ADMIN UI IS COMPLETELY HIDDEN
  // ----------------------------------------------------
  it('1. Tech should NOT see Admin Tabs or Buttons', () => {
    // Check Tabs
    cy.get('#nav-pending').should('have.class', 'hidden');
    cy.get('#nav-history').should('have.class', 'hidden');
    // Techs can now view performance
    cy.get('#nav-performance').should('not.have.class', 'hidden');
    
    // Techs should default to the Active (Dispatch) tab
    cy.get('#nav-active').should('be.visible');

    // Check Action Buttons
    cy.get('#btn-new').should('have.class', 'hidden');
    cy.get('#btn-bulk').should('have.class', 'hidden');
  });

  // ----------------------------------------------------
  // TEST 2: VERIFY DELETE BUTTON IS HIDDEN ON CARDS
  // ----------------------------------------------------
  it('2. Tech should NOT be able to delete tickets', () => {
    cy.get('body').then($body => {
      // If there are any tickets on the board, ensure the trash can is missing
      if ($body.find('.fa-trash').length > 0) {
        // We assert that the delete function wrapper does not exist
        cy.get('button[onclick^="deleteSO"]').should('not.exist');
      }
    });
  });

});