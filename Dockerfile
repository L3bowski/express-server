FROM node:8.11.3-alpine
RUN mkdir -p /var/www/app
WORKDIR /var/www/app
COPY . .
RUN npm install
EXPOSE 3000
CMD ["npm", "start"]