const { Pool } = require("pg");

const pool = new Pool({
    host: "localhost",    // se rodar Node fora do Docker; use "db" se dentro de outro container
    port: 5433,           // porta externa (localhost) ou 5432 se host="db"
    user: "user",
    password: "password",
    database: "chatboot",
});

module.exports = pool;