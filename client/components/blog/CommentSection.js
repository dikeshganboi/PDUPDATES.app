'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import {
  addCommentToBlog,
  deleteCommentById,
  fetchCommentsByBlogCursor,
  searchUsersForMentions,
} from '../../lib/engagementApi';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/formatDate';
import { getSocket } from '../../lib/socket';

const PAGE_LIMIT = 8;

const getMentionQueryAtCursor = (value, cursorPosition) => {
  const before = value.slice(0, cursorPosition);
  const match = before.match(/(?:^|\s)@([a-zA-Z0-9_.-]{1,30})$/);
  return match ? match[1] : '';
};

const applyMentionAtCursor = (value, cursorPosition, mentionName) => {
  const before = value.slice(0, cursorPosition);
  const after = value.slice(cursorPosition);
  const replacedBefore = before.replace(/@([a-zA-Z0-9_.-]{1,30})$/, `@${mentionName} `);
  return `${replacedBefore}${after}`;
};

const mergeById = (source, incoming) => {
  const map = new Map(source.map((item) => [item._id.toString(), item]));
  incoming.forEach((item) => {
    map.set(item._id.toString(), item);
  });
  return Array.from(map.values());
};

const addReplyToTree = (comments, parentId, reply) =>
  comments.map((comment) => {
    if (comment._id.toString() === parentId.toString()) {
      const replies = comment.replies || [];
      if (replies.some((item) => item._id.toString() === reply._id.toString())) return comment;

      return {
        ...comment,
        replies: [...replies, reply],
      };
    }

    return {
      ...comment,
      replies: comment.replies ? addReplyToTree(comment.replies, parentId, reply) : [],
    };
  });

const removeFromTree = (comments, deletedIdsSet) =>
  comments
    .filter((comment) => !deletedIdsSet.has(comment._id?.toString()))
    .map((comment) => ({
      ...comment,
      replies: comment.replies ? removeFromTree(comment.replies, deletedIdsSet) : [],
    }));

const replaceNodeById = (comments, targetId, replacement) =>
  comments.map((comment) => {
    if (comment._id.toString() === targetId.toString()) {
      return replacement;
    }

    return {
      ...comment,
      replies: comment.replies ? replaceNodeById(comment.replies, targetId, replacement) : [],
    };
  });

const renderTextWithMentions = (text) => {
  const parts = (text || '').split(/(@[a-zA-Z0-9_.-]+)/g);

  return parts.map((part, index) => {
    if (part.startsWith('@')) {
      return (
        <span key={`${part}-${index}`} className="font-semibold text-[#3858F6]">
          {part}
        </span>
      );
    }

    return <span key={`${part}-${index}`}>{part}</span>;
  });
};

