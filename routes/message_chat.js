const express = require('express');
const router = express.Router();
const { User, Post, Master, Relationship, Message, Bookmark } = require('../models/User');
const jwt = require('jsonwebtoken');

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
      return res.status(403).send({ message: 'No token provided' });
    }
    jwt.verify(token.split(' ')[1], 'secret', (err, decoded) => {
      if (err) {
        return res.status(500).send({ message: 'Failed to authenticate token' });
      }
      req.userId = decoded.id;
      next();
    });
  };



  // Fetch follower-following of the logged-in user
router.post('/fetch_fusers', verifyToken, async (req, res) => {
    try {
        const { username_profile } = req.body;
        
      const relationship = await Relationship.find({username: username_profile});
    
    // Return the response
    res.status(200).json(relationship);
      
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });



   // Fetch follower-following profile img of the logged-in user
router.post('/fetch_user_profile_img', verifyToken, async (req, res) => {
  try {
      const { username } = req.body;
    
    const master = await Master.find({username: username});
  
  // Return the response
  res.status(200).json(master);
    
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});




// Fetch follower-following bio of the logged-in user
router.post('/fetch_user_bio', verifyToken, async (req, res) => {
  try {
      const { username } = req.body;
    
    const user = await User.find({username: username});
  
  // Return the response
  res.status(200).json(user);
    
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});










// Fetch messages between two users
router.post('/fetch_messages', async (req, res) => {
  const { username_profile, username } = req.body;

  try {
    // Fetch the ObjectId of the current user (username_profile)
    const currentUser = await User.findOne({ username: username_profile });
    if (!currentUser) {
      return res.status(404).json({ error: 'Current user not found' });
    }

    // Fetch the ObjectId of the recipient user (username)
    const recipientUser = await User.findOne({ username: username });
    if (!recipientUser) {
      return res.status(404).json({ error: 'Recipient user not found' });
    }

    const currentUserId = currentUser._id;
    const recipientUserId = recipientUser._id;

    // Fetch messages involving both users and populate the userid field with the username
    const messages = await Message.find({
      $or: [
        { userid: currentUserId, recpid: recipientUserId },
        { userid: recipientUserId, recpid: currentUserId }
      ]
    })
    .populate('userid', 'username') // Populate only the username field of the sender
    .sort({ timestamp: 1 }); // Sort messages by timestamp in ascending order

    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


// Send message
router.post('/send_message', async (req, res) => {
  const { username_profile, currentChatUser, message_content } = req.body;

  
  try {
    // Fetch the ObjectId of the current user (username_profile)
    const currentUser = await User.findOne({ username: username_profile });
    if (!currentUser) {
      return res.status(404).json({ error: 'Current user not found' });
    }

    // Fetch the ObjectId of the recipient user (currentChatUser)
    const recipientUser = await User.findOne({ username: currentChatUser });
    if (!recipientUser) {
      return res.status(404).json({ error: 'Recipient user not found' });
    }

    const currentUserId = currentUser._id;
    const recipientUserId = recipientUser._id;

    // Create a new message
    const newMessage = new Message({
      userid: currentUserId,
      recpid: recipientUserId,
      message_text: message_content,
      seen: false
    });

    // Save the new message
    await newMessage.save();

    res.status(200).json({ message: 'Message sent successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


  




// Delete a specific message
router.post('/delete_message', verifyToken, async (req, res) => {
  const { messageId } = req.body;

  try {
    await Message.findByIdAndDelete(messageId);
    res.status(200).json({ message: 'Message deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});




// Clear all messages between two users
router.post('/clear_all_messages', verifyToken, async (req, res) => {
  const { username_profile, currentChatUser } = req.body;

  try {
    // Fetch the ObjectId of the current user (username_profile)
    const currentUser = await User.findOne({ username: username_profile });
    if (!currentUser) {
      return res.status(404).json({ error: 'Current user not found' });
    }

    // Fetch the ObjectId of the recipient user (currentChatUser)
    const recipientUser = await User.findOne({ username: currentChatUser });
    if (!recipientUser) {
      return res.status(404).json({ error: 'Recipient user not found' });
    }

    const currentUserId = currentUser._id;
    const recipientUserId = recipientUser._id;

    // Delete all messages between the two users
    await Message.deleteMany({
      $or: [
        { userid: currentUserId, recpid: recipientUserId },
        { userid: recipientUserId, recpid: currentUserId }
      ]
    });

    res.status(200).json({ message: 'All messages cleared successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
