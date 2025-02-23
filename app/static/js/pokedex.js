document.addEventListener("DOMContentLoaded", async () => {
    const container = document.querySelector(".container");
    await loadPlants();

    async function loadPlants() {
        try {
            const response = await fetch(`${serverURl}/getallplants`);
            plants = await response.json();
            container.innerHTML = '';

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
        const plantItem = document.createElement("div");
        plantItem.className = "plant-item";

        plantItem.innerHTML = `
            <div class="plant-card">
                <img src= "../plantImages/${plant.species_name}.jpg" alt="My Image">            
            </div>
        `;

        // Add click handler that passes species_name
        plantItem.addEventListener("click", () => {
            window.location.href = `flowerDetails.html?species_name=${encodeURIComponent(plant.species_name)}`;
        });

        return plantItem;
    }
});