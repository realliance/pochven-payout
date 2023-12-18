FROM node:current as builder

WORKDIR /build

# Add Files
ADD . .

# Build
RUN yarn install && yarn build

FROM docker.io/nginx:1-alpine

ENV VITE_CLIENT_ID 9d00645fc6c3434bb7a333c13a5be0fe
ENV VITE_REDIRECT_URI https://pochven-payout.connorjc.io/ 

COPY --from=builder /build/dist /usr/share/nginx/html
ADD nginx.conf /etc/nginx/nginx.conf