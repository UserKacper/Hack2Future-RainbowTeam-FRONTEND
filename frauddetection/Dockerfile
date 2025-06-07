# Use the official Node.js image (lighter Alpine variant)
FROM node:18-alpine AS build

# Set the working directory
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install --frozen-lockfile  # Ensures that the lockfile is respected

# Copy all project files (excluding node_modules and other unnecessary files)
COPY . .

# Build the Next.js app
RUN npm run build

# Use a lighter image for production
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Install production dependencies only (ignores devDependencies)
COPY package.json package-lock.json ./
RUN npm install --production --frozen-lockfile

# Copy the build output from the build stage
COPY --from=build /app/.next /app/.next
COPY --from=build /app/public /app/public

# Expose the port (default Next.js port 3000)
EXPOSE 3000

# Start the Next.js app in production mode
CMD ["npm", "start"]
