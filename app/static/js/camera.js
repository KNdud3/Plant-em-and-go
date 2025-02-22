import { Camera, CameraResultType, CameraSource } from '/@capacitor/camera';

        // Function to take a picture
        async function takePicture() {
            console.log("hello")
            try {
                const photo = await Camera.getPhoto({
                    resultType: CameraResultType.Uri,
                    source: CameraSource.Camera,
                    quality: 100
                });
                const imageUrl = photo.webPath;
                document.getElementById('photo').src = imageUrl;
            } catch (error) {
                console.error("Error taking picture: ", error);

            }
        }

        document.getElementById('cameraButton').addEventListener('click', takePicture);

