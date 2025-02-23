let sessionStartSteps = 0;
let currentSteps = 0;
let username;

document.addEventListener("DOMContentLoaded", async () => {
    const pointsElement = document.getElementById("points");
    const distElement = document.getElementById("distance-travelled");

    document.getElementById("cameraButton").addEventListener("click", goCam);
    document.getElementById("compendium").addEventListener("click", goCompendium);
    
    console.log("Hello");

    // ✅ Extract user from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    username = urlParams.get("user"); 
    console.log(username);

    if (username) {
        document.getElementById("user-tag").innerText = username;
    }

    // Get current date in ISO format (YYYY-MM-DD)
    const currentDate = new Date().toISOString().split("T")[0];

    try {
        // ✅ Send request to backend to store the date
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
        // ✅ Fetch and update user's score and steps
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
        pointsElement.innerText = data["user_score"];
        distElement.innerText = data["steps"];
        sessionStartSteps = data["steps"];
        console.log(`session start steps: ${sessionStartSteps}`);
        currentSteps = data["steps"];
    } catch (error) {
        console.error("Error:", error);
    }
});

// ✅ Navigate to Pokedex and pass `user` parameter
async function goCompendium() {
    console.log("Navigating to Pokedex...");
    currentSteps = document.getElementById("distance-travelled").innerText;

    try {
        // ✅ Update user's step count before navigation
        const response = await fetch(`${serverURl}/updateSteps`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ user: username, steps: currentSteps - sessionStartSteps }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // ✅ Redirect with the user parameter in the URL
        window.location.replace(`./pokedex.html?user=${encodeURIComponent(username)}`);
    } catch (error) {
        console.error("Error:", error);
    }
}

// ✅ Handle Camera button click and pass `user` parameter
async function goCam() {
    currentSteps = document.getElementById("distance-travelled").innerText;

    try {
        // ✅ Update user's step count
        const response = await fetch(`${serverURl}/updateSteps`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ user: username, steps: currentSteps - sessionStartSteps }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // ✅ Redirect with `user` parameter (if applicable)
        // You can add redirection here if needed
    } catch (error) {
        console.error("Error:", error);
    }
}
