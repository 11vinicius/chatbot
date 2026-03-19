viniciuscasarlemes@MacBook-Air-de-vinicius chatboot % docker compose down                                            
rm -rf .wwebjs_auth_docker .wwebjs_cache_docker
docker compose up --build -d
docker compose logs -f  