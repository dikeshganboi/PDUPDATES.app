import User from '../models/User.js';

export const searchUsers = async (req, res, next) => {
  try {
    const query = (req.query.q || '').trim();

    if (query.length < 1) {
      return res.status(200).json({ users: [] });
    }

    const users = await User.find({
      name: { $regex: new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
    })
      .select('_id name email role')
      .limit(8)
      .lean();

    return res.status(200).json({ users });
  } catch (error) {
    return next(error);
  }
};

export const getMyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const updateMyProfile = async (req, res, next) => {
  try {
    const { name, bio, avatar } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    if (name !== undefined) user.name = name.trim();
    if (bio !== undefined) user.bio = bio.trim();
    if (avatar !== undefined) user.avatar = avatar.trim();

    await user.save();

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      bio: user.bio,
    });
  } catch (error) {
    next(error);
  }
};
