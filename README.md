# Travel Booking System

Система учета и анализа туристических маршрутов и путевок с базой данных PostgreSQL, REST API и веб-интерфейсом.

## Описание проекта

Travel Booking System — это полноценная информационная система для управления туристическими маршрутами, турами, бронированиями и пользователями. Система включает:

- Управление пользователями с ролями (admin/user)
- Виртуальные кошельки с внутренней валютой COIN
- Каталог туристических маршрутов с характеристиками
- Управление турами и бронированиями
- Систему отзывов и рейтингов
- REST API с полной документацией Swagger
- Адаптивный веб-интерфейс с Bootstrap 5
- Интеграцию с Яндекс Картами

## Технологии

### Backend
- **Node.js** (18+) — серверная платформа
- **Express.js** (4.x) — веб-фреймворк
- **Sequelize** (6.x) — ORM для работы с базой данных
- **PostgreSQL** (15+) — система управления базами данных
- **bcryptjs** — хеширование паролей
- **swagger-ui-express** + **swagger-jsdoc** — документация API

### Frontend
- **Vanilla JavaScript** — логика приложения
- **Bootstrap 5** — адаптивный UI фреймворк
- **Yandex Maps API** — отображение карт

### DevOps
- **Docker** — контейнеризация
- **Docker Compose** — оркестрация контейнеров

## Структура проекта

```
travel-project/
├── travel-app/                          # Основное приложение
│   ├── app/
│   │   ├── config/
│   │   │   ├── db.config.js             # Конфигурация БД
│   │   │   └── seed.js                 # Инициализация данных
│   │   ├── models/
│   │   │   ├── index.js                # Инициализация Sequelize
│   │   │   ├── references.model.js     # Связи между сущностями
│   │   │   ├── user.model.js           # Модель пользователя
│   │   │   ├── wallet.model.js         # Модель кошелька
│   │   │   ├── route.model.js          # Модель маршрута
│   │   │   ├── tour.model.js           # Модель тура
│   │   │   ├── booking.model.js        # Модель бронирования
│   │   │   ├── review.model.js         # Модель отзыва
│   │   │   └── bookingRoute.model.js   # Промежуточная таблица
│   │   ├── controllers/
│   │   │   ├── user.controller.js      # Контроллер пользователей
│   │   │   ├── wallet.controller.js    # Контроллер кошельков
│   │   │   ├── route.controller.js     # Контроллер маршрутов
│   │   │   ├── tour.controller.js      # Контроллеров туров
│   │   │   ├── booking.controller.js   # Контроллер бронирований
│   │   │   └── review.controller.js    # Контроллер отзывов
│   │   └── routes/
│   │       ├── user.routes.js          # Маршруты пользователей
│   │       ├── wallet.routes.js        # Маршруты кошельков
│   │       ├── route.routes.js         # Маршруты маршрутов
│   │       ├── tour.routes.js          # Маршруты туров
│   │       ├── booking.routes.js       # Маршруты бронирований
│   │       └── review.routes.js        # Маршруты отзывов
│   ├── public/                          # Статические файлы
│   │   ├── index.html                  # Главная страница
│   │   ├── login.html                  # Страница входа
│   │   ├── register.html               # Страница регистрации
│   │   ├── profile.html                # Страница профиля
│   │   ├── css/
│   │   │   └── styles.css              # Стили приложения
│   │   └── js/
│   │       ├── api.js                  # API клиент
│   │       ├── app.js                  # Логика приложения
│   │       ├── auth.js                 # Авторизация
│   │       └── profile.js              # Профиль пользователя
│   ├── .env.sample                      # Шаблон переменных окружения
│   ├── Dockerfile                       # Docker образ приложения
│   ├── package.json                     # Зависимости Node.js
│   └── server.js                       # Точка входа приложения
├── .env                                 # Переменные окружения
├── docker-compose.yml                   # Docker Compose конфигурация
└── README.md                            # Документация
```

## База данных

### Сущности

