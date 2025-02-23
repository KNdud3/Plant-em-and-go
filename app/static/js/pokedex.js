document.addEventListener("DOMContentLoaded", () => {
    const flowers = [
        { id: 1, name: "Rose", image: "../img/rose.png", description: "A beautiful red flower." },
        { id: 2, name: "Tulip", image: "../img/tulip.png", description: "A vibrant spring flower." },
        { id: 3, name: "Sunflower", image: "../img/sunflower.png", description: "Follows the sun!" },
        { id: 4, name: "Daisy", image: "../img/daisy.png", description: "A simple yet elegant flower." }
    ];

    const container = document.querySelector(".container");

    function createFlowerItem(flower) {
        const flowerItem = document.createElement("div");
        flowerItem.classList.add("flower-item");
        flowerItem.innerHTML = `
            <img src="${flower.image}" alt="${flower.name}">
        `;
        // <p>${flower.name}</p>

        // Redirect to details page with query parameter
        flowerItem.addEventListener("click", () => {
            window.location.href = `flowerDetails.html?id=${flower.id}`;
        });

        return flowerItem;
    }

    flowers.forEach(flower => {
        container.appendChild(createFlowerItem(flower));
    });
});
