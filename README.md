# Innovation Dating

**Professional Skills-Based Matching & Collaboration Network**

A full-stack platform that connects professionals through skill-based matching, real-time collaboration, mentorship, and project building — going beyond traditional networking to foster meaningful professional relationships.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Vite, Axios, Socket.io-client, React Hot Toast |
| Backend | Node.js, Express.js, Socket.io, PostgreSQL, Sequelize ORM |
| Auth | JWT (JSON Web Tokens), bcryptjs |
| File Upload | Multer, Cloudinary |
| Real-time | Socket.io (WebSocket) |
| Scheduling | node-cron (daily swipe resets) |
| DevOps | Concurrently (parallel dev servers), Nodemon |

---

## Project Structure

```
innovative-dating/
├── backend/
│   ├── src/
│   │   ├── config/          # DB connection, constants, enums
│   │   ├── controllers/     # Route handlers (14 controllers)
│   │   ├── middleware/       # Auth, file upload, role checks
│   │   ├── models/          # Sequelize models (25 models)
│   │   ├── routes/          # API route definitions (14 route files)
│   │   ├── services/        # Business logic services
│   │   ├── socket/          # Real-time event handlers
│   │   ├── utils/           # Helper utilities
│   │   ├── server.js        # Express app + Socket.io setup
│   │   ├── start.js         # Entry point
│   │   └── seed.js          # Database seeder
│   ├── uploads/             # Local file uploads
│   └── .env                 # Environment variables
├── client/
│   ├── src/
│   │   ├── admin/           # Admin panel pages (10 pages)
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # Auth context provider
│   │   ├── pages/           # User-facing pages (12 pages)
│   │   ├── services/        # API client with interceptors
│   │   └── styles/          # Global styles
│   └── vite.config.js
├── package.json             # Root scripts (dev, install:all, test)
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL
- Cloudinary account (for photo uploads)

### Environment Variables

Create `backend/.env`:

```env
PORT=5000
DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5432/innovative_dating
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Installation

```bash
# Install all dependencies (backend + client)
npm run install:all

# Create the PostgreSQL database
createdb innovative_dating

# Seed sample data (optional)
cd backend && npm run seed
```

### Running the App

```bash
# Run backend + frontend concurrently
npm run dev

# Or run individually
npm run backend    # Express on port 5000
npm run client     # Vite dev server on port 5173
```

### Testing

```bash
npm run test:backend     # Node.js native test runner
npm run test:frontend    # Frontend tests
```

---

## Backend API Endpoints

All authenticated endpoints require a Bearer token in the `Authorization` header.

Base URL: `http://localhost:5000/api`

---

### Auth — `/api/auth`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register a new user account |
| POST | `/login` | Sign in with email and password |
| POST | `/social-login` | OAuth / social login (Google, etc.) |
| GET | `/me` | Get current authenticated user |
| POST | `/logout` | Log out and invalidate session |

---

### Users — `/api/users`

All routes require authentication.

| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | `/profile` | Update name, headline, bio, skills, intents |
| GET | `/profile/:id` | View another user's profile |
| POST | `/photos` | Upload profile photos (up to 6) |
| DELETE | `/photos/:photoId` | Remove a photo |
| PUT | `/photos/:photoId/primary` | Set a photo as primary |
| PUT | `/preferences` | Update matching preferences (skills, intents, distance) |
| PUT | `/location` | Update city/country |
| PUT | `/onboarding` | Mark onboarding as complete |
| GET | `/nearby` | Search professionals by filters (skills, role, location, intent) |
| POST | `/deactivate` | Deactivate own account |
| POST | `/report` | Report another user |

---

### Matches — `/api/matches`

All routes require authentication.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/swipe` | Swipe on a profile (like / super_like / pass) |
| GET | `/` | Get all mutual matches (connections) |
| GET | `/potential` | Get profiles to discover (with compatibility scores) |
| GET | `/daily` | Get daily AI-curated match suggestions |
| GET | `/insight/:matchId` | Get AI-generated match insight |
| POST | `/block` | Block a user |
| GET | `/swipe-count` | Check remaining daily swipes |

**Matching Logic:**
- Compatibility score calculated from skill overlap, experience level, and professional intent alignment
- Daily swipe limit enforced (resets at midnight via cron job)
- Mutual "like" creates a match connection
- "Super Like" has higher visibility

---

### Chat — `/api/chat`

All routes require authentication.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/conversations` | List all conversations with last message |
| GET | `/messages/:matchId` | Get message history for a match |
| POST | `/messages` | Send a message |
| DELETE | `/messages/:messageId` | Delete a message |
| PUT | `/messages/:matchId/read` | Mark messages as read |
| GET | `/icebreaker/:matchId` | Get AI-generated icebreaker prompt based on shared skills |

