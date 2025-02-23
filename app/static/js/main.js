let sessionStartSteps=0;
let currentSteps=0;
let username;
document.addEventListener("DOMContentLoaded", async () => {
    const pointsElement = document.getElementById("points")
    const distElement = document.getElementById("distance-travelled")

    document.getElementById("cameraButton").addEventListener("click",goCam)
    document.getElementById("compendium").addEventListener("click",goCompendium)
    console.log("Hello");
    // Get the current URL
    const currentUrl = window.location.href;    

    // Create a URL object from the current URL
    const url = new URL(currentUrl);

    // Get query parameters using URLSearchParams
    const params = new URLSearchParams(url.search);

    // Access a specific query parameter
    username = params.get('user'); // Replace 'paramName' with the name of your query parameter
    console.log(username)
    document.getElementById("user-tag").innerText = username
    
    // Get current date in ISO format (YYYY-MM-DD)
    const currentDate = new Date().toISOString().split("T")[0];

    try {
        // Send request to backend
        const response = await fetch(`${serverURl}/receivedate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ date: currentDate }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Server Response:", data);
    } catch (error) {
        console.error("Error:", error);
    }

    try {
        // Send request to backend
        const response = await fetch(`${serverURl}/updateScore`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ user: username }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Server Response:", data);
        pointsElement.innerText = data["user_score"]
        distElement.innerText = data["steps"]
        sessionStartSteps = data["steps"]
        console.log(`session start steps:${sessionStartSteps}`)
        currentSteps = data["steps"]
    } catch (error) {
        console.error("Error:", error);
    }
});

async function goCompendium(){
    console.log("here")
    currentSteps = document.getElementById("distance-travelled").innerText
    try {
        // Send request to backend
        const response = await fetch(`${serverURl}/updateSteps`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ user: username , steps:currentSteps-sessionStartSteps}),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        window.location.replace('./pokedex.html')
    } catch (error) {
        console.error("Error:", error);
    }
    
}

async function goCam(){
    currentSteps = document.getElementById("distance-travelled").innerText
    try {
        // Send request to backend
        const response = await fetch(`${serverURl}/updateSteps`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ user: username , steps:currentSteps-sessionStartSteps}),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        window.location.replace(`./camera.html?user=${username}`)

    } catch (error) {
        console.error("Error:", error);
    }
}
