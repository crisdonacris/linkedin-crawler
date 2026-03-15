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
      const searchUrl = `https://www.linkedin.com/search/results/companies/?keywords=${encodeURIComponent(company)}`;
      console.log(`Navegando para: ${searchUrl}`);
      await driver.get(searchUrl);

      // Aguardar carregamento da página
      await driver.sleep(3000);

      // Tentar diferentes seletores para o resultado da empresa
      let companyLink;
      try {
        companyLink = await driver.wait(until.elementLocated(By.css('.entity-result__title-text a')), 10000);
      } catch (e) {
        console.log('Tentando seletor alternativo...');
        try {
          companyLink = await driver.wait(until.elementLocated(By.css('a[data-test-id="search-result-company-name"]')), 10000);
        } catch (e2) {
          console.log(`Nenhum resultado encontrado para ${company}. Pulando...`);
          continue;
        }
      }

      await companyLink.click();

      // Aguardar página da empresa
      await driver.wait(until.urlContains('/company/'), 10000);
      console.log(`Página da empresa carregada: ${driver.getCurrentUrl()}`);

      // Buscar recrutadores (pessoas)
      const peopleUrl = `${await driver.getCurrentUrl()}/people/?keywords=tech%20recruiter`;
      console.log(`Buscando pessoas: ${peopleUrl}`);
      await driver.get(peopleUrl);

      // Aguardar carregamento
      await driver.sleep(3000);

      // Aguardar resultados
      let recruiters;
      try {
        recruiters = await driver.wait(until.elementsLocated(By.css('.entity-result__item')), 10000);
      } catch (e) {
        console.log('Tentando seletor alternativo para pessoas...');
        try {
          recruiters = await driver.wait(until.elementsLocated(By.css('[data-test-id="search-result-entity"]')), 10000);
        } catch (e2) {
          console.log(`Nenhum recrutador encontrado para ${company}. Pulando...`);
          continue;
        }
      }

      for (const recruiter of recruiters.slice(0, 5)) { // Limitar a 5 por empresa
        try {
          // Tentar encontrar botão de conectar
          let connectButton;
          try {
            connectButton = await recruiter.findElement(By.css('button[aria-label*="Conectar"]'));
          } catch (e) {
            try {
              connectButton = await recruiter.findElement(By.css('button[aria-label*="Connect"]'));
            } catch (e2) {
              console.log('Botão de conectar não encontrado. Pulando...');
              continue;
            }
          }
          await connectButton.click();

          // Aguardar modal e enviar convite
          await driver.sleep(2000);
          let sendButton;
          try {
            sendButton = await driver.wait(until.elementLocated(By.css('.send-invite__actions button[aria-label="Enviar"]')), 5000);
          } catch (e) {
            try {
              sendButton = await driver.wait(until.elementLocated(By.css('button[aria-label="Send"]')), 5000);
            } catch (e2) {
              console.log('Botão de enviar não encontrado. Fechando modal...');
              // Tentar fechar modal
              try {
                const closeButton = await driver.findElement(By.css('button[aria-label="Dismiss"]'));
                await closeButton.click();
              } catch (e3) {
                console.log('Não conseguiu fechar modal.');
              }
              continue;
            }
          }
          await sendButton.click();

          console.log('Convite enviado');
        } catch (e) {
          console.log('Erro ao conectar:', e.message);
        }

        // Delay para evitar rate limiting
        await driver.sleep(5000);
      }
    }

  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await driver.quit();
  }
}

main();