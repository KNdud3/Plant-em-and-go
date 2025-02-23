document.addEventListener("DOMContentLoaded", async () => {
    const container = document.querySelector(".container");
    await loadPlants();

    async function loadPlants() {
        try {
            // Fetch plants from your backend
            const response = await fetch(`${serverURl}/getallplants`);
            plants = await response.json()
            // Clear existing content
            container.innerHTML = '';

            // Create and append plant items
            plants["data"].forEach(plant => {
                const plantItem = createPlantItem(plant);
                container.appendChild(plantItem);
            });

        } catch (error) {
            console.error('Error loading plants:', error);
            container.innerHTML = '<p>Error loading plants. Please try again later.</p>';
        }
    }

    function createPlantItem(plant) {
        // Create the main container for the plant item
        const plantItem = document.createElement("div");
        plantItem.className = "plant-item";

        // Create the content structure
        plantItem.innerHTML = `
            <div class="plant-card">
                <img src="../../../plantImages/${plant.species_name}" alt="${plant.common_name}" class="plant-image">
                <div class="plant-info">
                    <h3>${plant.common_name}</h3>
                    <p class="species-name">${plant.species_name}</p>
                    <span class="rarity-tag ${plant.rarity.toLowerCase()}">${plant.rarity}</span>
                </div>
            </div>
        `;

        // Add click handler to show details
        plantItem.addEventListener("click", async () => {
            try {
                // Fetch detailed information about this specific plant
                const response = await fetch(`${serverURl}/plantinfo`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        species_name: plant.species_name,
                        user: localStorage.getItem('username') // Assuming username is stored in localStorage
                    })
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch plant details');
                }

                const plantDetails = await response.json();
                
                // Navigate to the details page with the plant data
                window.location.href = `flowerDetails.html?id=${plant.id}`;

            } catch (error) {
                console.error('Error fetching plant details:', error);
                alert('Error loading plant details. Please try again.');
            }
        });

        return plantItem;
    }
});



