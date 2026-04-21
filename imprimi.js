const net = require('net');
const iconv = require('iconv-lite');

const IP_ANDROID = '192.168.0.18';
const PORTA = 9100;

function imprimirPedido(texto) {
    // 1. LIMPEZA E TRATAMENTO (Para evitar o erro do bullet point •)
    const textoTratado = texto
        .replace(/[•\u2022]/g, '*') // Troca o bullet point por asterisco
        .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove caracteres invisíveis do WhatsApp
        .replace(/[^\x00-\x7F\xA0-\xFF]/g, "") // Remove qualquer coisa que não seja ASCII ou Latim básico
        .normalize('NFD') // Decompõe acentos para garantir compatibilidade
        .replace(/[\u0300-\u036f]/g, ""); // Remove os acentos se a impressora for muito antiga

    const socket = new net.Socket();
    socket.setTimeout(5000);

    socket.connect(PORTA, IP_ANDROID, () => {
        const reset = '\x1b\x40';
        const centro = '\x1b\x61\x01';
        const esquerda = '\x1b\x61\x00';
        const negritoOn = '\x1b\x45\x01';
        const negritoOff = '\x1b\x45\x00';

        // Seleciona a Code Page 850 na impressora (Comando ESC t 2)
        const setCodePage850 = '\x1b\x74\x02';

        socket.write(reset);
        socket.write(setCodePage850);

        socket.write(centro);
        socket.write(negritoOn + 'JET PIZZA DELIVERY\n' + negritoOff);
        socket.write('--------------------------------\n');

        socket.write(esquerda);

        // CORREÇÃO AQUI: 'cp850' em vez de 'pc850'
        const bufferTexto = iconv.encode(textoTratado + '\n', 'cp850');
        socket.write(bufferTexto);

        socket.write('\n\n\n\n');
        socket.write('\x1d\x56\x00'); // Corte

        socket.end();
    });

    socket.on('error', (err) => {
        console.error('❌ Erro Impressora:', err.message);
    });
}

module.exports = { imprimirPedido };