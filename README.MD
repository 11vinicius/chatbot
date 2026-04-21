docker compose down                                            
rm -rf .wwebjs_auth_docker .wwebjs_cache_docker
docker compose up --build -d
docker compose logs -f  
nc -zv 192.168.0.18 9100  
node chatbot.js  

-- 1. Criar a tabela de Pedidos
-- Esta tabela armazena o histórico de mensagens e controla a contagem por número
CREATE TABLE IF NOT EXISTS pedidos (
    id SERIAL PRIMARY KEY,           -- ID único sequencial para cada registro
    numero TEXT UNIQUE NOT NULL,     -- O número do WhatsApp (usado para o ON CONFLICT)
    nome TEXT,                       -- Nome do contato capturado
    corpo_pedido TEXT,               -- Conteúdo integral da mensagem
    quantidade INTEGER DEFAULT 1,    -- Contador de pedidos por número
    data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Data e hora automática
);

-- 2. (Opcional) Tabela de Clientes para uma organização mais limpa
-- Caso queira separar o cadastro do cliente do registro de cada pedido
CREATE TABLE IF NOT EXISTS clientes (
    celular TEXT PRIMARY KEY,
    nome TEXT,
    total_pedidos INTEGER DEFAULT 0,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS fila_impressao (
    id SERIAL PRIMARY KEY,
    conteudo TEXT NOT NULL,
    status TEXT DEFAULT 'pendente', -- pendente, impresso, erro
    tentativas INTEGER DEFAULT 0,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

