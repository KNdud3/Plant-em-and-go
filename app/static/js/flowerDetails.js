document.addEventListener("DOMContentLoaded", async () => {
   // Get the current URL
   const currentUrl = window.location.href;    

   // Create a URL object from the current URL
   const url = new URL(currentUrl);

   // Get query parameters using URLSearchParams
   const params = new URLSearchParams(url.search);

   // Access a specific query parameter
//    username = params.get('user'); // Replace 'paramName' with the name of your query parameter
    const speciesName = params.get("species_name");
    // let speciesName = "Narcissus jonquilla"
    if (speciesName) {
        try {
            const response = await fetch(`${serverURl}/getallplants`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch plant details');
            }

            const data = await response.json();
            const plants = data.data; // Extract plant list from response

            // Find the plant with the matching species name
            const plant = plants.find(p => p.species_name.toLowerCase() === speciesName.toLowerCase());

            if (!plant) {
                throw new Error('Plant not found');
            }

            // Update the DOM with plant details
            document.getElementById("flower-name").textContent = plant.common_name;
            document.getElementById("flower-image").src = `../plantImages/${plant.species_name}.jpg`;
            document.getElementById("flower-image").alt = plant.common_name;

            // Create and populate details section
            const detailsSection = document.createElement("div");
            detailsSection.className = "plant-details";
            detailsSection.innerHTML = `
                <p><strong>Common Name:</strong> ${plant.common_name}</p>
                <p><strong>Species:</strong> ${plant.species_name}</p>
                <p><strong>Family:</strong> ${plant.family}</p>
                <p><strong>Genus:</strong> ${plant.genus}</p>
                <p class="rarity-tag ${plant.rarity.toLowerCase()}"><strong>Rarity:</strong> ${plant.rarity}</p>
            `;

            document.getElementById("flower-description").appendChild(detailsSection);

        } catch (error) {
            console.error('Error fetching plant details:', error);
            document.querySelector(".details-container").innerHTML = `
                <p>Error loading plant details!</p>
                <button onclick="goBack()">Go Back</button>
            `;
        }
    } else {
        document.querySelector(".details-container").innerHTML = `
            <p>Plant not found!</p>
            <button onclick="goBack()">Go Back</button>
        `;
    }
});

function goBack() {
    window.history.back();
}
