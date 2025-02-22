import { Camera, CameraResultType, CameraSource } from 'https://cdn.jsdelivr.net/npm/@capacitor/camera/dist/esm/index.js';

window.takePhoto = async function() {
    try {
        const image = await Camera.getPhoto({
            quality: 90,
            allowEditing: false,
            resultType: CameraResultType.Uri,
            source: CameraSource.Camera
        });

        document.getElementById("capturedImage").src = image.webPath;
        document.getElementById("capturedImage").style.display = "block";
    } catch (error) {
        console.error("Camera error:", error);
    }
};
