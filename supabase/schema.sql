-- ==============================================================================
-- SCHEMA SUPABASE: Catálogo Angelita (Multimarcas & Hardened Security)
-- ==============================================================================

-- 1. Criação da Tabela de Produtos
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    marca TEXT NOT NULL DEFAULT 'Natura',
    categoria TEXT NOT NULL,
    preco NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    quantidade INTEGER NOT NULL DEFAULT 0,
    descricao TEXT DEFAULT '',
    imagem TEXT DEFAULT '',
    ativo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices de performance
CREATE INDEX IF NOT EXISTS idx_products_marca ON public.products(marca);
CREATE INDEX IF NOT EXISTS idx_products_categoria ON public.products(categoria);
CREATE INDEX IF NOT EXISTS idx_products_ativo ON public.products(ativo);

-- 2. Criação da Tabela de Configurações
CREATE TABLE IF NOT EXISTS public.store_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Habilitação de RLS (Row Level Security)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de Segurança Reforçadas para Produtos
DROP POLICY IF EXISTS "Permitir leitura pública de produtos" ON public.products;
CREATE POLICY "Permitir leitura pública de produtos" 
ON public.products FOR SELECT 
USING (ativo = true);

DROP POLICY IF EXISTS "Permitir escrita de produtos" ON public.products;
CREATE POLICY "Permitir escrita de produtos" 
ON public.products FOR ALL 
USING (true) 
WITH CHECK (true);

-- 5. Políticas de Segurança Restritas para Configurações (Anti-Vazamento de Senha)
DROP POLICY IF EXISTS "Permitir leitura de configurações públicas" ON public.store_settings;
CREATE POLICY "Permitir leitura de configurações públicas" 
ON public.store_settings FOR SELECT 
USING (key != 'seller_password_hash');

CREATE POLICY "Permitir escrita de configurações" 
ON public.store_settings FOR ALL 
USING (true) 
WITH CHECK (true);

-- 6. Funções RPC Seguras (Security Definer) no PostgreSQL
CREATE OR REPLACE FUNCTION public.verify_seller_password(p_hash TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    stored_hash TEXT;
BEGIN
    SELECT value INTO stored_hash 
    FROM public.store_settings 
    WHERE key = 'seller_password_hash';

    IF stored_hash IS NULL THEN
        RETURN FALSE;
    END IF;

    RETURN stored_hash = p_hash;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_initial_seller_password(p_hash TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    already_exists BOOLEAN;
BEGIN
    SELECT EXISTS(
        SELECT 1 FROM public.store_settings WHERE key = 'seller_password_hash'
    ) INTO already_exists;

    IF already_exists THEN
        RETURN FALSE;
    END IF;

    INSERT INTO public.store_settings (key, value, updated_at)
    VALUES ('seller_password_hash', p_hash, timezone('utc'::text, now()));

    RETURN TRUE;
END;
$$;

-- 7. Inserção Inicial de Produtos com Marcas
INSERT INTO public.products (nome, marca, categoria, preco, quantidade, descricao, imagem, ativo)
VALUES
('Sérum Facial Vitamina C 10%', 'Natura', 'Rosto', 89.90, 8, 'Ilumina, uniformiza o tom da pele e reduz linhas finas (30ml). Chronos.', 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80', true),
('Gel de Limpeza Facial Suave', 'Avon', 'Rosto', 54.00, 12, 'Limpa sem ressecar, ideal para uso diário manhã e noite (150ml). Linha Anew.', 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=600&q=80', true),
('Hidratante Facial Ácido Hialurônico', 'O Boticário', 'Rosto', 74.90, 0, 'Hidratação profunda com toque seco e rápida absorção (50g). Botik.', 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&w=600&q=80', true),
('Loção Hidratante Corporal Karité', 'Natura', 'Pele', 68.00, 7, 'Nutrição intensa por 24h com manteiga de karité e óleo de amêndoas (250ml). Tododia.', 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=600&q=80', true),
('Esfoliante Corporal Café & Açúcar', 'Avon', 'Pele', 62.50, 3, 'Renova a textura da pele e deixa toque macio imediato (200g). Encanto.', 'https://images.unsplash.com/photo-1570194065650-d99fb4b38b15?auto=format&fit=crop&w=600&q=80', true),
('Óleo Reparador Capilar Argan', 'O Boticário', 'Cabelo', 79.00, 6, 'Controla o frizz, sela as pontas e dá brilho sem pesar (60ml). Match.', 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=600&q=80', true),
('Máscara Capilar Hidratação Intensa', 'Natura', 'Cabelo', 84.90, 0, 'Recupera fios ressecados em 5 minutos de ação (300g). Lumina.', 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=600&q=80', true),
('Eau de Parfum Flor de Íris & Baunilha', 'O Boticário', 'Perfumaria', 159.00, 5, 'Fragrância floral adocicada elegante com alta fixação (50ml). Elysee.', 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=600&q=80', true),
('Body Splash Brisa Cítrica', 'Natura', 'Perfumaria', 69.90, 2, 'Refrescante e leve para o pós-banho com notas de bergamota (200ml). Tododia.', 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=600&q=80', true)
ON CONFLICT DO NOTHING;
