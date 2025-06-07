# Use the official Node.js image
FROM node:18-alpine AS build

# Set the working directory
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy all files
COPY . .

# Build the Next.js app
RUN npm run build

# Use a lighter image for production
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy the build files
COPY --from=build /app ./

# Expose the port (default Next.js port 3000)
EXPOSE 3000

# Start the Next.js app
CMD ["npm", "start"]