**Real-time Features (Socket.io):**
- Instant message delivery
- Typing indicators
- Read receipts (double checkmark)
- Online/offline status
- WebRTC signaling (voice/video calls)

---

### Feed — `/api/feed`

All routes require authentication.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Create a post (post, idea, question, achievement, project_update, article) |
| GET | `/feed` | Get feed from followed users |
| GET | `/explore` | Get explore/discovery feed |
| GET | `/user/:userId?` | Get posts by a specific user |
| PUT | `/:id` | Update a post |
| DELETE | `/:id` | Delete a post |
| POST | `/:id/like` | Like/unlike a post |
| GET | `/:id/comments` | Get comments on a post |
| POST | `/:postId/comments` | Add a comment |
| DELETE | `/comments/:commentId` | Delete a comment |
| POST | `/follow/:userId` | Follow/unfollow a user |
| GET | `/follow/followers/:userId?` | Get a user's followers |
| GET | `/follow/following/:userId?` | Get users someone follows |
| GET | `/follow/counts/:userId?` | Get follower/following counts |

**Post Types:** Post, Idea, Question, Achievement, Project Update, Article

---

### Projects — `/api/projects`

All routes require authentication.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Create a new project |
| GET | `/` | List all open projects |
| GET | `/:id` | Get project details |
| PUT | `/:id` | Update project |
| DELETE | `/:id` | Delete project |
| POST | `/:id/apply` | Apply to join a project |
| GET | `/:id/collaborators` | List project members |
| GET | `/:id/pending` | List pending applications |
| PUT | `/members/:memberId/approve` | Approve a member |
| PUT | `/members/:memberId/reject` | Reject a member |
| POST | `/:id/leave` | Leave a project |

---

### Tasks — `/api/tasks`

All routes require authentication. Kanban-style task management for projects.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/project/:projectId` | Create a task |
| GET | `/project/:projectId` | List project tasks |
| GET | `/project/:projectId/board` | Get task board (grouped by status) |
| PUT | `/project/:projectId/reorder` | Reorder tasks across columns |
| GET | `/:taskId` | Get task details |
| PUT | `/:taskId` | Update a task |
| DELETE | `/:taskId` | Delete a task |

**Task Statuses:** Todo, In Progress, In Review, Done, Blocked

---

### Ideas — `/api/ideas`

All routes require authentication.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Create an idea (title, problem, solution, skills needed) |
| GET | `/` | List open ideas |
| GET | `/:id` | Get idea details |
| PUT | `/:id` | Update an idea |
| DELETE | `/:id` | Delete an idea |
| POST | `/:id/like` | Like an idea |
| POST | `/:id/collaborate` | Request to collaborate |
| PUT | `/:id/collaborate/respond` | Accept/reject collaboration request |
| GET | `/:id/suggested-collaborators` | Get AI-suggested collaborators |

---

### Communities — `/api/communities`

All routes require authentication.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Create a community |
| GET | `/` | List all communities |
| GET | `/mine` | Get user's joined communities |
| GET | `/:id` | Get community details |
| PUT | `/:id` | Update community |
| POST | `/:id/join` | Join a community |
| POST | `/:id/leave` | Leave a community |

**Visibility Options:** Public, Private, Invite Only

---

### Groups (Community/Project Chat) — `/api/groups`

All routes require authentication.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/:groupType/:groupId/messages` | Send group message |
| GET | `/:groupType/:groupId/messages` | Get group messages |
| GET | `/:groupType/:groupId/activity` | Get activity log |
| POST | `/:groupType/:groupId/files` | Upload a file |
| GET | `/:groupType/:groupId/files` | List shared files |
| DELETE | `/files/:fileId` | Delete a file |

---

### Notifications — `/api/notifications`

All routes require authentication.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all notifications |
| GET | `/unread-count` | Get count of unread notifications |
| PUT | `/:id/read` | Mark a notification as read |
| PUT | `/read-all` | Mark all as read |
| GET | `/preferences` | Get notification preferences |
| PUT | `/preferences` | Update notification preferences |
| DELETE | `/:id` | Delete a notification |

---

### Reputation — `/api/reputation`

