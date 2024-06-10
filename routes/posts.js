const express = require('express');
const router = express.Router();
// const User = require('../models/User');
// const Post = require('../models/Post');
const { User, Post , Master, Relationship,  Message, Bookmark} = require('../models/User');


// Define your routes for posts here

const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

const jwt = require('jsonwebtoken');

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'dlstkslyu',
  api_key: '147498912511523',
  api_secret: 'oMABarW4U3ZgBtKi3NnnQ2chnJE'
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const uploadImageToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    let stream = cloudinary.uploader.upload_stream((error, result) => {
      if (result) {
        resolve(result.secure_url);
      } else {
        reject(error);
      }
    });
    streamifier.createReadStream(file.buffer).pipe(stream);
  });
};

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













// Change Profile Image
router.post('/change_profile_image/:loginUsername', verifyToken, upload.single('image'), async (req, res) => {
  try {
    const { loginUsername } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).send({ message: 'No image file uploaded' });
    }

    const imageUrl = await uploadImageToCloudinary(file);

    // Update profileImageUrl in User and Master collections
    await User.updateOne({ username: loginUsername }, { profileImageUrl: imageUrl });
    await Master.updateOne({ username: loginUsername }, { profileImageUrl: imageUrl });

    res.status(200).json({ message: 'Profile image updated successfully', imageUrl });
  } catch (error) {
    console.error('Error updating profile image:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});







// Create Post
router.post('/create_post', verifyToken, upload.single('image'), async (req, res) => {
  try {
    const { caption , username} = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).send({ message: 'No image file uploaded' });
    }

    const imageUrl = await uploadImageToCloudinary(file);

    const newPost = new Post({
      user: req.userId,
      username:username,
      caption: caption,
      image: imageUrl,
      likes: [],
      comments: []
    });

    await newPost.save();

    res.status(201).json({ message: 'Post created successfully', post: newPost });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});




// Fetch posts for the logged-in user
router.get('/display_posts', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const posts = await Post.find({ username: user.username }).populate('user');

    res.status(200).json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});



// Delete a post by ID
router.delete('/delete_post/:postId', verifyToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.user.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await Post.findByIdAndDelete(postId);
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});




// Add comment to a post
router.post('/add_comment/:postId', verifyToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const { comment , username_profile} = req.body;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    const user2 = await User.findOne({username: username_profile });

    post.comments.push({ text: comment, user: user2._id , person_name: user2.username});
    await post.save();

    res.status(201).json({ message: 'Comment added successfully', comment });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get comments for a post
router.get('/get_comments/:postId', verifyToken, async (req, res) => {
  try {
    const { postId } = req.params;
  

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
  
    
    const comments = post.comments;
    //const username=post.person_name;
    res.status(200).json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});





// Like a post from profile
router.post('/like/:postId', verifyToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const{currentUserUsername}=req.body;

   


    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    

    const user2 = await User.findOne({username: currentUserUsername });

   

    if (post.likes.includes(user2._id)) {
      return res.status(400).json({ message: 'Post already liked' });
    }

    post.likes.push(req.userId);
    await post.save();

    res.status(200).json({ message: 'Post liked successfully', likes: post.likes.length });
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});



// Like a post from feed
router.post('/like2/:postId', verifyToken, async (req, res) => {
  try {
   // console.log("lp1");
    const { postId } = req.params;

    const{currentUserUsername}=req.body;

    


    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
   
    

    const user2 = await User.findOne({username: currentUserUsername });

    if (post.likes.includes(user2._id)) {
      return res.status(400).json({ message: 'Post already liked' });
    }

    post.likes.push(user2._id);
    await post.save();

    res.status(200).json({ message: 'Post liked successfully', likes: post.likes.length });
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});



// Unlike a post from feed
router.post('/unlike2/:postId', verifyToken, async (req, res) => {
  try {
    
   // console.log("lp2");

    const { postId } = req.params;
    const{currentUserUsername}=req.body;

    const post = await Post.findById(postId);


    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const user2 = await User.findOne({username: currentUserUsername });


    const likeIndex = post.likes.indexOf(user2._id);

    if (likeIndex === -1) {
      return res.status(400).json({ message: 'Post not liked yet' });
    }

    post.likes.splice(likeIndex, 1);
    await post.save();

    res.status(200).json({ message: 'Post unliked successfully', likes: post.likes.length });
 
  } catch (error) {
    console.error('Error unliking post:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});






// Unlike a post from profile
router.post('/unlike/:postId', verifyToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const{currentUserUsername}=req.body;
    const post = await Post.findById(postId);


   

    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    const user2 = await User.findOne({username: currentUserUsername });

    const likeIndex = post.likes.indexOf(user2._id);
  
    if (likeIndex === -1) {
      return res.status(400).json({ message: 'Post not liked yet' });
    }

    post.likes.splice(likeIndex, 1);
    await post.save();

    res.status(200).json({ message: 'Post unliked successfully', likes: post.likes.length });
  } catch (error) {
    console.error('Error unliking post:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});




// Fetch like status for a post
router.post('/fetch_like/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const { post_id, currentusername} = req.body;

   //  console.log("lp3");

    // Find the user by their username
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

  
    

    const user2 = await User.findOne({username: currentusername });
    
      // Find the post first from post_id
      const post = await Post.findById(post_id);
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
      var isliked = false;   
      if (post.likes.includes(user2._id)) {
        isliked =true;
       
        res.status(200).json({ isliked, size:post.likes.length });
      }
      else
      {
      
        // Return the like status
        res.status(200).json({ isliked , size:post.likes.length});
      }
   
   
  } catch (error) {
    console.error('Error fetching like status:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});




// Bookmark a post
router.post('/bookmark_post', verifyToken, async (req, res) => {
  try {
    const { postId, postUsername, currentUserUsername } = req.body;

    // Check if the bookmark already exists
    const existingBookmark = await Bookmark.findOne({
      current_username: currentUserUsername,
      friend_username: postUsername,
      id_post: postId
    });

    if (existingBookmark) {
      return res.status(400).json({ message: 'Post is already bookmarked' });
    }

    // If the bookmark does not exist, create a new one
    const bookmark = new Bookmark({
      current_username: currentUserUsername,
      friend_username: postUsername,
      id_post: postId
    });

    await bookmark.save();
    res.status(201).json({ message: 'Post bookmarked successfully' });
  } catch (error) {
    console.error('Error bookmarking post:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
















// Delete a comment by ID
router.delete('/delete_comment/:postId/:commentId', verifyToken, async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if the comment exists
    const commentIndex = post.comments.findIndex(comment => comment._id.toString() === commentId);
    if (commentIndex === -1) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Remove the comment
    post.comments.splice(commentIndex, 1);
    await post.save();

    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});





router.get('/search', async (req, res) => {
  const queryString = req.query.query;
  
  


  try {
      const users = await User.find({
        isAdmin: false, // Ensure isAdmin is false
          $or: [
              { username: { $regex: queryString, $options: 'i' } }, // Case-insensitive regex search
              { bio: { $regex: queryString, $options: 'i' } }
          ]
      }).select('username bio profileImageUrl');

      res.json(users);
  } catch (error) {
      console.error('Error searching for users:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});





module.exports = router;
