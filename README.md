# VerdeAr — Frontend

> Do campo à sua mesa — produtos orgânicos e da agricultura familiar, com quem produz de verdade.

Aplicação web (SPA) do **VerdeAr**, marketplace que conecta produtores familiares e orgânicos a consumidores conscientes. Este repositório substitui a camada de visualização do monolito legado [`VerdeAr/Verdear`](https://github.com/VerdeAr/Verdear), com interface responsiva e mobile-first. A API consumida é o repositório [`VerdeAr/backend`](https://github.com/VerdeAr/backend).

## Perfis e funcionalidades

**Cliente**
- Vitrine com banner rotativo, busca em tempo real, filtro por categoria e paginação.
- Carrinho persistente com escolha entre **entrega** (com frete) e **retirada** no produtor.
- Checkout com forma de pagamento (Cartão, PIX, Dinheiro, Boleto) e tela de sucesso com instruções.
- Histórico de compras, edição de perfil e troca de senha.

**Vendedor (produtor rural)** — tudo o que o cliente faz, mais:
- Catálogo próprio com cadastro e edição de produtos (foto, categoria, unidade de medida, estoque).
- Ativar ou desativar produtos sem excluí-los.
- Controle de pedidos recebidos, com filtro por status (Aberta, Finalizada, Cancelada).
- Configuração do frete fixo.

### Telas

| Tela | Acesso |
|---|---|
| Vitrine (Home), com busca, categorias e paginação | Público |
| Detalhe do produto (`/produtos/:id`) | Público |
| Login e Cadastro | Público (usuário já logado é redirecionado para a Home) |
| Carrinho, Finalizar Pedido e Pedido confirmado | Logado |
| Minha Conta (dados, senha, histórico de compras) | Logado |
| Abas de Catálogo de produtos, Controle de pedidos e Frete (dentro de Minha Conta) | Somente Vendedor |

A vitrine pode ser navegada sem login. Ao tentar adicionar um produto ao carrinho, o visitante é enviado para o Login e volta à página de origem depois de autenticar.

## Stack

| Camada | Tecnologia |
|---|---|
| Build | Vite 8 + npm |
| Linguagem | TypeScript (strict) |
| UI | React 19 |
| Estilo | Tailwind CSS v4 |
| Componentes | shadcn / Base UI |
| Rotas | React Router 8 (data mode, loaders) |
| Formulários | React Hook Form + Zod |
| Estado global | Zustand (`auth`, `cart`) |
| HTTP | Axios com `withCredentials` (sessão por cookie HTTP-Only) |
| Validação de CPF/CNPJ | cpf-cnpj-validator |
| Qualidade | Biome |
| Git hooks | Husky + Commitlint |
| Container | Docker multi-stage (Nginx Alpine) |

## Pré-requisitos

- Node.js 20+ (a imagem Docker usa 22)
- Backend do VerdeAr em execução (por padrão em `http://localhost:3000`)

## Como executar

```bash
# 1. Variáveis de ambiente
cp .env.example .env

# 2. Defina a URL da API no .env
#    VITE_API_BASEURL=http://localhost:3000

# 3. Dependências
npm install

# 4. Servidor de desenvolvimento (http://localhost:5173)
npm run dev
```

O backend libera por padrão a origem `http://localhost:5173` via `CORS_ORIGIN`.

### Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `VITE_API_BASEURL` | URL base da API. É embutida no build, então precisa estar definida **antes** de `npm run build`. |

## Scripts

| Script | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento Vite |
| `npm run build` | Type check (`tsc -b`) e build de produção em `dist/` |
| `npm run preview` | Serve a build localmente |
| `npm run check` | `tsc --noEmit` + Biome com `--error-on-warnings` |
| `npm run format` | Formata e corrige com Biome |

## Docker

```bash
docker build --build-arg VITE_API_BASEURL=https://api.seudominio.com -t verdear-frontend .
docker run -p 8080:80 verdear-frontend
```

A imagem serve os arquivos estáticos com Nginx, com a configuração de SPA em [nginx.conf](nginx.conf).

## Estrutura do projeto

```
src/
├── components/
│   ├── account/    # Perfil, senha, frete e histórico de compras
│   ├── auth/       # Login, registro, ProtectedRoute e RoleRoute
│   ├── cart/       # Itens, resumo, seletor de entrega
│   ├── catalog/    # Vitrine, carrossel, filtros e busca
│   ├── checkout/   # Resumo, endereço, pagamento
│   ├── layout/     # Header, Footer, RootLayout
│   ├── seller/     # Catálogo e pedidos do produtor
│   └── ui/         # Primitivos (Button, Dialog, Input, Badge...)
├── lib/            # Instância Axios, formatadores, máscaras, utils
├── pages/          # Páginas que apenas orquestram componentes
├── router/         # Rotas e loaders de dados
├── schemas/        # Schemas Zod (auth, person, product)
├── services/       # Chamadas tipadas à API REST
├── stores/         # Zustand (auth.store, cart.store)
└── types/          # Modelos e contratos TypeScript
```

### Diretrizes

- **Mobile-first:** layouts pensados para 375–430px e ampliados com `md:` e `lg:`; áreas de toque com no mínimo 44px.
- **Páginas orquestradoras:** `src/pages/` compõe componentes isolados; formulários complexos ficam em componentes próprios.
- **Type safety:** `any` é proibido; rode `npm run check` antes de abrir o PR.
- **Controle de acesso:** Home, Login e Cadastro são públicos; Minha Conta, Carrinho, Checkout e Pedido confirmado ficam sob `ProtectedRoute`. As abas de vendedor em Minha Conta só aparecem para `role === "VENDEDOR"`, e o backend valida o papel em cada rota de vendedor.

## Fluxo de contribuição

- **Branches:** GitLab Flow. Crie `<tipo>/VER-<ID>-<descricao-curta-em-portugues>` a partir de `main` (ex.: `feat/VER-105-validacao-pagamento`), usando o ID da própria tarefa. Ver [docs/GITFLOW.md](docs/GITFLOW.md).
- **Commits:** Conventional Commits com o ID da subtarefa do Jira, validados pelo Commitlint:
  ```
  feat(carrinho): [VER-105] descricao concisa da alteracao
  ```
  Redigidos em português, no imperativo, com no máximo 100 caracteres. Prefixos: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`.
- **Pull Request:** revisado por pares (responsáveis no `CODEOWNERS`) e com `npm run check` passando.
- **Segurança:** nunca comite tokens, senhas ou URLs fixas; use o `.env`.
- **Definition of Done:** critérios de aceite do Jira atendidos, commits no padrão, sem credenciais expostas, testes validados pelo QA com evidências, subtarefas concluídas e PR aprovado.

## Documentação adicional

- [docs/ARQUITETURA.md](docs/ARQUITETURA.md) — arquitetura, rotas, estado, fluxos e limitações conhecidas
- [docs/REQUISITOS.md](docs/REQUISITOS.md) — requisitos funcionais e não funcionais, com o estado de cada um
- [docs/ANDAMENTO.md](docs/ANDAMENTO.md) — o que já foi entregue, o que está em andamento e o que está planejado
- [docs/GITFLOW.md](docs/GITFLOW.md) — fluxo de versionamento
