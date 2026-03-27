// =====================================
// IMPORTAÇÕES
// =====================================
const qrcode = require("qrcode-terminal");
const { Client, LocalAuth } = require("whatsapp-web.js");
const pool = require("./db"); // Conexão com Postgres

// =====================================
// CLIENTE
// =====================================
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--single-process",
    ],
  },
});

// =====================================
// QR CODE
// =====================================
client.on("qr", (qr) => {
  console.log("📲 Escaneie o QR Code:");
  qrcode.generate(qr, { small: true });
});

// =====================================
// READY
// =====================================
client.on("ready", () => {
  console.log("✅ WhatsApp conectado!");
});

// =====================================
// DESCONECTADO
// =====================================
client.on("disconnected", (reason) => {
  console.log("⚠️ Desconectado:", reason);
});

// =====================================
// INICIALIZA
// =====================================
client.initialize();

// =====================================
// DELAY
// =====================================
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// =====================================
// CONTROLE DE ATENDIMENTO
// =====================================
const atendidos = new Map();
const TEMPO_RESET = 1000 * 60 * 10; // 10 minutos

// =====================================
// FUNIL
// =====================================
client.on("message", async (msg) => {
  try {
    if (
      msg.fromMe ||
      msg.from === "status@broadcast" ||
      msg.from?.endsWith("@g.us")
    ) return;

    const chat = await msg.getChat();
    if (chat.isGroup) return;

    const numero = msg.from;
    const texto = (msg.body || "").trim().toLowerCase();

    const agora = Date.now();
    const ultimo = atendidos.get(numero);
    const primeiraInteracao = !ultimo || agora - ultimo > TEMPO_RESET;

    const typing = async (tempo = 1500) => {
      await chat.sendStateTyping();
      await delay(tempo);
    };

    const data = new Date();
    const hora = data.getHours();
    const minuto = data.getMinutes();
    const aberto = hora > 18 || (hora === 18 && minuto >= 30);

    // =====================================
    // FORA DO HORÁRIO
    // =====================================
    if (!aberto && primeiraInteracao) {
      atendidos.set(numero, agora);
      await typing();
      await client.sendMessage(
        numero,
        `
        🍕 *JET PIZZA DELIVERY*
      
        😄 Olá!
        
        No momento estamos fechados.
        
        🕐 Abrimos às *18:30*.
        
        🔥 Já já estaremos com pizzas quentinhas!
        
        👉 Enquanto isso, acompanha a gente no Instagram:
         https://www.instagram.com/_viniciuslemes/

        👀 Postamos promoções e novidades por lá!
        
        Segura a fome aí 😅🍕
        `
      );
      return;
    }

    // =====================================
    // MENSAGEM INICIAL DENTRO DO HORÁRIO
    // =====================================
    if (/^(menu|oi|olá|ola|bom dia|boa tarde|boa noite)$/i.test(texto) && primeiraInteracao) {
      atendidos.set(numero, agora);
      await typing();

      let saudacao = "Olá";
      if (hora >= 5 && hora < 12) saudacao = "Bom dia";
      else if (hora < 18) saudacao = "Boa tarde";
      else saudacao = "Boa noite";

      await client.sendMessage(
        numero,
        `
        🍕 *JET PIZZA DELIVERY*

        ${saudacao}! 👋

        😄 Bem-vindo!

        🔥 Pizzas quentinhas
        🧀 Recheio caprichado
        🚀 Entrega rápida

        📋 Cardápio:
        👉 https://viniviegas.com.br/

        💥 Fica de olho no status 👀

        Se quiser pedir, só mandar aqui 😉
        `
      );
      return;
    }

    // =====================================
    // CONFIRMAÇÃO DE PEDIDO
    // =====================================
    if (texto.includes("total") && texto.includes("pedido") && texto.includes("itens")) {
      await typing();

      // Atualiza/insere pedido no Postgres
      await pool.query(
        `
        INSERT INTO pedidos(numero, quantidade)
        VALUES($1, 1)
        ON CONFLICT (numero)
        DO UPDATE SET quantidade = pedidos.quantidade + 1;
        `,
        [numero]
      );

      await client.sendMessage(
        numero,
        `
        🧾 *PEDIDO CONFIRMADO!*
        
        🍕 Perfeito! Seu pedido foi recebido com sucesso!
          
        🚀 Já estamos preparando tudo com muito capricho
        🔥 Sua pizza sai quentinha direto do forno
          
        ⏱ *Tempo médio de preparo e entrega: 60 a 90 minutos*
          
        🙏 Obrigado pela preferência!
          
        📲 Aproveita e segue a gente no Instagram pra não perder promoções:
        👉 https://www.instagram.com/_viniciuslemes/
          
        💥 Sempre postamos ofertas exclusivas por lá 👀
        `
      );

      return;
    }

    // =====================================
    // FALLBACK
    // =====================================
    await typing(1000);

  } catch (err) {
    console.error("❌ Erro:", err);
  }
});