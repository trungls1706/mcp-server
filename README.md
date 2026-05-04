# MCP Blog Demo

Demo MCP Server kết nối Claude với ứng dụng Blog (Express + MongoDB).

## 🚀 Quick Start

### Chạy với Docker (Recommended)

```bash
# Start MongoDB + App
docker compose -p hoidanit-mcp-blog up -d
```
Server sẽ chạy tại:
- **API**: http://localhost:3000/api/posts
- **MCP**: http://localhost:3000/sse

## 🔌 Kết nối với Claude

### Claude Code (MCP URL)
```
http://localhost:3000/sse
```

## 🛠 MCP Tools Available

| Tool | Description |
|------|-------------|
| `list_posts` | Lấy danh sách bài viết (filter: status, author, tag) |
| `get_post` | Lấy chi tiết bài viết theo ID hoặc slug |
| `create_post` | Tạo bài viết mới |
| `update_post` | Cập nhật bài viết |
| `delete_post` | Xóa bài viết |
| `search_posts` | Tìm kiếm bài viết theo keyword |
| `get_blog_stats` | Thống kê tổng quan blog |

## 📝 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/posts` | List posts |
| GET | `/api/posts/:id` | Get post detail |
| POST | `/api/posts` | Create post |
| PUT | `/api/posts/:id` | Update post |
| DELETE | `/api/posts/:id` | Delete post |
| GET | `/api/posts/stats/overview` | Blog statistics |

## 🧪 Test với cURL

```bash
# List posts
curl http://localhost:3000/api/posts

# Create post
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Post","content":"Hello World","author":"Test"}'

# Search
curl "http://localhost:3000/api/posts?search=node"
```

## 📁 Project Structure

```
mcp-blog-demo/
├── docker-compose.yml
├── Dockerfile
├── package.json
├── src/
│   ├── index.js              # Entry point
│   ├── config/
│   │   └── db.js             # MongoDB connection
│   ├── models/
│   │   └── post.model.js     # Mongoose schema
│   ├── routes/
│   │   └── post.routes.js    # Express routes
│   ├── seed/
│   │   └── seed.js           # Fake data seeder
│   └── mcp/
│       └── server.js         # MCP Server (SSE)
```

## 🎯 Demo Scenarios

Sau khi kết nối MCP với Claude, thử các câu hỏi:

1. "Cho tôi xem danh sách tất cả bài viết"
2. "Tìm bài viết về Node.js"
3. "Tạo bài viết mới về React với tiêu đề 'React Hooks Guide'"
4. "Thống kê blog có bao nhiêu bài viết?"
5. "Publish bài viết có ID xyz"
