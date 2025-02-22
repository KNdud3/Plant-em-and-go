async function loadPage() {
    let content = document.getElementById("app");

    try {
        const response = await fetch(`https://d805-134-151-21-91.ngrok-free.app/`);

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        let data = await response.json(); // Use response.json() if expecting JSON
        console.log(data)
        console.log('Success:', JSON.stringify(data["message"]));

        content.innerHTML = JSON.stringify(data["message"]); // Update the page content
    } catch (error) {
        console.error('Error:', error);
        content.innerHTML = "<h1>Error loading page</h1>"; // Handle errors gracefully
    }
}

// Example usage:
// loadPage('home'); // Loads home page from server
