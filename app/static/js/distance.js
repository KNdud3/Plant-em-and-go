let lastLocation = null;
let totalDistance;
let watchId = null;
let tracking = false;
const Geolocation = Capacitor.Plugins.Geolocation;
document.addEventListener("DOMContentLoaded",()=>{
    document.getElementById("StartStop").addEventListener("click",toggleJourney)
})




async function toggleJourney(){
    totalDistance = parseInt(document.getElementById("distance-travelled").innerText)
    console.log(totalDistance)
    if(!tracking){
        startJourney()
        document.getElementById("StartStop").innerText = "Stop Journey"
    }else{
        stopJourney()
        document.getElementById("StartStop").innerText = "Start Journey"
    }
}

async function requestPermissions() {
    const permStatus = await Geolocation.requestPermissions();
    if (permStatus.location !== 'granted') {
        alert("Location permission not granted.");
        return false;
    }
    return true;
}

async function startJourney() {
    if (!await requestPermissions()) return;
    

    lastLocation = null;
    tracking = true;

    watchId = Geolocation.watchPosition(
        { enableHighAccuracy: true, timeout: 3000, maximumAge: 0 },
        (position, err) => {
            if (err) {
                console.error("Geolocation error:", err);
                return;
            }

            const { latitude, longitude } = position.coords;
            const newLocation = { latitude, longitude };

            if (lastLocation) {
                const distance = calculateDistance(lastLocation, newLocation);
                const distanceThreshold = 3; // in meters
                if (distance > distanceThreshold) {
                    totalDistance = parseInt(totalDistance + distance);
                    document.getElementById("distance-travelled").innerText = totalDistance;
                }
                

            }

            lastLocation = newLocation;
        }
    );

    console.log("Journey started!");
}

function stopJourney() {
    if (watchId) {
        Geolocation.clearWatch({ id: watchId });
        watchId = null;
        tracking = false;
        document.getElementById("distance-travelled").innerText = totalDistance;
    }
}

function calculateDistance(loc1, loc2) {
    const R = 6371e3; // Earth radius in meters
    const lat1 = (loc1.latitude * Math.PI) / 180;
    const lat2 = (loc2.latitude * Math.PI) / 180;
    const deltaLat = ((loc2.latitude - loc1.latitude) * Math.PI) / 180;
    const deltaLon = ((loc2.longitude - loc1.longitude) * Math.PI) / 180;

    const a =
        Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos(lat1) *
            Math.cos(lat2) *
            Math.sin(deltaLon / 2) *
            Math.sin(deltaLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
}