// ✅ SAFE VERSION (Upload this!)
const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      if (!config.browsers) config.browsers = [];
      config.browsers.push({
        name: 'brave',
        channel: 'stable',
        family: 'chromium',
        displayName: 'Brave',
        version: '120',
        path: '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
        majorVersion: 120
      });
      return config;
    },
  },
  // We removed the hardcoded 'env' block. 
  // Cypress will now look for secrets in cypress.env.json (Local) 
  // OR GitHub Secrets (Cloud).
});