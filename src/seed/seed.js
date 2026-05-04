const Post = require('../models/post.model');

const fakePosts = [
  {
    title: 'Getting Started with Node.js',
    slug: 'getting-started-with-nodejs',
    content: `Node.js is a powerful JavaScript runtime built on Chrome's V8 engine. 
    It allows developers to run JavaScript on the server-side, enabling full-stack 
    JavaScript development. In this guide, we'll explore the basics of Node.js 
    and how to set up your first project.`,
    author: 'John Doe',
    tags: ['nodejs', 'javascript', 'backend'],
    status: 'published',
    viewCount: 150,
  },
  {
    title: 'Understanding MongoDB and Mongoose',
    slug: 'understanding-mongodb-mongoose',
    content: `MongoDB is a NoSQL database that stores data in flexible, JSON-like 
    documents. Mongoose is an ODM (Object Data Modeling) library that provides 
    a schema-based solution for modeling your application data. Together, they 
    make building Node.js applications with databases much easier.`,
    author: 'Jane Smith',
    tags: ['mongodb', 'mongoose', 'database'],
    status: 'published',
    viewCount: 230,
  },
  {
    title: 'Building REST APIs with Express',
    slug: 'building-rest-apis-express',
    content: `Express.js is a minimal and flexible Node.js web application framework. 
    It provides a robust set of features for building web and mobile applications. 
    In this tutorial, we'll create a complete REST API with CRUD operations.`,
    author: 'John Doe',
    tags: ['express', 'api', 'rest', 'nodejs'],
    status: 'published',
    viewCount: 320,
  },
  {
    title: 'Introduction to MCP (Model Context Protocol)',
    slug: 'introduction-to-mcp',
    content: `MCP (Model Context Protocol) is a protocol that allows AI models like 
    Claude to connect with external data sources and tools. It enables developers 
    to build powerful integrations between their applications and AI assistants.`,
    author: 'Alice Johnson',
    tags: ['mcp', 'ai', 'claude', 'integration'],
    status: 'published',
    viewCount: 89,
  },
  {
    title: 'Docker for Node.js Developers',
    slug: 'docker-for-nodejs-developers',
    content: `Docker simplifies the deployment of Node.js applications by packaging 
    them into containers. This ensures consistency across development, testing, 
    and production environments. Learn how to containerize your Node.js apps.`,
    author: 'Bob Wilson',
    tags: ['docker', 'nodejs', 'devops', 'containers'],
    status: 'published',
    viewCount: 175,
  },
  {
    title: 'Advanced TypeScript Patterns',
    slug: 'advanced-typescript-patterns',
    content: `TypeScript brings static typing to JavaScript, improving code quality 
    and developer experience. This article covers advanced patterns like generics, 
    conditional types, and utility types that will level up your TypeScript skills.`,
    author: 'Jane Smith',
    tags: ['typescript', 'javascript', 'patterns'],
    status: 'draft',
    viewCount: 0,
  },
  {
    title: 'React 19 New Features',
    slug: 'react-19-new-features',
    content: `React 19 introduces exciting new features including improved server 
    components, better hydration, and enhanced concurrent rendering. Let's explore 
    what's new and how to migrate your existing applications.`,
    author: 'Alice Johnson',
    tags: ['react', 'frontend', 'javascript'],
    status: 'draft',
    viewCount: 0,
  },
];

const seedDatabase = async () => {
  try {
    // Check if data already exists
    const count = await Post.countDocuments();
    
    if (count > 0) {
      console.log(`⏭️  Seed skipped: ${count} posts already exist`);
      return;
    }

    // Insert fake data
    await Post.insertMany(fakePosts);
    console.log(`✅ Seed completed: ${fakePosts.length} posts created`);
    
  } catch (error) {
    console.error('❌ Seed error:', error.message);
  }
};

module.exports = seedDatabase;
