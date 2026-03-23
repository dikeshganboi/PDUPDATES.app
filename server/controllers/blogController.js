import mongoose from 'mongoose';
import Blog from '../models/Blog.js';
import slugify from '../utils/slugify.js';
import { sanitizeHtml } from '../utils/sanitize.js';
import { escapeRegex } from '../utils/escapeRegex.js';

const normalizeTags = (tags) => {
  if (!tags) return [];

  if (Array.isArray(tags)) {
    return tags
      .map((tag) => String(tag).trim().toLowerCase())
      .filter(Boolean);
  }

  if (typeof tags === 'string') {
    return tags
      .split(',')
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean);
  }

  return [];
};

const buildUniqueSlug = async (title, ignoreBlogId = null) => {
  const base = slugify(title) || `blog-${Date.now()}`;
  let candidate = base;
  let suffix = 1;

  while (true) {
    const existing = await Blog.findOne({ slug: candidate }).select('_id');

    if (!existing || (ignoreBlogId && existing._id.toString() === ignoreBlogId.toString())) {
      return candidate;
    }

    suffix += 1;
    candidate = `${base}-${suffix}`;
  }
};

export const createBlog = async (req, res, next) => {
  try {
    const { title, content, category, tags, image } = req.body;

    if (!title || !content || !category) {
      res.status(400);
      throw new Error('Title, content, and category are required');
    }

    const slug = await buildUniqueSlug(title);

    const blog = await Blog.create({
      title,
      slug,
      content: sanitizeHtml(content),
      category,
      tags: normalizeTags(tags),
      image: image || '',
      author: req.user._id,
    });

    const populatedBlog = await Blog.findById(blog._id).populate('author', 'name email role');

    res.status(201).json(populatedBlog);
  } catch (error) {
    next(error);
  }
};

export const getAllBlogs = async (req, res, next) => {
  try {
    const search = (req.query.search || '').trim();
    const category = (req.query.category || '').trim();
    const tag = (req.query.tag || '').trim();
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(24, Math.max(1, Number.parseInt(req.query.limit, 10) || 9));
    const skip = (page - 1) * limit;

    const filter = {};

    if (category) {
      filter.category = { $regex: `^${escapeRegex(category)}$`, $options: 'i' };
    }

    if (tag) {
      filter.tags = { $regex: `^${escapeRegex(tag.toLowerCase())}$`, $options: 'i' };
    }

    let blogs = [];
    let totalCount = 0;

    if (search) {
      const textFilter = {
        ...filter,
        $text: { $search: search },
      };

      blogs = await Blog.find(textFilter, { score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' }, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('author', 'name email role');

      totalCount = await Blog.countDocuments(textFilter);

      // Fallback for partial matches that text index may not capture.
      if (!blogs.length && page === 1) {
        const searchRegex = new RegExp(escapeRegex(search), 'i');
        const regexFilter = {
          ...filter,
          $or: [{ title: searchRegex }, { content: searchRegex }, { tags: searchRegex }],
        };

        totalCount = await Blog.countDocuments(regexFilter);
        blogs = await Blog.find(regexFilter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate('author', 'name email role');
      }
    } else {
      totalCount = await Blog.countDocuments(filter);
      blogs = await Blog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('author', 'name email role');
    }

    const totalPages = Math.max(1, Math.ceil(totalCount / limit));
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    const categoryFacets = await Blog.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
      { $project: { _id: 0, category: '$_id', count: 1 } },
      { $limit: 8 },
    ]);

    res.status(200).json({
      count: blogs.length,
      totalCount,
      pagination: {
        page,
        limit,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
      filters: {
        search,
        category,
        tag,
      },
      categoryFacets,
      blogs,
    });
  } catch (error) {
    next(error);
  }
};

export const getBlogSuggestions = async (req, res, next) => {
  try {
    const query = (req.query.q || '').trim();
    const limit = Math.min(8, Math.max(1, Number.parseInt(req.query.limit, 10) || 6));

    if (!query) {
      return res.status(200).json({ suggestions: [] });
    }

    const matchRegex = new RegExp(escapeRegex(query), 'i');

    const titleDocs = await Blog.find({ title: matchRegex })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('title');

    const tagDocs = await Blog.find({ tags: matchRegex })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('tags');

    const titleSuggestions = titleDocs.map((blog) => ({
      type: 'title',
      value: blog.title,
    }));

    const tagSuggestions = tagDocs
      .flatMap((blog) => blog.tags || [])
      .filter((item) => matchRegex.test(item))
      .map((item) => ({
        type: 'tag',
        value: item,
      }));

    const uniqueMap = new Map();
    [...titleSuggestions, ...tagSuggestions].forEach((item) => {
      const key = `${item.type}:${item.value.toLowerCase()}`;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, item);
      }
    });

    const suggestions = Array.from(uniqueMap.values()).slice(0, limit);

    res.status(200).json({ suggestions });
  } catch (error) {
    next(error);
  }
};

