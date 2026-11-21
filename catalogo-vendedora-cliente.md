# Plano do Projeto: Catálogo Duplo (Clientes & Painel da Vendedora)

> **Arquivo:** `catalogo-vendedora-cliente.md`  
> **Status:** Concluído com Sucesso ✅  
> **Arquitetura:** React 18 + TypeScript + Vite + Tailwind CSS + React Router + Supabase  
> **Inspiração:** Protótipo Lovable (`https://lovable.dev/preview/NkmOPOzcVExNbQ8chCjO4OFWvEaQWRKQ`)

---

## 🎯 1. Visão Geral e Objetivos

O projeto foi implementado com uma plataforma de catálogo online para cosméticos com **duas experiências distintas**:

1. **Visão do Cliente (Pública)**:
   - Vitrine de produtos elegante, acolhedora e responsiva em `/`.
   - Informações em tempo real: produtos disponíveis, quantidade em estoque (*"Disponível"*, *"Últimas X unidades"*, *"Esgotado"*) e preços formatados em Real (`R$`).
   - Página de detalhes de cada produto em `/produto/:id` com fotos ampliadas e descrição detalhada.
   - Integração com WhatsApp: botão *"Pedir pelo WhatsApp"* para itens em estoque e *"Avise-me pelo WhatsApp"* para itens esgotados, com mensagens inteligentes pré-formatadas.
   - Link discreto no rodapé para a área da vendedora.

2. **Visão da Vendedora (Área de Gestão com Senha)**:
   - Acesso simplificado em `/vendedora` **sem necessidade de login/e-mail**, protegido exclusivamente por **senha mestra**.
   - **Fluxo de Primeiro Acesso**: Se a senha ainda não estiver configurada, o sistema solicita a criação da senha mestra.
   - **Painel de Controle em Tempo Real** em `/vendedora/painel` (rota protegida):
     - Contador analítico de total de produtos e somatório de unidades em estoque.
     - Filtros por categoria e busca interna.
     - Ajuste rápido de estoque inline (botões `+` e `−` com atualização instantânea).
     - Controle de visibilidade / disponibilidade (*Toggle Switch* "Mostrar no site").
     - Edição direta de preços e modal de criação (`+ Novo produto`) e edição de produtos.
     - Remoção de produtos com confirmação e alertas (*toast notifications*).

3. **Sincronização em Nuvem (Supabase)**:
   - Suporte completo a banco Supabase com script SQL pronto (`supabase/schema.sql`).
   - Modo de resiliência automático: opera graciosamente em modo local com `localStorage` caso as credenciais do Supabase ainda não tenham sido inseridas no `.env`.

---

## 🏗️ 2. Arquitetura do Sistema e Modelo de Dados

### 2.1 Schema do Banco de Dados (Supabase / PostgreSQL)

Arquivo criado: [supabase/schema.sql](file:///c:/Users/apoll/OneDrive/Desktop/projetos/cat%C3%A1logo/supabase/schema.sql)
- Tabela `products` (id, nome, categoria, preco, quantidade, descricao, imagem, ativo, timestamps)
- Tabela `store_settings` (key, value, updated_at)
- Índices de performance e políticas RLS de leitura/escrita abertas para chave pública anon.
- Inserção inicial automática dos 9 produtos da referência.

---

## 🗺️ 3. Roteamento e Estrutura de Páginas (`react-router-dom`)

```
/                       -> HomePage (Catálogo público para clientes)
/produto/:id            -> ProductDetailPage (Detalhes do produto + CTA WhatsApp)
/vendedora              -> SellerAuthPage (Validação ou primeiro cadastro de senha)
/vendedora/painel       -> SellerDashboardPage (Painel protegido de estoque e preços)
```

---

## 📋 4. Status de Execução das Tarefas

- [x] **Fase 1: Dependências e Configuração de Infraestrutura**
  - [x] Instalação de `react-router-dom` e `@supabase/supabase-js`
  - [x] Cliente Supabase tipado em `src/services/supabase.ts` com fallback automático para modo local
  - [x] Script `supabase/schema.sql` pronto para execução
  - [x] Criação de `.env.example`
- [x] **Fase 2: Serviços de Dados e Autenticação por Senha**
  - [x] `src/services/productsService.ts`: listar produtos ativos (cliente), listar todos (vendedora), atualizar estoque inline, alternar visibilidade, criar, editar e excluir
  - [x] `src/services/authService.ts`: checagem de primeiro acesso, criação de senha, validação de senha e gestão de sessão no `sessionStorage`
- [x] **Fase 3: Roteamento e Visão do Cliente**
  - [x] Configuração de rotas em `src/App.tsx`
  - [x] `src/pages/HomePage.tsx`: Hero elegante, contadores de categorias, busca e filtros
  - [x] `src/pages/ProductDetailPage.tsx`: rota dinâmica `/produto/:id` com foto ampliada e botão WhatsApp
  - [x] `src/components/ProductCard.tsx`: badges de estoque dinâmicos (`>=5` Disponível, `1-4` Últimas X un., `0` Esgotado)
- [x] **Fase 4: Autenticação da Vendedora e Painel de Gestão**
  - [x] `src/pages/SellerAuthPage.tsx`: detecção de primeiro acesso (criar senha) ou login direto
  - [x] `src/components/ProtectedRoute.tsx`: proteção contra acessos sem senha
  - [x] `src/pages/SellerDashboardPage.tsx`: métricas em tempo real, lista de produtos, controles rápidos `+`/`−` e switch de visibilidade
  - [x] `src/components/ProductFormModal.tsx`: modal para cadastrar novo produto ou editar existente
- [x] **Fase 5: Verificação e Build**
  - [x] `npm run build` executado com sucesso e zero erros de TypeScript.
