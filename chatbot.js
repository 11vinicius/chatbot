// =====================================
// IMPORTAÇÕES
// =====================================
const qrcode = require("qrcode-terminal");
const { Client, MessageMedia, LocalAuth } = require("whatsapp-web.js");

// =====================================
// CONFIGURAÇÃO DO CLIENTE
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
  console.log("📲 Escaneie o QR Code abaixo:");
  qrcode.generate(qr, { small: true });
});

// =====================================
// WHATSAPP CONECTADO
// =====================================
client.on("ready", () => {
  console.log("✅ Tudo certo! WhatsApp conectado.");
});

// =====================================
// DESCONEXÃO
// =====================================
client.on("disconnected", (reason) => {
  console.log("⚠️ Desconectado:", reason);
});

// =====================================
// INICIALIZA
// =====================================
client.initialize();

// =====================================
// FUNÇÃO DE DELAY
// =====================================
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// =====================================
// FUNIL DE MENSAGENS (SOMENTE PRIVADO)
// =====================================
client.on("message", async (msg) => {
  try {
    // ❌ IGNORA QUALQUER COISA QUE NÃO SEJA CONVERSA PRIVADA
    if (!msg.from || msg.from.endsWith("@g.us")) return;

    const chat = await msg.getChat();
    if (chat.isGroup) return; // blindagem extra

    const texto = msg.body ? msg.body.trim().toLowerCase() : "";

    // Função de digitação
    const typing = async () => {
      await delay(2000);
      await chat.sendStateTyping();
      await delay(2000);
    };

    // =====================================
    // MENSAGEM INICIAL
    // =====================================
    if (/^(menu|oi|olá|ola|bom dia|boa tarde|boa noite)$/i.test(texto)) {

      await typing();

      const agora = new Date();
      const hora = agora.getHours();
      const minuto = agora.getMinutes();

      const aberto = (hora > 18) || (hora === 18 && minuto >= 30);

      // 🚫 FORA DO HORÁRIO
      if (!aberto) {
        await client.sendMessage(
          msg.from,
          `🍕 *JET PIZZA DELIVERY* 🍕
    
    😄 Olá!
    
    No momento estamos fechados.
    
    🕐 Nosso atendimento começa a partir das *18:30*.\n
    
    Já já estaremos prontos pra te atender com pizzas quentinhas e deliciosas 🔥🍕\n
    
    Aguarde a gente 😉`
        );
        return; // 🔥 IMPORTANTE: para aqui
      }

      // ✅ DENTRO DO HORÁRIO
      let saudacao = "Olá";

      if (hora >= 5 && hora < 12) saudacao = "Bom dia";
      else if (hora < 18) saudacao = "Boa tarde";
      else saudacao = "Boa noite";

      await client.sendMessage(
        msg.from,
        `🍕 *JET PIZZA DELIVERY* 🍕
    
    ${saudacao}! 👋
    
    Que bom ter você por aqui 😄
    
    🔥 Trabalhamos com pizzas quentinhas, recheio caprichado e entrega rápida!
    
    📋 *Confira nosso cardápio e faça seu pedido:*
    👉 https://viniviegas.com.br/
    
    💥 Promoções do dia podem estar rolando!
    Fica de olho 👀
    
    🕐 Atendimento rápido
    🚀 Entrega ágil
    ❤️ Feito com qualidade
    
    Se precisar, é só mandar mensagem aqui 😉`
      );
    }


  } catch (error) {
    console.error("❌ Erro no processamento da mensagem:", error);
  }
});
