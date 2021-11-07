FROM node
COPY BattleDucks/ /tmp/myapp/
EXPOSE 3000

ENV PORT=3000
ENV HOST=0.0.0.0

# Build and set up
RUN cd /tmp/myapp && \
    npm install && \
    mkdir -p /var/www/app && \
    mv * /var/www/app/

# Run
CMD cd /var/www/app/myapp && node app.js 3000
