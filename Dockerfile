FROM node:20.19.0-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

# Use official nginx image as the base image
FROM nginx:latest

# copy the build files to nginx server  html directory
# dist:distribution folder
COPY --from=build /app/dist/to-do-app-frontend/browser /usr/share/nginx/html

# Copy the Nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080
