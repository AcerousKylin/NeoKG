import { fetchData } from './fetchData.js';
import { showToast } from './UIHelper.js';

document.addEventListener('DOMContentLoaded', async function() {

    const chartDOM = document.getElementById('graph-container');
    const chart = echarts.init(chartDOM);
    let showLabels = false;

    // Preloading Module
    chart.showLoading();
    let graphData = sessionStorage.getItem('graphData');

    if (graphData) {
        console.log("使用预加载数据！");
        graphData = JSON.parse(graphData);
        setTimeout(() => {
            updateChart(graphData);
            chart.hideLoading(); // 让加载动画稍微停留一下
        }, 500); // 延迟 500ms，增强用户体验
    } else {
        console.log("未找到预加载数据，重新请求服务器...");
        const initData = await fetchData('/graph/api/');
        if (initData) await updateChart(initData);
        chart.hideLoading();
    }


    function updateChart(data) {
        if (!data || !data.nodes || data.nodes.length === 0) {
            showToast('图谱数据为空，无法显示');
            return;
        }

        chart.setOption({
            legend: {
                orient: 'vertical',
                right: 20,
                top: 20,
                textStyle: { color: '#333', fontSize: 14 },
                data: data.categories.map(c => c.name),
                hoverLink: true,
                selectedMode: 'multiple'
            },
            tooltip: {
                trigger: 'item',
                triggerOn: 'mousemove',
                position: [20, 20],
                backgroundColor: 'rgba(50,50,50,0.8)',
                padding: 10,
                textStyle: { color: '#fff' },
                formatter: params => {
                    if (params.dataType === 'node') {
                        const node = params.data;
                        // 将节点的 category 索引转换回对应名称
                        var categoryName = data.categories[node.category] ? data.categories[node.category].name : 'Unknown';
                        let content = `<div class="tooltip-ellipsis">
                                            <span class="tooltip-header">${node.name}</span>
                                        </div>`;
                        content += `<div  class="tooltip-ellipsis">
                                        <span class="tooltip-sub">类型</span>：
                                        <span class="tooltip-value">${categoryName}</span>
                                    </div>`;
                        for (const [key, value] of Object.entries(node.properties || {})) {
                            content += `<div class="tooltip-ellipsis">
                                            <span class="tooltip-key">${key}</span>：
                                            <span class="tooltip-value">${value}</span>
                                        </div>`;
                        }
                        return `<div>${content}</div>`;
                    } else if (params.dataType === 'edge') {
                        return `关系: ${params.data.name}`;
                    }
                }
            },
            series: [{
                name: 'Technology Service',
                type: 'graph',
                layout: 'force',
                data: data.nodes.map(function(node) {
                    return {
                        ...node,
                        symbolSize: 20,
                        draggable: true
                    };
                }),
                links: data.links,
                categories: data.categories,
                roam: true,
                lineStyle: { curveness: 0.2 },
                label: { show: false, position: 'right', fontSize: 12 },
                force: { repulsion: 100, edgeLength: 30 },
                emphasis: { lineStyle: { show: true } }
            }]
        });
        chart.hideLoading()
    }


    // Loading initial data
    await (async () => {
        chart.showLoading()
        const initData = await fetchData('/graph/api/');
        if (initData) await updateChart(initData);
        chart.hideLoading()
    })();

    // Label display button event handler
    const toggleLabelButton = document.getElementById('toggle-label');
    toggleLabelButton.addEventListener('click', () => {
        showLabels = !showLabels;
        // 更新按钮文本提示
        toggleLabelButton.textContent = showLabels ? '隐藏节点名' : '显示节点名';
        // 更新图表：采用 chart.setOption 局部更新，直接修改 series label.show
        chart.setOption({ series: [{ label: { show: showLabels } }] });
    });

    // Window size event handler
    window.addEventListener('resize', () => chart.resize());

    // 防止鼠标滚轮事件冒泡至页面：同时监听图表容器和 zrender 的 mousewheel 事件
    chartDOM.addEventListener('wheel', e => e.preventDefault(), { passive: false });
    chart.getZr().on('mousewheel', e => e.event.preventDefault());


    // Async search request module
    let lastSearchKeyword = '';
    document.getElementById('search-button').addEventListener('click', async () => {
        const keyword = document.getElementById('search-input').value.trim();

        if (!keyword) {
            showToast('请输入搜索关键词');
            return;
        }
        if (keyword === lastSearchKeyword) {
            showToast('搜索关键词未变化，无需重新加载');
            return;
        }

        chart.showLoading()
        const level = document.getElementById('level-select').value;
        const direction = document.getElementById('direction-select').value;
        const url = `/search/?keyword=${encodeURIComponent(keyword)}&level=${level}&direction=${direction}`;

        const searchData = await fetchData(url);

        if (searchData.error) {
            showToast(searchData.error); // 显示错误信息
            const initData = await fetchData('/graph/api/');
            if (initData) updateChart(initData);
        } else {
            updateChart(searchData);
        }
        chart.hideLoading();
    });
});