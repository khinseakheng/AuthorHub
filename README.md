# AuthorHub

Centralized, open-source user and permission management system built with Express.js (TypeScript), Prisma ORM, SQLite (with easy DB swap), and React.  
Easily manage users, groups (roles), resources (features), and fine-grained CRUD permissions—all with a robust REST API and an admin UI.

---

## 🚀 Features

- **Group (Role) Management**  
  Create/edit/delete groups (roles) such as "admin", "customer service", etc.

- **User Management**  
  CRUD operations on users, assign users to multiple groups.

- **Resource Management**  
  Define resources representing app features (e.g., `account/change-password`, `report/daily-sale`).

- **Permission Assignment**  
  Assign CRUD permissions (CanRead, CanCreate, CanUpdate, CanDelete) to groups for each resource.

- **Permission Resolution**  
  Users inherit permissions from their groups. Endpoints to check if a user can perform an action, and to fetch all permissions (with their group origins) for a user.

- **API Documentation**  
  Swagger/OpenAPI UI for full API exploration.

- **Database Flexibility**  
  SQLite by default—swap to PostgreSQL, MySQL, or others easily via Prisma.

---

## 🛠️ Tech Stack

- **Backend:**  
  - Express.js (TypeScript)
  - Prisma ORM
  - SQLite (default, swappable)
  - Swagger (OpenAPI)

- **Frontend:**  
  - React.js (TypeScript)

- **Other:**  
  - Environment config via `.env`
  - Docker support (optional)

---

## 📝 Example Usage

**1. Create a group:**  
`POST /api/groups`  
Body:  
```json
{ "name": "admin" }
```

**2. Add a user:**  
`POST /api/users`  
Body:  
```json
{ "username": "user1", "email": "user1@example.com" }
```

**3. Assign user to group:**  
`POST /api/groups/:groupId/users`  
Body:  
```json
{ "userId": 1 }
```

**4. Define a resource:**  
`POST /api/resources`  
Body:  
```json
{ "key": "account/change-password" }
```

**5. Assign permissions:**  
`POST /api/groups/:groupId/permissions`  
Body:  
```json
{
  "resourceId": 1,
  "canRead": true,
  "canUpdate": true,
  "canCreate": false,
  "canDelete": false
}
```

**6. Check if a user has permission:**  
`GET /api/permissions/check?user_id=1&resource=account/change-password&action=update`  
Response:  
```json
{ "allowed": true }
```

**7. Get all permissions for a user (flat, with group origin):**  
`GET /api/permissions/user/:user_id`  
Response:  
```json
{
  "userId": 1,
  "groups": [
    { "id": 1, "name": "admin" },
    { "id": 2, "name": "customer-service" }
  ],
  "permissions": [
    {
      "groupId": 1,
      "resource": "account/change-password",
      "canRead": true,
      "canCreate": false,
      "canUpdate": true,
      "canDelete": false
    },
    {
      "groupId": 1,
      "resource": "user/list",
      "canRead": true,
      "canCreate": true,
      "canUpdate": true,
      "canDelete": true
    },
    {
      "groupId": 2,
      "resource": "report/daily-sale",
      "canRead": true,
      "canCreate": false,
      "canUpdate": false,
      "canDelete": false
    }
  ]
}
```

---

## 🚦 Getting Started

### Backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate dev --name init
npm run dev
```

---

## 🔮 Future Features
  - frontend web portal can let user easy to operate
  - SDKs for popular languages (Node.js, Python, Java, C#, PHP)
  - SSO/OAuth integration (backend)
  - Multi-tenancy support (backend)
  - Audit logging/history
  - User self-service endpoints
  - JWT/stateless permission checks
  - Hierarchical/wildcard resource permissions
  - Config export/import (JSON/YAML)
  - Notifications for permission changes (backend)
  - GraphQL API option
  - Internationalization (i18n)

---

## 🤝 Contributing

Contributions, bug reports, and feature requests are welcome!  
Open an issue or pull request on GitHub.

---

## 📄 License

MIT
