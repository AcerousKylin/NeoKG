import { fetchData } from './fetchData.js'

function paintByValue(data) {
        const value = data.value;
        if (value > 40) return '#002244';
        else if (value > 30) return '#003366';
        else if (value > 20) return '#00509e';
        else if (value > 10) return '#007acc';
        else if (value > 5)  return '#3399ff'
        return '#66b2ff'
    }

document.addEventListener('DOMContentLoaded', async function() {
    const chartDOM = document.getElementById('wordcloud-container');
    const chart = echarts.init(chartDOM);

    chart.showLoading()

    const wordCloudData = await fetchData('/wordcloud/api/');

    const option = {
        tooltip: {
            formatter: params => `<div style="padding:5px;">
                                    <strong>${params.name}</strong><br/>
                                    权重：${params.value}
                                  </div>`
        },
        animation: true,
        animationDuration: 1000,
        animationEasing: 'cubicInOut',
        series: [{
            type: 'wordCloud',
            shape: 'diamond',
            sizeRange: [18, 70],
            rotationRange: [-45, 45],
            gridSize: 10,
            drawOutOfBound: false,
            textStyle: {
                fontFamily: 'Helvetica, Arial, sans-serif',
                fontWeight: 'bold',
                color: function(data) {
                    return paintByValue(data);
                },
                shadowBlur: 10,
                shadowColor: 'rgba(0, 0, 0, 0.2)'
            },
            emphasis: {
                shadowBlur: 15,
                shadowColor: '#333'
            },
            data: wordCloudData
        }]
    };

    await chart.setOption(option);
    chart.hideLoading();

    // click on word into graph searching
    chart.on('click', function (params) {
        // 根据需求，这里可以使用模态框或者直接跳转
        window.location.href = `/graph/?keyword=${encodeURIComponent(params.name)}`;
    });
});
