FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html /usr/share/nginx/html/index.html
COPY world_cup_player_tables_collected.csv /usr/share/nginx/html/world_cup_player_tables_collected.csv
COPY assets /usr/share/nginx/html/assets

EXPOSE 8080

