import { fetchData } from './fetchData.js';
import { showToast } from './UIHelper.js';

function getQueryParam(paramName) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(paramName);
}

document.addEventListener('DOMContentLoaded', async function() {

        const chartDOM = document.getElementById('graph-container');
        const chart = echarts.init(chartDOM);
        let showLabels = false;

        chart.showLoading();

        // Keyword Jump Search Module
        const keyword = getQueryParam('keyword');
        if (keyword) {
            // set specified infos
            const searchInput = document.getElementById('search-input');
            if (searchInput) searchInput.value = keyword;
            const levelSelect = document.getElementById('level-select');
            if (levelSelect) levelSelect.value = '1';
            const directionSelect = document.getElementById('direction-select');
            if (directionSelect) directionSelect.value = 'both';

            // construct search url
            const level = '1';
            const direction = 'both';
            const searchUrl = `/search/?keyword=${encodeURIComponent(keyword)}&level=${level}&direction=${direction}`;

            // search data generate
            const searchData = await fetchData(searchUrl);
            if (searchData.error) {
                showToast(searchData.error);
                const initData = await fetchData('/graph/api/');
                if (initData) updateChart(initData);
            } else {
                updateChart(searchData);
            }
        }

        // Preloading Module
        else {
            let graphData = sessionStorage.getItem('graphData');

            if (graphData) {
                console.log("Using preload data!");
                graphData = JSON.parse(graphData);
                setTimeout(() => {
                    updateChart(graphData);
                }, 500);    // delay for experience
            } else {
                console.log("Could not get preload data, requesting server...");
                const initData = await fetchData('/graph/api/');
                if (initData) await updateChart(initData);
            }
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

    // Label display button event handler
    const toggleLabelButton = document.getElementById('toggle-label');
    toggleLabelButton.addEventListener('click', () => {
        showLabels = !showLabels;
        // update button text
        toggleLabelButton.textContent = showLabels ? '隐藏节点名' : '显示节点名';
        // update chart
        chart.setOption({ series: [{ label: { show: showLabels } }] });
    });

    // Window size event handler
    window.addEventListener('resize', () => chart.resize());

    // Mousewheel event handler
    chartDOM.addEventListener('wheel', e => e.preventDefault(), { passive: false });

    // Prevent the mistaken scroll by listening Zrender's mousewheel event
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