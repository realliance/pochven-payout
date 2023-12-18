FROM node:current as builder

WORKDIR /build

# Add Files
ADD . .

# Build
RUN yarn install && yarn build

FROM docker.io/nginx:1-alpine

COPY --from=builder /build/dist /usr/share/nginx/html
ADD nginx.conf /etc/nginx/nginx.conf