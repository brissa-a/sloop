# Use a base image with Node.js pre-installed
FROM --platform=linux/amd64 node:20

# Set the working directory inside the container
WORKDIR /app

# Copy all files except node_modules
COPY . .

WORKDIR /app/package/sloop-express

RUN npm install -g pnpm
RUN pnpm install
RUN pnpm prisma generate

# Expose the port on which your application will run
EXPOSE 3000

# Start the application using pnpm start
CMD ["pnpm", "start"]