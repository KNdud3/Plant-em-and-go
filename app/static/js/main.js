document.addEventListener("DOMContentLoaded", async () => {
    console.log("Hello");

    // Get current date in ISO format (YYYY-MM-DD)
    const currentDate = new Date().toISOString().split("T")[0];

    try {
        // Send request to backend
        const response = await fetch(`${serverURl}/receivedate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ date: currentDate }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Server Response:", data);
    } catch (error) {
        console.error("Error:", error);
    }
});
