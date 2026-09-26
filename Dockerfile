FROM node:24-alpine
WORKDIR /app
COPY package* ./
RUN npm ci && npm install -g serve
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
