document.addEventListener("DOMContentLoaded", async () => {
    const container = document.querySelector(".container");
    await loadPlants();

    async function loadPlants() {
        try {
            // Fetch plants from your backend
            alert("hello");
            const response = await fetch(`${serverURl}/getallplants`);
            // alert(JSON.stringify(await response.json()));
            plants = await response.json()
            console.log(plants)
            // Clear existing content
            container.innerHTML = '';

            // Create and append plant items
            plants.forEach(plant => {
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
                <img src="/api/placeholder/200/200" alt="${plant.common_name}" class="plant-image">
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



// document.addEventListener("DOMContentLoaded", () => {
//     const flowers = [
//         { id: 1, name: "Rose", image: "../img/rose.png", description: "A beautiful red flower." },
//         { id: 2, name: "Tulip", image: "../img/tulip.png", description: "A vibrant spring flower." },
//         { id: 3, name: "Sunflower", image: "../img/sunflower.png", description: "Follows the sun!" },
//         { id: 4, name: "Daisy", image: "../img/daisy.png", description: "A simple yet elegant flower." }
//     ];

//     const container = document.querySelector(".container");

//     function createFlowerItem(flower) {
//         const flowerItem = document.createElement("div");
//         flowerItem.classList.add("flower-item");
//         flowerItem.innerHTML = `
//             <img src="${flower.image}" alt="${flower.name}">
//         `;
//         // <p>${flower.name}</p>

//         // Redirect to details page with query parameter
//         flowerItem.addEventListener("click", () => {
//             window.location.href = `flowerDetails.html?id=${flower.id}`;
//         });

//         return flowerItem;
//     }

//     flowers.forEach(flower => {
//         container.appendChild(createFlowerItem(flower));
//     });
// });