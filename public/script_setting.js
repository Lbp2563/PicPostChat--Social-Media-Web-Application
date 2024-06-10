document.addEventListener('DOMContentLoaded', function () {
    // Retrieve the username from sessionStorage
    const loggedInUser = sessionStorage.getItem('loginusername');
  
    // Add event listener to the "Save Settings" button
    document.getElementById('save-settings').addEventListener('click', function () {
      saveSettings();
    });
  
    async function saveSettings() {
      const newEmail = document.getElementById('new-email').value;
      const newPassword = document.getElementById('new-password').value;
  
      // Basic form validation
      if (!newEmail || !newPassword) {
        alert('New email and password are required for settings update');
        return;
      }
  
      
  
      try {
        // Perform AJAX request to the server settings endpoint
        const response = await fetch('/api/auth/settings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username: loggedInUser, newEmail, newPassword }),
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
  
        const result = await response.json();
  
       
  
        // Handle success or error response from the server
        if (result.success) {

          
          alert(result.message);
  
          // Redirect to the dashboard after saving settings
          window.location.href = `/profile.html`; // Adjust the path accordingly
        } else {
          // Settings update failed, display an error message or take appropriate action
          console.error('Settings update failed:', result.message);
          alert(result.message);
        }
      } catch (error) {
        console.error('Error:', error);
        // Handle errors here
        alert('An unexpected error occurred. Please try again later.');
      }
      
    }



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
  