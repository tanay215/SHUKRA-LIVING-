FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/

# Install dependencies
RUN npm install
RUN cd server && npm install

# Copy application files
COPY . .

# Expose ports
EXPOSE 5173 30011

# Start both frontend and backend
CMD ["sh", "-c", "cd server && npm start & npm run dev"]