export const getBlogBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const blog = await Blog.findOneAndUpdate(
      { slug },
      { $inc: { views: 1 } },
      { new: true }
    ).populate('author', 'name email role avatar bio');

    if (!blog) {
      res.status(404);
      throw new Error('Blog not found');
    }

    res.status(200).json(blog);
  } catch (error) {
    next(error);
  }
};

export const getBlogById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400);
      throw new Error('Invalid blog id');
    }

    const blog = await Blog.findById(id).populate('author', 'name email role');

    if (!blog) {
      res.status(404);
      throw new Error('Blog not found');
    }

    res.status(200).json(blog);
  } catch (error) {
    next(error);
  }
};

export const updateBlog = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400);
      throw new Error('Invalid blog id');
    }

    const blog = await Blog.findById(id);

    if (!blog) {
      res.status(404);
      throw new Error('Blog not found');
    }

    const { title, content, category, tags, image } = req.body;

    if (title && title !== blog.title) {
      blog.title = title;
      blog.slug = await buildUniqueSlug(title, blog._id);
    }

    if (content !== undefined) blog.content = sanitizeHtml(content);
    if (category !== undefined) blog.category = category;
    if (tags !== undefined) blog.tags = normalizeTags(tags);
    if (image !== undefined) blog.image = image;

    await blog.save();

    const updatedBlog = await Blog.findById(blog._id).populate('author', 'name email role');

    res.status(200).json(updatedBlog);
  } catch (error) {
    next(error);
  }
};

export const toggleLikeBlog = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400);
      throw new Error('Invalid blog id');
    }

    const blog = await Blog.findById(id);
    if (!blog) {
      res.status(404);
      throw new Error('Blog not found');
    }

    const userId = req.user._id.toString();
    const likedIndex = blog.likedBy.findIndex((likedUser) => likedUser.toString() === userId);

    let liked = false;

    if (likedIndex >= 0) {
      blog.likedBy.splice(likedIndex, 1);
      blog.likes = Math.max(0, (blog.likes || 0) - 1);
    } else {
      blog.likedBy.push(req.user._id);
      blog.likes = (blog.likes || 0) + 1;
      liked = true;
    }

    await blog.save();

    const io = req.app.get('io');
    if (io) {
      io.to(`blog:${blog._id}`).emit('likeUpdated', {
        blogId: blog._id,
        likes: blog.likes,
      });
    }

    res.status(200).json({
      liked,
      likes: blog.likes,
      blogId: blog._id,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteBlog = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400);
      throw new Error('Invalid blog id');
    }

    const blog = await Blog.findById(id);

    if (!blog) {
      res.status(404);
      throw new Error('Blog not found');
    }

    await blog.deleteOne();

    res.status(200).json({ message: 'Blog deleted successfully' });
  } catch (error) {
    next(error);
  }
};
