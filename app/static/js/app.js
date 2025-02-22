function loadPage(page) {
    let url = '';
    switch (page) {
        case 'home':
            url = 'static/templates/home.html';  // Update to point to home.html inside templates
            break;
        case 'login':
            url = './templates/Login.html';  // Point to login.html inside the login folder
            break;
        case 'about':
            url = 'static/templates/about/about.html';  // Point to about.html
            break;
        case 'contact':
            url = 'static/templates/contact/contact.html';  // Point to contact.html
            break;
        default:
            url = 'static/templates/404.html';  // Default to 404 page if the page is not found
            break;
        
    }
    // console.log(url)
    // // Fetch the HTML content from the corresponding file
    // fetch(url)
    //     .then(response => response.text())
    //     .then(html => {
    //         // Inject the HTML content into the app div
    //         document.getElementById('app').innerHTML = html;
    //     })
    //     .catch(error => {
    //         console.error('Error loading page:', error);
    //         document.getElementById('app').innerHTML = '<h1>404 Page Not Found</h1>';
    //     });
    fetch('http://127.0.0.1:5000')
    .then(response => {
    if (response.ok) {
      return response.text();  // or response.json() if you expect JSON response
    } else {
      throw new Error('Network response was not ok');
    }
  })
  .then(data => {
    console.log('Success:', data);  // Log the response data
  })
  .catch(error => {
    console.error('Error:', error);  // Catch any errors
  });

}
