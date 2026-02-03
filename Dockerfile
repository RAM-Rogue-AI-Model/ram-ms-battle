
FROM node:20-alpine

WORKDIR /app

RUN npm install -g pnpm@10.13.1 tsx

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma
COPY src ./src
COPY prisma.config.ts tsconfig.json ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN chmod +x entrypoint.sh

CMD ["./entrypoint.sh"]
