# Arquitetura do Frontend — Verdear

Este repositório (`VerdeAr/frontend`) contém a aplicação web que substitui as views do monolito legado [`VerdeAr/Verdear`](https://github.com/VerdeAr/Verdear), como parte da separação entre frontend e backend do projeto. O monolito segue **ativo em paralelo** até que a migração seja concluída e validada.

A API consumida por este frontend é o repositório irmão [`VerdeAr/backend`](https://github.com/VerdeAr/backend).

---

## 1. Stack

| Camada | Tecnologia |
|---|---|
| Build tool / gerenciador de pacotes | Vite + npm |
| Linguagem | TypeScript |
| Framework | React |
| Estilização | TailwindCSS |
| Componentes | ShadCN/UI (base BaseUI, template `base-nova`) |
| Roteamento | React Router — Data Mode (loaders) |
| Formulários | React Hook Form + Zod + `@hookform/resolvers` |
| Validação de CPF/CNPJ | `cpf-cnpj-validator` |
| Autenticação | JWT (`jwt-decode`) + `react-cookie` (persistência do token) |
| Cliente HTTP | Axios |
| Datas | `date-fns` |
| Qualidade de código | Biome |
| Git hooks | Husky |
| Padrão de commits | Commitlint (Conventional Commits) |
| Containerização | Docker |
| Variáveis de ambiente | dotenv (`VITE_*`) |

---

## 2. Estrutura de pastas

```
src/
├── components/
│   ├── (modulo)/    # Componentes específicos de um domínio (ex.: produto, carrinho)
│   ├── layout/       # Componentes estruturais (ex.: RootLayout)
│   └── ui/            # Componentes de UI genéricos (ShadCN/UI)
├── hooks/              # Hooks customizados reutilizáveis
├── lib/                 # Integrações/config de bibliotecas de terceiros (ex.: api.ts, utils.ts)
├── utils/
│   └── masks.ts           # Máscaras de input (CPF/CNPJ, telefone, etc.)
├── pages/                  # Componentes de página, associados às rotas
├── router/
│   ├── routes.tsx            # Definição das rotas (React Router Data Mode)
│   └── loaders.ts             # Loaders de dados por rota
├── services/                   # Chamadas à API (Axios)
├── schemas/                     # Schemas de validação Zod (formulários/DTOs)
├── stores/                       # Estado global da aplicação
└── types/
    └── dto/                        # Tipos/contratos de dados trocados com a API
```

Aliases configurados (`components.json` / `tsconfig`): `@/components`, `@/components/ui`, `@/lib`, `@/hooks`.

---

## 3. Estado atual do scaffold

Já implementado:
- `main.tsx` — bootstrap da aplicação com `CookiesProvider` (react-cookie) e `RouterProvider`.
- `router/routes.tsx` + `router/loaders.ts` — rota `/` com `RootLayout` e página `Home` (loader ainda placeholder, retorna `true`).
- `lib/api.ts` — instância Axios com `baseURL` via `VITE_API_BASEURL`; interceptor de request injeta `Authorization: Bearer <token>` a partir do cookie `token`; interceptor de response limpa o cookie em respostas `401`.
- `components/layout/RootLayout.tsx` e `components/ui/button.tsx` (ShadCN, estilo `base-nova`, cor base `mist`).

Ainda não implementado: páginas e componentes de domínio (produto, carrinho, checkout, gestão de cadastro), `services/`, `schemas/`, `stores/`, `hooks/`, `types/dto/`, e o fluxo de autenticação (login/logout) em si.

---

## 4. Convenções

- **Commits:** Conventional Commits, validados via Commitlint no hook `commit-msg` (Husky).
- **Lint/format:** Biome.
- **Fluxo de branches:** GitLab Flow — ver [`docs/GITFLOW.md`](./GITFLOW.md).
- **Idioma:** Código, comentários e documentação em Português (Brasil).

---

## 5. Setup local

- Variáveis de ambiente: copiar `.env.example` para `.env` e preencher `VITE_API_BASEURL` com a URL da API do repositório `backend`.
- Ainda não há `Dockerfile`/`docker-compose.yml` neste repositório. Esta seção deve ser preenchida assim que a configuração de containerização for definida.
