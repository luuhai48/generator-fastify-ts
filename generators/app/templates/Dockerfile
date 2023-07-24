FROM node:18-alpine as build
WORKDIR /app
ADD package.json yarn.lock /app/
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build


FROM node:18-alpine as dependencies
WORKDIR /app
ADD package.json yarn.lock /app/
RUN yarn install --frozen-lockfile --production


FROM node:18-alpine
ENV NODE_ENV production
WORKDIR /app
RUN apk add --update --no-cache dumb-init
COPY --from=dependencies --chown=node:node /app/node_modules /app/node_modules
COPY --from=build --chown=node:node /app/dist /app/dist<% if (plugins.includes('mailer')) {%>
COPY src/template/ /app/src/template/
<%}%><% if (db === 'postgresql') {%>COPY ./prisma/ /app/prisma/<%}%>
USER node
EXPOSE 8080
CMD dumb-init node dist/index.js
