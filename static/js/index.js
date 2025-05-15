async function preloadGraphData() {
    try {
        const response = await fetch('/graph/api/', { headers: { 'X-Requested-With': 'XMLHttpRequest' } });

        if (!response.ok) {
            console.error("预加载失败，状态码:", response.status);
            return;
        }

        const data = await response.json();
        sessionStorage.setItem('graphData', JSON.stringify(data)); // 存储数据
        console.log("图数据预加载完成！");
    } catch (error) {
        console.error("预加载图数据失败:", error);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await preloadGraphData(); // 确保数据加载完成后再继续执行
});