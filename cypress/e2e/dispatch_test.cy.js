describe('Dispatch Manager - Comprehensive Functional Verification', () => {

  Cypress.on('window:alert', (msg) => {
    cy.log(`⚠️ APP ALERT: ${msg}`);
  });

  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('http://127.0.0.1:5500/index.html');
    
    cy.window().then(async (win) => {
      const testEmail = Cypress.env('TEST_EMAIL');
      const testPass = Cypress.env('TEST_PASSWORD');
      
      const { error } = await win.db.auth.signInWithPassword({
        email: testEmail, 
        password: testPass          
      });
      if (error) throw error;
      
      win.showApp();
    });

    cy.get('#main-app', { timeout: 15000 }).should('be.visible');
    cy.get('#app-title', { timeout: 15000 }).should('be.visible');
    cy.get('#loading-screen', { timeout: 15000 }).should('have.class', 'hidden');
    cy.wait(1000); 
  });

  it('1. Mode Switching: SLR vs SLI UI Labels', () => {
    cy.get('#mode-sli').click();
    cy.wait(1000);
    cy.get('#app-title').should('contain', 'SLI');
    
    cy.get('#btn-new').click();
    cy.get('#form-modal', { timeout: 8000 }).should('be.visible');
    cy.get('input[placeholder*="JO No."]').should('be.visible');
    
    cy.get('#form-modal button .fa-times').first().parent().click({ force: true });
    cy.get('#form-modal', { timeout: 5000 }).should('have.class', 'hidden');

    cy.get('#mode-slr').click();
    cy.wait(1000);
    cy.get('#app-title').should('contain', 'SLR');
    
    cy.get('#btn-new').click();
    cy.get('#form-modal', { timeout: 8000 }).should('be.visible');
    cy.get('input[placeholder*="Ticket No."]').should('be.visible');
    cy.get('#form-modal button .fa-times').first().parent().click({ force: true });
  });

  it('2. Manual Dispatch: Barangay & Details', () => {
    const testName = 'Cy Manual ' + Date.now().toString().slice(-4);
    cy.get('#btn-new').click();
    cy.get('#input-name').type(testName);
    cy.get('#input-area').select('AMADEO', { force: true }).trigger('change');
    cy.wait(1000); 
    cy.get('#input-barangay').select('DAGATAN', { force: true });
    cy.get('#input-team').select('Team Bernie', { force: true });
    cy.get('#input-ticket').type('TCK-MANUAL');
    cy.get('#modal-btn').click();

    cy.get('#nav-pending').click({ force: true });
    cy.wait(500);
    cy.get('#nav-active').click({ force: true });
    
    cy.get('#global-search').clear().type(testName);
    cy.contains('.service-order-card', testName, { timeout: 15000 }).should('be.visible');
  });

  it('3. Card Actions: Checklist Toggling', () => {
    const testName = 'Cy Checklist ' + Date.now().toString().slice(-4);
    
    // ⚡ Self-Healing: Create a card first to ensure test data exists
    cy.get('#btn-new').click();
    cy.get('#input-name').type(testName);
    cy.get('#input-area').select('AMADEO', { force: true }).trigger('change');
    cy.wait(1000); 
    cy.get('#input-barangay').select('DAGATAN', { force: true });
    cy.get('#input-team').select('Team Bernie', { force: true });
    cy.get('#modal-btn').click();
    
    cy.get('#nav-active').click({ force: true });
    cy.get('#global-search').clear().type(testName);
    
    cy.get('.service-order-card', { timeout: 15000 }).first().within(() => {
      cy.get('input[type="checkbox"]').first().click({ force: true });
      cy.wait(800); 
      cy.get('input[type="checkbox"]').first().should('be.checked');
    });
  });

  it('4. Bulk Dispatch: New Trouble Column', () => {
    const bulkName = 'Cy Bulk ' + Date.now().toString().slice(-4);
    cy.get('#btn-bulk').click();
    
    // Barangay is now a per-row text input
    cy.get('.bulk-row').first().find('.bulk-name').type(bulkName);
    cy.get('.bulk-row').first().find('.bulk-barangay').type('DAGATAN');
    cy.get('.bulk-row').first().find('.bulk-trouble').type('Bulk Trouble Test');
    
    cy.get('#global-bulk-area').select('AMADEO', { force: true }).trigger('change');
    cy.wait(500);
    cy.get('#global-bulk-team').select('Team Bernie', { force: true });

    cy.get('#bulk-btn').click();
    cy.get('#bulk-modal', { timeout: 10000 }).should('have.class', 'hidden');

    cy.get('#nav-pending').click({ force: true });
    cy.wait(500);
    cy.get('#nav-active').click({ force: true });
    cy.get('#global-search').clear().type(bulkName);
    cy.contains('.service-order-card', bulkName, { timeout: 15000 }).should('be.visible');
  });

  it('5. Navigation: Performance Tab Rendering', () => {
    cy.get('#nav-performance').click();
    cy.get('#view-performance', { timeout: 10000 }).should('be.visible');
    cy.get('canvas', { timeout: 15000 }).should('have.length.at.least', 2);
  });

  it('6. Cleanup: Search and Delete Created Records', () => {
    cy.get('#nav-active').click({ force: true });
    cy.get('#global-search').clear().type('Cy ');
    cy.wait(1000);

    cy.get('body').then(($body) => {
      const deleteButtons = $body.find('button[onclick*="deleteSO"]');
      if (deleteButtons.length > 0) {
        cy.stub(window, 'confirm').returns(true);
        // Delete up to 5 sequentially with fresh DOM lookups
        for(let i=0; i<Math.min(deleteButtons.length, 5); i++) {
            cy.get('button[onclick*="deleteSO"]').first().click({ force: true });
            cy.wait(1000);
        }
      }
    });
  });
});