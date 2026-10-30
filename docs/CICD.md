# CI/CD do Frontend — VerdeAr

Como o código do frontend é validado, publicado e monitorado. O processo não depende de uma plataforma de hospedagem específica: o resultado do pipeline é uma **imagem Docker** (Nginx servindo a SPA) no GitHub Container Registry (GHCR), que pode rodar em qualquer servidor.

O pipeline do backend segue o mesmo desenho (`VerdeAr/backend`, `docs/CICD.md`). Aqui estão as diferenças que importam para o frontend, em especial a [seção 2.3](#23-a-imagem-é-feita-por-ambiente).

## 1. Visão geral

```
Pull Request ──▶ ci.yml ──▶ merge na main ──▶ deploy.yml ──▶ homologação
                                prod ───────────────────────▶ produção
                                                    monitoring.yml (a cada 15 min)
```

| Workflow | Quando roda | O que faz |
|---|---|---|
| [`ci.yml`](../.github/workflows/ci.yml) | Em todo Pull Request para `main` ou `prod`, manualmente e quando chamado pelo deploy | **Qualidade** (`npm run check` e `npm run build`), **Testes unitários** (`npm test`) e **E2E** (Playwright contra a API real) |
| [`deploy.yml`](../.github/workflows/deploy.yml) | Push na `main` (homologação) ou na `prod` (produção) e manualmente | Roda o CI, publica a imagem no GHCR, implanta no ambiente e confere a aplicação |
| [`monitoring.yml`](../.github/workflows/monitoring.yml) | A cada 15 minutos e manualmente | Consulta a aplicação de homologação e de produção com `curl --fail` |
| [`dependabot.yml`](../.github/dependabot.yml) | Semanal (npm e Docker) e mensal (GitHub Actions) | Abre Pull Requests de atualização de dependências |

O `ci.yml` não roda em `push`: quem o executa depois do merge é o `deploy.yml`. Assim a publicação só acontece com o CI verde e não há execução duplicada.

## 2. O CI

Todos os jobs usam Node 22 (o mesmo do `Dockerfile`) e `HUSKY=0`, porque os hooks do Husky não fazem sentido no runner.

### 2.1 Jobs

| Job | Comandos | Falha quando |
|---|---|---|
| **Qualidade** | `npm ci`, `npm run check` (`tsc -b` + Biome com `--error-on-warnings`) e `npm run build` | Há erro de tipo, de lint ou de formato, ou o build não compila |
| **Testes unitários** | `npm ci` e `npm test` (Vitest + Testing Library) | Algum teste falha |
| **E2E** | Sobe o PostgreSQL e a API do backend e roda `npm run test:e2e` (Playwright) | O caminho feliz de compra falha |

Para o merge ser **bloqueado** quando algum deles falha, veja a [seção 3.2](#32-proteção-de-branch).

### 2.2 Como o job E2E funciona

O E2E usa a API de verdade, então o job monta o ambiente completo no próprio runner:

1. Sobe um **PostgreSQL 16** como *service* (`verdear_test`), descartado junto com o runner. Nenhum teste toca a homologação.
2. Baixa o repositório **`VerdeAr/backend`** em `backend/` (é público, então não precisa de token). Usa a `main`, ou a versão da variável `E2E_BACKEND_REF`.
3. Instala as dependências dos dois projetos e roda `npm run migration:run` e `npm run seed` no banco de testes.
4. Sobe a API em segundo plano (`npx tsx src/server.ts`) e espera `GET /ready` responder por até 60 s.
5. Instala o Chromium (`npx playwright install --with-deps chromium`) e roda `npm run test:e2e`. O `playwright.config.ts` faz o build do frontend e o serve com `vite preview` na porta 5173, a origem liberada no `CORS_ORIGIN` da API.
6. Se algo falhar, mostra o log da API e envia o artefato **`relatorio-e2e`** (relatório HTML do Playwright, `test-results/` com os traces e `api.log`), guardado por 7 dias. Para abri-lo: *Actions → execução → Artifacts*.

No CI a variável `CI` está definida, então o Playwright repete cada teste até 2 vezes antes de dar o resultado final.

> **O E2E acompanha a `main` do backend.** Uma mudança incompatível lá (por exemplo, no formato de uma resposta) pode quebrar o E2E do frontend sem que o frontend tenha mudado. Para fixar uma versão enquanto isso se resolve, crie a variável de repositório `E2E_BACKEND_REF` (*Settings → Secrets and variables → Actions → Variables*) com uma branch, tag ou commit do backend. Se o repositório do backend ficar privado, o `checkout` dele precisará de um token.

### 2.3 A imagem é feita por ambiente

O Vite **grava a URL da API dentro do JavaScript** na hora do build (`VITE_API_BASEURL`). Por isso, ao contrário do backend, a imagem do frontend não é a mesma para todos os ambientes: o `deploy.yml` constrói uma imagem para a homologação e outra para a produção, cada uma com a `API_BASE_URL` do seu Environment.

Consequências:

- Sem `API_BASE_URL` no Environment, o job **Publicar imagem falha** (em vez de gerar uma imagem apontando para `localhost:3000`).
- Para trocar a URL da API, é preciso **publicar de novo** (*Actions → Deploy → Run workflow*). Reiniciar o contêiner não basta.
- A imagem de homologação **não deve ser promovida** para produção com a mesma tag: ela aponta para a API de homologação.

## 3. Configuração no GitHub

### 3.1 Environments

Em *Settings → Environments*, crie `homologacao` e `producao`. Em `producao`, vale ativar **Required reviewers**: a aprovação é pedida antes de **publicar** a imagem (o job *Publicar imagem* usa o Environment para ler a `API_BASE_URL`).

Cadastre em **cada** environment:

| Nome | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `API_BASE_URL` | Variable | **Sim**, para publicar | URL pública da API, sem barra no final (ex.: `https://api.exemplo.com`). Vai para o build como `VITE_API_BASEURL` |
| `APP_BASE_URL` | Variable | Sim, para verificar e monitorar | URL pública do frontend, sem barra no final (ex.: `https://app.exemplo.com`) |
| `DEPLOY_METHOD` | Variable | Para implantar | `webhook` ou `ssh`. Vazio: o workflow só publica a imagem |
| `DEPLOY_WEBHOOK_URL` | Secret | Método `webhook` | URL completa do webhook de deploy (cada aplicação e ambiente tem a sua) |
| `DEPLOY_WEBHOOK_TOKEN` | Secret | Opcional | Token enviado como `Authorization: Bearer` (no Coolify, o token de API com permissão *Deploy*) |
| `DEPLOY_WEBHOOK_METHOD` | Variable | Opcional | Método HTTP do webhook (padrão `POST`) |
| `DEPLOY_VERIFY_DELAY` | Variable | Opcional | Segundos de espera antes de verificar a aplicação depois do deploy (padrão `30`) |
| `DEPLOY_SSH_HOST` | Secret | Método `ssh` | Servidor de destino |
| `DEPLOY_SSH_USER` | Secret | Método `ssh` | Usuário SSH |
| `DEPLOY_SSH_KEY` | Secret | Método `ssh` | Chave privada do usuário |
| `DEPLOY_SSH_PORT` | Secret | Opcional | Porta SSH (padrão `22`) |
| `DEPLOY_SSH_PATH` | Variable | Método `ssh` | Pasta do `docker-compose.yml` no servidor |
| `DEPLOY_SSH_COMMAND` | Variable | Opcional | Comando executado no servidor (padrão `docker compose pull && docker compose up -d`) |

Se `APP_BASE_URL` ou `DEPLOY_METHOD` não estiverem definidos, os workflows emitem um aviso e pulam a etapa correspondente, sem falhar. Só a `API_BASE_URL` é obrigatória.

> **Atenção ao tipo:** *Variable* e *Secret* são coisas diferentes no GitHub. Variáveis ficam em *Environment variables* e secrets em *Environment secrets*. Os workflows leem as variáveis pelo contexto `vars`, então **um valor cadastrado como secret não é enxergado**.

Além disso, a **API precisa aceitar a origem do frontend**: inclua a URL do `APP_BASE_URL` em `CORS_ORIGIN` no backend de cada ambiente. O cookie de sessão é `SameSite`, então frontend e API devem estar no mesmo site (por exemplo, subdomínios do mesmo domínio). Veja `docs/ARQUITETURA.md`, seção 6.

### 3.2 Proteção de branch

Para o CI **bloquear o merge**, em *Settings → Branches* crie regras para `main` e `prod` exigindo os checks **Qualidade**, **Testes unitários** e **E2E**, e a revisão dos code owners (`CODEOWNERS`). Os nomes dos checks só aparecem na lista depois que o workflow rodou ao menos uma vez em um Pull Request.

### 3.3 Acesso à imagem (GHCR)

Os pacotes do GHCR são privados por padrão. Quem for baixar a imagem (a hospedagem ou um servidor) precisa de credenciais com a permissão `read:packages`, ou o pacote deve ser tornado público em *Packages → Package settings*. A imagem fica em `ghcr.io/verdear/frontend`.

## 4. O deploy

```
Definir ambiente ─┐
                  ├─▶ Publicar imagem ─▶ Implantar ─▶ Verificar
CI ───────────────┘
```

| Ambiente | Branch | Tags da imagem | GitHub Environment |
|---|---|---|---|
| Homologação | `main` | `homologacao` e `sha-<commit curto>-homologacao` | `homologacao` |
| Produção | `prod` | `producao`, `latest` e `sha-<commit curto>-producao` | `producao` |

A tag por commit identifica exatamente o código da imagem (usada no rollback) e leva o nome do ambiente porque o mesmo commit gera imagens diferentes em cada um (ver [2.3](#23-a-imagem-é-feita-por-ambiente)).

O ambiente é decidido **só pela branch que recebeu o push** (ou pela escolha em *Run workflow*). O fluxo de branches segue o [GitLab Flow](GITFLOW.md): as features entram na `main` por Pull Request e a `main` é promovida para a `prod`.

Para publicar manualmente em um ambiente, use *Actions → Deploy → Run workflow* e escolha o ambiente.

### 4.1 Webhook (`DEPLOY_METHOD=webhook`)

O workflow chama a URL configurada depois de publicar a imagem. Serve a qualquer plataforma que aceite um webhook de deploy.

**Exemplo com Coolify** (modo imagem: o GitHub Actions constrói e publica a imagem, e o Coolify só baixa e inicia):

1. **Habilite a API** em *Settings → Advanced → API access* e crie um token com a permissão **Deploy** em *Keys & Tokens → API tokens*. O valor aparece uma única vez e vai para o secret `DEPLOY_WEBHOOK_TOKEN`.
2. **Deixe o servidor baixar do GHCR:** o Coolify precisa estar logado no `ghcr.io` para baixar imagens privadas (token do GitHub com `read:packages`), ou o pacote deve ser público.
3. **Crie a aplicação como Docker Image** (*New Resource → Docker Based → Docker Image*). Esse tipo é escolhido na criação: uma aplicação criada a partir do Git não pode ser convertida.

   | Aplicação | Imagem | Tag | Porta exposta |
   |---|---|---|---|
   | Frontend, homologação | `ghcr.io/verdear/frontend` | `homologacao` | `80` |
   | Frontend, produção | `ghcr.io/verdear/frontend` | `producao` | `80` |

   A imagem precisa **já existir no GHCR**: rode o `deploy.yml` antes. Configure o domínio da aplicação (o mesmo do `APP_BASE_URL`). O frontend **não precisa de variáveis de ambiente em tempo de execução**, porque a URL da API já está dentro da imagem.
4. **Deploy automático desligado** (*manual deployments only*): a implantação deve ocorrer só pelo webhook, depois do CI verde.
5. **Copie o webhook de cada aplicação** para o secret `DEPLOY_WEBHOOK_URL` do environment correspondente (formato `https://<seu-coolify>/api/v1/deploy?uuid=<uuid-da-aplicacao>&force=false`, método `POST`). Defina `DEPLOY_METHOD=webhook`.
6. **Health check:** ative o health check da aplicação no caminho `/`.

> **Limite da verificação:** o webhook apenas enfileira o deploy e responde na hora, e a versão antiga continua respondendo até a nova ficar saudável. Por isso a etapa *Verificar* espera `DEPLOY_VERIFY_DELAY` segundos antes de consultar e serve como confirmação de que a aplicação está de pé, não como prova de que a versão nova já entrou. O acompanhamento do deploy em si está nos logs da plataforma, e o `monitoring.yml` detecta quedas depois.

### 4.2 SSH (`DEPLOY_METHOD=ssh`)

O workflow entra no servidor, vai até `DEPLOY_SSH_PATH` e executa `docker compose pull && docker compose up -d`. O servidor precisa ter o Docker e um `docker-compose.yml` que use a imagem (exemplo na seção 5).

## 5. Rodar a imagem em qualquer lugar

```bash
docker run -d --name verdear-frontend -p 8080:80 \
  ghcr.io/verdear/frontend:producao
```

Ou, com Docker Compose (`docker-compose.yml`):

```yaml
services:
  frontend:
    image: ghcr.io/verdear/frontend:producao
    restart: unless-stopped
    ports:
      - "8080:80"
```

A imagem serve a SPA com Nginx, com fallback de rotas para o `index.html`. Não há variáveis de ambiente em tempo de execução; a API usada é a do build. Para construir uma imagem para outra API, fora do pipeline:

```bash
docker build --build-arg VITE_API_BASEURL=https://api.seudominio.com -t verdear-frontend .
```

## 6. Rollback

Cada publicação gera a tag `sha-<commit curto>-<ambiente>`. Para voltar a uma versão anterior:

- **Webhook/plataforma:** troque a tag da aplicação para `sha-<commit>-<ambiente>` (ex.: `ghcr.io/verdear/frontend:sha-1a2b3c4-producao`) e reimplante.
- **SSH/Compose:** ajuste a tag no `docker-compose.yml` do servidor e rode `docker compose up -d`.
- **Definitivo:** faça um `revert` do commit problemático pelo fluxo normal de Pull Request.

## 7. Monitoramento

O `monitoring.yml` roda a cada 15 minutos e faz `curl --fail` em `${APP_BASE_URL}/` de cada ambiente, com até 3 tentativas. Se um ambiente não responde ou devolve erro HTTP, a execução falha e o GitHub notifica os responsáveis pelo repositório. Para rodar na hora: *Actions → Monitoramento → Run workflow*.

- Workflows agendados só rodam na branch padrão (`main`). O monitoramento começa a valer depois do merge.
- A verificação confere que o Nginx entrega a página, **não** que a API está de pé. A API tem o próprio monitoramento no repositório do backend (`/ready`).
- Um ambiente sem `APP_BASE_URL` é ignorado com um aviso, para não gerar falha falsa.

## 8. Dependabot

O [`dependabot.yml`](../.github/dependabot.yml) abre Pull Requests de atualização para três ecossistemas:

| Ecossistema | Frequência | Observação |
|---|---|---|
| `npm` | Semanal | Atualizações menores e de correção entram juntas em um único PR; versões maiores abrem PRs separados. No máximo 5 abertos |
| `github-actions` | Mensal | Versões das ações dos workflows |
| `docker` | Semanal | Imagens base do `Dockerfile` (`node` e `nginx`) |

Os PRs saem com o prefixo `chore(deps):`, que passa na validação do Commitlint. Todos passam pelo mesmo CI antes do merge.

## 9. Rodando localmente

- Qualidade e testes unitários: `npm run check`, `npm run build` e `npm test` (ver o [README](../README.md#testes)).
- E2E: o passo a passo com o banco de testes em Docker está no [README](../README.md#testes-e2e-playwright).
- Imagem: `docker build --build-arg VITE_API_BASEURL=http://localhost:3000 -t verdear-frontend:local .` e `docker run -p 8080:80 verdear-frontend:local`.
- Workflows: a ferramenta [`actionlint`](https://github.com/rhysd/actionlint) aponta erros de sintaxe e de expressões sem precisar do GitHub.

> **Fim de linha no Windows:** com `core.autocrlf=true`, o `npm run check` local pode acusar erros de formato (CRLF) em arquivos que não foram alterados. No CI, o checkout é em LF (veja `.gitattributes`) e o erro não ocorre.

## 10. Problemas comuns

| Sintoma | Causa provável |
|---|---|
| `Qualidade` falha só no CI, com erro de formato | O arquivo foi commitado com CRLF. O `.gitattributes` força LF; rode `npm run format` e comite |
| `E2E` falha no CI mas passa local | Veja o artefato `relatorio-e2e` (traces e `api.log`). Confira se a `main` do backend mudou; fixe a versão com `E2E_BACKEND_REF` |
| `E2E` falha com `A API não respondeu em /ready` | A API não subiu: o `api.log` impresso no job mostra o motivo (migrations, variáveis `DB_*`) |
| `Publicar imagem` falha pedindo `API_BASE_URL` | A variável não existe no Environment, ou foi cadastrada como *secret* em vez de *variable* |
| `Publicar imagem` falha ao enviar | O repositório precisa da permissão de escrita em pacotes (`packages: write` já está no workflow) |
| A aplicação publicada chama a API errada | A imagem foi construída com outra `API_BASE_URL`. Corrija a variável e publique de novo |
| Login funciona na API mas a sessão se perde | A origem do frontend não está em `CORS_ORIGIN` do backend, ou frontend e API estão em sites diferentes (cookie `SameSite`) |
| `Implantar por webhook` falha com `405` | Método HTTP errado. O log mostra o cabeçalho `Allow`; o Coolify atual exige `POST` |
| `Implantar` avisa que `DEPLOY_METHOD` não está definido | O environment ainda não foi configurado (ou foi criado como *secret*); a imagem foi publicada, mas nada foi implantado |
| Coolify falha com `error from registry: denied` | O servidor não está autenticado no `ghcr.io`: rode `docker login ghcr.io` com um token `read:packages` e reimplante |
| `Verificar` falha após o deploy | A aplicação não respondeu em `APP_BASE_URL`: veja os logs da plataforma |
