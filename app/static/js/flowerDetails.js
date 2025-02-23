document.addEventListener("DOMContentLoaded", () => {
    const flowers = [
        { id: 1, name: "Rose", image: "../img/rose.png", description: "A beautiful red flower." },
        { id: 2, name: "Tulip", image: "../img/tulip.png", description: "A vibrant spring flower." },
        { id: 3, name: "Sunflower", image: "../img/sunflower.png", description: "Follows the sun!" },
        { id: 4, name: "Daisy", image: "../img/daisy.png", description: "A simple yet elegant flower." }
    ];

    // Get the flower ID from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const flowerId = parseInt(urlParams.get("id"));

    // Find the selected flower
    const flower = flowers.find(f => f.id === flowerId);

    if (flower) {
        document.getElementById("flower-name").textContent = flower.name;
        document.getElementById("flower-image").src = flower.image;
        document.getElementById("flower-image").alt = flower.name;
        document.getElementById("flower-description").textContent = flower.description;
    } else {
        document.querySelector(".details-container").innerHTML = "<h2>Flower not found!</h2>";
    }
});

// Function to go back to the main page
function goBack() {
    window.history.back();
}
