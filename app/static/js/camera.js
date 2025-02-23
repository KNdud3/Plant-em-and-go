document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("cameraButton").addEventListener("click", takePicture);
});
async function getData(base64string){
    try {
        // Send request to backend
        const response = await fetch(`${serverURl}/testPlantAPI`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ b64: base64string }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        // console.log("Server Response:", data);
        document.getElementById("plantdata").innerHTML = JSON.stringify(data)
    } catch (error) {
        console.error("Error:", error);
    }
}
async function takePicture() {
    console.log("Opening Camera...");

    try {
        // Correct way to access plugins
        const camera = Capacitor.Plugins.Camera;
        
        if (!camera) {
            throw new Error("Camera plugin is not available!");
        }

        const photo = await camera.getPhoto({
            resultType: "dataUrl",  // Use "dataUrl" for base64 images
            source: "CAMERA",
            quality: 100
        });
        const base64String = photo.dataUrl.split(",")[1];  // Removes "data:image/jpeg;base64,"
        
        document.getElementById("capturedImage").innerHTML = base64String;
        getData(base64String)
    } catch (error) {
        console.error("Error taking picture:", error);
    }
}
