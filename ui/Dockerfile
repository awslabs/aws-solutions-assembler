FROM node:13.3.0-alpine as build-stage
RUN mkdir /app
WORKDIR /app
ENV LC_ALL=en_US.UTF-8
COPY ./ ./
RUN apk add --update \
    python \
    python-dev \
    build-base \
  && rm -rf /var/cache/apk/*
RUN yarn install
RUN yarn build

FROM nginx:1.16-alpine
COPY ./config/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build-stage /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]