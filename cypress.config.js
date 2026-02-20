// ✅ SAFE VERSION (Upload this!)
const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
  // We removed the hardcoded 'env' block. 
  // Cypress will now look for secrets in cypress.env.json (Local) 
  // OR GitHub Secrets (Cloud).
});