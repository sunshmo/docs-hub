FROM node:18-slim

RUN npm install -g pm2

ENV DEBIAN_FRONTEND=noninteractive
ENV EXIFTOOL_PATH=/usr/bin/exiftool
ENV FFMPEG_PATH=/usr/bin/ffmpeg
ENV PNPM_VERSION=10.7.0

RUN apt-get update && \
    (apt-get install -y --no-install-recommends \
        python3 \
        python3-pip \
        ffmpeg \
        exiftool \
        git \
    || (echo "Retrying apt-get install..." && sleep 5 && apt-get update && apt-get install -y --no-install-recommends \
        python3 \
        python3-pip \
        ffmpeg \
        exiftool \
        git)) && \
    rm -rf /var/lib/apt/lists/*

RUN git clone https://github.com/microsoft/markitdown.git /markitdown
RUN pip3 install --break-system-packages \
    /markitdown/packages/markitdown[all] \
    /markitdown/packages/markitdown-sample-plugin

RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY shared-models/package.json ./shared-models/
COPY backend/package.json ./backend/

RUN pnpm install --frozen-lockfile

COPY shared-models ./shared-models
COPY backend ./backend

RUN cd shared-models && pnpm run build
RUN cd backend && pnpm run build

WORKDIR /app/backend

RUN markitdown --version

EXPOSE 3456
#CMD ["pnpm", "start"]
CMD ["pm2-runtime", "start", "pnpm", "--", "start"]
