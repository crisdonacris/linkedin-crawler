# LinkedIn Tech Recruiter Crawler

Este projeto utiliza Selenium WebDriver com Node.js para automatizar a busca e adição de recrutadores de tecnologia no LinkedIn. O script faz login no LinkedIn, lê uma lista de empresas de um arquivo JSON, busca recrutadores técnicos dessas empresas e tenta adicioná-los como contatos.

## Funcionalidades

- Login automático no LinkedIn
- Leitura de lista de empresas de um arquivo JSON
- Busca de recrutadores de tecnologia por empresa
- Adição automática de recrutadores como contatos

## Pré-requisitos

- Node.js (versão 14 ou superior)
- Navegador Chrome ou Firefox
- Conta válida no LinkedIn

## Instalação

1. Clone ou baixe este repositório.
2. Instale as dependências:
   ```
   npm install
   ```
3. Baixe o WebDriver correspondente ao seu navegador (ex: chromedriver para Chrome).

## Configuração

1. Crie um arquivo `credentials.json` na raiz do projeto com suas credenciais do LinkedIn:
   ```json
   {
     "username": "seu_email@linkedin.com",
     "password": "sua_senha"
   }
   ```

2. Crie um arquivo `companies.json` na raiz do projeto com a lista de empresas:
   ```json
   [
     "Empresa A",
     "Empresa B",
     "Empresa C"
   ]
   ```

## Uso

Execute o script principal:
```
node crawler.js
```

O script irá:
1. Fazer login no LinkedIn
2. Para cada empresa na lista, buscar recrutadores de tecnologia
3. Tentar adicionar cada recrutador encontrado como contato

## Avisos Importantes

- **Uso Responsável**: Este script automatiza ações no LinkedIn. Certifique-se de cumprir os termos de serviço do LinkedIn e as leis aplicáveis. O uso excessivo pode levar à suspensão da conta.
- **Rate Limiting**: Implemente delays adequados para evitar bloqueios.
- **Privacidade**: Não compartilhe suas credenciais.
- **Teste**: Teste em um ambiente controlado antes de usar em produção.

## Dependências

- selenium-webdriver
- chrome-driver (ou gecko-driver para Firefox)

## Troubleshooting

- **Erro de login**: Verifique suas credenciais e se o LinkedIn não está solicitando verificação adicional (CAPTCHA).
- **Elementos não encontrados**: O LinkedIn pode ter mudado sua interface; atualize os seletores XPath/CSS.
- **Bloqueio**: Se bloqueado, aguarde ou use uma VPN.

## Contribuição

Sinta-se à vontade para contribuir com melhorias, mas lembre-se das implicações éticas e legais.

## Licença

Este projeto é para fins educacionais. Use por sua própria conta e risco.