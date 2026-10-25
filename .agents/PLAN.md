# PLAN — VER-64: Endereços com CEP e Integração ViaCEP no Frontend

> Plano de execução em conformidade com as diretrizes de `.agents/AGENTS.md`.
> Regras: execução subfaseada atômica (uma subtarefa por vez), verificação obrigatória (`tsc --noEmit` e `npm run check`) antes de cada pausa e comandos de escrita no Git gerenciados exclusivamente pelo desenvolvedor.

---

## 1. Tarefa

| Campo | Valor |
|---|---|
| Chave Jira | `VER-64` |
| Título | Endereços com CEP e integração ViaCEP no Frontend |
| Tipo | Subtarefa |
| Tarefa pai | `VER-62` (Endereços com CEP) |
| Repositório | `frontend` |
| Branch | `feat/VER-64-enderecos-com-cep` |
| Status no Jira | Fazendo |

---

## 2. Entendimento da demanda

Implementar no frontend o consumo da API pública do ViaCEP e o componente especializado `ZipCodeInput` com máscara (`00000-000`) e busca automática no 8º dígito. Integrar o autopreenchimento nos formulários de cadastro (`RegisterForm`) e edição de perfil (`ProfileDataForm`), além de refinar a exibição do endereço completo e formatado no card do checkout (`DeliveryAddressCard`), atendendo ao requisito funcional **RF-09**.

### Critérios de aceite

- [ ] Serviço `cep.service.ts` implementado consumindo `https://viacep.com.br/ws/{cep}/json/` com Axios desacoplado de interceptores de autenticação, com tipagem e tratamento de erros (CEP inexistente, formato inválido, falha de rede).
- [ ] Componente `ZipCodeInput.tsx` implementado com máscara `00000-000`, disparo automático de busca ao completar 8 dígitos numéricos, indicação de carregamento (spinner) e callbacks para preenchimento de endereço e erros.
- [ ] Formulário de cadastro (`RegisterForm.tsx`) atualizado com o campo de CEP, autopreenchimento de logradouro/endereço e seleção automática do bairro se correspondente na base.
- [ ] Gestão de perfil (`ProfileDataForm.tsx`) atualizada com campo de CEP e autopreenchimento com o mesmo comportamento.
- [ ] Card de entrega no checkout (`DeliveryAddressCard.tsx`) aprimorado para apresentar o endereço completo e formatado (logradouro, bairro, cidade/UF e CEP quando disponível).
- [ ] 100% de aprovação nas verificações de tipo e linter (`tsc --noEmit` e `npm run check`).

### Contexto consultado

- Requisitos: `docs/REQUISITOS.md` (`RF-09` e `RNF-23`)
- Andamento: `docs/ANDAMENTO.md` (item VER-62 / VER-64)
- Arquitetura: `docs/ARQUITETURA.md` (camadas, Axios desacoplado para serviços externos, formulários com React Hook Form e Zod)

### Premissas e decisões técnicas

- O ViaCEP é um serviço externo e gratuito; a requisição HTTP não deve utilizar a instância de `src/lib/api.ts` (que possui `withCredentials: true` e interceptor de 401 voltado à API do VerdeAr), e sim uma instância/chamada Axios limpa.
- Manter compatibilidade com os modelos e schemas atuais (`address`, `neighborhood_id`), adicionando o suporte a `cep` de forma opcional em `User`, `RegisterData` e `UpdateProfileData`.

---

## 3. Arquivos previstos

| Ação | Arquivo | Motivo |
|---|---|---|
| Editar | `src/lib/masks.ts` | Adicionar utilitário `maskCep` para formatação `00000-000` |
| Criar | `src/services/cep.service.ts` | Serviço de consulta ao ViaCEP com tipagem `ViaCepAddress` |
| Editar | `src/services/index.ts` | Exportar `cepService` |
| Criar | `src/components/ui/ZipCodeInput.tsx` | Componente de input de CEP com máscara, busca no 8º dígito e feedback de loading |
| Editar | `src/types/models.ts`, `src/types/auth.ts` | Adicionar propriedade opcional `cep` aos tipos |
| Editar | `src/schemas/auth.schema.ts`, `src/schemas/person.schema.ts` | Adicionar validação opcional de CEP nos formulários |
| Editar | `src/components/auth/RegisterForm.tsx` | Incluir campo de CEP com busca e autopreenchimento |
| Editar | `src/components/account/ProfileDataForm.tsx` | Incluir campo de CEP com busca e autopreenchimento |
| Editar | `src/components/checkout/DeliveryAddressCard.tsx` | Exibir endereço formatado completo |
| Editar | `docs/ANDAMENTO.md`, `docs/ARQUITETURA.md` | Documentação atualizada ao fim da tarefa |

---

## 4. Fases e subtarefas

