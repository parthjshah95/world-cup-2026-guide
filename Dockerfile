FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html /usr/share/nginx/html/index.html
COPY team.html /usr/share/nginx/html/team.html
COPY players.html /usr/share/nginx/html/players.html
COPY compare.html /usr/share/nginx/html/compare.html
COPY world_cup_player_tables_collected.csv /usr/share/nginx/html/world_cup_player_tables_collected.csv
COPY assets /usr/share/nginx/html/assets
COPY data /usr/share/nginx/html/data
COPY js /usr/share/nginx/html/js
COPY styles /usr/share/nginx/html/styles

EXPOSE 8080