const CommentItem = ({
  comment,
  user,
  isAdmin,
  isAuthenticated,
  maxThreadDepth,
  openReplyFor,
  setOpenReplyFor,
  replyDrafts,
  setReplyDrafts,
  onReplyTextChange,
  submitReply,
  handleDelete,
  mentionContext,
  mentionUsers,
  selectMention,
  depthIndent = 0,
}) => {
  const canDelete = isAdmin || comment.user?._id === user?._id;
  const canReply = (comment.depth || 0) < maxThreadDepth;

  return (
    <article
      className="rounded-xl border border-amber-100 bg-soft/50 px-4 py-3"
      style={{ marginLeft: `${depthIndent}px` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-ink">{comment.user?.name || 'User'}</p>
          <p className="text-xs text-ink/60">{formatDate(comment.createdAt)}</p>
        </div>

        {canDelete && (
          <button
            type="button"
            onClick={() => handleDelete(comment._id)}
            className="text-xs font-semibold text-red-600 hover:underline"
          >
            Delete
          </button>
        )}
      </div>

      <p className="mt-2 whitespace-pre-line text-sm leading-6 text-ink/90">
        {renderTextWithMentions(comment.text)}
      </p>

      <div className="mt-3 flex items-center gap-3">
        {canReply && (
          <button
            type="button"
            onClick={() => {
              if (!isAuthenticated) {
                toast('Login to reply');
                return;
              }

              setOpenReplyFor((prev) => (prev === comment._id ? '' : comment._id));
              setReplyDrafts((prev) => ({
                ...prev,
                [comment._id]: prev[comment._id] || `@${comment.user?.name || 'user'} `,
              }));
            }}
            className="text-xs font-semibold text-[#3858F6] hover:underline"
          >
            Reply
          </button>
        )}
      </div>

      {openReplyFor === comment._id && (
        <form onSubmit={(event) => submitReply(event, comment)} className="mt-3 space-y-2">
          <textarea
            value={replyDrafts[comment._id] || ''}
            onChange={(event) => onReplyTextChange(comment._id, event)}
            rows={2}
            className="w-full rounded-lg border border-amber-200 px-3 py-2 text-xs outline-none focus:border-[#3858F6]"
            placeholder="Write a reply..."
          />

          {mentionContext.target === `reply:${comment._id}` && mentionUsers.length > 0 && (
            <div className="rounded-lg border border-amber-100 bg-white shadow-sm">
              {mentionUsers.map((mentionUser) => (
                <button
                  key={mentionUser._id}
                  type="button"
                  onClick={() => selectMention(mentionUser.name)}
                  className="block w-full border-b border-amber-50 px-3 py-1.5 text-left text-[11px] text-ink hover:bg-soft last:border-b-0"
                >
                  @{mentionUser.name}
                </button>
              ))}
            </div>
          )}

          <button
            type="submit"
            className="rounded-lg bg-[#3858F6] px-3 py-1.5 text-xs font-semibold text-white hover:bg-black transition"
          >
            Post Reply
          </button>
        </form>
      )}

      {!!comment.replies?.length && (
        <div className="mt-3 space-y-2 border-l-2 border-amber-100 pl-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply._id}
              comment={reply}
              user={user}
              isAdmin={isAdmin}
              isAuthenticated={isAuthenticated}
              maxThreadDepth={maxThreadDepth}
              openReplyFor={openReplyFor}
              setOpenReplyFor={setOpenReplyFor}
              replyDrafts={replyDrafts}
              setReplyDrafts={setReplyDrafts}
              onReplyTextChange={onReplyTextChange}
              submitReply={submitReply}
              handleDelete={handleDelete}
              mentionContext={mentionContext}
              mentionUsers={mentionUsers}
              selectMention={selectMention}
              depthIndent={8}
            />
          ))}
        </div>
      )}
    </article>
  );
};

