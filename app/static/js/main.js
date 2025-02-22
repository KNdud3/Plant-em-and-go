document.addEventListener("DOMContentLoaded",()=>{
    console.log("Hello")
    // Get current date in ISO format (YYYY-MM-DD)
    const currentDate = new Date().toISOString().split('T')[0];

    // Send it to the backend using fetch()
    fetch(`${serverURl}/receive-date`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ date: currentDate })
    })
    .then(response => response.json())
    .then(data => console.log("Server Response:", data))
    .catch(error => console.error("Error:", error));

})