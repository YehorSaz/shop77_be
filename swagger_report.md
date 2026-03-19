# Звіт про перевірку Swagger документації

Після порівняння файлу `shop-list.swagger.yaml` та фактичної реалізації роутів у Вашому коді (`src/routers/`) я виявив низку невідповідностей.

Нижче наведено детальний перелік відмінностей:

## 1. Ендпоінти, яких немає у Swagger, але вони є у коді:
- `GET /api/users/email` — пошук юзера за email (файл `user.router.ts`).
- `POST /api/auth/logout` — логаут (файл `auth.router.ts`).
- `PUT /api/auth/forgot-password-set` — встановлення пароля після скидання (файл `auth.router.ts`).
- `POST /api/purchase-list/:purchaseListId/unShare` — скасування доступу до списку (файл `purchase-list.router.ts`).

## 2. Ендпоінти, які є у Swagger, але відсутні у коді:
- `GET /api/users/friends` — у файлі `user.router.ts` немає такого роута, є лише `/friends/add/:friendId` та `/friends/delete/:friendId`.
- `GET /api/purchase-lists/sharedWithMe` — у файлі `purchase-list.router.ts` цей роут закоментований (і базовий шлях у Swagger вказаний неправильно, див. пункт 4).

## 3. Невідповідність HTTP-методів:
- **Забутий пароль:** У Swagger вказано метод `PUT /auth/forgot-password`, але в `auth.router.ts` використовується `POST` (`router.post('/forgot-password')`).

## 4. Помилки у шляхах (Path definitions):
Базовий шлях для списків покупок у файлі `main.ts` зареєстрований як `/api/purchase-list`. Однак, у Swagger є роути (рядки 810 та 835), які використовують множину (`purchase-lists`):
- У Swagger: `GET /purchase-lists/sharedWithMe`
- У Swagger: `GET /purchase-lists/{purchaseListId}`
- У Swagger для оновлення та видалення правильно: `PUT /purchase-list/{purchaseListId}`.

Для збігу з кодом, `GET`-запити для списків теж повинні починатись з `/purchase-list`, а не `/purchase-lists`.

## Висновок:
Swagger файл загалом написаний правильно синтаксично, але **значно відстає від актуального коду**. Рекомендую оновити його, додавши пропущені ендпоінти, виправивши закоментований код (або видаливши його з Swagger) та виправити типізацію (`/purchase-lists` -> `/purchase-list` та `PUT` -> `POST` для відновлення паролю).
