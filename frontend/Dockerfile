FROM node:22-slim

RUN npm install -g pm2

ENV PNPM_VERSION=10.7.0
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY shared-models/package.json ./shared-models/
COPY frontend/package.json ./frontend/

RUN pnpm install --frozen-lockfile

COPY shared-models ./shared-models
COPY frontend ./frontend

RUN cd shared-models && pnpm run build
RUN cd frontend && pnpm run build

WORKDIR /app/frontend
EXPOSE 3000
#CMD ["pnpm", "start"]
CMD ["pm2-runtime", "start", "pnpm", "--", "start"]
