const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');

// Carregar configurações do arquivo JSON
const config = JSON.parse(fs.readFileSync('credentials.json', 'utf8'));

async function main() {
  // Configurar o driver do Chrome
  const options = new chrome.Options();
  options.addArguments('--disable-blink-features=AutomationControlled');
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');

  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();

  try {
    // Fazer login no LinkedIn
    await driver.get('https://www.linkedin.com/login');
    await driver.findElement(By.id('username')).sendKeys(config.username);
    await driver.findElement(By.id('password')).sendKeys(config.password);
    await driver.findElement(By.css('button[type="submit"]')).click();

    // Aguardar login
    await driver.wait(until.urlContains('feed'), 10000);

    // Ler lista de empresas
    const companies = JSON.parse(fs.readFileSync('companies.json', 'utf8'));

    for (const company of companies) {
      console.log(`Buscando recrutadores para: ${company}`);

      // Buscar empresa
      await driver.get(`https://www.linkedin.com/search/results/companies/?keywords=${encodeURIComponent(company)}`);
      await driver.wait(until.elementLocated(By.css('.entity-result__title-text')), 5000);

      // Clicar na primeira empresa
      const companyLink = await driver.findElement(By.css('.entity-result__title-text a'));
      await companyLink.click();

      // Aguardar página da empresa
      await driver.wait(until.urlContains('/company/'), 5000);

      // Buscar recrutadores (pessoas)
      await driver.get(`${driver.getCurrentUrl()}/people/?keywords=tech%20recruiter`);

      // Aguardar resultados
      await driver.wait(until.elementLocated(By.css('.entity-result__item')), 5000);

      // Pegar lista de recrutadores
      const recruiters = await driver.findElements(By.css('.entity-result__item'));

      for (const recruiter of recruiters.slice(0, 5)) { // Limitar a 5 por empresa
        try {
          // Clicar no botão "Conectar" ou similar
          const connectButton = await recruiter.findElement(By.css('button[aria-label*="Conectar"]'));
          await connectButton.click();

          // Aguardar modal e enviar convite
          await driver.wait(until.elementLocated(By.css('.send-invite__actions button[aria-label="Enviar"]')), 5000);
          await driver.findElement(By.css('.send-invite__actions button[aria-label="Enviar"]')).click();

          console.log('Convite enviado');
        } catch (e) {
          console.log('Erro ao conectar:', e.message);
        }

        // Delay para evitar rate limiting
        await driver.sleep(2000);
      }
    }

  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await driver.quit();
  }
}

main();