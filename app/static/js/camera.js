let username;
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("cameraButton").addEventListener("click", takePicture);
    // Get the current URL
    const currentUrl = window.location.href;    

    // Create a URL object from the current URL
    const url = new URL(currentUrl);

    // Get query parameters using URLSearchParams
    const params = new URLSearchParams(url.search);

    // Access a specific query parameter
    username = params.get('user'); // Replace 'paramName' with the name of your query parameter
});

async function getData(base64string) {
    try {

        // let username = document.getElementById("user-tag").innerText
        // Send request to backend
        const response = await fetch(`${serverURl}/testPlantAPI`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ b64: base64string , user:username}),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        
        document.getElementById("plant-data").innerText = JSON.stringify(data)
        // Redirect to flower details with the species name
        // window.location.href = `flowerDetails.html?species_name=${encodeURIComponent(data.species)}`;
    } catch (error) {
        console.error("Error:", error);
        // In case of error, redirect to flower details with error state
        window.location.href = `flowerDetails.html?error=true`;
    }
}

async function takePicture() {
    console.log("Opening Camera...");

    try {
        const camera = Capacitor.Plugins.Camera;
        
        if (!camera) {
            throw new Error("Camera plugin is not available!");
        }

        const photo = await camera.getPhoto({
            resultType: "dataUrl",
            source: "CAMERA",
            quality: 100
        });
        const base64String = photo.dataUrl.split(",")[1];
        getData(base64String);
    } catch (error) {
        console.error("Error taking picture:", error);
    }
}