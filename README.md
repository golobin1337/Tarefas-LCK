# Tarefas — app interno de gerenciamento de tarefas

App de tarefas estilo Todoist, feito para uso interno de 2 pessoas. Next.js (App Router) +
TypeScript + Tailwind CSS + Supabase (Postgres + Auth).

## Funcionalidades

- Login com e-mail e senha, com autocadastro limitado a 2 contas.
- Adicionar tarefa rapidamente (botão flutuante ou atalho de teclado `N`).
- **Hoje**: atrasadas + tarefas de hoje + o que já foi concluído hoje.
- **Semana**: visão da semana atual agrupada em Atrasadas / Hoje / Amanhã / Resto da semana.
- **Lembretes**: tarefas marcadas como urgentes, destacadas visualmente.
- **Concluídas**: revisão do que foi feito na semana, agrupado por dia.
- **Projetos**: categorias coloridas para organizar as tarefas por área do negócio.
- Atribuição de tarefas a um dos dois usuários (ou sem responsável).
- Busca e filtros por responsável e projeto.
- Tema claro/escuro.

## 1. Criar o projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie um novo projeto (ou use um existente).
2. No painel do projeto, vá em **Project Settings > API Keys** e copie:
   - `Project URL`
   - a chave **publishable** (pública, começa com `sb_publishable_...` ou é o `anon public` JWT em projetos mais antigos)
   - a chave **secret** / **service_role** (privada — nunca vai para o navegador)

## 2. Configurar variáveis de ambiente

Copie os valores acima para o arquivo `.env.local` na raiz do projeto (já existe com placeholders):

```
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-publishable
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role
```

A `SUPABASE_SERVICE_ROLE_KEY` é usada apenas em server actions (nunca chega ao navegador) para
permitir que a tela `/signup` crie as 2 contas do time sem precisar mexer no painel do Supabase.
Ao publicar na Vercel, cadastre-a como variável do tipo **Secret** (não **Config**, que é para
valores públicos).

## 3. Rodar as migrations

O arquivo `supabase/migrations/0001_init.sql` cria as tabelas (`profiles`, `projects`, `tasks`),
o gatilho que cria automaticamente um perfil quando um usuário é criado, as políticas de RLS e
alguns projetos de exemplo.

Opção A — pelo **SQL Editor** do painel do Supabase:

1. Abra **SQL Editor** no painel do projeto.
2. Cole o conteúdo de `supabase/migrations/0001_init.sql` e execute.

Opção B — pela **Supabase CLI** (se preferir versionar migrations via CLI):

```bash
npx supabase login
npx supabase link --project-ref SEU_PROJECT_REF
npx supabase db push
```

## 4. Instalar dependências e rodar localmente

```bash
npm install
npm run dev
```

## 5. Criar os 2 usuários

Acesse [http://localhost:3000/signup](http://localhost:3000/signup) (ou `/signup` no domínio da
Vercel, depois do deploy) e crie as duas contas por lá (nome, e-mail e senha). A conta já entra
confirmada e ativa — não precisa mexer no painel do Supabase nem confirmar e-mail. Depois que a
segunda conta for criada, a tela de cadastro se bloqueia automaticamente (limite de 2 contas),
e novas contas só podem ser criadas apagando um usuário existente em **Authentication > Users**
no painel do Supabase.

## Estrutura do projeto

```
app/
  (auth)/login/        tela de login
  (app)/                rotas protegidas (sidebar + tema)
    hoje/
    semana/
    lembretes/
    concluidas/
    projetos/
      [id]/
components/
  ui/                   componentes genéricos (modal)
  tasks/                lista, formulário, filtros e views de tarefas
  projects/             cartão e formulário de projeto
  layout/               sidebar, topo mobile, toggle de tema
lib/
  supabase/             clientes Supabase (browser, server, middleware)
  actions/              server actions de tarefas e projetos
  queries.ts            leitura de dados (server)
  types.ts              tipos compartilhados
supabase/migrations/    SQL das tabelas, RLS e trigger de perfil
```

## Deploy na Vercel

1. Suba o repositório para o GitHub.
2. Importe o projeto na Vercel.
3. Configure as mesmas variáveis de ambiente nas configurações do projeto na Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` como tipo **Config** (públicas).
   - `SUPABASE_SERVICE_ROLE_KEY` como tipo **Secret** (privada).
   - Marque Production, Preview e Development nas três.
4. Deploy (ou Redeploy, se as variáveis foram adicionadas depois do primeiro deploy).