Legenda: `[ ]` a fazer, `[~]` em execução, `[x]` concluída e validada pelo desenvolvedor.

### Fase 1 — Serviço ViaCEP e Componente `ZipCodeInput`

- [x] **1.1** Criar função `maskCep` em `src/lib/masks.ts` e implementar o serviço `src/services/cep.service.ts`
  - **Arquivos:** `src/lib/masks.ts`, `src/services/cep.service.ts`, `src/services/index.ts`
  - **Entrega:** Função de máscara de CEP e serviço tipado `cepService.fetchAddressByCep(cep)` com tratamento de erros.
  - **Verificação:** `tsc --noEmit` e `npm run check` sem erros.
  - **Commit sugerido:** `feat(cep): [VER-64] cria servico de consulta ao viacep`

- [x] **1.2** Implementar o componente `src/components/ui/ZipCodeInput.tsx`
  - **Arquivos:** `src/components/ui/ZipCodeInput.tsx`
  - **Entrega:** Input estilizado com máscara `00000-000`, disparo automático na 8ª tecla, indicador de loading e tratamento de erro visual.
  - **Verificação:** `tsc --noEmit` e `npm run check` sem erros.
  - **Commit sugerido:** `feat(ui): [VER-64] cria componente ZipCodeInput com busca automatica`

### Fase 2 — Integração nos Formulários e Checkout

- [x] **2.1** Integrar `ZipCodeInput` no formulário de cadastro (`RegisterForm.tsx`)
  - **Arquivos:** `src/types/auth.ts`, `src/types/models.ts`, `src/schemas/auth.schema.ts`, `src/components/auth/RegisterForm.tsx`
  - **Entrega:** Campo de CEP adicionado com autopreenchimento de logradouro e seleção de bairro correlato.
  - **Verificação:** `tsc --noEmit` e `npm run check` sem erros.
  - **Commit sugerido:** `feat(auth): [VER-64] integra busca de cep no formulario de cadastro`

- [x] **2.2** Integrar `ZipCodeInput` na edição de perfil (`ProfileDataForm.tsx`)
  - **Arquivos:** `src/schemas/person.schema.ts`, `src/components/account/ProfileDataForm.tsx`
  - **Entrega:** Campo de CEP na aba de dados cadastrais com autopreenchimento similar ao cadastro.
  - **Verificação:** `tsc --noEmit` e `npm run check` sem erros.
  - **Commit sugerido:** `feat(account): [VER-64] integra busca de cep na edicao de perfil`

- [x] **2.3** Atualizar o card de endereço no checkout (`DeliveryAddressCard.tsx`)
  - **Arquivos:** `src/components/checkout/DeliveryAddressCard.tsx`
  - **Entrega:** Exibição do endereço de entrega completo e estruturado (logradouro, bairro, cidade/UF e CEP formatado).
  - **Verificação:** `tsc --noEmit` e `npm run check` sem erros.
  - **Commit sugerido:** `feat(checkout): [VER-64] formata endereco completo no card de entrega`

### Fase Final — Documentação

- [x] **F.1** Atualizar documentação de andamento e arquitetura
  - **Arquivos:** `docs/ANDAMENTO.md`, `docs/ARQUITETURA.md`, `docs/REQUISITOS.md`
  - **Entrega:** Status da VER-64 / VER-62 e documentação técnica do serviço ViaCEP e do componente `ZipCodeInput`.
  - **Verificação:** `tsc --noEmit` e `npm run check` sem erros.
  - **Commit sugerido:** `docs(cep): [VER-64] atualiza documentacao de enderecos com cep`

---

## 5. Registro de execução

| Subtarefa | Status | Verificação (`tsc` e `npm run check`) | Validada pelo desenvolvedor |
|---|---|---|---|
| 1.1 | Concluída | Aprovado sem erros | Sim |
| 1.2 | Concluída | Aprovado sem erros | Sim |
| 2.1 | Concluída | Aprovado sem erros | Sim |
| 2.2 | Concluída | Aprovado sem erros | Sim |
| 2.3 | Concluída | Aprovado sem erros | Sim |
| F.1 | Concluída | Aprovado sem erros | Aguardando validação |

---

## 6. Comandos Git sugeridos para o desenvolvedor

```bash
git checkout -b feat/VER-64-enderecos-com-cep
git add docs/ANDAMENTO.md docs/ARQUITETURA.md docs/REQUISITOS.md .agents/PLAN.md
git commit -m "docs(cep): [VER-64] atualiza documentacao de enderecos com cep"
git push -u origin feat/VER-64-enderecos-com-cep
```

---

## 7. Encerramento da tarefa

- [x] Todos os critérios de aceite atendidos
- [x] `tsc --noEmit` e `npm run check` sem erros
- [x] Documentação atualizada
- [x] Commits organizados por subtarefa
- [ ] Pull Request aberto e subtarefa movida no Jira para **Revisão**
