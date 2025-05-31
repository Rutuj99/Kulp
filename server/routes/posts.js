import express from 'express';
import Post from '../models/Post.js';
import User from '../models/User.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();


router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: posts });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    
    res.status(200).json({ success: true, data: post });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, caption, imageUrl, post } = req.body;
    const user = req.user;

    const newPost = new Post({
      userId: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      title,
      caption,
      imageUrl,
      post
    });

    const savedPost = await newPost.save();
    res.status(201).json({ success: true, data: savedPost });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    
    // Check if user is the post owner
    if (post.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this post' });
    }
    
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    
    res.status(200).json({ success: true, data: updatedPost });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    
    // Check if user is the post owner
    if (post.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this post' });
    }
    
    await Post.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


router.post('/:id/comment', authMiddleware, async (req, res) => {
  try {
    const { comment } = req.body;
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    
    const newComment = {
      userId: req.user.id,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      comment,
      createdAt: new Date()
    };
    
    post.comments.unshift(newComment);
    await post.save();
    
    res.status(201).json({ success: true, data: post.comments });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


router.post('/:id/vote', authMiddleware, async (req, res) => {
  try {
    const { type } = req.body; // 'upvote' or 'downvote'
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    
    // Check if user has already voted
    const existingVoteIndex = post.votes.findIndex(
      vote => vote.userId === req.user.id
    );
    
    // If user has already voted
    if (existingVoteIndex !== -1) {
      const existingVote = post.votes[existingVoteIndex];
      
      // If same vote type, remove the vote (toggle off)
      if (existingVote.type === type) {
        post.votes.splice(existingVoteIndex, 1);
        
        // Update vote count
        if (type === 'upvote') {
          post.voteCount -= 1;
        } else {
          post.voteCount += 1;
        }
      } 
      // If different vote type, update the vote
      else {
        post.votes[existingVoteIndex].type = type;
        
        // Update vote count (flip from -1 to +1 or vice versa = change of 2)
        if (type === 'upvote') {
          post.voteCount += 2;
        } else {
          post.voteCount -= 2;
        }
      }
    } 
    // If user has not voted yet
    else {
      // Add new vote
      post.votes.push({
        userId: req.user.id,
        type
      });
      
      // Update vote count
      if (type === 'upvote') {
        post.voteCount += 1;
      } else {
        post.voteCount -= 1;
      }
    }
    
    await post.save();
    res.status(200).json({ success: true, data: post });
  } catch (error) {
    console.error('Vote error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


router.get('/user/:userId', async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: posts });
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;