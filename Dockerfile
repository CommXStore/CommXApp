# syntax = docker/dockerfile:1

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=22
FROM node:${NODE_VERSION}-slim AS base

LABEL fly_launch_runtime="Next.js"

# Next.js app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"


# Throw-away build stage to reduce size of final image
FROM base AS build

# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential pkg-config python3

# Copy application code first (to bust cache on any code change)
COPY . .

# Copy package files after code to ensure npm ci runs on every code change
COPY package.json package-lock.json* ./

# Install node modules (need devDependencies for build)
# Important: Don't use --ignore-scripts as it breaks @tailwindcss/postcss
RUN rm -rf node_modules && npm ci

# Install @tsconfig/next for Turbopack tsconfig resolution
RUN npm install @tsconfig/next

# Build application
RUN npm run build

# Remove development dependencies and install production only
RUN rm -rf node_modules && \
    npm install --production --ignore-scripts


# Final stage for app image
FROM base

# Copy built application
COPY --from=build /app /app

# Entrypoint sets up the container.
ENTRYPOINT [ "/app/docker-entrypoint.js" ]

# Start the server by default, this can be overwritten at runtime
EXPOSE 3000
CMD [ "npm", "run", "start" ]