All routes require authentication.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/leaderboard` | Get top contributors |
| GET | `/contributions/:userId` | Get user's contribution history |
| POST | `/endorse` | Endorse a user's skill |
| GET | `/endorsements/:userId` | Get endorsements for a user |
| POST | `/reviews` | Write a review |
| GET | `/reviews/:userId` | Get reviews for a user |
| GET | `/badges/:userId` | Get user's earned badges |

**Reputation System:**
- Points for actions: create project (50), complete project (200), complete task (25), give review (10), endorse skill (5), create post (10), share idea (15)
- Badge types: Top Developer, Healthcare Expert, Innovator, Collaborator, Mentor, Early Adopter, Community Builder, Problem Solver, and more
- Reputation levels: Bronze, Silver, Gold, Platinum

---

### Subscriptions — `/api/subscriptions`

All routes require authentication.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/current` | Get current subscription |
| GET | `/plans` | Get available plans (Free, Premium, VIP) |
| GET | `/history` | Get subscription history |
| POST | `/upgrade` | Upgrade to a plan |
| POST | `/cancel` | Cancel auto-renewal |

---

### Admin — `/api/admin`

Requires admin, moderator, or support role.

| Method | Endpoint | Permission | Description |
|--------|----------|-----------|-------------|
| POST | `/login` | Public | Admin login |
| GET | `/dashboard` | analytics | Dashboard statistics |
| GET | `/analytics` | analytics | Platform analytics |
| GET | `/users` | userManagement | List all users |
| GET | `/users/:id` | userManagement | Get user details |
| PUT | `/users/:id` | userManagement | Update a user |
| DELETE | `/users/:id` | userManagement | Delete a user |
| PUT | `/users/:id/role` | userManagement | Update user role |
| GET | `/roles` | userManagement | List available roles |
| GET | `/reports` | contentModeration | Get user reports |
| PUT | `/reports/:id` | contentModeration | Resolve a report |
| GET | `/flagged-messages` | contentModeration | Get flagged messages |
| PUT | `/messages/:id/moderate` | contentModeration | Moderate a message |
| GET | `/campaigns` | notificationManagement | List notification campaigns |
| POST | `/campaigns` | notificationManagement | Create a campaign |
| POST | `/campaigns/:id/send` | notificationManagement | Send a campaign |
| GET | `/posts` | socialMediaModeration | List all posts |
| DELETE | `/posts/:id` | socialMediaModeration | Delete a post |
| GET | `/comments` | socialMediaModeration | List all comments |
| PUT | `/comments/:id` | socialMediaModeration | Update a comment |
| DELETE | `/comments/:id` | socialMediaModeration | Delete a comment |
| GET | `/communities` | communityManagement | List all communities |
| PUT | `/communities/:id` | communityManagement | Update a community |
| DELETE | `/communities/:id` | communityManagement | Delete a community |
| GET | `/projects` | projectManagement | List all projects |
| PUT | `/projects/:id` | projectManagement | Update a project |
| DELETE | `/projects/:id` | projectManagement | Delete a project |

**Roles:** admin, moderator, support, user, mentor, company

---

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server and DB status |

---

## Frontend Pages & Features

### Public Pages

| Page | Route | Description |
|------|-------|-------------|
| Landing | `/` | Marketing page with hero, sectors, how-it-works, testimonials, CTA |
| Login | `/login` | Email/password sign-in, backend health check, demo credentials |
| Register | `/register` | Account creation with name, email, phone, password |

### Protected Pages (Auth Required)

| Page | Route | Description |
|------|-------|-------------|
| Feed | `/feed` | Social feed with post composer, like/comment/share, sidebar (notifications, messages, suggestions) |
| Matches | `/matches` | Swipe-style discovery (connect, super like, skip) + connections list |
| Chat | `/chat` | Conversation list + real-time messaging with typing indicators, read receipts, icebreaker prompts |
| Chat (specific) | `/chat/:matchId` | Direct message thread with a match |
| Profile | `/profile` | Own profile with edit mode, completeness meter, photo upload, skills, portfolio links |
| Profile (other) | `/profile/:id` | View others' profiles, endorsement, compatibility score |
| Idea Rooms | `/ideas` | Post ideas, find collaborators, skill-matching for ideas |
| Mentors | `/mentors` | Browse mentors, book sessions, view session history |
| Search | `/search` | Advanced search with filters (skills, experience, intent, location) |
| Notifications | `/notifications` | Notification center with mark as read |
| Settings | `/settings` | Preferences (skills, intents, distance), location, subscription management, account deactivation |

