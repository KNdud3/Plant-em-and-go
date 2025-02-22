async function getStepsData() {
    console.log("Fetching steps data...");

    try {
        const HealthConnect = Capacitor.Plugins.HealthConnect;
        // Check availability of Health Connect
        const healthConnectAvailability = await HealthConnect.checkAvailability();
        if (healthConnectAvailability !== 'Available') {
            alert("Health connect not available")
            throw new Error("Health Connect is not available!");
            
        }

        // Request Health Permissions to read steps data
        await HealthConnect.requestHealthPermissions({
            read: ['Steps'],  // Read steps data
            write: []         // No write permission needed
        });

        // Define the time range for today (start of today to end of today)
        const startDate = new Date();
        startDate.setHours(0, 0, 0, 0);  // Start of today
        const endDate = new Date();
        endDate.setHours(23, 59, 59, 999);  // End of today

        const timeRangeFilter = {
            type: 'between',
            startTime: startDate,
            endTime: endDate
        };

        // Fetch the steps data for the defined time range
        const stepsData = await HealthConnect.readRecords({
            type: 'Steps',
            timeRangeFilter: timeRangeFilter
        });

        // Process the steps data (sum of steps for today)
        if (stepsData && stepsData.length > 0) {
            const totalSteps = stepsData.reduce((total, record) => total + record.count, 0);
            document.getElementById('stepsData').innerText = `${totalSteps}`;
        } else {
            document.getElementById('stepsData').innerText = 'No steps data available for today.';
        }
    } catch (error) {
        console.error("Error fetching steps data:", error);
    }
}
