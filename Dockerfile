# ---- Etapa 1: build ----
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --non-interactive
COPY . .
RUN yarn build --configuration production

# Copia la carpeta que contiene index.html a /out, sin importar la versión de Angular
RUN mkdir -p /out && \
    cp -r "$(dirname "$(find /app/dist -name index.html | head -n 1)")"/. /out/

# ---- Etapa 2: nginx ----
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /out/ /usr/share/nginx/html/
EXPOSE 80