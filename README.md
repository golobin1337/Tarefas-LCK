# Tarefas — app interno de gerenciamento de tarefas

App de tarefas estilo Todoist, feito para uso interno de 2 pessoas. Next.js (App Router) +
TypeScript + Tailwind CSS + Supabase (Postgres + Auth).

## Funcionalidades

- Login com e-mail e senha (contas criadas manualmente no Supabase).
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
2. No painel do projeto, vá em **Project Settings > API** e copie:
   - `Project URL`
   - `anon public` key

## 2. Configurar variáveis de ambiente

Copie os valores acima para o arquivo `.env.local` na raiz do projeto (já existe com placeholders):

```
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
```

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

## 4. Criar os 2 usuários

Como o app é só para 2 pessoas, os usuários são criados manualmente:

1. No painel do Supabase, vá em **Authentication > Users > Add user**.
2. Crie os dois usuários com e-mail e senha. Marque **Auto Confirm User** para não precisar de
   confirmação por e-mail.
3. O gatilho `on_auth_user_created` cria automaticamente uma linha em `profiles` para cada
   usuário, usando o e-mail como nome inicial.
4. (Opcional) Atualize o nome de exibição de cada um: no **SQL Editor**, rode:

```sql
update profiles set full_name = 'Seu Nome' where id = 'uuid-do-usuario';
```

Você encontra o `uuid` do usuário na tela de **Authentication > Users**.

## 5. Instalar dependências e rodar localmente

```bash
npm install
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) e entre com um dos e-mails/senhas criados.

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

## Deploy na Vercel (mais tarde)

1. Suba o repositório para o GitHub.
2. Importe o projeto na Vercel.
3. Configure as mesmas variáveis de ambiente (`NEXT_PUBLIC_SUPABASE_URL` e
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`) nas configurações do projeto na Vercel.
4. Deploy.