const CommentSection = ({ blogId }) => {
  const { isAuthenticated, token, user, isAdmin } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const [maxThreadDepth, setMaxThreadDepth] = useState(2);
  const [submitting, setSubmitting] = useState(false);
  const [text, setText] = useState('');
  const [replyDrafts, setReplyDrafts] = useState({});
  const [openReplyFor, setOpenReplyFor] = useState('');
  const cursorCacheRef = useRef(new Map());
  const [mentionContext, setMentionContext] = useState({ target: null, query: '', cursor: 0 });
  const [mentionUsers, setMentionUsers] = useState([]);
  const mentionDebounceRef = useRef(null);

  const canSubmit = useMemo(() => isAuthenticated && text.trim().length > 0, [isAuthenticated, text]);

  const loadCommentsByCursor = async (cursor = null, append = false) => {
    const cacheKey = cursor || '__start__';
    const cached = cursorCacheRef.current.get(cacheKey);
    if (cached) {
      setComments((prev) => (append ? mergeById(prev, cached.comments) : cached.comments));
      setHasMore(cached.hasMore);
      setNextCursor(cached.nextCursor || null);
      setMaxThreadDepth(cached.maxThreadDepth || 2);
      return;
    }

    try {
      const data = await fetchCommentsByBlogCursor(blogId, cursor, PAGE_LIMIT);
      const nextComments = data.comments || [];

      setComments((prev) => (append ? mergeById(prev, nextComments) : nextComments));
      setHasMore(Boolean(data.hasMore));
      setNextCursor(data.nextCursor || null);
      setMaxThreadDepth(data.maxThreadDepth || 2);

      cursorCacheRef.current.set(cacheKey, {
        comments: nextComments,
        hasMore: Boolean(data.hasMore),
        nextCursor: data.nextCursor || null,
        maxThreadDepth: data.maxThreadDepth || 2,
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load comments');
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadCommentsByCursor(null, false);
      setLoading(false);
    };

    if (blogId) {
      init();
    }
  }, [blogId]);

  useEffect(() => {
    const socket = getSocket();
    socket.emit('joinBlog', blogId);

    const onCommentAdded = (payload) => {
      if (payload.blogId?.toString() !== blogId?.toString()) return;

      const incoming = payload.comment;
      const incomingId = incoming._id?.toString();
      const incomingUserId = incoming.user?._id?.toString() || incoming.user?.toString();

      // Skip our own comments — already handled by optimistic update
      if (incomingUserId && incomingUserId === user?._id?.toString()) {
        return;
      }

      setComments((prev) => {
        if (incoming.parentComment) {
          return addReplyToTree(prev, incoming.parentComment.toString(), incoming);
        }

        if (prev.some((comment) => comment._id.toString() === incomingId)) return prev;
        return [incoming, ...prev];
      });
      cursorCacheRef.current.clear();
    };

    const onCommentDeleted = (payload) => {
      if (payload.blogId?.toString() !== blogId?.toString()) return;

      const deletedIds = payload.deletedIds?.length
        ? payload.deletedIds.map((id) => id.toString())
        : [payload.commentId.toString()];
      const deletedSet = new Set(deletedIds);

      setComments((prev) => removeFromTree(prev, deletedSet));
      cursorCacheRef.current.clear();
    };

    socket.on('commentAdded', onCommentAdded);
    socket.on('commentDeleted', onCommentDeleted);

    return () => {
      socket.emit('leaveBlog', blogId);
      socket.off('commentAdded', onCommentAdded);
      socket.off('commentDeleted', onCommentDeleted);
    };
  }, [blogId]);

  useEffect(() => {
    if (!isAuthenticated || !token || !mentionContext.query) {
      setMentionUsers([]);
      return;
    }

    if (mentionDebounceRef.current) {
      clearTimeout(mentionDebounceRef.current);
    }

    mentionDebounceRef.current = setTimeout(async () => {
      try {
        const data = await searchUsersForMentions(mentionContext.query, token);
        setMentionUsers(data.users || []);
      } catch {
        setMentionUsers([]);
      }
    }, 200);

    return () => {
      if (mentionDebounceRef.current) {
        clearTimeout(mentionDebounceRef.current);
      }
    };
  }, [mentionContext.query, isAuthenticated, token]);

  const updateMentionContext = (target, value, selectionStart) => {
    const query = getMentionQueryAtCursor(value, selectionStart);
    if (!query) {
      setMentionContext({ target: null, query: '', cursor: 0 });
      return;
    }

    setMentionContext({ target, query, cursor: selectionStart });
  };

  const onMainTextChange = (event) => {
    const { value, selectionStart } = event.target;
    setText(value);
    updateMentionContext('main', value, selectionStart);
  };

  const onReplyTextChange = (commentId, event) => {
    const { value, selectionStart } = event.target;
    setReplyDrafts((prev) => ({
      ...prev,
      [commentId]: value,
    }));
    updateMentionContext(`reply:${commentId}`, value, selectionStart);
  };

  const selectMention = (mentionName) => {
    if (mentionContext.target === 'main') {
      const nextValue = applyMentionAtCursor(text, mentionContext.cursor, mentionName);
      setText(nextValue);
    } else if (mentionContext.target?.startsWith('reply:')) {
      const commentId = mentionContext.target.split(':')[1];
      const draft = replyDrafts[commentId] || '';
      const nextValue = applyMentionAtCursor(draft, mentionContext.cursor, mentionName);
      setReplyDrafts((prev) => ({
        ...prev,
        [commentId]: nextValue,
      }));
    }

    setMentionContext({ target: null, query: '', cursor: 0 });
    setMentionUsers([]);
  };

  const submitComment = async (event) => {
    event.preventDefault();

    if (!isAuthenticated) {
      toast('Login to add comments');
      return;
    }

    const message = text.trim();
    if (!message) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticComment = {
      _id: tempId,
      blog: blogId,
      text: message,
      depth: 0,
      parentComment: null,
      replies: [],
      user: {
        _id: user?._id,
        name: user?.name || 'You',
      },
      createdAt: new Date().toISOString(),
    };

    try {
      setSubmitting(true);
      setComments((prev) => [optimisticComment, ...prev]);
      cursorCacheRef.current.clear();

      const newComment = await addCommentToBlog({ blog: blogId, text: message }, token);
      setComments((prev) => replaceNodeById(prev, tempId, { ...newComment, replies: [] }));
      setText('');
      toast.success('Comment added');
    } catch (error) {
      setComments((prev) => prev.filter((item) => item._id !== tempId));
      toast.error(error.response?.data?.message || 'Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;

    try {
      await deleteCommentById(commentId, token);
      setComments((prev) => removeFromTree(prev, new Set([commentId.toString()])));
      cursorCacheRef.current.clear();
      toast.success('Comment deleted');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete comment');
    }
  };

  const submitReply = async (event, parentComment) => {
    event.preventDefault();

    if (!isAuthenticated) {
      toast('Login to reply');
      return;
    }

    if ((parentComment.depth || 0) >= maxThreadDepth) {
      toast.error(`Maximum reply depth is ${maxThreadDepth}`);
      return;
    }

    const message = (replyDrafts[parentComment._id] || '').trim();
    if (!message) return;

    const tempId = `temp-reply-${Date.now()}`;
    const optimisticReply = {
      _id: tempId,
      blog: blogId,
      text: message,
      depth: (parentComment.depth || 0) + 1,
      parentComment: parentComment._id,
      replies: [],
      user: {
        _id: user?._id,
        name: user?.name || 'You',
      },
      createdAt: new Date().toISOString(),
    };

    try {
      setComments((prev) => addReplyToTree(prev, parentComment._id, optimisticReply));
      const newReply = await addCommentToBlog(
        { blog: blogId, text: message, parentComment: parentComment._id },
        token
      );

      setComments((prev) => replaceNodeById(prev, tempId, { ...newReply, replies: [] }));
      setReplyDrafts((prev) => ({ ...prev, [parentComment._id]: '' }));
      setOpenReplyFor('');
      toast.success('Reply added');
    } catch (error) {
      setComments((prev) => removeFromTree(prev, new Set([tempId])));
      toast.error(error.response?.data?.message || 'Failed to add reply');
    }
  };

  const loadMore = async () => {
    if (!nextCursor) return;
    setLoadingMore(true);
    await loadCommentsByCursor(nextCursor, true);
    setLoadingMore(false);
  };

  return (
    <section className="mt-10 rounded-2xl border border-amber-100 bg-white p-5 md:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-ink">Comments</h2>
        <span className="rounded-full bg-soft px-3 py-1 text-xs font-semibold text-ink/70">{comments.length}</span>
      </div>

      <form onSubmit={submitComment} className="space-y-3">
        <textarea
          value={text}
          onChange={onMainTextChange}
          rows={3}
          placeholder={isAuthenticated ? 'Share your thoughts...' : 'Login to write a comment'}
          className="w-full rounded-xl border border-amber-200 px-3 py-2.5 text-sm outline-none transition focus:border-[#3858F6]"
          disabled={!isAuthenticated || submitting}
        />

        {mentionContext.target === 'main' && mentionUsers.length > 0 && (
          <div className="rounded-xl border border-amber-100 bg-white shadow-sm">
            {mentionUsers.map((mentionUser) => (
              <button
                key={mentionUser._id}
                type="button"
                onClick={() => selectMention(mentionUser.name)}
                className="block w-full border-b border-amber-50 px-3 py-2 text-left text-xs text-ink hover:bg-soft last:border-b-0"
              >
                @{mentionUser.name}
              </button>
            ))}
          </div>
        )}

        <button
          type="submit"
          disabled={!canSubmit || submitting}
          className="rounded-xl bg-[#3858F6] px-4 py-2 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Posting...' : 'Post Comment'}
        </button>
      </form>

      <div className="mt-6 space-y-4">
        {loading && <p className="text-sm text-ink/70">Loading comments...</p>}

        {!loading && comments.length === 0 && (
          <p className="rounded-xl border border-dashed border-amber-200 bg-soft/60 px-4 py-4 text-sm text-ink/70">
            No comments yet. Be the first to comment.
          </p>
        )}

        {comments.map((comment) => (
          <CommentItem
            key={comment._id}
            comment={comment}
            user={user}
            isAdmin={isAdmin}
            isAuthenticated={isAuthenticated}
            maxThreadDepth={maxThreadDepth}
            openReplyFor={openReplyFor}
            setOpenReplyFor={setOpenReplyFor}
            replyDrafts={replyDrafts}
            setReplyDrafts={setReplyDrafts}
            onReplyTextChange={onReplyTextChange}
            submitReply={submitReply}
            handleDelete={handleDelete}
            mentionContext={mentionContext}
            mentionUsers={mentionUsers}
            selectMention={selectMention}
          />
        ))}

        {!loading && hasMore && (
          <button
            type="button"
            onClick={loadMore}
            disabled={loadingMore}
            className="rounded-xl border border-amber-200 px-4 py-2 text-sm font-semibold text-ink hover:bg-soft disabled:opacity-60"
          >
            {loadingMore ? 'Loading...' : 'Load More Comments'}
          </button>
        )}
      </div>
    </section>
  );
};

export default CommentSection;
