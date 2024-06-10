const express = require('express');
const router = express.Router();
const { User, Post, Master, Relationship , Message, Bookmark} = require('../models/User');
// const User = require('../models/User');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const nodemailer = require('nodemailer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');


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



// Function to send registration email
async function sendRegistrationEmail(email, username) {
  try {
      // Create a transporter with your SMTP server details
      const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: "lakshin2563@gmail.com",
            pass: "ypoe jrma lcfz pmej",
          },
      });

      // Email content
      const mailOptions = {
          from: "lakshin2563@gmail.com", // Update with your email
          to: email,
          subject: "Welcome to Your Social Media App!",
          text: `Dear ${username},\n\nWelcome to Your Social Media App! We're thrilled to have you join our community.\n\nWith Your Social Media App, you can connect with friends, share moments, and explore a world of possibilities.\n\nBest regards,\nThe Your Social Media App Team`,
      };

      // Send email
      const info = await transporter.sendMail(mailOptions);

      console.log("Email sent: " + info.response);
  } catch (error) {
      console.error("Error sending registration email:", error);
  }
}

// // Sign Up
router.post('/signup', upload.single('profileImage'), async (req, res) => {
  try {
    const { username, email, password, bio } = req.body;
    let profileImageUrl = '';

    if (req.file) {
      profileImageUrl = await uploadImageToCloudinary(req.file);
    }

    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ message: 'User with this username already exists' });
    }

    //const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password , profileImageUrl , bio: bio, isAdmin:false});
    await newUser.save();


    const newUser_Master = new Master({ username: username, profileImageUrl: profileImageUrl});
    await newUser_Master.save();


     // Send welcome email
     await sendRegistrationEmail(email, username);



    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});









// Log In
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    

    // Check if user exists
    const user = await User.findOne({ username });
    
    if (!user ) {
      return res.status(400).json({ message: 'Invalid Username' });
    }

  

    

    if(password!=user.password)
      {
        return res.status(400).json({ message: 'Invalid password' });
      }

    // if (!(await bcrypt.compare(password, user.password))) {
    //   return res.status(400).json({ message: 'Invalid password' });
    // }

    // Sign JWT token
    const token = jwt.sign({ id: user._id }, 'secret', { expiresIn: '1h' });
   // console.log('Token generated:', token);

    res.status(200).json({ token, username: user.username, isAdmin: user.isAdmin });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Fetch user details by username
