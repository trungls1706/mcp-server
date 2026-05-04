const { randomUUID } = require('node:crypto');
const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { StreamableHTTPServerTransport } = require('@modelcontextprotocol/sdk/server/streamableHttp.js');
const { isInitializeRequest } = require('@modelcontextprotocol/sdk/types.js');
const { z } = require('zod');
const Post = require('../models/post.model');

const createMcpServer = () => {
  const server = new McpServer({
    name: 'blog-mcp-server',
    version: '1.0.0',
  });

  // Tool: List all posts
  server.registerTool(
    'list_posts',
    {
      title: 'List Posts',
      description: 'Lấy danh sách bài viết blog. Có thể filter theo status (draft/published), author, tag',
      inputSchema: {
        status: z.enum(['draft', 'published']).optional().describe('Filter theo trạng thái bài viết'),
        author: z.string().optional().describe('Filter theo tên tác giả'),
        tag: z.string().optional().describe('Filter theo tag'),
        limit: z.number().optional().describe('Số lượng bài viết tối đa (default: 10)'),
      },
    },
    async ({ status, author, tag, limit = 10 }) => {
      const filter = {};
      if (status) filter.status = status;
      if (author) filter.author = new RegExp(author, 'i');
      if (tag) filter.tags = tag;

      const posts = await Post.find(filter)
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('title slug author status tags viewCount createdAt');

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(posts, null, 2),
          },
        ],
      };
    }
  );

  // Tool: Get post detail
  server.registerTool(
    'get_post',
    {
      title: 'Get Post',
      description: 'Lấy chi tiết một bài viết theo ID hoặc slug',
      inputSchema: {
        id: z.string().optional().describe('ID của bài viết (MongoDB ObjectId)'),
        slug: z.string().optional().describe('Slug của bài viết'),
      },
    },
    async ({ id, slug }) => {
      let post;

      if (id) {
        post = await Post.findById(id);
      } else if (slug) {
        post = await Post.findOne({ slug });
      } else {
        return {
          content: [{ type: 'text', text: 'Error: Cần cung cấp id hoặc slug' }],
        };
      }

      if (!post) {
        return {
          content: [{ type: 'text', text: 'Error: Không tìm thấy bài viết' }],
        };
      }

      return {
        content: [{ type: 'text', text: JSON.stringify(post, null, 2) }],
      };
    }
  );

  // Tool: Create post
  server.registerTool(
    'create_post',
    {
      title: 'Create Post',
      description: 'Tạo bài viết blog mới',
      inputSchema: {
        title: z.string().describe('Tiêu đề bài viết (bắt buộc)'),
        content: z.string().describe('Nội dung bài viết (bắt buộc)'),
        author: z.string().describe('Tên tác giả (bắt buộc)'),
        tags: z.array(z.string()).optional().describe('Danh sách tags'),
        status: z.enum(['draft', 'published']).optional().describe('Trạng thái bài viết (default: draft)'),
      },
    },
    async ({ title, content, author, tags = [], status = 'draft' }) => {
      try {
        const post = new Post({ title, content, author, tags, status });
        await post.save();

        return {
          content: [
            {
              type: 'text',
              text: `Đã tạo bài viết thành công!\n${JSON.stringify(post, null, 2)}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [{ type: 'text', text: `Error: ${error.message}` }],
        };
      }
    }
  );

  // Tool: Update post
  server.registerTool(
    'update_post',
    {
      title: 'Update Post',
      description: 'Cập nhật bài viết blog',
      inputSchema: {
        id: z.string().describe('ID của bài viết cần cập nhật (bắt buộc)'),
        title: z.string().optional().describe('Tiêu đề mới'),
        content: z.string().optional().describe('Nội dung mới'),
        author: z.string().optional().describe('Tác giả mới'),
        tags: z.array(z.string()).optional().describe('Tags mới'),
        status: z.enum(['draft', 'published']).optional().describe('Trạng thái mới'),
      },
    },
    async ({ id, ...updates }) => {
      try {
        Object.keys(updates).forEach(
          (key) => updates[key] === undefined && delete updates[key]
        );

        const post = await Post.findByIdAndUpdate(id, updates, {
          new: true,
          runValidators: true,
        });

        if (!post) {
          return {
            content: [{ type: 'text', text: 'Error: Không tìm thấy bài viết' }],
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: `Đã cập nhật bài viết!\n${JSON.stringify(post, null, 2)}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [{ type: 'text', text: `Error: ${error.message}` }],
        };
      }
    }
  );

  // Tool: Delete post
  server.registerTool(
    'delete_post',
    {
      title: 'Delete Post',
      description: 'Xóa bài viết blog',
      inputSchema: {
        id: z.string().describe('ID của bài viết cần xóa'),
      },
    },
    async ({ id }) => {
      try {
        const post = await Post.findByIdAndDelete(id);

        if (!post) {
          return {
            content: [{ type: 'text', text: 'Error: Không tìm thấy bài viết' }],
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: `Đã xóa bài viết: "${post.title}"`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [{ type: 'text', text: `Error: ${error.message}` }],
        };
      }
    }
  );

  // Tool: Search posts
  server.registerTool(
    'search_posts',
    {
      title: 'Search Posts',
      description: 'Tìm kiếm bài viết theo từ khóa trong tiêu đề và nội dung',
      inputSchema: {
        keyword: z.string().describe('Từ khóa tìm kiếm'),
        limit: z.number().optional().describe('Số lượng kết quả tối đa (default: 5)'),
      },
    },
    async ({ keyword, limit = 5 }) => {
      const posts = await Post.find({
        $or: [
          { title: new RegExp(keyword, 'i') },
          { content: new RegExp(keyword, 'i') },
          { tags: new RegExp(keyword, 'i') },
        ],
      })
        .sort({ viewCount: -1 })
        .limit(limit)
        .select('title slug author status tags viewCount');

      if (posts.length === 0) {
        return {
          content: [
            { type: 'text', text: `Không tìm thấy bài viết nào với từ khóa: "${keyword}"` },
          ],
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: `Tìm thấy ${posts.length} bài viết:\n${JSON.stringify(posts, null, 2)}`,
          },
        ],
      };
    }
  );

  // Tool: Get blog statistics
  server.registerTool(
    'get_blog_stats',
    {
      title: 'Blog Statistics',
      description: 'Lấy thống kê tổng quan của blog: tổng số bài, bài đã publish, draft, tổng lượt xem',
      inputSchema: {},
    },
    async () => {
      const [totalPosts, publishedPosts, draftPosts, viewsResult, topPosts] =
        await Promise.all([
          Post.countDocuments(),
          Post.countDocuments({ status: 'published' }),
          Post.countDocuments({ status: 'draft' }),
          Post.aggregate([{ $group: { _id: null, total: { $sum: '$viewCount' } } }]),
          Post.find({ status: 'published' })
            .sort({ viewCount: -1 })
            .limit(3)
            .select('title viewCount'),
        ]);

      const stats = {
        totalPosts,
        publishedPosts,
        draftPosts,
        totalViews: viewsResult[0]?.total || 0,
        topPosts,
      };

      return {
        content: [
          {
            type: 'text',
            text: `Blog Statistics:\n${JSON.stringify(stats, null, 2)}`,
          },
        ],
      };
    }
  );

  return server;
};

// Setup Streamable HTTP endpoint
const setupMcpEndpoint = (app) => {
  const transports = {};

  // POST /mcp - Main endpoint for MCP messages
  app.post('/mcp', async (req, res) => {
    const sessionId = req.headers['mcp-session-id'];

    try {
      let transport;

      if (sessionId && transports[sessionId]) {
        transport = transports[sessionId];
      } else if (!sessionId && isInitializeRequest(req.body)) {
        const server = createMcpServer();

        transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => randomUUID(),
          onsessioninitialized: (sid) => {
            console.log(`MCP session initialized: ${sid}`);
            transports[sid] = transport;
          },
        });

        transport.onclose = () => {
          const sid = transport.sessionId;
          if (sid && transports[sid]) {
            console.log(`MCP session closed: ${sid}`);
            delete transports[sid];
          }
        };

        await server.connect(transport);
        await transport.handleRequest(req, res, req.body);
        return;
      } else {
        res.status(400).json({
          jsonrpc: '2.0',
          error: {
            code: -32000,
            message: 'Bad Request: No valid session ID provided',
          },
          id: null,
        });
        return;
      }

      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      console.error('Error handling MCP request:', error);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: '2.0',
          error: {
            code: -32603,
            message: 'Internal server error',
          },
          id: null,
        });
      }
    }
  });

  // GET /mcp - SSE stream for server-to-client notifications
  app.get('/mcp', async (req, res) => {
    const sessionId = req.headers['mcp-session-id'];
    if (!sessionId || !transports[sessionId]) {
      res.status(400).send('Invalid or missing session ID');
      return;
    }

    const transport = transports[sessionId];
    await transport.handleRequest(req, res);
  });

  // DELETE /mcp - Session termination
  app.delete('/mcp', async (req, res) => {
    const sessionId = req.headers['mcp-session-id'];
    if (!sessionId || !transports[sessionId]) {
      res.status(400).send('Invalid or missing session ID');
      return;
    }

    try {
      const transport = transports[sessionId];
      await transport.handleRequest(req, res);
    } catch (error) {
      console.error('Error handling session termination:', error);
      if (!res.headersSent) {
        res.status(500).send('Error processing session termination');
      }
    }
  });

  console.log('MCP Server ready at /mcp (Streamable HTTP)');
};

module.exports = { setupMcpEndpoint };
