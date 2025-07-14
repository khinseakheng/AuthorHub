# AuthorHub Development Guide

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Quick Start

#### Option 1: Automatic Setup (Recommended)

**For Unix/Linux/macOS:**
```bash
chmod +x setup.sh
./setup.sh
```

**For Windows:**
```cmd
setup.bat
```

#### Option 2: Manual Setup

1. **Clone and navigate to project:**
```bash
git clone <repository-url>
cd AuthorHub
```

2. **Backend Setup:**
```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

3. **Frontend Setup (in new terminal):**
```bash
cd frontend
npm install
npm start
```

### Running the Application

1. **Start Backend:** `cd backend && npm run dev` (Port 3001)
2. **Start Frontend:** `cd frontend && npm start` (Port 3000)
3. **Access Application:** http://localhost:3000
4. **API Documentation:** http://localhost:3001/api-docs

## Docker Deployment

### Using Docker Compose (Recommended)
```bash
docker-compose up --build
```

### Individual Containers
```bash
# Backend
cd backend
docker build -t authorhub-backend .
docker run -p 3001:3001 authorhub-backend

# Frontend
cd frontend
docker build -t authorhub-frontend .
docker run -p 3000:80 authorhub-frontend
```

## Project Structure

```
AuthorHub/
├── backend/                 # Express.js API
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── schemas/        # Validation schemas
│   │   ├── config/         # Configuration files
│   │   └── lib/           # Utilities
│   ├── prisma/            # Database schema & migrations
│   └── package.json
├── frontend/              # React application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   └── services/      # API services
│   └── package.json
├── docker-compose.yml     # Docker setup
└── README.md
```

## API Endpoints

### Users
- `GET /api/users` - List all users
- `POST /api/users` - Create user
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Groups
- `GET /api/groups` - List all groups
- `POST /api/groups` - Create group
- `GET /api/groups/:id` - Get group by ID
- `PUT /api/groups/:id` - Update group
- `DELETE /api/groups/:id` - Delete group
- `POST /api/groups/:id/users` - Assign user to group
- `DELETE /api/groups/:id/users/:userId` - Remove user from group

### Resources
- `GET /api/resources` - List all resources
- `POST /api/resources` - Create resource
- `GET /api/resources/:id` - Get resource by ID
- `PUT /api/resources/:id` - Update resource
- `DELETE /api/resources/:id` - Delete resource

### Permissions
- `GET /api/permissions/check` - Check user permission
- `GET /api/permissions/user/:id` - Get user permissions
- `POST /api/permissions/groups/:groupId` - Create permission
- `PUT /api/permissions/groups/:groupId/resources/:resourceId` - Update permission
- `DELETE /api/permissions/groups/:groupId/resources/:resourceId` - Delete permission

## Database

### Schema
The system uses SQLite by default with the following entities:
- **Users** - User accounts
- **Groups** - Roles/groups for organizing permissions
- **Resources** - Features/endpoints to protect
- **Permissions** - CRUD permissions linking groups to resources
- **UserGroups** - Many-to-many relationship between users and groups

### Migration Commands
```bash
# Create new migration
npx prisma migrate dev --name <migration_name>

# Reset database
npx prisma migrate reset

# View database
npx prisma studio
```

### Switching Database Provider
1. Update `DATABASE_URL` in `.env`
2. Modify `provider` in `prisma/schema.prisma`
3. Run `npx prisma migrate dev`

## Development

### Backend Development
- **Hot Reload:** `npm run dev`
- **Build:** `npm run build`
- **Start:** `npm start`

### Frontend Development
- **Development:** `npm start`
- **Build:** `npm run build`
- **Test:** `npm test`

### Environment Variables

**Backend (.env):**
```env
DATABASE_URL="file:./dev.db"
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

**Frontend:**
```env
REACT_APP_API_URL=http://localhost:3001
```

## Testing the API

### Example API Calls

**Create a User:**
```bash
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "email": "admin@example.com", "name": "Administrator"}'
```

**Create a Group:**
```bash
curl -X POST http://localhost:3001/api/groups \
  -H "Content-Type: application/json" \
  -d '{"name": "administrators", "description": "System administrators"}'
```

**Create a Resource:**
```bash
curl -X POST http://localhost:3001/api/resources \
  -H "Content-Type: application/json" \
  -d '{"key": "user/management", "name": "User Management", "description": "Manage system users"}'
```

**Check Permission:**
```bash
curl "http://localhost:3001/api/permissions/check?user_id=1&resource=user/management&action=read"
```

## Troubleshooting

### Common Issues

1. **Port Already in Use:**
   - Change ports in `.env` files
   - Kill existing processes: `lsof -ti:3001 | xargs kill -9`

2. **Database Issues:**
   - Reset database: `npx prisma migrate reset`
   - Regenerate client: `npx prisma generate`

3. **CORS Errors:**
   - Update `CORS_ORIGIN` in backend `.env`
   - Ensure frontend URL matches

4. **Package Installation Errors:**
   - Clear cache: `npm cache clean --force`
   - Delete `node_modules` and reinstall

### Getting Help
- Check API documentation at http://localhost:3001/api-docs
- Review server logs for error messages
- Ensure all dependencies are installed correctly

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
