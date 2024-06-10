document.addEventListener('DOMContentLoaded', async function () {





  const urlParams = new URLSearchParams(window.location.search);

  const isScript1 = urlParams.get("script1") === "true";
  const isScript2 = urlParams.get("script2") === "true";
  const isScript3 = urlParams.get("script3") === "true";
  const isScript4 = urlParams.get("script4") === "true";
  //urlParams.get("fusername") ||
  const username =  sessionStorage.getItem("loginusername");
  const currentUserUsername =  sessionStorage.getItem("loginusername") ; //urlParams.get("fusername") ||
  if (isScript1 || isScript2 || isScript3 || isScript4) {
    const username =  sessionStorage.getItem("loginusername") ;
    //loginusername2
   
    document.getElementById('username1').textContent = `${username}`;

    try {
      const response = await fetch(`/api/auth/${username}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
      });

      const data = await response.json();

     
      if (data.profileImageUrl) {
        document.getElementById('profileImage').src = data.profileImageUrl;
      } else {
        document.getElementById('profileImage').src = 'assets/img/default-profile.png'; // Use a default image if no profile image is found
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }

    // Fetch suggestions
    try {
      const suggestionsResponse = await fetch('/api/profile/master', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
      });

      const suggestionsData = await suggestionsResponse.json();
      const suggestionsContainer = document.getElementById('suggestions');

      suggestionsData.forEach(suggestion => {
        if (suggestion.username !== username) {

          
          const suggestionCard = document.createElement('div');
          suggestionCard.className = 'card';

          const profileImage = document.createElement('img');
          profileImage.src = suggestion.profileImageUrl || 'assets/img/default-profile.png';
          profileImage.alt = suggestion.username;

          const infoDiv = document.createElement('div');
          infoDiv.className = 'info';

          const usernameDiv = document.createElement('div');
          usernameDiv.className = 'name';
          usernameDiv.textContent = suggestion.username;


          const followButton = document.createElement('button');
          followButton.className = 'follow-btn';
          followButton.textContent = 'Follow';
          followButton.dataset.username = suggestion.username;

          followButton.addEventListener('click', async function () {
            if (followButton.textContent === 'Follow') {
              await followUser(suggestion.username, followButton);
            } else {
              await unfollowUser(suggestion.username, followButton);
            }
          });

          infoDiv.appendChild(usernameDiv);
          infoDiv.appendChild(followButton);
          suggestionCard.appendChild(profileImage);
          suggestionCard.appendChild(infoDiv);
          suggestionsContainer.appendChild(suggestionCard);

         // loadUserPosts(suggestion.username);
        }
      });
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  }
  




//fetch following usernames
try {
  const response = await fetch(`/api/profile/relation_username/${username}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    }
  });

  const data = await response.json();





  for(var i=0;i<data.following.length;i++)
    {
      loadUserPosts(data.following[i]);
    }

} catch (error) {
  console.error('Error fetching user data:', error);
}



  async function followUser(username, button) {
    try {
        const response = await fetch(`/api/profile/follow/${username}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            body: JSON.stringify({ currentUserUsername })
        });

        if (response.ok) {
            button.textContent = 'Unfollow';
            button.classList.add('unfollow');
           // localStorage.setItem(`${username}-followed`, 'true'); // Store follow status in local storage
           sessionStorage.setItem(`${currentUserUsername}-${username}-followed`, 'true');
          // document.cookie = `${currentUserUsername}-${username}-followed=true; expires=Thu, 01 Jan 2099 00:00:00 UTC; path=/;`;

            window.location.reload(true);
          //  loadUserPosts(username);
        } else {
            console.error('Error following user:', response.statusText);
        }
    } catch (error) {
        console.error('Error following user:', error);
    }
   
}





async function func(username,currentUserUsername)
{

  try {
    const response = await fetch(`/api/profile/fetch2/${username}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      },
      body: JSON.stringify({ currentUserUsername })
    });

    if (response.ok) {
    const data = await response.json();
    
  return data.isFollowing   
   
    } else {
      console.error('Error unfollowing user:', response.statusText);
    }
  } catch (error) {
    console.error('Error unfollowing user:', error);
  }
}

// Check if the user is already followed and update button text accordingly
const followButtons = document.querySelectorAll('.follow-btn');
followButtons.forEach(button => {
    const username = button.dataset.username;

 //   const isFollowed = sessionStorage.getItem(`${currentUserUsername}-${username}-followed`);
  
(async () => {
  try {
      const isFollowing = await func(username, currentUserUsername);

      
    
    
    if (isFollowing === true) {
         
          button.textContent = 'Unfollow';
          button.classList.add('unfollow');
      }
  } catch (error) {
      console.error('Error:', error);
  }
})();



});