#### User (Пользователь)
- `id` — уникальный идентификатор
- `username` — логин (уникальный)
- `password_hash` — хеш пароля
- `email` — email (уникальный)
- `full_name` — полное имя
- `role` — роль (admin/user)

#### Wallet (Кошелёк)
- `id` — уникальный идентификатор
- `user_id` — ID пользователя (внешний ключ)
- `balance` — баланс в COIN (по умолчанию 1000)

#### Route (Маршрут)
- `id` — уникальный идентификатор
- `name` — название маршрута
- `description` — описание
- `difficulty` — сложность (1-10)
- `duration_days` — длительность в днях
- `distance_km` — дистанция в км
- `start_location` — место начала
- `end_location` — место окончания
- `coordinates_start` — координаты начала
- `coordinates_end` — координаты окончания

#### Tour (Тур)
- `id` — уникальный идентификатор
- `route_id` — ID маршрута (внешний ключ)
- `name` — название тура
- `description` — описание
- `price` — цена в COIN
- `max_participants` — максимум участников
- `current_participants` — текущее количество участников
- `start_date` — дата начала
- `end_date` — дата окончания
- `status` — статус (active/cancelled/completed)

#### Booking (Бронирование)
- `id` — уникальный идентификатор
- `user_id` — ID пользователя (внешний ключ)
- `tour_id` — ID тура (внешний ключ)
- `participants_count` — количество участников
- `total_price` — общая цена
- `status` — статус (pending/confirmed/cancelled)
- `notes` — заметки

#### Review (Отзыв)
- `id` — уникальный идентификатор
- `user_id` — ID пользователя (внешний ключ)
- `tour_id` — ID тура (внешний ключ)
- `rating` — оценка (1-5)
- `comment` — комментарий

#### BookingRoute (Связь бронирования и маршрута)
- `booking_id` — ID бронирования (составной PK)
- `route_id` — ID маршрута (составной PK)
- `order_index` — порядковый номер

### Связи
- **1:1** User ↔ Wallet
- **1:N** User → Booking, User → Review, Route → Tour, Tour → Booking, Tour → Review
- **N:M** Booking ↔ Route через BookingRoute

## Установка и запуск

### Требования
- Docker и Docker Compose
- Git (для клонирования репозитория)

### Шаги установки

1. **Клонировать репозиторий**
```bash
git clone <repository-url>
cd travel-project
```

2. **Настроить переменные окружения**
```bash
cp travel-app/.env.sample .env
```

Отредактируйте `.env` файл при необходимости:
```env
POSTGRESDB_USER=travel_user
POSTGRESDB_ROOT_PASSWORD=travel_password
POSTGRESDB_DATABASE=travel_db
POSTGRESDB_LOCAL_PORT=5433
POSTGRESDB_DOCKER_PORT=5432

NODE_LOCAL_PORT=6868
NODE_DOCKER_PORT=8080

DB_HOST=postgresdb
DB_USER=travel_user
DB_PASSWORD=travel_password
DB_NAME=travel_db
DB_PORT=5432
```

3. **Запустить контейнеры**
```bash
docker-compose up -d --build
```

4. **Инициализировать базу данных (опционально)**
```bash
docker-compose exec app npm run seed
```

Это создаст тестовых пользователей:
- **admin** / adminadmin (роль: admin)
- **test** / testtest (роль: user)

У обоих пользователей будет баланс 1000 COIN.

### Доступ к приложению

- **Frontend**: http://localhost:6868
- **API Documentation (Swagger)**: http://localhost:6868/api-docs
- **PostgreSQL**: localhost:5433

## API Эндпоинты

### Пользователи
- `POST /api/users/register` — регистрация
- `POST /api/users/login` — вход
- `GET /api/users` — получить всех пользователей
- `GET /api/users/:id` — получить пользователя по ID
- `PUT /api/users/:id` — обновить пользователя
- `DELETE /api/users/:id` — удалить пользователя
- `GET /api/users/top/users` — топ пользователей по тратам

