# Vigia Rural

Protótipo acadêmico de segurança, rastreamento e gestão de risco para máquinas agrícolas. Baseado nos materiais fornecidos e no escopo descrito no texto do projeto.

## Abrir para apresentar

Abra `entrega/VIGIA RURAL.html` em um navegador. O arquivo é autossuficiente e funciona sem internet, instalações ou servidor. Leia `entrega/COMECE AQUI.txt` para o roteiro de demonstração.

Gestor: `admin@vigiarural.com` / `admin123`.

Operador: `operador@vigiarural.com` / `operador123`.

## Desenvolvimento

Código em JavaScript, CSS e HTML, sem dependências externas. A arquitetura simples prioriza a versão portátil e permite editar a aplicação sem instalar pacotes.

- `src/model.js`: dados, regras, simulações, autorizações e ocorrências.
- `src/app.js`: telas, navegação, formulários e exportações.
- `src/styles.css`: aparência, responsividade e impressão.
- `tools/build.cjs`: incorpora o código ao HTML portátil.
- `tools/serve.cjs`: servidor local opcional, limitado a 127.0.0.1:4173.
- `tests/model.test.cjs`: validação das regras e dos fluxos de simulação.

Com Node.js 18 ou posterior:

```text
npm test
npm run build
npm start
```

O servidor serve a versão de desenvolvimento em `http://127.0.0.1:4173`. `npm run build` atualiza o arquivo pronto para apresentação.

## Persistência e limites

As ações são persistidas em localStorage e a sessão de acesso em sessionStorage. Os dados são fictícios e o relógio segue o cenário de 30/09/2026. Não há backend, comunicação com rastreadores ou notificações externas. Autenticação e controles por perfil demonstram a experiência de uso e não oferecem segurança real. A retenção selecionada nas configurações é apenas representada; a limpeza dos dados é manual.

O arquivo portátil e o endereço localhost têm armazenamentos distintos. Para reiniciar a narrativa, use Configurações → Restaurar dados de demonstração. A versão anterior é preservada para recuperação. As exportações CSV e JSON permitem guardar os registros fora do navegador.

LoRaWAN representa comunicação via gateway local simulado. A saída da geofence e a violação geram ocorrências para análise; a aplicação não executa bloqueios ou comandos físicos.

## Preparação para produção

Uma implantação real exigiria autenticação e autorização no servidor, persistência protegida, validação de telemetria, integração com RFID e rastreadores, gateway e cobertura de rede testados em campo, auditoria protegida contra alteração e definição da política de privacidade. Nenhuma integração real é necessária para apresentar este MVP.
