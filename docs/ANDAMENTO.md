# Andamento do Projeto — Frontend

Retrato do que já foi entregue, do que está em andamento e do que está planejado para a interface do VerdeAr.

- **Fonte:** projeto `VER` no Jira, cruzado com o `origin/main` do repositório.
- **Posição:** 21/10/2026.
- **Atualização:** manual. Ao concluir uma tarefa, mova a linha de seção e ajuste `ARQUITETURA.md` e `README.md` (ver `.agents/AGENTS.md`).

Legenda dos status do Jira: **Feito**, **Revisão** (code review), **Fazendo**, **A fazer**.

---

## 1. Resumo

| Épico | Status | Observação |
|---|---|---|
| VER-46 — Validações Iniciais | Feito | Levantamento de fluxos e validação das funcionalidades básicas. |
| VER-36 — Migração | Feito | Interface migrada do monolito para SPA independente. |
| VER-47 — Funcionalidades Finais e Qualidade | Em andamento | 2 tarefas em andamento, 1 concluída e 11 por iniciar. |

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

---

## 3. Em andamento

| Tarefa | Status | Frontend | Backend | QA |
|---|---|---|---|---|
| VER-74 — Blindagem de autenticação com cookies HTTP-Only | Fazendo | VER-76 **Revisão** (remoção de tokens do client-side e `withCredentials`) | VER-75 Feito | VER-77 A fazer |
| VER-58 — Mensagens e chat com WebSocket (Socket.io) | Fazendo | VER-60 A fazer (cliente Socket.io, `ChatInboxPage`, `ChatRoomPage` e stores) | VER-59 Revisão | VER-61 A fazer |
| VER-66 — PDP | Feito | VER-68 Feito | VER-67 Feito | VER-69 **Fazendo** (QA ainda em curso) |

A VER-48 (subcomponentização) já tem a branch `feature/VER-48-subcomponentizacao-reutilizacoes-frontend`, mas o Jira ainda a mostra como A fazer.

---

## 4. Planejado (A fazer)

| Tarefa | Frontend previsto |
|---|---|
| VER-78 — Avaliação pós-venda | VER-80: `StarRatingInput`, `ReviewOrderModal` e exibição de reputação nos cards e no perfil do produtor. A PDP já mostra média e quantidade de avaliações. Backend já pronto (VER-79). |
| VER-48 — Subcomponentização e reutilizações | VER-49: subcomponentização e reutilizações profundas. |
| VER-51 — Data loaders do React Router | Frontend concluído (VER-53). Faltam o backend (VER-52) e o QA (VER-54). |
| VER-55 — `errorElement` geral e 404 | VER-56: `RootErrorBoundary` e página 404. |
| VER-62 — Endereços com CEP | VER-64: `ZipCodeInput`, integração ViaCEP e atualização de formulários. |
| VER-70 — Perfil público do produtor | VER-72: `ProducerProfilePage`, vitrine do produtor e rota pública `/vendedores/:id`. |
| VER-82 — E-mails transacionais com Resend | VER-84: avisos e feedbacks visuais dos e-mails disparados. |
| VER-86 — Imagens na Cloudflare R2 | VER-88: `ImageUploadDropzone` e integração nos formulários. |
| VER-90 — Frete dinâmico com OpenRouteService e Leaflet | VER-92: mapa interativo com Leaflet.js e exibição da rota. |
| VER-94 — Painel do vendedor e workflow de pedidos | VER-96: `SellerOrderDetailPage`, modal de ajuste e banner de aprovação. |
| VER-17 — Testes do fluxo principal | VER-103 (Vitest e Testing Library) já está no `main`. VER-104 (E2E com Playwright) está implementada, aguardando revisão. Falta a VER-105 (workflows de CI). |

---

## 5. Pendências conhecidas sem tarefa

- A busca mobile do Header aponta para `/produtos/busca`, que não existe. Nenhuma tarefa cobre isso hoje.
- O link `/chat` do Header e do Footer será resolvido pela VER-58. A página 404 e o `errorElement` ficam com a VER-55.

---

## 6. Impacto previsto na arquitetura

Quando as tarefas abaixo forem entregues, revise estas partes de `ARQUITETURA.md`:

| Tarefa | O que muda na documentação |
|---|---|
| VER-74 | Após o merge da VER-76 e da QA, confirmar a descrição do `auth.store`, do `api.ts` e da restauração de sessão. |
| VER-58 | Novas rotas (`/chat` e sala de conversa), novos stores e cliente Socket.io. Remover o item das rotas órfãs. |
| VER-78 | Novos componentes de avaliação e exibição de reputação. Remover o item "sem tela". |
| VER-55 | `errorElement` e página 404 na árvore de rotas. |
| VER-62 | Formulários de endereço com CEP e consulta ao ViaCEP. |
| VER-70 | Nova rota pública de perfil do produtor. |
| VER-86 | Upload de imagens (`ImageUploadDropzone`) nos formulários de produto. |
| VER-90 | Mapa com Leaflet, nova dependência e nova regra de exibição do frete. |
| VER-94 | Nova página de detalhe de pedido do vendedor. |
| VER-48 | Nova organização de componentes. Atualizar a estrutura de pastas. |
| VER-17 | Os testes já constam em "Limitações conhecidas" e na seção de qualidade. Com o CI (VER-105), remover o item "Sem pipeline de CI". |

---

## 7. Documentos relacionados

- [REQUISITOS.md](REQUISITOS.md) — o que o sistema deve fazer, com o estado de cada requisito.
- [ARQUITETURA.md](ARQUITETURA.md) — como o sistema está estruturado hoje.
- [GITFLOW.md](GITFLOW.md) — fluxo de branches e Pull Requests.
- [README.md](../README.md) — setup e scripts.
