FROM node:14-alpine as build
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --silent
COPY . .
RUN npm run build:prod

# Stage 2 - serve static files
FROM nginx:alpine
COPY --from=build /usr/src/app/dist/tommy /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 4200