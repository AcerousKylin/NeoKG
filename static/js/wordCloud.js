import { fetchData } from './fetchData.js'

document.addEventListener('DOMContentLoaded', async function() {
    const chartDOM = document.getElementById('wordcloud-container');
    const chart = echarts.init(chartDOM);

    function paintByValue(data) {
        console.log(data.value)
        const value = data.value;
        if (value > 40) return '#C71585';
        else if (value > 30) return '#FF69B4';
        else if (value > 20) return '#FF98A2';
        else if (value > 10) return '#FFC6C1';
        return '#FFC0CB'
    }

    function tooltipFormatter(params) {
        return `<div style="padding:5px;">
                    <strong>${params.name}</strong><br/>
                    权重：${params.value}
                </div>`;
    }

    // 词云配置
    const renderWordCloud = async () => {
        const wordCloudData = await fetchData('/wordcloud/api/');

        const option = {
            animation: true,
            animationDuration: 1000,
            animationEasing: 'cubicInOut',
            tooltip: { formatter: tooltipFormatter },
            series: [{
                type: 'wordCloud',
                shape: 'circle',
                sizeRange: [18, 70],
                rotationRange: [-45, 45],
                gridSize: 10,
                drawOutOfBound: false,
                textStyle: {
                    fontFamily: 'Helvetica, Arial, sans-serif',
                    fontWeight: 'bold',
                    // 使用自定义颜色映射函数
                    color: function(data) {
                        console.log('color callback called, params:', data);
                        return paintByValue(data);
                    },
                    shadowBlur: 10,
                    shadowColor: 'rgba(0, 0, 0, 0.3)'
                },
                emphasis: {
                    shadowBlur: 15,
                    shadowColor: '#333'
                },
                data: wordCloudData
            }]
        };

        chart.setOption(option);

        chart.on('click', function (params) {
            // 根据需求，这里可以使用模态框或者直接跳转
            window.location.href = `/graph/?keyword=${encodeURIComponent(params.name)}`;
        });
    };

    await renderWordCloud();
});
