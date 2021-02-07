FROM node:14.15.3-buster as builder
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --pure-lockfile --network-timeout 600000
COPY ./dataParser.js ./
COPY ./gulpfile.js ./
COPY src/ ./src/
RUN yarn build

FROM node:14.15.3-buster
WORKDIR /app
RUN yarn global add http-server
COPY --from=builder /app/dist /app/dist
EXPOSE 3000
CMD ["http-server", "-p", "3000", "/app/dist"]
