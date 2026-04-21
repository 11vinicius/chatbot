const { imprimirPedido } = require("./imprimi");
const pool = require("./db");


// =====================================
// WORKER DE IMPRESSÃO (JOB QUEUE)
// =====================================
async function processarFila() {
    try {
        const res = await pool.query(
            `SELECT * FROM fila_impressao 
       WHERE status = 'pendente' 
       ORDER BY criado_em ASC LIMIT 1 FOR UPDATE SKIP LOCKED`
        );

        if (res.rows.length > 0) {
            const job = res.rows[0];
            console.log(`🖨️ Processando impressão do Job #${job.id}...`);

            try {
                await imprimirPedido(job.conteudo);
                await pool.query('UPDATE fila_impressao SET status = $1 WHERE id = $2', ['impresso', job.id]);
                console.log(`✅ Job #${job.id} impresso.`);
            } catch (err) {
                console.error(`❌ Erro na impressora (Job #${job.id}):`, err.message);
                await pool.query('UPDATE fila_impressao SET status = $1, tentativas = tentativas + 1 WHERE id = $2', ['erro', job.id]);
            }
        }
    } catch (err) {
        console.error("Erro no Worker de fila:", err);
    }
}


module.exports = { processarFila };