docker compose down                                            
rm -rf .wwebjs_auth_docker .wwebjs_cache_docker
docker compose up --build -d
docker compose logs -f  
nc -zv 192.168.0.18 9100  
node chatbot.js  