# Use a imagem oficial do Node.js
FROM node:18

# Define o diretório de trabalho
WORKDIR /code

# Copia o package.json e o package-lock.json
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o restante dos arquivos da aplicação
COPY . .

# Exponha a porta que a aplicação irá usar
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["node", "server.js"]
