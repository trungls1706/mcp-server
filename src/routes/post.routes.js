const express = require('express');
const Post = require('../models/post.model');

const router = express.Router();

// GET /posts - List all posts (with filters)
router.get('/', async (req, res) => {
  try {
    const { status, author, tag, search, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    
    if (status) filter.status = status;
    if (author) filter.author = new RegExp(author, 'i');
    if (tag) filter.tags = tag;
    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { content: new RegExp(search, 'i') },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [posts, total] = await Promise.all([
      Post.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('-content'), // Exclude content in list
      Post.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: posts,
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /posts/:id - Get single post
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    // Increment view count
    post.viewCount += 1;
    await post.save();

    res.json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /posts - Create new post
router.post('/', async (req, res) => {
  try {
    const { title, content, author, tags, status } = req.body;

    const post = new Post({ title, content, author, tags, status });
    await post.save();

    res.status(201).json({ success: true, data: post });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// PUT /posts/:id - Update post
router.put('/:id', async (req, res) => {
  try {
    const { title, content, author, tags, status } = req.body;

    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { title, content, author, tags, status },
      { new: true, runValidators: true }
    );

    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    res.json({ success: true, data: post });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// DELETE /posts/:id - Delete post
router.delete('/:id', async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /posts/stats/overview - Get blog statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const [totalPosts, publishedPosts, draftPosts, totalViews] = await Promise.all([
      Post.countDocuments(),
      Post.countDocuments({ status: 'published' }),
      Post.countDocuments({ status: 'draft' }),
      Post.aggregate([{ $group: { _id: null, total: { $sum: '$viewCount' } } }]),
    ]);

    res.json({
      success: true,
      data: {
        totalPosts,
        publishedPosts,
        draftPosts,
        totalViews: totalViews[0]?.total || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
