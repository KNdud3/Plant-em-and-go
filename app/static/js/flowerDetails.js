document.addEventListener("DOMContentLoaded", async () => {
    // Get the species name from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const speciesName = urlParams.get("species_name");
    
    if (speciesName) {
        try {
            const response = await fetch(`${serverURl}/plantinfo`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    species_name: speciesName,
                    user: localStorage.getItem('username') // Assuming username is stored in localStorage
                })
            });

            if (!response.ok) {
                throw new Error('Failed to fetch plant details');
            }

            const plant = await response.json();
            
            // Update the DOM with plant details
            document.getElementById("flower-name").textContent = plant.plant_common;
            document.getElementById("flower-image").src = "/api/placeholder/400/400";
            document.getElementById("flower-image").alt = plant.plant_common;
            
            // Create and populate details section
            const detailsSection = document.createElement("div");
            detailsSection.innerHTML = `
                <p><strong>Species:</strong> ${plant.plant_species}</p>
                <p><strong>Family:</strong> ${plant.plant_family}</p>
                <p><strong>Rarity:</strong> ${plant.rarity}</p>
                ${plant.user_has_plant ? '<p class="collection-status">✓ In Your Collection!</p>' : ''}
            `;
            
            document.getElementById("flower-description").appendChild(detailsSection);

        } catch (error) {
            console.error('Error fetching plant details:', error);
            document.querySelector(".details-container").innerHTML = "<h2>Error loading plant details!</h2>";
        }
    } else {
        document.querySelector(".details-container").innerHTML = "<h2>Plant not found!</h2>";
    }
});

// Function to go back to the main page
// function goBack() {
//     window.history.back();
// }

// document.addEventListener("DOMContentLoaded", () => {
//     const flowers = [
//         { id: 1, name: "Rose", image: "../img/rose.png", description: "A beautiful red flower." },
//         { id: 2, name: "Tulip", image: "../img/tulip.png", description: "A vibrant spring flower." },
//         { id: 3, name: "Sunflower", image: "../img/sunflower.png", description: "Follows the sun!" },
//         { id: 4, name: "Daisy", image: "../img/daisy.png", description: "A simple yet elegant flower." }
//     ];

//     // Get the flower ID from the URL
//     const urlParams = new URLSearchParams(window.location.search);
//     const flowerId = parseInt(urlParams.get("id"));

//     // Find the selected flower
//     const flower = flowers.find(f => f.id === flowerId);

//     if (flower) {
//         document.getElementById("flower-name").textContent = flower.name;
//         document.getElementById("flower-image").src = flower.image;
//         document.getElementById("flower-image").alt = flower.name;
//         document.getElementById("flower-description").textContent = flower.description;
//     } else {
//         document.querySelector(".details-container").innerHTML = "<h2>Flower not found!</h2>";
//     }
// });

// // Function to go back to the main page
// function goBack() {
//     window.history.back();
// }
