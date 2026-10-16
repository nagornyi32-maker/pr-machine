FROM node:22-alpine
WORKDIR /app
COPY --chown=node:node . .
RUN mkdir -p data && chown node:node data
USER node
ENV HOST=0.0.0.0
EXPOSE 3000
CMD ["node","server.mjs"]
