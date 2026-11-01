# Andamento do Projeto — Frontend

Retrato do que já foi entregue, do que está em andamento e do que está planejado para a interface do VerdeAr.

- **Fonte:** projeto `VER` no Jira, cruzado com o `origin/main` do repositório.
- **Posição:** 01/11/2026.
- **Atualização:** manual. Ao concluir uma tarefa, mova a linha de seção e ajuste `ARQUITETURA.md` e `README.md` (ver `.agents/AGENTS.md`).

Legenda dos status do Jira: **Feito**, **Revisão** (code review), **Fazendo**, **A fazer**.

---

## 1. Resumo

| Épico | Status | Observação |
|---|---|---|
| VER-46 — Validações Iniciais | Feito | Levantamento de fluxos e validação das funcionalidades básicas. |
| VER-36 — Migração | Feito | Interface migrada do monolito para SPA independente. |
| VER-47 — Funcionalidades Finais e Qualidade | A fazer no Jira | 14 tarefas: 1 concluída (VER-17), 4 em andamento (VER-58, VER-62, VER-74 e VER-78) e 9 por iniciar. Destas, VER-51, VER-66 e VER-90 já têm subtarefas entregues ou em andamento. Há também o bug VER-108 aberto. |

---

## 2. Implementado

### Migração do monolito (VER-36, épico concluído)

| Tarefa | Entrega |
|---|---|
| VER-38 | Login, cadastro (Cliente e Vendedor), perfil e configuração de frete. |
| VER-39 | Home pública, categorias, busca e painel de produtos do produtor rural. |
| VER-40 | Carrinho persistente, seletor de entrega e escolha de pagamento. |
| VER-41 | Checkout, histórico de compras e painel de pedidos do vendedor. |
| VER-44 | Auditoria de type safety, testes integrados e arquivamento do legado. |
| VER-45 | Dockerfile e deploy dos servidores de backend e frontend. |

### Já mergeadas no `main` (épico VER-47)

| Subtarefa | Entrega | Tarefa |
|---|---|---|
| VER-53 | Data loaders do React Router e refatoração das páginas (Home e Carrinho) | VER-51 — Migração para data loaders |
| VER-68 | `ProductDetailPage` e subcomponentes da PDP (`/produtos/:id`): galeria, informações com avaliação, produtor, simulador de frete e barra de ações | VER-66 — Páginas de detalhe do produto |
| VER-76 | Autenticação por cookies HTTP-Only: remoção dos tokens do client-side, `withCredentials` e botão de logout | VER-74 — Blindagem de autenticação |
| VER-60 | Cliente Socket.io, `ChatInboxPage` e `ChatRoomPage`, stores do chat, badge de mensagens não lidas no Header e botão para conversar com o produtor na PDP | VER-58 — Mensagens e chat |

### CI/CD e testes automatizados (VER-17, concluída)

| Subtarefa | Entrega | Repositório |
|---|---|---|
| VER-98 | Endpoints `/health` e `/ready`, saída em falha de banco e `HEALTHCHECK` | Backend |
| VER-99 | Testes de integração do fluxo principal com Vitest e Supertest | Backend |
| VER-100 | Pipeline `ci.yml` e Dependabot | Backend |
| VER-101 | Swagger atualizado e rota única `/docs` | Backend |
| VER-102 | Pipelines `deploy.yml` e `monitoring.yml` e `docs/CICD.md` | Backend |
| VER-103 | Testes unitários e de componentes com Vitest e Testing Library | Frontend |
| VER-104 | Teste E2E do caminho feliz de compra com Playwright (inclui a correção da tela de pedido confirmado) | Frontend |
| VER-105 | Workflows de CI, deploy e monitoramento, Dependabot e `docs/CICD.md` | Frontend |
| VER-106 | QA: pipelines, deploy nos dois ambientes, monitoramento e Swagger | Os dois |
| VER-107 | Documentação: README, Arquitetura, Requisitos, Andamento, `.agents` e Notion | Os dois |

Resultado: os ambientes de **homologação** e **produção** estão no ar, com deploy automático depois do CI verde e monitoramento a cada 15 minutos (ver [CICD.md](CICD.md)). Os Pull Requests do Dependabot já mergeados atualizaram o TypeScript (7.0), o `@hookform/resolvers` (6.0), as ações do pipeline (`docker/*` e `upload-artifact`), o Nginx da imagem (1.29) e o grupo de dependências menores.

---

## 3. Em andamento

