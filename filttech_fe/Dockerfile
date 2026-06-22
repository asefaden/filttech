FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install -f

COPY . .
RUN npm run build --build-optimizer --vendor-chunk=false --output-path=dist/fil-tech/browser

FROM nginx:stable
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/fil-tech/browser /usr/share/nginx/html

EXPOSE 80
