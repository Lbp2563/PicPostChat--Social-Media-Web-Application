document.addEventListener('DOMContentLoaded', async function () {
    const currentUserUsername = sessionStorage.getItem("loginusername");

    try {
        const response = await fetch(`/api/profile/bookmarks/${currentUserUsername}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        });

        if (response.ok) {
            const bookmarkedPosts = await response.json();
            displayBookmarkedPosts(bookmarkedPosts);
        } else {
            console.error('Failed to fetch bookmarked posts:', response.statusText);
        }
    } catch (error) {
        console.error('Error fetching bookmarked posts:', error);
    }
});

function displayBookmarkedPosts(bookmarkedPosts) {
    const bookmarkedPostsContainer = document.getElementById('bookmarked-posts');

    bookmarkedPosts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'bookmarked-post';

        const postImage = document.createElement('img');
        postImage.src = post.image;
        postImage.alt = post.caption;

        const postCaption = document.createElement('p');
        postCaption.textContent = "Caption: " + post.caption;
        postCaption.className = 'bookmarked-post-caption';

        const postUsername = document.createElement('p');
        postUsername.textContent = "Username: " + post.username;
        postUsername.className = 'bookmarked-post-username';

        const likeCount = document.createElement('p');
        likeCount.textContent = "Likes: " + post.likes.length;
        likeCount.className = 'bookmarked-post-likes';



        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.className = 'delete-button';
        deleteButton.addEventListener('click', async () => {
            await deleteBookmark(post._id); 

          
        });




        postElement.appendChild(postImage);
        postElement.appendChild(postCaption);
        postElement.appendChild(postUsername);
        postElement.appendChild(likeCount);
        postElement.appendChild(deleteButton);

        bookmarkedPostsContainer.appendChild(postElement);
    });



    // Function to delete a bookmarked post
async function deleteBookmark(postId) {
    try {
        const response = await fetch(`/api/profile/delete_bookmark/${postId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        });
        if (!response.ok) {
            throw new Error('Failed to delete bookmarked post');
        }
        else{
            window.location.reload(true);
        }
    } catch (error) {
        console.error('Error deleting bookmarked post:', error);
    }
}




// Function to clear session storage
function clearSessionStorage() {
  
    sessionStorage.clear();
  }
  
  // Add an event listener to the logout link
  document.getElementById('logout-btn').addEventListener('click', function(event) {
    // Prevent the default action of the anchor tag
    event.preventDefault();
  
    // Call the function to clear session storage
    clearSessionStorage();
  
    // Redirect the user to the logout page or any other page
    window.location.href = '/index.html';
    history.pushState(null, null, '/index.html');
  });


}



  


