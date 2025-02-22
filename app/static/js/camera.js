document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("cameraButton").addEventListener("click", takePicture);
});

async function takePicture() {
    console.log("Opening Camera...");

    try {
        // Correct way to access plugins
        const camera = Capacitor.Plugins.Camera;
        
        if (!camera) {
            throw new Error("Camera plugin is not available!");
        }

        const photo = await camera.getPhoto({
            resultType: "uri",  // Use "dataUrl" for base64 images
            source: "CAMERA",
            quality: 100
        });

        const imageUrl = photo.webPath;
        document.getElementById("capturedImage").src = imageUrl;

    } catch (error) {
        console.error("Error taking picture:", error);
    }
}
