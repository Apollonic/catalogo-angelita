# Task Plan: Base do Catálogo Online (React + Vite + Tailwind CSS)

> **Context:** Criação da base estrutural e modular do catálogo online inspirado no protótipo de referência (`referencias/aura_cosm_ticos_vitrine_de_beleza.html`), configurado como um modelo flexível e expansível para futuras alterações de marca e funcionalidades.

---

## 🎯 Escopo da Base (Fase 1) - CONCLUÍDO

1. **Scaffold do Projeto**:
   - React 18 + TypeScript + Vite + Tailwind CSS
   - Configuração de paths, build e estilos globais
2. **Camada de Configuração & Dados (Desacoplada)**:
   - `src/config/store.ts`: Configurações da loja (nome, slogan, WhatsApp, categorias)
   - `src/types/product.ts`: Tipagem completa para produtos e filtros
   - `src/data/products.ts`: Mock de produtos de referência tipado e estruturado
3. **Componentização Modular**:
   - `Header`: Cabeçalho com identidade visual acolhedora e personalizável
   - `SearchBar`: Busca instantânea com botão de limpar
   - `CategoryFilter`: Filtro por abas de categorias
   - `StockFilter`: Filtro toggle "Mostrar apenas disponíveis"
   - `ProductCard`: Card do produto com badge de disponibilidade, imagem (fallback inteligente) e botão de WhatsApp dinâmico
   - `ProductGrid`: Grade responsiva com estado vazio (Empty State)
   - `FloatingWhatsApp`: Botão flutuante de atendimento geral
4. **Utilitários**:
   - `src/utils/whatsapp.ts`: Geração padronizada de links de WhatsApp (para compras e reposição)
5. **Verificação & Teste**:
   - Dependências instaladas com sucesso
   - Compilação de tipos e empacotamento Vite validados com `npm run build` (sucesso)

---

## 📋 Lista de Tarefas

- [x] **Task 1: Configurar estrutura base e dependências** (`package.json`, `vite.config.ts`, `tailwind.config.js`, `tsconfig.json`, `index.html`)
- [x] **Task 2: Configurar dados e tipagem** (`src/types/product.ts`, `src/config/store.ts`, `src/data/products.ts`)
- [x] **Task 3: Implementar utilitários** (`src/utils/whatsapp.ts`) e estilos base (`src/index.css`)
- [x] **Task 4: Desenvolver componentes modulares** (`Header`, `SearchBar`, `CategoryFilter`, `StockFilter`, `ProductCard`, `ProductGrid`, `FloatingWhatsApp`)
- [x] **Task 5: Integrar tela principal** (`src/App.tsx`, `src/main.tsx`) com estado reativo de busca e filtros
- [x] **Task 6: Instalar dependências, validar compilação de tipos e build de produção**
