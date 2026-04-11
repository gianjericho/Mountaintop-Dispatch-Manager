describe('RBAC Verification - Field Tech Role', () => {

  Cypress.on('window:alert', (msg) => {
    throw new Error(`🚨 CAUGHT SILENT APP ERROR: ${msg}`);
  });

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    
    cy.visit('http://127.0.0.1:5500/index.html');
    cy.get('#login-screen', { timeout: 15000 }).should('be.visible');
    
    cy.window().then(async (win) => {
      const login = async (retryCount = 0) => {
        try {
          const { error } = await win.db.auth.signInWithPassword({
            email: Cypress.env('TECH_TEST_EMAIL'), 
            password: Cypress.env('TECH_TEST_PASSWORD')          
          });
          if (error) throw error;
        } catch (err) {
          if (retryCount < 2) {
            cy.wait(1000);
            return login(retryCount + 1);
          }
          throw new Error(`🚨 LOGIN FAILED: ${err.message}`);
        }
      };
      await login();
      win.showApp();
    });

    cy.get('#main-app', { timeout: 15000 }).should('be.visible');
    cy.get('#loading-screen', { timeout: 15000 }).should('have.class', 'hidden');
  });

  it('1. Tech: Hidden Admin Controls', () => {
    cy.get('#nav-pending').should('have.class', 'hidden');
    cy.get('#btn-new').should('have.class', 'hidden');
    cy.get('#btn-bulk').should('have.class', 'hidden');
  });

  it('2. Tech: Card Actions Restricted', () => {
    cy.get('#nav-active').click({ force: true });
    
    cy.get('body').then(($body) => {
      // Use the unique .service-order-card selector to avoid collisions
      const cards = $body.find('.service-order-card');
      if (cards.length > 0) {
        cy.get('.service-order-card', { timeout: 10000 }).first().within(() => {
          cy.contains('button', 'Done').should('be.visible');
          cy.get('button[onclick^="deleteSO"]').should('not.exist');
          cy.get('button[onclick^="rescheduleSO"]').should('not.exist');
        });
      } else {
        cy.log('No active cards found for tech verification.');
      }
    });
  });

  it('3. Tech: Can Edit Own Remarks', () => {
    cy.get('#nav-active').click({ force: true });
    
    cy.get('body').then(($body) => {
      if ($body.find('.service-order-card input[placeholder*="remarks"]').length > 0) {
        const testRemark = 'Tech Remark ' + Date.now();
        cy.get('.service-order-card input[placeholder*="remarks"]').first().clear().type(testRemark + '{enter}');
        // ⚡ Wait for auto-save to settle
        cy.wait(1000); 
        cy.get('.service-order-card input[placeholder*="remarks"]').first().should('have.value', testRemark);
      }
    });
  });

});