#!/bin/bash

# Скрипт для деплоя Telegram Game Store на продакшен-сервер

# Директория проекта на сервере
PROJECT_DIR="/var/www/gameparadice.ru"
REPO_URL="https://github.com/FlaweOFF/GameShopPRODUCTION.git"  # Замените на URL вашего репозитория

# Цвета для вывода
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Начинаем деплой Telegram Game Store на продакшен-сервер...${NC}"

# Проверка существования директории
if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${GREEN}Создаем директорию проекта...${NC}"
    mkdir -p $PROJECT_DIR
    cd $PROJECT_DIR
    
    # Клонирование репозитория
    echo -e "${GREEN}Клонирование репозитория...${NC}"
    git clone $REPO_URL .
else
    # Обновление существующего репозитория
    cd $PROJECT_DIR
    echo -e "${GREEN}Обновление репозитория...${NC}"
    git pull
fi

# Устанавливаем зависимости и собираем backend
echo -e "${GREEN}Устанавливаем зависимости и собираем backend...${NC}"
cd $PROJECT_DIR/backend
npm install
npm prune --production

# Устанавливаем зависимости и собираем frontend
echo -e "${GREEN}Устанавливаем зависимости и собираем frontend...${NC}"
cd $PROJECT_DIR/frontend
npm install
npm run build

# Устанавливаем зависимости и собираем admin-panel
echo -e "${GREEN}Устанавливаем зависимости и собираем admin-panel...${NC}"
cd $PROJECT_DIR/admin-panel
npm install
npm run build

# Перезапуск PM2 процессов
echo -e "${GREEN}Перезапуск PM2 процессов...${NC}"
cd $PROJECT_DIR
pm2 restart tg-game-store || pm2 start backend/src/server.js --name "tg-game-store"

# Перезагрузка NGINX
echo -e "${GREEN}Перезагрузка NGINX...${NC}"
sudo systemctl reload nginx

echo -e "${GREEN}Деплой успешно завершен!${NC}"