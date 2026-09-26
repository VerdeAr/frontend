# =============================================================
# Stage 1 — Builder: instala dependências e gera o build estático
# =============================================================
FROM node:22-alpine AS builder

WORKDIR /app

# ARG permite passar a URL do backend em tempo de build (vite usa em compile time)
ARG VITE_API_BASEURL
ENV VITE_API_BASEURL=$VITE_API_BASEURL

# Copia os manifestos de dependência primeiro para aproveitar o cache do Docker
COPY package*.json ./

# Instala todas as dependências
RUN npm ci

# Copia o restante do código-fonte
COPY . .

# Gera o build estático (saída em ./dist)
RUN npm run build

# =============================================================
# Stage 2 — Runner: Nginx Alpine servindo os arquivos estáticos
# =============================================================
FROM nginx:1.27-alpine AS runner

# Remove a configuração padrão do Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copia a configuração customizada para SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia os arquivos estáticos gerados no stage anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Expõe a porta 80
EXPOSE 80

# Inicia o Nginx em modo foreground (necessário para containers)
CMD ["nginx", "-g", "daemon off;"]
