export async function fetchData(url) {
    try {
        const response = await fetch(url, { headers: { 'X-Requested-With': 'XMLHttpRequest' } });

        if (!response.ok) {
            return { error: response.status === 404 ? '未找到相关数据' : `HTTP 错误！状态码: ${response.status}` };
        }

        return await response.json();
    } catch (error) {
        console.error('数据加载失败：', error);
        return { error: '数据加载失败，请检查网络或服务器状态' };
    }
}