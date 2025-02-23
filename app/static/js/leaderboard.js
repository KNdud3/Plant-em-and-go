document.addEventListener("DOMContentLoaded", async () => {
    const leaderboardBody = document.getElementById("leaderboard-body");
    const backButton = document.getElementById("backButton");

    // Get the current user from URL
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get("user");

    try {
        // Fetch leaderboard data
        const response = await fetch(`${serverURl}/leaderboard`);
        if (!response.ok) throw new Error("Failed to fetch leaderboard data");

        const data = await response.json();
        const users = data.users.slice(0, 10); // Top 10 players

        // Populate leaderboard
        leaderboardBody.innerHTML = users.map(user => `
            <tr>
                <td>#${user.rank}</td>
                <td>${user.name}</td>
                <td>${user.score}</td>
                <td>"yo" </td>
            </tr>
        `).join("");

    } catch (error) {
        console.error("Error loading leaderboard:", error);
        leaderboardBody.innerHTML = `<tr><td colspan="4">Error loading leaderboard.</td></tr>`;
    }

    // Back button navigates back with username
    backButton.addEventListener("click", () => {
        window.location.href = `./dummyMain.html?user=${encodeURIComponent(username)}`;
    });
});
