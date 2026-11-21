# 🌸 Catálogo Angelita — Cosméticos Multimarcas

Catálogo digital interativo e moderno para venda de cosméticos multimarcas (**Natura**, **Avon** e **O Boticário**), com vitrine pública para clientes e painel administrativo protegido por senha para a vendedora gerenciar estoque, produtos, categorias e número de atendimento.

---

## ✨ Funcionalidades

### 🛍️ Para o Cliente (Vitrine Pública)
- **Boas-vindas personalizadas**: *"Seja bem-vinda ao catálogo da Angelita!"*
- **Filtros rápidos por Marca**: Seleção visual em botões arredondados para **Todas**, **Natura**, **Avon** e **O Boticário**.
- **Filtros por Categoria**: Perfumaria, Maquiagem, Cuidados Diários, Cabelos, Kits e Presentes, etc.
- **Filtros por Estoque**: Todos, Pronta Entrega ou Por Encomenda.
- **Busca em tempo real**: Localização instantânea por nome ou descrição do produto.
- **Integração direta com WhatsApp**: Botão flutuante de atendimento e botão de pedido com mensagem pré-formatada do produto desejado.

### 💼 Para a Vendedora (Painel Administrativo `/vendedora`)
- **Acesso Seguro**: Autenticação por senha mestra com hash criptográfico SHA-256 + salt e proteção contra força bruta (bloqueio temporário após tentativas incorretas).
- **Gestão de Estoque Ágil**: Botões de incremento e decremento rápido (`+` / `-`) diretamente no grid de produtos.
- **Controle de Visibilidade**: Ativação ou desativação de produtos no site com um clique.
- **Adição e Edição de Produtos**: Cadastro com seleção de Marca, Categoria, Preço, Quantidade em estoque e Imagem.
- **Upload de Fotos Otimizado**: Permite selecionar fotos da galeria ou tirar na hora pela câmera, com **compressão automática no navegador** (reduz imagens pesadas para ~70KB em JPEG sem perda de qualidade visual).
- **Gerenciador de Categorias**: Criação, renomeação e exclusão dinâmica de categorias, com atualização automática dos produtos vinculados.
- **Configuração do WhatsApp de Atendimento**: Permite alterar o número de telefone que recebe os pedidos a qualquer momento diretamente pelo painel.

---

## 🛡️ Segurança Implementada

- **Criptografia Web Crypto**: Hashes SHA-256 com salting aleatório.
- **Proteção contra Brute-Force**: Bloqueio progressivo de 5 minutos após tentativas inválidas repetidas.
- **Sanitização de Entradas (Anti-XSS)**: Higienização rigorosa de textos e validação estrita de URLs de imagens.
- **Cabeçalhos HTTP de Proteção**:
  - `X-Frame-Options: DENY` (Anti-Clickjacking)
  - `X-Content-Type-Options: nosniff` (Anti-MIME Sniffing)
  - `Referrer-Policy: strict-origin-when-cross-origin`

---

## 🚀 Tecnologias Utilizadas

- **Frontend**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Dev Server**: [Vite](https://vitejs.dev/)
- **Estilização**: [Tailwind CSS](https://tailwindcss.com/)
- **Ícones**: [Lucide React](https://lucide.dev/)
- **Roteamento**: [React Router](https://reactrouter.com/)
- **Backend / Database (Opcional)**: [Supabase](https://supabase.com/) com fallback automático e tolerante a falhas para armazenamento local seguro.

---

## 💻 Como Rodar Localmente

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/Apollonic/catalogo-angelita.git
   cd catalogo-angelita
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

4. **Para gerar a versão de produção:**
   ```bash
   npm run build
   ```

---

## 🌐 Deploy Contínuo (CI/CD) no Netlify

O repositório já inclui o arquivo `netlify.toml` pré-configurado com regras de build, cabeçalhos de segurança e redirecionamentos SPA.

Para conectar ao Netlify:
1. Acesse [app.netlify.com](https://app.netlify.com).
2. Clique em **Add new site** > **Import an existing project**.
3. Selecione **GitHub** e escolha o repositório `Apollonic/catalogo-angelita`.
4. As configurações de build serão detectadas automaticamente (`npm run build` e diretório `dist`).
5. A partir de então, qualquer alteração enviada para o GitHub atualizará o site automaticamente!
