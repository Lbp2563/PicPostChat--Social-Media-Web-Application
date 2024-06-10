document.getElementById('createAdminForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const username = document.getElementById('f_name').value;
    const password = document.getElementById('f_pass').value;
    const email=document.getElementById('f_email').value;
    const securityKey=document.getElementById('f_sec_key').value;
 
    try {

        const response = await fetch('/api/auth/createadmin', {
method: 'POST',
headers: {
  'Content-Type': 'application/json',
  'authorization': securityKey,
},
body: JSON.stringify({ username,email, password }),
});



        const data = await response.json();
        if (response.ok) {

            // console.log('Admin user created successfully:', data.message);
            window.location.href = `index.html`;
            //   window.location.href = `admin.html?script5=true&admin_name=${username}`;
        } else {
            console.error('Error creating admin user:', data.message);
        }
    } 
    catch (error) {
        console.error('An unexpected error occurred:', error.message);
    }
});