| Tarefa | Status | Frontend | Backend | QA |
|---|---|---|---|---|
| VER-58 — Mensagens e chat com WebSocket (Socket.io) | Fazendo | VER-60 Feito (no `main`) | VER-59 Feito | VER-61 **Fazendo** |
| VER-62 — Endereços com CEP e autopreenchimento | Fazendo | VER-64 **Revisão** (branch `feat/VER-64-enderecos-com-cep`, ainda sem merge) | VER-63 A fazer | VER-65 A fazer |
| VER-74 — Blindagem de autenticação com cookies HTTP-Only | Fazendo | VER-76 Feito (no `main`) | VER-75 Feito | VER-77 **Fazendo** |
| VER-78 — Avaliação pós-venda | Fazendo | VER-80 A fazer | VER-79 Feito | VER-81 A fazer |
| VER-90 — Frete dinâmico com OpenRouteService e Leaflet | A fazer (a tarefa; as subtarefas já começaram) | VER-92 **Fazendo** | VER-91 **Fazendo** | VER-93 A fazer |
| VER-66 — PDP | A fazer (o Jira não atualizou a tarefa) | VER-68 Feito (no `main`) | VER-67 Feito | VER-69 A fazer |
| VER-51 — Data loaders do React Router | A fazer (a tarefa; o frontend já está entregue) | VER-53 Feito (no `main`) | VER-52 A fazer | VER-54 A fazer |

---

## 4. Planejado (A fazer)

| Tarefa | Frontend previsto |
|---|---|
| VER-48 — Subcomponentização e reutilizações | VER-49: subcomponentização e reutilizações profundas. |
| VER-55 — `errorElement` geral e 404 | VER-56: `RootErrorBoundary` e página 404. |
| VER-70 — Perfil público do produtor | VER-72: `ProducerProfilePage`, vitrine do produtor e rota pública `/vendedores/:id`. |
| VER-82 — E-mails transacionais com Resend | VER-84: avisos e feedbacks visuais dos e-mails disparados. |
| VER-86 — Imagens na Cloudflare R2 | VER-88: `ImageUploadDropzone` e integração nos formulários. |
| VER-94 — Painel do vendedor e workflow de pedidos | VER-96: `SellerOrderDetailPage`, modal de ajuste e banner de aprovação. |

---

## 5. Pendências conhecidas

- **VER-108 (bug, backend, A fazer):** os endpoints de chat expõem o hash da senha, o CPF, o e-mail e o telefone do outro participante da conversa. Precisa ser corrigido antes de o chat ser considerado concluído (VER-58).
- A busca mobile do Header aponta para `/produtos/busca`, que não existe. Nenhuma tarefa cobre isso hoje.
- A página 404 e o `errorElement` ficam com a VER-55.
- O `POST /vendas/checkout` devolve a entidade crua da venda, diferente do `GET /vendas/:id`. A tela de pedido confirmado contorna isso buscando o pedido pelo ID. A correção é do backend e ainda não tem tarefa.

---

## 6. Impacto previsto na arquitetura

Quando as tarefas abaixo forem entregues, revise estas partes de `ARQUITETURA.md` e `REQUISITOS.md`:

| Tarefa | O que muda na documentação |
|---|---|
| VER-58 | A VER-60 já está no `main`, mas `ARQUITETURA.md` e `REQUISITOS.md` ainda tratam o chat como em desenvolvimento. Documentar as rotas `/chat`, os stores e o cliente Socket.io, remover o item das rotas órfãs e atualizar o RF-70 a RF-73 depois da QA (VER-61). |
| VER-74 | A VER-76 já está no `main`. Depois da QA (VER-77), confirmar a descrição do `auth.store`, do `api.ts` e da restauração de sessão, e atualizar o RNF-03. |
| VER-78 | Novos componentes de avaliação e exibição de reputação. Remover o item "sem tela". |
| VER-55 | `errorElement` e página 404 na árvore de rotas. |
| VER-62 | Formulários de endereço com CEP e consulta ao ViaCEP (VER-64 em revisão). |
| VER-70 | Nova rota pública de perfil do produtor. |
| VER-86 | Upload de imagens (`ImageUploadDropzone`) nos formulários de produto. |
| VER-90 | Mapa com Leaflet, nova dependência e nova regra de exibição do frete. |
| VER-94 | Nova página de detalhe de pedido do vendedor. |
| VER-48 | Nova organização de componentes. Atualizar a estrutura de pastas. |

---

## 7. Documentos relacionados

- [REQUISITOS.md](REQUISITOS.md) — o que o sistema deve fazer, com o estado de cada requisito.
- [ARQUITETURA.md](ARQUITETURA.md) — como o sistema está estruturado hoje.
- [CICD.md](CICD.md) — pipelines de CI, deploy e monitoramento.
- [GITFLOW.md](GITFLOW.md) — fluxo de branches e Pull Requests.
- [README.md](../README.md) — setup e scripts.
