FROM node:20 as build
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:20 as production
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
COPY ./languages ./languages
RUN corepack enable
RUN pnpm install --frozen-lockfile --prod

USER node


COPY --from=build /app/dist /app/dist
CMD ["pnpm", "start"]