const express = require('express');
const router = express.Router();
const { User, Post, Master , Relationship, Message, Bookmark} = require('../models/User');

// Route to fetch all records from the Master table
router.get('/master', async (req, res) => {
  try {
    const masterRecords = await Master.find({});
    res.status(200).json(masterRecords);
  } catch (error) {
    console.error('Error fetching master records:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});



// Route to fetch all following usernames for a given username

router.get('/relation_username/:username', async (req, res) => {
  try {
    const { username } = req.params;

    // Find the relationship record for the given username
    const relationship = await Relationship.findOne({ username });

    if (!relationship) {
      return res.status(404).json({ message: 'No following users found for the given username' });
    }

    // Return the array of following array
    res.status(200).json(relationship);
  } catch (error) {
    console.error('Error fetching following usernames:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});




//Route to fetch following-follower count of particular user name

router .get('/fetch_count/:username', async (req, res)=>{

try{
  const {username} = req.params;

  const relation= await Relationship.findOne({username});

  if(!relation)
    {

      return res.status(400).json({message: 'No users found for the given username'});
    }

//, followers: 0, following: 0
    const followerCount = relation.followers.length ;
    const followingCount = relation.following.length ;

   

    res.status(200).json({ followers: followerCount, following: followingCount });
}
catch (error) {
  console.error('Error fetching following-follower count', error);
  res.status(500).json({ message: 'Internal Server Error' });
}



});

//countdata.followers ? countdata.followers : 0







// Route to follow a user
router.post('/follow/:username', async (req, res) => {
  const { username } = req.params;
  const { currentUserUsername } = req.body; // Assuming you send the current user's username in the request body

  try {
    // Find the user being followed and the current user
    const userToFollow = await Master.findOne({ username });
    const currentUser = await Master.findOne({ username: currentUserUsername });

    if (!userToFollow || !currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the Relationship table
    let relationship = await Relationship.findOne({ username: currentUserUsername });

    // If the relationship record doesn't exist, create a new one
    if (!relationship) {
      relationship = new Relationship({ username: currentUserUsername, following: [] });
    }

    // Add the followed user's username to the following array
    relationship.following.push(username);
    await relationship.save();



    let relationship2 = await Relationship.findOne({ username: username });

     // If the relationship2 record doesn't exist, create a new one
     if (!relationship2) {
      relationship2 = new Relationship({ username: username, followers: [] });
    }

    relationship2.followers.push(currentUserUsername);
    await relationship2.save();
    // Send the response
    res.status(200).json({ message: 'User followed successfully' });
  } catch (error) {
    console.error('Error following user:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});







router.post('/fetch2/:username', async (req, res) => {
  const { username } = req.params;
  const { currentUserUsername } = req.body; 

  try {
    // Find the relationship record for the current user
    const currentUserRelationship = await Relationship.findOne({ username: currentUserUsername });

    if (!currentUserRelationship) {
      return res.status(404).json({ message: 'No relationship record found for the current user' });
    }

    // Check if the user with the given username is being followed by the current user
    const isFollowing = currentUserRelationship.following.includes(username);

    // Return more information about the relationship status
    const result = {
      isFollowing,
      username: currentUserUsername,
      targetUser: username,
      // Add more information if needed
    };

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching!!!', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});









// Fetch bookmarked posts for a specific user
router.get('/bookmarks/:username', async (req, res) => {
  try {
      const { username } = req.params;

      // Find bookmarks for the specified user
      const bookmarks = await Bookmark.find({ current_username: username });

      // Get details of the bookmarked posts
      const bookmarkedPosts = [];
      for (const bookmark of bookmarks) {
          const postId = bookmark.id_post;
          const post = await Post.findById(postId);
          bookmarkedPosts.push(post);
      }

      res.json(bookmarkedPosts);
  } catch (error) {
      console.error('Error fetching bookmarked posts:', error);
      res.status(500).json({ message: 'Internal Server Error' });
  }
});



// DELETE route to remove a bookmarked post
router.delete('/delete_bookmark/:postId', async (req, res) => {
  const { postId } = req.params;
 
  try {
      // Find the bookmarked post by its ID and remove it
      await Bookmark.findOneAndDelete({ id_post: postId });
      

      res.status(200).json({ message: 'Bookmark deleted successfully' });
  } catch (error) {
      console.error('Error deleting bookmark:', error);
      res.status(500).json({ message: 'Internal Server Error' });
  }
});









// Route to unfollow a user
router.post('/unfollow/:username', async (req, res) => {
  const { username } = req.params;
  const {currentUserUsername} = req.body; // Assuming you're sending the current user's username in the request body

 
  try {
    const userToUnfollow = await Master.findOne({ username });
    const currentUser = await Master.findOne({ username: currentUserUsername });

    if (!userToUnfollow || !currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the Relationship table's following field and remove it if it exists
    await Relationship.findOneAndUpdate(
      { username: currentUserUsername },
      { $pull: { following: username } },
      { new: true }
    );

    await Relationship.findOneAndUpdate(
      { username: username },
      { $pull: { followers: currentUserUsername } },
      { new: true }

    );

    res.status(200).json({ message: 'User unfollowed successfully' });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// Route to fetch posts of a user
router.get('/:username/fetch_post_feed', async (req, res) => {
  const { username } = req.params;

  try {

    // Find the current user in the Master table
    const currentUserRelationship = await Master.findOne({ username });


    // Fetch posts of users that the current user is following
    const posts = await Post.find({ username });
   
    res.status(200).json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Route to post a comment on a post
router.post('/:postId/comment', async (req, res) => {
  const { postId } = req.params;
  const { comment, currentUserUsername  } = req.body;
 

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }


    const user_id= await User.findOne({username: currentUserUsername});
   
    post.comments.push({ user: user_id._id, text: comment , person_name: user_id.username});

    await post.save();

   

    res.status(200).json({ message: 'Comment added successfully',text: comment , person_name: user_id.username });
  } catch (error) {
    console.error('Error Adding comment:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});




// Route to fetch followers and following with their profile images
router.get('/followers_following/:username', async (req, res) => {
  try {
    const { username } = req.params;

    // Find the relationship record for the given username
    const relationship = await Relationship.findOne({ username });

    if (!relationship) {
      return res.status(404).json({ message: 'No followers or following users found for the given username' });
    }

    const { followers, following } = relationship;

    // Fetch user details from the Master table using followers and following usernames
    const followersDetails = await Master.find({ username: { $in: followers } }, 'username profileImageUrl');
    const followingDetails = await Master.find({ username: { $in: following } }, 'username profileImageUrl');

   
    // Combine followers and following details
    const data = {
      followers: followersDetails,
      following: followingDetails
    };

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching followers and following:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});






// Route to removeFollower from profile
router.post('/removeFollower/:username', async (req, res) => {
  const { username } = req.params;
  const {currentUserUsername} = req.body; 

 
  try {
    const usertoremove = await Master.findOne({ username });
    const currentUser = await Master.findOne({ username: currentUserUsername });

    if (!usertoremove || !currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }


    // Update the Relationship table's folllower field and remove it if it exists
    await Relationship.findOneAndUpdate(
      { username: currentUserUsername },
      { $pull: { followers: username } },
      { new: true }
    );

    res.status(200).json({ message: 'Follower Removed successfully' });
  } catch (error) {
    console.error('Error Removing Follower :', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});





// Route to unfollowUser from profile
router.post('/unfollowUser/:username', async (req, res) => {
  const { username } = req.params;
  const {currentUserUsername} = req.body; 

 
  try {
    const userToUnfollow = await Master.findOne({ username });
    const currentUser = await Master.findOne({ username: currentUserUsername });

    if (!userToUnfollow || !currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }


    // Update the Relationship table's folllower field and remove it if it exists
    await Relationship.findOneAndUpdate(
      { username: currentUserUsername },
      { $pull: { following: username } },
      { new: true }
    );

    res.status(200).json({ message: 'User Unfollowed successfully' });
  } catch (error) {
    console.error('Error in UnFollowing User :', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});



module.exports = router;
