import mongoose from 'mongoose';
import Blog from '../models/Blog.js';
import Comment from '../models/Comment.js';
import User from '../models/User.js';
import { escapeRegex } from '../utils/escapeRegex.js';

const MAX_THREAD_DEPTH = Number.parseInt(process.env.MAX_COMMENT_THREAD_DEPTH, 10) || 2;

const extractMentionTokens = (text) => {
  const matches = [...text.matchAll(/@([a-zA-Z0-9_.-]{2,30})/g)];
  return [...new Set(matches.map((match) => match[1].toLowerCase()))];
};

const resolveMentionUserIds = async (text) => {
  const mentionTokens = extractMentionTokens(text);
  if (!mentionTokens.length) return [];

  const users = await User.find({
    $or: mentionTokens.map((token) => ({
      name: { $regex: new RegExp(`^${escapeRegex(token)}$`, 'i') },
    })),
  }).select('_id name');

  return [...new Set(users.map((user) => user._id.toString()))];
};

const buildNestedComments = (topLevelComments, descendants) => {
  const topLevel = topLevelComments.map((comment) => ({
    ...comment.toObject(),
    replies: [],
  }));

  const byId = new Map(topLevel.map((comment) => [comment._id.toString(), comment]));

  descendants.forEach((commentDoc) => {
    const comment = {
      ...commentDoc.toObject(),
      replies: [],
    };

    byId.set(comment._id.toString(), comment);
  });

  descendants.forEach((commentDoc) => {
    const commentId = commentDoc._id.toString();
    const parentId = commentDoc.parentComment?.toString();
    const parent = byId.get(parentId);
    const comment = byId.get(commentId);

    if (parent && comment) {
      parent.replies.push(comment);
    }
  });

  return topLevel;
};

const getDescendantCommentIds = async (commentId) => {
  const collected = [commentId.toString()];
  let frontier = [commentId.toString()];

  while (frontier.length) {
    const children = await Comment.find({
      parentComment: { $in: frontier },
    })
      .select('_id')
      .lean();

    const childIds = children.map((item) => item._id.toString());
    if (!childIds.length) break;

    collected.push(...childIds);
    frontier = childIds;
  }

  return [...new Set(collected)];
};