### Admin Pages

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/admin` | Platform statistics overview |
| Users | `/admin/users` | User management (view, edit, delete, change roles) |
| Moderation | `/admin/moderation` | Content moderation (reports, flagged messages) |
| Analytics | `/admin/analytics` | Platform analytics and insights |
| Notifications | `/admin/notifications` | Notification campaign management |
| Projects | `/admin/projects` | Project management |
| Comments | `/admin/comments` | Comment moderation |
| Communities | `/admin/communities` | Community management |

---

## Frontend Functionality Details

### Authentication & Session
- JWT-based auth stored in localStorage
- Auto-redirect on 401 (token expiry)
- Role-based routing (admin users → `/admin`, regular users → `/feed`)
- OAuth callback handling via URL params
- Backend connection check on login page

### Matching & Discovery
- Swipe cards with profile photos, headline, skills, experience level
- Compatibility score percentage (skill + intent + experience match)
- Daily swipe limit with counter
- Match insights explaining why two professionals complement each other
- Connections list with quick-chat access

### Real-time Chat
- WebSocket-based instant messaging
- Typing indicators ("Someone is typing...")
- Read receipts (single ✓ / double ✓✓)
- Online/offline status display
- AI-generated icebreaker prompts based on shared skills
- Auto-scroll to latest message

### Social Feed
- Multi-type posts (Post, Idea, Question, Achievement, Project Update, Article)
- Hashtag support
- Like, comment, share actions
- Follow/unfollow users
- Explore feed for discovering new content
- Three-column layout (profile sidebar, feed, notifications/messages/suggestions)

### Profile Management
- Edit mode for all profile fields
- Profile completeness percentage meter
- Skill selection from predefined options
- Professional intent badges (Hire, Collaborate, Mentor, Find Co-founder, etc.)
- Experience level selection
- Portfolio links (GitHub, Website, Behance)
- Photo upload with primary photo selection
- Endorsement system (endorse others' skills)

### Idea Rooms
- Post ideas with problem statement and proposed solution
- Specify skills needed for collaboration
- Collaboration type (Open, By Approval, Invite Only)
- Join ideas to collaborate

### Mentorship
- Browse available mentors with ratings and expertise
- Book sessions with date, topic, and message
- View session history and status (pending, confirmed, completed)

### Search & Discovery
- Multi-filter search (name, skills, experience level, intent, location)
- Skill tag filtering
- Results with profile cards linking to full profiles

### Subscription Management
- Free, Premium, and VIP tiers
- Feature comparison per plan
- Upgrade and cancel flows

### Admin Panel
- Role-based access control (admin, moderator, support)
- Permission-gated routes (userManagement, contentModeration, analytics, etc.)
- Dashboard statistics
- User CRUD operations
- Content moderation (reports, flagged messages)
- Notification campaign creation and sending
- Community, project, post, and comment management

---

## Database Models (25 Total)

| Model | Purpose |
|-------|---------|
| User | User accounts, profiles, skills, preferences |
| Match | Connection records between two users |
| Message | Chat messages between matches |
| GroupMessage | Messages in community/project group chats |
| Notification | User notifications |
| NotificationCampaign | Admin broadcast campaigns |
| Subscription | User subscription tiers and history |
| Admin | Admin-specific settings |
| Post | Feed posts |
| Comment | Post comments |
| Like | Post likes |
| Follow | User follow relationships |
| Project | Collaboration projects |
| ProjectMember | Project membership and roles |
| Community | Professional communities |
| CommunityMember | Community membership |
| Task | Kanban tasks within projects |
| Idea | Shared ideas for collaboration |
| Badge | Achievement badges |
| Contribution | Reputation contribution records |
| Endorsement | Skill endorsements |
| Review | User reviews |
| Report | User/content reports |
| ActivityLog | Group activity logs |
| SharedFile | Files shared in group chats |

---

## Real-time Socket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `join_match` | Client → Server | Join a chat room for a match |
| `leave_match` | Client → Server | Leave a chat room |
| `new_message` | Server → Client | New message received |
| `typing` | Client → Server | User is typing indicator |
| `user_typing` | Server → Client | Other user typing status |
| `message_read` | Client → Server | Message read receipt |
| `user_online` | Server → Client | User came online |
| `user_offline` | Server → Client | User went offline |
| `call_user` | Client → Server | Initiate voice/video call |
| `incoming_call` | Server → Client | Incoming call notification |
| `call_answer` | Client → Server | Answer a call |
| `call_answered` | Server → Client | Call was answered |
| `ice_candidate` | Both | WebRTC ICE candidates |
| `end_call` | Client → Server | End a call |
| `location_update` | Client → Server | Update user location |

---

## License

Private — All rights reserved.
