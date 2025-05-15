async function preloadGraphData() {
    try {
        const response = await fetch('/graph/api/', { headers: { 'X-Requested-With': 'XMLHttpRequest' } });
        if (!response.ok) {
            console.error("Preload failed - Status:", response.status);
            return;
        }
        const data = await response.json();
        sessionStorage.setItem('graphData', JSON.stringify(data)); // 存储数据
        console.log("Graph data preloaded!");
    } catch (error) {
        console.error("Preloading graph data failed:", error);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await preloadGraphData();
});