export const addComment = async (req, res, next) => {
  try {
    const { blog, text, parentComment } = req.body;

    if (!blog || !text?.trim()) {
      res.status(400);
      throw new Error('Blog id and text are required');
    }

    if (!mongoose.Types.ObjectId.isValid(blog)) {
      res.status(400);
      throw new Error('Invalid blog id');
    }

    const targetBlog = await Blog.findById(blog);
    if (!targetBlog) {
      res.status(404);
      throw new Error('Blog not found');
    }

    let validParentComment = null;
    let depth = 0;
    let rootComment = null;
    let parentOwnerId = null;

    if (parentComment) {
      if (!mongoose.Types.ObjectId.isValid(parentComment)) {
        res.status(400);
        throw new Error('Invalid parent comment id');
      }

      const parent = await Comment.findById(parentComment);
      if (!parent || parent.blog.toString() !== blog.toString()) {
        res.status(404);
        throw new Error('Parent comment not found for this blog');
      }

      validParentComment = parent._id;
      rootComment = parent.rootComment || parent._id;
      depth = (parent.depth || 0) + 1;
      parentOwnerId = parent.user?.toString() || null;

      if (depth > MAX_THREAD_DEPTH) {
        res.status(400);
        throw new Error(`Maximum reply depth (${MAX_THREAD_DEPTH}) reached`);
      }
    }

    const mentionIds = await resolveMentionUserIds(text);

    const comment = await Comment.create({
      blog,
      user: req.user._id,
      parentComment: validParentComment,
      rootComment,
      depth,
      mentions: mentionIds,
      text: text.trim(),
    });

    if (!validParentComment) {
      comment.rootComment = comment._id;
      await comment.save();
    }

    targetBlog.commentsCount = Math.max(0, (targetBlog.commentsCount || 0) + 1);
    await targetBlog.save();

    const populated = await Comment.findById(comment._id)
      .populate('user', 'name email role')
      .populate('mentions', 'name email');

    const io = req.app.get('io');
    if (io) {
      io.to(`blog:${blog}`).emit('commentAdded', {
        blogId: blog,
        comment: populated,
        replyToUserId: parentOwnerId,
        mentionUserIds: mentionIds,
      });

      const actor = {
        _id: req.user._id,
        name: req.user.name,
      };

      mentionIds
        .filter((mentionedUserId) => mentionedUserId !== req.user._id.toString())
        .forEach((mentionedUserId) => {
          io.to(`user:${mentionedUserId}`).emit('notify', {
            type: 'mention',
            blogId: blog,
            commentId: populated._id,
            actor,
            message: `${req.user.name} mentioned you in a comment`,
          });
        });

      if (parentOwnerId && parentOwnerId !== req.user._id.toString()) {
        io.to(`user:${parentOwnerId}`).emit('notify', {
          type: 'reply',
          blogId: blog,
          commentId: populated._id,
          actor,
          message: `${req.user.name} replied to your comment`,
        });
      }
    }

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

export const getCommentsByBlog = async (req, res, next) => {
  try {
    const { blogId } = req.params;
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(20, Math.max(1, Number.parseInt(req.query.limit, 10) || 10));
    const cursor = req.query.cursor || null;
    const mode = req.query.mode === 'page' ? 'page' : 'cursor';

    if (!mongoose.Types.ObjectId.isValid(blogId)) {
      res.status(400);
      throw new Error('Invalid blog id');
    }

    let comments = [];
    let hasMore = false;
    let nextCursor = null;
    let totalTopLevelComments = null;
    let totalPages = null;
    let currentPage = null;

    if (mode === 'page') {
      totalTopLevelComments = await Comment.countDocuments({
        blog: blogId,
        parentComment: null,
      });

      comments = await Comment.find({ blog: blogId, parentComment: null })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('user', 'name email role')
        .populate('mentions', 'name email');

      totalPages = Math.max(1, Math.ceil(totalTopLevelComments / limit));
      currentPage = page;
      hasMore = page < totalPages;
      nextCursor = comments.length ? comments[comments.length - 1].createdAt.toISOString() : null;
    } else {
      const query = { blog: blogId, parentComment: null };

      if (cursor) {
        const cursorDate = new Date(cursor);
        if (Number.isNaN(cursorDate.getTime())) {
          res.status(400);
          throw new Error('Invalid cursor value');
        }
        query.createdAt = { $lt: cursorDate };
      }

      const chunk = await Comment.find(query)
        .sort({ createdAt: -1 })
        .limit(limit + 1)
        .populate('user', 'name email role')
        .populate('mentions', 'name email');

      hasMore = chunk.length > limit;
      comments = hasMore ? chunk.slice(0, limit) : chunk;
      nextCursor = hasMore && comments.length ? comments[comments.length - 1].createdAt.toISOString() : null;
    }

    const parentIds = comments.map((comment) => comment._id);
    const replies = await Comment.find({
      blog: blogId,
      parentComment: { $ne: null },
      $or: [{ rootComment: { $in: parentIds } }, { parentComment: { $in: parentIds } }],
    })
      .sort({ createdAt: 1 })
      .populate('user', 'name email role')
      .populate('mentions', 'name email');

    const commentsWithReplies = buildNestedComments(comments, replies);

    res.status(200).json({
      count: commentsWithReplies.length,
      totalCount: totalTopLevelComments,
      currentPage,
      totalPages,
      hasMore,
      nextCursor,
      mode,
      maxThreadDepth: MAX_THREAD_DEPTH,
      comments: commentsWithReplies,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400);
      throw new Error('Invalid comment id');
    }

    const comment = await Comment.findById(id);
    if (!comment) {
      res.status(404);
      throw new Error('Comment not found');
    }

    const isOwner = comment.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      res.status(403);
      throw new Error('Not allowed to delete this comment');
    }

    const descendantIds = await getDescendantCommentIds(comment._id);
    const deleteResult = await Comment.deleteMany({ _id: { $in: descendantIds } });
    const removedCount = deleteResult.deletedCount || descendantIds.length;

    const targetBlog = await Blog.findById(comment.blog);
    if (targetBlog) {
      targetBlog.commentsCount = Math.max(0, (targetBlog.commentsCount || 0) - removedCount);
      await targetBlog.save();
    }

    const io = req.app.get('io');
    if (io) {
      io.to(`blog:${comment.blog}`).emit('commentDeleted', {
        blogId: comment.blog,
        commentId: comment._id,
        deletedIds: descendantIds,
      });
    }

    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    next(error);
  }
};
