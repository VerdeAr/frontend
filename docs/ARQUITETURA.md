# Arquitetura do Frontend — Verdear

Este repositório (`VerdeAr/frontend`) contém a aplicação Single Page Application (SPA) que substitui integralmente a camada de visualização do monólito legado [`VerdeAr/Verdear`](https://github.com/VerdeAr/Verdear), consolidando uma interface moderna, responsiva e mobile-first para o ecossistema Verdear.

A API consumida por este frontend é o repositório irmão [`VerdeAr/backend`](https://github.com/VerdeAr/backend).

---

## 1. Status da Migração do Monólito

A migração das interfaces e fluxos de usuário a partir do monólito legado foi **concluída com sucesso**:
- **Autenticação e Perfis:** Telas e formulários completos para Login, Registro (com suporte a papéis Cliente e Produtor Rural), Alteração de Senha e Gerenciamento de Frete Fixo.
- **Catálogo e Vitrine Pública:** Página inicial (`Home`) com banner rotativo, pesquisa em tempo real, filtro por categorias agrícolas, listagem com paginação e cards de produtos com indicadores visuais.
- **Painel do Produtor Rural:** Catálogo restrito ao vendedor com listagem de produtos, formulário modal de cadastro/edição de produtos (com upload/URL de foto e seleção de unidade de medida) e controle de disponibilidade (toggle ativo/inativo).
- **Carrinho de Compras Persistente:** Gerenciamento multi-sessão com sincronização via Zustand e API, seletor de modalidade de entrega (Entrega domiciliar com frete ou Retirada no produtor) e cálculo dinâmico de valores.
- **Checkout e Histórico de Pedidos:** Fluxo completo de checkout, tela de sucesso com instruções de pagamento via PIX/Dinheiro, histórico de compras do cliente e painel de pedidos do vendedor com filtros por status (Aberta, Finalizada, Cancelada).

---

## 2. Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Build tool / Bundler | Vite 8 + npm |
| Linguagem | TypeScript (Strict Mode) |
| Framework | React 19 |
| Estilização | Tailwind CSS v4 |
| Componentes Visuais | ShadCN / Base-UI (primitivos acessíveis) |
| Roteamento | React Router 8 (Data Mode com loaders) |
| Formulários | React Hook Form + Zod + `@hookform/resolvers` |
| Gerenciamento de Estado | Zustand (auth, cart) |
| Validação de Documentos | `cpf-cnpj-validator` |
| Cliente HTTP | Axios (com interceptor de Bearer Token e refresh) |
| Qualidade de Código | Biome (linter e formatação estrita) |
| Git hooks | Husky + Commitlint (Conventional Commits) |
| Containerização | Docker (multi-stage build com Nginx Alpine) |

---

## 3. Estrutura de Pastas

```
src/
├── components/
│   ├── account/        # Formulários de perfil, senha e frete do vendedor
│   ├── cart/           # Lista de itens, resumo de valores e seletor de entrega
│   ├── catalog/        # Vitrine de produtos, carrossel, filtros e busca
│   ├── checkout/       # Resumo de checkout, endereço e instruções de pagamento
│   ├── layout/         # Header, Footer e RootLayout
│   ├── seller/         # Painel de pedidos e gerenciamento de produtos do produtor
│   └── ui/             # Primitivos atômicos de interface (Button, Dialog, Input, Badge, etc.)
├── hooks/              # Custom hooks reutilizáveis
├── lib/                # Instância Axios (`api.ts`), utilitários (`utils.ts`) e máscaras (`masks.ts`)
├── pages/              # Páginas orquestradoras das rotas (Home, Login, Register, Cart, Checkout, etc.)
├── router/             # Definição de rotas (`routes.tsx`) e loaders de dados (`loaders.ts`)
├── schemas/            # Schemas de validação Zod (auth, person, product)
├── services/           # Comunicação com a API REST tipada
├── stores/             # Estado global com Zustand (auth.store, cart.store)
└── types/              # Modelos de dados e contratos TypeScript
```

---

## 4. Diretrizes Arquiteturais

1. **Desenvolvimento Mobile-First:**
   - Todo layout e componente é concebido inicialmente para telas móveis (viewport entre 375px e 430px) e enriquecido progressivamente com breakpoints (`md:`, `lg:`).
   - Áreas de toque confortáveis (mínimo de 44px de altura para botões e inputs interativos).
2. **Páginas Orquestradoras vs. Componentização Atômica:**
   - Páginas em `src/pages/` não atuam como monólitos visuais; sua função é apenas compor subcomponentes isolados.
   - Formulários complexos são desacoplados em componentes próprios com isolamento de validações e renders.
3. **Type Safety e Integridade:**
   - Uso de `any` proibido.
   - Validação contínua com `npm run check` (`tsc --noEmit && biome check --error-on-warnings`).

---

## 5. Setup Local e Execução

### Pré-requisitos
- Node.js (v20+)
- Backend Verdear em execução (`http://localhost:3000`)

### Passos de Instalação:
1. Copie o arquivo de variáveis de ambiente:
   ```bash
   cp .env.example .env
   ```
2. Configure a URL da API no `.env`:
   ```env
   VITE_API_BASEURL=http://localhost:3000
   ```
3. Instale as dependências:
   ```bash
   npm install
   ```
4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
5. Para compilar a versão de produção:
   ```bash
   npm run build
   ```