router.get('/:username', async (req, res) => {
  try {
    const { username } = req.params;
   
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      username: user.username,
      email: user.email,
      profileImageUrl: user.profileImageUrl,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});




router.get('/:username_profile', async (req, res) => {
  try {
    const { username } = req.params;
    
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      username: user.username,
      email: user.email,
      profileImageUrl: user.profileImageUrl,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// Update user settings
router.post('/settings', async (req, res) => {
  try {
    const { username, newEmail, newPassword } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (newEmail) {
      user.email = newEmail;
     
    }

    if (newPassword) {
      user.password = newPassword;
    
    }

    await user.save();

    res.status(200).json({
      success: true,
      username: user.username,
      email: user.email,
      profileImageUrl: user.profileImageUrl,
      message: 'Settings updated successfully'
    });

  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});




// Update user bio
router.post('/:username/bio', async (req, res) => {
  try {
    const { username } = req.params;
    const { bio } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.bio = bio;
    await user.save();

    res.status(200).json({ message: 'Bio updated successfully' });
  } catch (error) {

    console.error('Error updating bio:', error);
    
    res.status(500).json({ message: 'Internal Server Error' });
  }
});



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


// fetch user bio
router.get('/:username/fetch_bio',verifyToken, async (req, res) => {
  try {
    const { username } = req.params;
  
     const user = await User.findOne({ username });
    
    const username1 = user.bio
   
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({k: username1});
  } catch (error) {
    console.error('Error fetching bio:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// Middleware to check security key
const checkSecurityKey = (req, res, next) => {
  const securityKey = req.headers['authorization'];
  const expectedKey = 'pathak'; // Replace this with your actual security key

  if (securityKey === expectedKey) {
      next();
  } else {
      return res.status(403).json({ message: 'Forbidden: Invalid security key' });
  }
};

// Create Admin
router.post('/createadmin', checkSecurityKey, async (req, res) => {
  try {
      const { username, email, password } = req.body;

      const userExists = await User.findOne({ username });
      if (userExists) {
          return res.status(400).json({ message: 'User with this username already exists' });
      }

      const newUser = new User({ username, email, password, isAdmin: true });  
      await newUser.save();

      res.status(201).json({ message: 'Admin user created successfully' });
  } catch (error) {
      console.error('Create Admin error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Middleware to check if the user is an admin
const verifyAdmin = async (req, res, next) => {
  const user = await User.findById(req.userId);
  if (!user || !user.isAdmin) {
    return res.status(403).send({ message: 'Access forbidden: Admins only' });
  }
  next();
};


// Fetch all users
router.get('/:username/fetch_users', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { username } = req.params;
   

    const users = await User.find({});
    


    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// Update user details
router.put('/:username/update_user', verifyToken, verifyAdmin, async (req, res) => {
  try {
    // const { username1 } = req.params;
    const { email, password, username } = req.body;
    
    const user = await User.findOne({username: username })
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (email) user.email = email;
    if (password) user.password = password;

    await user.save();

    res.status(200).json({ message: 'User updated successfully', user });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});




// Delete a user
router.delete('/:username/delete_user', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { username } = req.params;
    
    const user = await User.findOne({username:username });

    const posts= await Post.find({username:username });

    const master = await Master.find({username:username });

     const relation = await Relationship.find({username:username });


     const id_user=user._id;


     // Remove the user from Relationship records where they are being followed
     await Relationship.updateMany(
      { following: username },
      { $pull: { following: username } }
    );

      // Remove the user from Relationship records where they are being following
      await Relationship.updateMany(
        { followers: username },
        { $pull: { followers: username } }
      );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.deleteOne({ username });
    await Post.deleteMany({username});
    await Master.deleteOne({ username });
   await Relationship.deleteOne({ username });


   // Delete user from Bookmark table if friend_username or current_username matches username
   await Bookmark.deleteMany({ $or: [{ friend_username: username }, { current_username: username }] });



    // Remove the user's ID from the likes array of any post
    await Post.updateMany(
      { likes: id_user },
      { $pull: { likes: id_user } }
    );
    

 // Remove the user's ID from the comment array of any post
    await Post.updateMany(
      { 'comments.user': user._id },
      { $pull: { comments: { user: user._id } } }
    );




    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


















// Delete a user from profile
router.delete('/delete_user_from_profile', verifyToken, async (req, res) => {
  try {
    const { username } = req.body;
    

    
    const user = await User.findOne({username:username });

    const posts= await Post.find({username:username });

    const master = await Master.find({username:username });

     const relation = await Relationship.find({username:username });


     const id_user=user._id;


     // Remove the user from Relationship records where they are being followed
     await Relationship.updateMany(
      { following: username },
      { $pull: { following: username } }
    );

      // Remove the user from Relationship records where they are being following
      await Relationship.updateMany(
        { followers: username },
        { $pull: { followers: username } }
      );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.deleteOne({ username });
    await Post.deleteMany({username});
    await Master.deleteOne({ username });
   await Relationship.deleteOne({ username });


   // Delete user from Bookmark table if friend_username or current_username matches username
   await Bookmark.deleteMany({ $or: [{ friend_username: username }, { current_username: username }] });



    // Remove the user's ID from the likes array of any post
    await Post.updateMany(
      { likes: id_user },
      { $pull: { likes: id_user } }
    );
    

 // Remove the user's ID from the comment array of any post
    await Post.updateMany(
      { 'comments.user': user._id },
      { $pull: { comments: { user: user._id } } }
    );




    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
module.exports = router;
