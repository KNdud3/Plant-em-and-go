document.addEventListener("DOMContentLoaded", async () => {
    const container = document.querySelector(".container");
    await loadPlants();

    async function loadPlants() {
        try {
            const response = await fetch(`${serverURl}/getallplants`);
            const plants = await response.json();
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
                <img src="../plantImages/${plant.species_name}.jpg" alt="${plant.species_name}">            
            </div>
        `;

        // Handle plant click
        plantItem.addEventListener("click", () => {
            window.location.href = `flowerDetails.html?species_name=${encodeURIComponent(plant.species_name)}`;
        });

        return plantItem;
    }

    // ✅ Set back button behavior once (not inside createPlantItem)
    const urlParams = new URLSearchParams(window.location.search);
    const user = urlParams.get('user'); // Get the user parameter

    const backButton = document.getElementById('backButton');
    if (backButton) {
        backButton.addEventListener('click', () => {
            window.location.href = `dummyMain.html${user ? '?user=' + encodeURIComponent(user) : ''}`;
        });
    }
});
