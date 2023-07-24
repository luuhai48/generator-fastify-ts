# <%= name %>

## How to install

```bash
yarn
```

## How to run in local

```bash
# Create .env file
cp .env.example .env

# Update secret values in .env file

# Start <% if (db === 'mongodb') {%>Mongodb<%} %><% if (plugins.includes('redis')) {%> and Redis<%}%>
docker-compose up -d

# Start API server
yarn dev
```
