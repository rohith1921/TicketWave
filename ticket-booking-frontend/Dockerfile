# 1. Build Stage
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# 🔒 SECURITY STEP: Accept secrets as arguments during build
ARG VITE_RAZORPAY_KEY_ID
ARG VITE_API_BASE_URL

# Set them as Environment Variables for Vite
ENV VITE_RAZORPAY_KEY_ID=$VITE_RAZORPAY_KEY_ID
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Now build the app (Vite will read the ENV vars above)
RUN npm run build

# 2. Production Stage (Nginx)
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# (Optional) Copy custom nginx config if you have one
# COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]