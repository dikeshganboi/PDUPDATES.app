'use client';

import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { FiHeart } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import { toggleBlogLike } from '../../lib/engagementApi';
import { useAuth } from '../../context/AuthContext';
import { getSocket } from '../../lib/socket';

const LikeButton = ({ blogId, initialLikes = 0, initialLikedBy = [] }) => {
  const { isAuthenticated, token, user } = useAuth();
  const initialLiked = useMemo(
    () => initialLikedBy.some((id) => id?.toString?.() === user?._id),
    [initialLikedBy, user?._id]
  );

  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(initialLiked);
  const [loading, setLoading] = useState(false);

  // Sync liked state when user loads after hydration (SSR has no user)
  useEffect(() => {
    if (user?._id) {
      const isLiked = initialLikedBy.some(
        (id) => id?.toString?.() === user._id?.toString()
      );
      setLiked(isLiked);
    }
  }, [user?._id, initialLikedBy]);

  useEffect(() => {
    const socket = getSocket();

    socket.emit('joinBlog', blogId);

    const onLikeUpdated = (payload) => {
      if (payload.blogId?.toString() === blogId?.toString()) {
        setLikes(payload.likes);
      }
    };

    socket.on('likeUpdated', onLikeUpdated);

    return () => {
      socket.emit('leaveBlog', blogId);
      socket.off('likeUpdated', onLikeUpdated);
    };
  }, [blogId]);

  const onLike = async () => {
    if (!isAuthenticated) {
      toast('Please login to like this post');
      return;
    }

    if (loading) return;

    const prevLiked = liked;
    const prevLikes = likes;
    const optimisticLiked = !prevLiked;

    setLiked(optimisticLiked);
    setLikes((count) => Math.max(0, count + (optimisticLiked ? 1 : -1)));

    try {
      setLoading(true);
      const data = await toggleBlogLike(blogId, token);
      setLiked(data.liked);
      setLikes(data.likes);
      toast.success(data.liked ? 'You liked this post' : 'Like removed');
    } catch (error) {
      setLiked(prevLiked);
      setLikes(prevLikes);
      toast.error(error.response?.data?.message || 'Failed to update like');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={onLike}
      disabled={loading}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
        liked ? 'border-red-500 bg-red-500 text-white' : 'border-amber-200 bg-white text-ink hover:bg-soft'
      } disabled:opacity-70`}
    >
      {liked ? <FaHeart /> : <FiHeart />}
      <span>{likes}</span>
    </button>
  );
};

export default LikeButton;
