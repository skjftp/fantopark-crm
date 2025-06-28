# Use nginx to serve the static files
FROM nginx:alpine

# Copy the already built files
COPY build/ /usr/share/nginx/html/

# Configure nginx to listen on port 8080 (required by Cloud Run)
RUN sed -i 's/listen       80;/listen       8080;/g' /etc/nginx/conf.d/default.conf

# Ensure nginx handles React Router properly
RUN echo 'location / { try_files $uri /index.html; }' > /tmp/try_files.conf && \
    sed -i '/location \/ {/r /tmp/try_files.conf' /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