async function unfollowUser(username, button) {

  try {
    const response = await fetch(`/api/profile/unfollow/${username}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      },
      body: JSON.stringify({ currentUserUsername })
    });

    if (response.ok) {
      button.textContent = 'Follow';
      button.classList.remove('unfollow');
      sessionStorage.removeItem(`${currentUserUsername}-${username}-followed`); // Remove the follow status from local storage
     // removeUserPosts(username);
    // document.cookie = `${currentUserUsername}-${username}-followed=true; expires=Thu, 01 Jan 2099 00:00:00 UTC; path=/;`;

      window.location.reload(true);
     // removeUserPosts(username);
    } else {
      console.error('Error unfollowing user:', response.statusText);
    }
  } catch (error) {
    console.error('Error unfollowing user:', error);
  }
 // window.location.reload(true);
}


async function fun2(post_id,username, currentusername)
{

  try {
const response = await fetch(`/api/posts/fetch_like/${username}`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  },
  body: JSON.stringify({ post_id, currentusername })
});

if (response.ok) {
const data = await response.json();



return data;   

} else {
  console.error('Error unfollowing user:', response.statusText);
}
} catch (error) {
console.error('Error unfollowing user:', error);
}

}


async function fun1(post_id, username, currentusername)
{

  const likeButtons = document.querySelectorAll(`#like-button-id-${post_id}`);



  likeButtons.forEach(button => {

    (async () => {
try {


  var isliked =await  fun2(post_id,username, currentusername);
  

     if (isliked.isliked === true) 
     {  
      
    //  button.textContent = isliked ? 'Like' : 'UnLike';

      button.textContent = 'UnLike';
      button.classList.remove('like-button-class');

     // button.classList.remove('liked');
    
    }


   

} catch (error) {
    console.error('Error:', error);
}
})();

});

}

async function loadUserPosts(username) {

  try {
      // Fetch posts from users that the current user is following
      const response = await fetch(`/api/profile/${username}/fetch_post_feed`, {
          method: 'GET',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + localStorage.getItem('token')
          }
      });

      const postsData = await response.json();
      const feedPostsContainer = document.getElementById('feed-posts');



      // Append new posts
      postsData.forEach(post => {
          const postElement = document.createElement('div');
          postElement.className = 'post';
          postElement.dataset.username = username;

          // Create post image element
          const postImage = document.createElement('img');
          postImage.src = post.image;
          postImage.alt = post.caption;
          postImage.className = 'post-image';
          postElement.appendChild(postImage);

          // Create post caption element
          const postCaption = document.createElement('p');
          postCaption.textContent = "Caption: "+post.caption;
          postCaption.className = 'post-caption';
          postElement.appendChild(postCaption);


           // Create post username element
           const postusername = document.createElement('p');
           postusername.textContent = "Username: "+ post.username;
           postusername.className = 'post-username';
           postElement.appendChild(postusername);


               // Create likecount caption element
               const likecount = document.createElement('p');
               likecount.textContent = "Like Count: "+post.likes.length
               likecount.className = 'post-like-Count';
               postElement.appendChild(likecount);


         


          // Create comments section
          const commentsSection = document.createElement('div');
          commentsSection.className = 'comments';
          post.comments.forEach(comment => {
              const commentElement = document.createElement('p');
              commentElement.textContent = "Comments: "+comment.text + " Person name:"+ comment.person_name;
              commentsSection.appendChild(commentElement);
          });
          postElement.appendChild(commentsSection);

          // Create add comment section
          const addCommentDiv = document.createElement('div');
          addCommentDiv.className = 'add-comment';

          const commentInput = document.createElement('input');
          commentInput.type = 'text';
          commentInput.placeholder = 'Add a comment...';
          addCommentDiv.appendChild(commentInput);

          const commentButton = document.createElement('button');
          commentButton.textContent = 'Post';
          commentButton.addEventListener('click', async () => {
              await postComment(post._id, commentInput.value, commentsSection);
              commentInput.value = '';
          });
          addCommentDiv.appendChild(commentButton);
          postElement.appendChild(addCommentDiv);


          const LikeButton = document.createElement('button');
          LikeButton.classList.add(`like-button-class`);
          LikeButton.id = `like-button-id-${post._id}`;
          LikeButton.textContent = 'Like';

          LikeButton.addEventListener('click', async () => {
            await  postlike(post._id);

          });
          postElement.appendChild(LikeButton);




            // Create bookmark button
            const bookmarkButton = document.createElement('button');
            bookmarkButton.classList.add('bookmark-button');
            bookmarkButton.textContent = 'Bookmark';
  

            bookmarkButton.addEventListener('click', async () => {
                await bookmarkPost(post._id, post.username);
            });

              postElement.appendChild(bookmarkButton);




          // Append post element to container
          feedPostsContainer.appendChild(postElement);

         fun1(post._id, post.username, currentUserUsername);

          
       


           
        
    
      });
  } catch (error) {
      console.error('Error loading posts:', error);
  }
}


  async function postComment(postId, comment, commentsSection) {



  

  const currentUserUsername = urlParams.get("fusername") || sessionStorage.getItem("loginusername");
 

  
  try{

    const response = await fetch(`/api/profile/${postId}/comment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      },
      body: JSON.stringify({ comment,currentUserUsername })
    });

    if (response.ok) {
      const data = await  response.json();
      window.location.reload(true);
    } else {
      console.error('Error Adding Comment:', response.statusText);
    }

  }
  catch (error) {
    console.error('Error Adding Comment :', error);
}
  }







  async function bookmarkPost(postId, postUsername) {
    try {
     

        const response = await fetch('/api/posts/bookmark_post', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token') 
            },
            body: JSON.stringify({postId,postUsername,currentUserUsername})
        });

        const result = await response.json();
        if (response.ok) {
            alert('Post bookmarked successfully!');
        } else {
            alert('Message: ' + result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while bookmarking the post.');
    }
}






























async function postlike(postId)
{

 
  const currentUserUsername = urlParams.get("fusername") || sessionStorage.getItem("loginusername");

  try{


   
    
    const likeButton = document.querySelector(`#like-button-id-${postId}`);

      const isLiked = likeButton.classList.contains('like-button-class');


    


     const  response = await fetch(`/api/posts/${isLiked ? 'like2' : 'Unlike2'}/${postId}`,
     {

      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      },
      body: JSON.stringify({ currentUserUsername })

    });


    if (response.ok) {
      window.location.reload(true);
    
    } else {
      console.error('Error in Likeing Post', response.statusText);
    }

  }
  catch(error)
  {
    console.error('Error in Liking Post:', error);
  }





}




 

 


  document.getElementById('home-link').addEventListener('click', function (e) {
    e.preventDefault();
    location.reload();
  });







  

const searchBar = document.getElementById('search-bar');
const searchResults = document.getElementById('search-results');

searchBar.addEventListener('input', async () => {
    const query = searchBar.value.trim();
    if (query.length > 0) {
        try {
            const response = await fetch(`/api/posts/search?query=${encodeURIComponent(query)}`);
            const users = await response.json();
            displayResults(users);
        } catch (error) {
            console.error('Error fetching search results:', error);
        }
    } else {
        searchResults.innerHTML = '';
        searchResults.style.display = 'none';
        window.location.reload(true);
    }
});




function displayResults(users) {
    searchResults.innerHTML = '';
    if (users.length > 0) {
        users.forEach(user => {
            const resultItem = document.createElement('div');
            resultItem.className = 'search-result-item';

            const profileImage = document.createElement('img');
            profileImage.src = user.profileImageUrl;
            profileImage.alt = user.username;

            const userInfo = document.createElement('div');
            userInfo.innerHTML = `<strong>${user.username}</strong><br>${user.bio}`;

            resultItem.appendChild(profileImage);
            resultItem.appendChild(userInfo);

            searchResults.appendChild(resultItem);
        });
        searchResults.style.display = 'block';
    } else {
        searchResults.style.display = 'none';
    }
}






// function logOut() {
//   sessionStorage.clear();
//   window.location.href = 'index.html';
// }


// Function to clear session storage
function clearSessionStorage() {
  
  sessionStorage.clear();
}

// Add an event listener to the logout link
document.getElementById('logout-link').addEventListener('click', function(event) {
  // Prevent the default action of the anchor tag
  event.preventDefault();

  // Call the function to clear session storage
  clearSessionStorage();

  // Redirect the user to the logout page or any other page
  window.location.href = '/index.html';
  history.pushState(null, null, '/index.html');
});




});




  