### Кошельки
- `POST /api/wallets` — создать кошелёк
- `GET /api/wallets` — получить все кошельки
- `GET /api/wallets/:id` — получить кошелёк по ID
- `GET /api/wallets/user/:userId` — получить кошелёк пользователя
- `PUT /api/wallets/:id` — обновить кошелёк
- `POST /api/wallets/transfer` — перевести COIN
- `GET /api/wallets/balance/:userId` — баланс с историей

### Маршруты
- `POST /api/routes` — создать маршрут
- `GET /api/routes` — получить все маршруты
- `GET /api/routes/:id` — получить маршрут по ID
- `PUT /api/routes/:id` — обновить маршрут
- `DELETE /api/routes/:id` — удалить маршрут
- `GET /api/routes/difficulty/:min/:max` — фильтр по сложности
- `GET /api/routes/duration/:min/:max` — фильтр по длительности
- `GET /api/routes/popular/routes` — популярные маршруты

### Туры
- `POST /api/tours` — создать тур
- `GET /api/tours` — получить все туры
- `GET /api/tours/:id` — получить тур по ID
- `GET /api/tours/active/tours` — активные туры
- `GET /api/tours/route/:routeId` — туры по маршруту
- `PUT /api/tours/:id` — обновить тур
- `PUT /api/tours/:id/participants` — обновить участников
- `DELETE /api/tours/:id` — удалить тур
- `GET /api/tours/rating/tours` — туры с рейтингами
- `GET /api/tours/available/tours` — доступные туры

### Бронирования
- `POST /api/bookings` — создать бронирование
- `GET /api/bookings` — получить все бронирования
- `GET /api/bookings/:id` — получить бронирование по ID
- `GET /api/bookings/user/:userId` — бронирования пользователя
- `GET /api/bookings/tour/:tourId` — бронирования тура
- `PUT /api/bookings/:id` — обновить бронирование
- `PUT /api/bookings/:id/confirm` — подтвердить бронирование
- `DELETE /api/bookings/:id` — удалить бронирование
- `GET /api/bookings/statistics/bookings` — статистика бронирований

### Отзывы
- `POST /api/reviews` — создать отзыв
- `GET /api/reviews` — получить все отзывы
- `GET /api/reviews/:id` — получить отзыв по ID
- `GET /api/reviews/tour/:tourId` — отзывы тура
- `GET /api/reviews/user/:userId` — отзывы пользователя
- `PUT /api/reviews/:id` — обновить отзыв
- `DELETE /api/reviews/:id` — удалить отзыв
- `GET /api/reviews/tour/:tourId/details` — отзывы с деталями

## Специализированные SQL-запросы

Система включает 7 специализированных raw SQL запросов:

1. **Популярные маршруты** — маршруты с наибольшим количеством бронирований
2. **Статистика бронирований** — статистика по месяцам с выручкой
3. **Рейтинг туров** — средний рейтинг и количество отзывов
4. **Топ пользователей** — пользователи с наибольшими тратами
5. **Доступные туры** — туры на заданный период с местами
6. **Баланс кошелька** — баланс с количеством подтверждённых бронирований
7. **Отзывы с деталями** — отзывы с информацией о пользователе и туре

## Цветовая палитра

Приложение использует следующую цветовую палитру:

- **#2D4354** — тёмно-синий (фон, шапка, подвал)
- **#73766A** — серо-зелёный (вторичные элементы)
- **#FED7A5** — светло-персиковый (акценты, кнопки)
- **#9E6752** — терракотовый (заголовки, иконки)
- **#534145** — тёмно-бордовый (текст)
- **#20212B** — почти чёрный (фон карточек, модальные окна)

## Разработка

### Локальная разработка без Docker

1. Установите зависимости:
```bash
cd travel-app
npm install
```

2. Настройте локальную PostgreSQL базу данных

3. Создайте `.env` файл:
```env
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=travel_db
DB_PORT=5432
NODE_DOCKER_PORT=8080
```

4. Запустите сервер:
```bash
npm start
```

### Запуск seed данных
```bash
npm run seed
```

## Автор

Разработано в рамках курсового проекта по базам данных.

## Лицензия

ISC
