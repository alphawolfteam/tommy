FROM node:14-alpine AS build
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --silent
COPY . .
RUN npm run build

FROM node:14-alpine
WORKDIR /usr/src/app
ENV NODE_ENV=production
COPY --from=build ./usr/src/app/dist ./dist
COPY --from=build ./usr/src/app/package.json ./
RUN npm install --production --silent
EXPOSE 80
CMD npm start