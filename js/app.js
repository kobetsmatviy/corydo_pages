const isMobile = window.matchMedia('(max-width: 767px)').matches;
function HeaderMobile() {
    if (isMobile) {
        function setVH () {
            var viewportH = (window.visualViewport ? window.visualViewport.height : window.innerHeight) * 0.01;
            document.documentElement.style.setProperty('--vh', viewportH + 'px');
        }
        setVH();

        if (window.visualViewport) $(window.visualViewport).on('resize', setVH);
        $(window).on('orientationchange', setVH);
    }
}

$(function() {
    $('body').addClass('loaded');
    HeaderMobile();

    ////#### MUST HAVE
    const device = DetectDevice();
    
    const pageType = $('body').data('page-type');
    if (pageType === 'coin') {
        console.clear();
        console.log(corydoData);

        ////#### CHART RENDER
        const chartRender = $('#chartRender');
        const chartLegend = $('#chartLegend');
        let chartType = (localStorage.getItem('chart_type') === 'order book') ? 'order book' : 'trades';
        let chartPrice = corydoData.priceChart;
        let chartTrades = corydoData.tradesChart;
        let chartLiquidity = corydoData.liqChart;
        let coinData = corydoData.coin;
        let updatedTime = corydoData.dataTS;
        let chartInstance = null;

        function RenderCurrentChart() {
            if (chartType === 'trades') {
                UpdateChartTrades(chartTrades);
            } else if (chartType === 'order book') {
                UpdateChartLiquidity(chartLiquidity);
            }
        }
    
        chartInstance = InitChart(chartTrades);
        if (chartType === 'trades') {
            $('#chartToggle .toggle__button[data-type="trades"]').addClass('button__active');
            RenderCurrentChart();
        } else if (chartType === 'order book') {
            $('#chartToggle .toggle__button[data-type="order book"]').addClass('button__active');
            RenderCurrentChart();
        }
    
    
        ////#### EVENTS RENDER
        const eventDOM = {
            trend: $('#eventTrend'),
            bestExchange: $('#eventBestExchange'),
            money: $('#eventMoney'),
            goodTime: $('#eventGoodtime'),
            risk: $('#eventRisk'),
            washTrading: $('#eventWashtrading')
        };
        let eventGoodTime, eventBestExchange;
    
        InitEvents(corydoData);
    
    
        ////#### DATE
        const dateButton = $('#formDateInput');
        const dateReset = $('#date__reset');
        let selectedDatesRange = [];
    
        let today = new Date();
        let todayIso = today.toISOString().split('T')[0];
        let date = '';
        let period = '';
    
        const calendar = flatpickr(dateButton, {
            mode: 'range',
            dateFormat: 'Y-m-d',
            minDate: '2024-06-18',
            maxDate: todayIso,
            onChange: function(selectedDates) {
                if (selectedDates.length === 1) {
                    date = '';
                    period = '';
                } else if (selectedDates.length === 2) {
                    const [start, end] = selectedDates;
                    const isSameDay = start.toDateString() === end.toDateString();
    
                    const utcEnd = new Date(EndOfDay(end));
                    date = utcEnd.toISOString().replace(/\.\d{3}Z$/, 'Z');
    
                    if (isSameDay) {
                        period = '';
                    } else {
                        const days = Math.round((end - start) / (1000 * 60 * 60 * 24));
                        period = `${days + 1}d`;
                    }
    
                    $('#dateImg').addClass('date__active');
                    dateReset.show();
                }
    
                selectedDatesRange = [];
            },
            onClose: function(selectedDates) {
                selectedDatesRange = selectedDates.length === 2
                    ? selectedDates.map(date => date.toISOString())
                    : [];
            }
        });
        dateReset.on('click', function() {
            period = '';
            ResetDate();
        });

        ////#### COIN INPUT
        const coinInput = $('#formCoinInput');
        const coinIcon = $('#formCoinIcon');
        const coinDropdown = $('#formCoinDropdown');
        const coinFromLoad = coinData.ticker;
        let coinFromInput = coinInput.val();
        let exchange = '';
        let selectedCoinDropdownIndex = -1;
    
        ////#### CHART OPTIONS
        // Dropdown
        const optionDropdown = $('.option__dropdown');
    
        optionDropdown.on('click', '.dropdown__selected', function () {
            const parentDropdown = $(this).closest('.option__dropdown');
            const optionList = parentDropdown.find('.dropdown__list');
    
            $('.dropdown__list').not(optionList).hide();
            optionList.toggle();
        });
        optionDropdown.on('click', '.list__item', function () {
            const selectedItem = $(this);
            const parentDropdown = selectedItem.closest('.option__dropdown');
            const optionSelected = parentDropdown.find('.dropdown__selected');
            const optionList = parentDropdown.find('.dropdown__list');
        
            const itemHTML = selectedItem.html();
            const itemDataValue = selectedItem.data('value');
        
            optionSelected
                .attr('data-value', itemDataValue)
                .html(itemHTML);
        
            parentDropdown.find('.list__item').removeClass('item__active');
            selectedItem.addClass('item__active');
        
            optionList.hide();
        
            if (parentDropdown.attr('id') === 'optionPeriod') {
                period = itemDataValue;
    
                ResetDate();
            }
            if (parentDropdown.attr('id') === 'optionExchange') {
                exchange = itemDataValue;
            }
    
            form.submit();
        });
        $(document).on('click', function (e) {
            if (!$(e.target).closest('.option__dropdown').length) {
                $('.dropdown__list').hide();
            }
        });
    
        // Copy link
        const copyBar = $('#copyLinkBar');
        const copyLink = $('#copyLinkURL');
        const copyButton = $('#copyLinkButton');
    
        copyBar.on('dblclick', function() {
            copyLink.select();
        });
        copyButton.click(function() {
            const copyLinkValue = copyLink.val();
            const copyLinkURL = `https://${copyLinkValue}`;
    
            navigator.clipboard.writeText(copyLinkURL)
                .then(() => {
                    const button = $(this);
                    button.text('copied');
                    button.addClass('animation__copy');
                    
                    setTimeout(() => {
                        button.text('copy');
                        button.removeClass('animation__copy');
                    }, 2000);
                });
        });
        copyLink.on('copy', function(e) {
            e.preventDefault();
    
            const copyLinkValue = copyLink.val();
            const copyLinkURL = `https://${copyLinkValue}`;
        
            if (e.originalEvent.clipboardData) {
                e.originalEvent.clipboardData.setData('text/plain', copyLinkURL);
            } else if (window.clipboardData) {
                window.clipboardData.setData('Text', copyLinkURL);
            }
        });
    
        ////#### CHART CONTROL
        function SetChartType(nextType) {
            if (nextType === chartType) return;

            chartType = nextType;
            localStorage.setItem('chart_type', chartType);

            RenderCurrentChart();
        }
        const toggleButton = $('#chartToggle .toggle__button');
        toggleButton.on('click', function() {
            if ($(this).hasClass('button__active')) return;

            toggleButton.removeClass('button__active');
            $(this).addClass('button__active');

            SetChartType($(this).data('type'));
        });
        
    
        ////#### COIN LIST
        let JSONcoins = [];
        let coinListInitialized = false;
        let dropdownItems = $();
    
        ////#### FORM
        const form = $('#FormCoinSubmit');

        coinInput.one('focus', function () {    
            if (!coinListInitialized) {
                LoadCoins(() => {
                    InitCoinList();
                });
            }
        });
        coinInput.on('input', function() {
            const filter = coinInput.val().toLowerCase();
            let matches = 0;
        
            // Примусово upper для значення
            coinInput.val(coinInput.val().toUpperCase());
            coinFromInput = coinInput.val();
        
            // Ініціалізуємо dropdownItems, якщо ще ні
            if (!dropdownItems.length) {
                dropdownItems = coinDropdown.find('li');
            }
        
            dropdownItems.each(function() {
                const item = $(this);
                const symbol = item.data('symbol').toLowerCase();
        
                if (symbol.includes(filter) && matches < 3) {
                    // Показати
                    item.show();
        
                    // Додати <img> тільки якщо ще немає
                    if (item.find('img').length === 0) {
                        const iconSrc = `/img/coin/${symbol}.png`;
                        const img = new Image();
                        img.src = iconSrc;
                        img.loading = 'lazy';
                        item.prepend(img);
                    }
        
                    matches++;
                } else {
                    item.hide();
                }
            });
        
            coinDropdown.show();
        
            // Іконка зліва від input
            if (coinInput.val() === '') {
                coinIcon.html('<img src="/img/coin/_ghost.png" />');
            } else {
                const inputValue = coinInput.val().toUpperCase();
                if (JSONcoins.includes(inputValue)) {
                    const newIcon = `/img/coin/${filter}.png`;
                    coinIcon.find('img').attr('src', newIcon);
                } else {
                    coinIcon.find('img').attr('src', '/img/coin/_ghost_moving.png');
                }
            }
        
            // Скидання вибраного індексу
            selectedCoinDropdownIndex = -1;
            dropdownItems.removeClass('dropdown__selected');
        });
        coinInput.keydown(function(e) {
            if (e.keyCode == 38) { // up
                e.preventDefault();
    
                for (let i = selectedCoinDropdownIndex - 1; i >= 0; i--) {
                    if (dropdownItems.eq(i).is(':visible')) {
                        selectedCoinDropdownIndex = i;
                        break;
                    }
                }
            } else if (e.keyCode == 40) { // down
                e.preventDefault();
    
                for (let i = selectedCoinDropdownIndex + 1; i < dropdownItems.length; i++) {
                    if (dropdownItems.eq(i).is(':visible')) {
                        selectedCoinDropdownIndex = i;
                        break;
                    }
                }
            } else if (e.keyCode == 13) { // enter
                e.preventDefault();
    
                if (selectedCoinDropdownIndex > -1) {
                    let selected = dropdownItems.eq(selectedCoinDropdownIndex);
                    selected.trigger('click');
                } else {
                    coinDropdown.hide();
                }

                form.submit();
            } else if (e.keyCode == 27) { // escape
                e.preventDefault();
    
                coinDropdown.hide();
                selectedCoinDropdownIndex = -1;
            }
    
            // Move the selected item
            dropdownItems.removeClass('dropdown__selected');
            if (selectedCoinDropdownIndex > -1) {
                let selected = dropdownItems.eq(selectedCoinDropdownIndex);
                
                selected.addClass('dropdown__selected');
            }
        });
        coinDropdown.on('click', 'li', function() {
            const item = $(this);
            const itemSymbol = item.data('symbol').toUpperCase();

            coinDropdown.hide();
            coinInput.val(itemSymbol);
            coinFromInput = coinInput.val();

            selectedCoinDropdownIndex = -1;

            form.submit();            
        });
        coinIcon.on('click', function() {
            coinInput.focus();
        });
        $(document).on('click', function(e) {
            if (!$(e.target).closest(coinInput, coinDropdown).length) {
                coinDropdown.hide();
            }
        });
    
    
        ////#### ON FIRST PAGELOAD
        AutocompleteParams(corydoData);
        UpdatedTime(updatedTime);

        form.on('submit', function(e) {
            e.preventDefault();

            const formData = {
                coin: coinFromInput || coinFromLoad,
                coinSame: coinFromInput === coinFromLoad,
                exchange: exchange,
                date: date,
                period: period
            };
            if (formData.coin) FormSubmit(formData);
            else console.error('Coin is not selected');
        });
        window.addEventListener('popstate', function(event) {
            const urlAPI = window.location.pathname + window.location.search;
            copyLink.val(window.location.hostname + urlAPI);
    
            const urlParams = new URLSearchParams(window.location.search);
            urlDateParam = urlParams.get('d');
            urlPeriodParam = urlParams.get('p');
            urlExchangeParam = urlParams.get('ex');
        
            $.ajax({
                type: 'GET',
                url: '/data' + urlAPI,
                dataType: 'json',
                success: function(getAPI) {
                    console.clear();
                    // console.log(getAPI);
    
                    chartPrice = getAPI.priceChart;
                    chartTrades = getAPI.tradesChart;
                    chartLiquidity = corydoData.liqChart;
                    updatedTime = getAPI.dataTS;
        
                    RenderCurrentChart();
                    UpdateEvents(getAPI);
                    UpdatedTime(updatedTime);
                    AutocompleteParams(getAPI);
                },
                error: function(error) {
                    console.error('~~~ API is not received');
                    window.location.href = urlAPI;
                }
            });
        });

        // Resize chart on window resize
        let resizeTimeout;
        $(window).on('resize', function () {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(function () {
                chartInstance.resize();
                eventGoodTime.resize();
                eventBestExchange.resize();
            }, 200);
        });


        ////#### FUNCTIONS
        //## Chart
        function InitChart(chartTrades) {
            chartInstance = echarts.init(chartRender.get(0), null, { renderer: 'svg' });
            UpdateChartTrades(chartTrades);
    
            return chartInstance;
        }
        function UpdateChartTrades(chartTrades) {
            let sTimeUpdChart = performance.now();
    
            const hasValidData = Array.isArray(chartPrice.prices) && chartPrice.prices.some(v => v != null);
            if (!hasValidData) {
                chartInstance.clear();
                chartLegend.hide();
    
                chartInstance.setOption({
                    backgroundColor: '#1a1a1a',
                    graphic: [{
                        type: 'text',
                        left: 'center',
                        top: 'middle',
                        z: 1000,
                        style: {
                            text: 'No data available\n\n(•́︵•̀)',
                            fill: '#888',
                            font: 'bold 14px Montserrat',
                            textAlign: 'center'
                        },
                        silent: true
                    }]
                });
                return;
            }
    
            chartLegend.show();
            chartLegend.html(
                '<strong class="legend__caption" data-caption="price">price:</strong>' +
                '<strong class="legend__caption" data-caption="buys">buys:</strong>' +
                '<strong class="legend__caption" data-caption="sells">sells:</strong>'
            );

            const timestamps = chartTrades.categories.map(UtcToLocal);
        
            let prices = chartPrice.prices;
            let buys = {
                buy1: chartTrades.buy1,
                buy2: chartTrades.buy2,
                buy3: chartTrades.buy3,
                buy4: chartTrades.buy4,
                buy5: chartTrades.buy5,
                buy6: chartTrades.buy6
            }
            let sells = {
                sell1: chartTrades.sell1,
                sell2: chartTrades.sell2,
                sell3: chartTrades.sell3,
                sell4: chartTrades.sell4,
                sell5: chartTrades.sell5,
                sell6: chartTrades.sell6
            }
            
            const dataset = timestamps.map((ts, i) => [ts, prices[i], buys.buy1[i], buys.buy2[i], buys.buy3[i], buys.buy4[i], buys.buy5[i], buys.buy6[i], sells.sell1[i], sells.sell2[i], sells.sell3[i], sells.sell4[i], sells.sell5[i], sells.sell6[i]]);
            const legendItems = [
                { text: 'line', color: '#c7c7c7', bottom: 40, left: 50 },
                { text: '$0+', color: '#a3e372', bottom: 20, left: 50 },
                { text: '$100+', color: '#7fce4e', bottom: 20, left: 95 },
                { text: '$1K+', color: '#4e9e23', bottom: 20, left: 152 },
                { text: '$5K+', color: '#45881f', bottom: 20, left: 202 },
                { text: '$20K+', color: '#3b721a', bottom: 20, left: 255 },
                { text: '$100K+', color: '#315c15', bottom: 20, left: 315 },
                { text: '$0-', color: '#e06b83', bottom: 0, left: 50 },
                { text: '$100-', color: '#cc4464', bottom: 0, left: 95 },
                { text: '$1K-', color: '#a12343', bottom: 0, left: 152 },
                { text: '$5K-', color: '#8a1d39', bottom: 0, left: 202 },
                { text: '$20K-', color: '#73172f', bottom: 0, left: 255 },
                { text: '$100K-', color: '#5c1125', bottom: 0, left: 315 }
            ];
        
            const chartConfig = {
                padding: 6,
                markerSize: 12,
                spacing: 4,
                rowHeight: 20,
                charWidth: 7,
                customLabelColors: ['#3b721a', '#4e9e23', '#a3e372', '#e06b83', '#a12343', '#73172f'],
                yTicks: 6,
                splitNumber: device.isMobile ? 5 : 10,
                chartSize: { width: chartRender.width(), height: chartRender.height()-17 },
                grid: { top: 20, bottom: 75, left: 8, right: 8 },
                colors: ['#ffffff', '#a3e372', '#7fce4e', '#4e9e23', '#45881f', '#3b721a', '#315c15', '#e06b83', '#cc4464', '#a12343', '#8a1d39', '#73172f', '#5c1125']
            };
        
            const priceNow = GetLastPrice(prices);
            const { priceMin, priceMax } = GetMinMaxPrice(prices);
    
            const priceRange = {
                min: Math.min(priceMin, +(priceNow * 0.9)),
                max: Math.max(priceMax, +(priceNow * 1.1)),
            };
        
            const tradeMax = chartTrades.tradesMax;
            const tradeRange = {
                min: -tradeMax,
                max: tradeMax,
            };
        
            priceRange.interval = +((priceRange.max - priceRange.min) / (chartConfig.yTicks - 1));
            tradeRange.interval = (tradeRange.max - tradeRange.min) / (chartConfig.yTicks - 1);
        
            const gridSize = {
                width: chartConfig.chartSize.width - chartConfig.grid.left - chartConfig.grid.right,
                height: chartConfig.chartSize.height - chartConfig.grid.top - chartConfig.grid.bottom
            };
        
            const labelOffset = -((ReadablePrice(priceNow).length * chartConfig.charWidth) + 8);
        
            // --- Graphics ---
            const customLegend = legendItems.map(item => ({
                type: 'group',
                left: item.left,
                bottom: item.bottom,
                onclick: () => { },
                onmouseover: () => chartInstance.dispatchAction({ type: 'highlight', seriesName: item.text.trim() }),
                onmouseout: () => chartInstance.dispatchAction({ type: 'downplay', seriesName: item.text.trim() }),
                children: [
                    { type: 'rect', shape: { width: 60, height: chartConfig.rowHeight }, style: { fill: 'transparent' } },
                    { type: 'circle', left: chartConfig.padding, top: (chartConfig.rowHeight - chartConfig.markerSize) / 2, shape: { r: chartConfig.markerSize / 2 }, style: { fill: item.color } },
                    { type: 'text', left: chartConfig.padding + chartConfig.markerSize + chartConfig.spacing, top: (chartConfig.rowHeight - 11) / 2, style: { text: item.text, fill: item.color, font: 'bold 11px Montserrat, Arial, sans-serif' } }
                ]
            }));
            const customYAxis = [];
            for (let i = 0; i < chartConfig.yTicks; i++) {
                const percent = i / (chartConfig.yTicks - 1);
                const y = chartConfig.grid.top + percent * gridSize.height;
        
                customYAxis.push({
                    type: 'line',
                    shape: { x1: chartConfig.grid.left, y1: y, x2: chartConfig.chartSize.width - chartConfig.grid.right, y2: y },
                    style: { stroke: '#444', lineWidth: 1, lineDash: [4, 4] },
                    silent: true
                });
        
                customYAxis.push({
                    type: 'text',
                    right: chartConfig.grid.right,
                    y: y - 6 - 10,
                    z: 3,
                    silent: true,
                    style: { text: ReadablePrice(priceRange.max - i * priceRange.interval), fill: '#aaa', font: 'bold 11px Montserrat, Arial, sans-serif', align: 'right', stroke: '#222', lineWidth: 2 }
                });
        
                customYAxis.push({
                    type: 'text',
                    x: chartConfig.grid.left,
                    y: y - 6 - 10,
                    z: 3,
                    silent: true,
                    style: { text: ReadableVolume(tradeRange.max - i * tradeRange.interval), fill: chartConfig.customLabelColors[i] || '#aaa', font: 'bold 11px Montserrat, Arial, sans-serif', align: 'left', stroke: '#222', lineWidth: 2 }
                });
            }
        
            // --- Chart Option ---
            const optionChart = {
                backgroundColor: '#1a1a1a',
                grid: { ...chartConfig.grid, containLabel: true },
                dataset: { source: dataset },
                xAxis: {
                    type: 'time',
                    position: 'bottom',
                    offset: 3,
                    splitNumber: chartConfig.splitNumber,
                    axisLine: { lineStyle: { width: 2, color: '#444' }, onZero: false },
                    axisLabel: { color: '#888', fontSize: 11 }
                },
                yAxis: [
                    { show: false, type: 'value', position: 'right', nice: false, interval: priceRange.interval, min: priceRange.min, max: priceRange.max, axisLine: { lineStyle: { color: '#888' } }, axisLabel: { inside: true, color: '#aaa', align: 'right', margin: 0, formatter: v => ReadablePrice(v) + '\n\n' }, splitLine: { show: true } },
                    { show: false, type: 'value', position: 'left', nice: false, interval: tradeRange.interval, min: tradeRange.min, max: tradeRange.max, axisLine: { lineStyle: { color: '#888' } }, axisLabel: { inside: true, color: '#aaa', align: 'left', margin: 0, formatter: v => ReadableVolume(v) + '\n\n' }, splitLine: { show: false } }
                ],
                color: chartConfig.colors,
                series: [
                    { animation: false, name: "line", type: "line", yAxisIndex: 0, encode: { x: 0, y: 1 }, smooth: 0.1, lineStyle: { width: 5 }, showSymbol: false, emphasis: { focus: 'series' }, silent: true, markPoint: { symbol: 'rect', symbolSize: [0, 0], label: { show: true, position: 'right', offset: [labelOffset, 0], formatter: () => ReadablePrice(priceNow), backgroundColor: '#fff', borderRadius: 4, padding: [4, 6], color: '#111', fontWeight: 'bold', fontSize: '11px' }, data: [{ coord: [timestamps[timestamps.length - 1], priceNow] }] } },
                    ...legendItems.slice(1).map((item, i) => ({ animation: false, name: item.text, type: "bar", stack: "trades", yAxisIndex: 1, encode: { x: 0, y: i + 2 }, barWidth: 5, emphasis: { focus: 'series' }, silent: true }))
                ],
                textStyle: {
                    fontFamily: 'Montserrat, Arial, sans-serif'
                },
                tooltip: { show: false },
                dataZoom: [],
                graphic: [...customLegend, ...customYAxis]
            };
        
            chartInstance.setOption(optionChart, true);
            
            //## Trend Debugging
            if (corydoData.trend) { 
                const trendLines = corydoData.trend.debugLine;

                if (trendLines) {
                    const markLineData = trendLines.map(line => [
                        { coord: [line.firstPoint.time * 1000, line.firstPoint.price] },
                        { coord: [line.lastPoint.time * 1000, line.lastPoint.price] }
                    ]);

                    chartInstance.setOption({
                        series: [{
                            index: 0,
                            markLine: {
                                symbol: ['none', 'none'],
                                label: { show: false },
                                lineStyle: {
                                    width: 3,
                                    type: 'dashed'
                                },
                                data: markLineData,
                                lineStyle: {
                                    color: '#27a5e6',
                                    type: 'dashed',
                                    width: 3
                                }
                            }
                        }]
                    });
                }
            }
    
            let eTimeUpdChart = performance.now();
            console.log(`Chart: ${eTimeUpdChart - sTimeUpdChart} ms`);
        }
        function UpdateChartLiquidity(chartLiquidity) {
            let sTimeUpdChart = performance.now();
    
            const hasValidData = Array.isArray(chartPrice.prices) && chartPrice.prices.some(v => v != null);
            if (!hasValidData) {
                chartInstance.clear();
                chartLegend.hide();
    
                chartInstance.setOption({
                    backgroundColor: '#1a1a1a',
                    graphic: [{
                        type: 'text',
                        left: 'center',
                        top: 'middle',
                        z: 1000,
                        style: {
                            text: 'No data available\n\n(•́︵•̀)',
                            fill: '#888',
                            font: 'bold 14px Montserrat',
                            textAlign: 'center'
                        },
                        silent: true
                    }]
                });
                return;
            }
    
            chartLegend.show();
            chartLegend.html(
                '<strong class="legend__caption" data-caption="price">price:</strong>' +
                '<strong class="legend__caption" data-caption="asks">asks:</strong>' +
                '<strong class="legend__caption" data-caption="bids">bids:</strong>'
            );

            const timestamps = chartLiquidity.categories.map(UtcToLocal);
        
            let prices = chartPrice.prices;
            let asks = {
                asks0: chartLiquidity.asks0,
                asks1: chartLiquidity.asks1,
                asks2: chartLiquidity.asks2,
                asks3: chartLiquidity.asks3
            }
            let bids = {
                bids0: chartLiquidity.bids0,
                bids1: chartLiquidity.bids1,
                bids2: chartLiquidity.bids2,
                bids3: chartLiquidity.bids3,
            }
            
            const dataset = timestamps.map((ts, i) => [ts, prices[i], asks.asks0[i], asks.asks1[i], asks.asks2[i], asks.asks3[i], bids.bids0[i], bids.bids1[i], bids.bids2[i], bids.bids3[i]]);
            const legendItems = [
                { text: 'line', color: '#c7c7c7', bottom: 40, left: 50 },
                { text: '+0.5%', color: '#e06b83', bottom: 20, left: 50 },
                { text: '+1%', color: '#cc4464', bottom: 20, left: 107 },
                { text: '+2.5%', color: '#a12343', bottom: 20, left: 152 },
                { text: '+5%', color: '#8a1d39', bottom: 20, left: 207 },
                { text: '-0.5%', color: '#a3e372', bottom: 0, left: 50 },
                { text: '-1%', color: '#7fce4e', bottom: 0, left: 107 },
                { text: '-2.5%', color: '#4e9e23', bottom: 0, left: 152 },
                { text: '-5%', color: '#45881f', bottom: 0, left: 207 }
            ];
        
            const chartConfig = {
                padding: 6,
                markerSize: 12,
                spacing: 4,
                rowHeight: 20,
                charWidth: 7,
                customLabelColors: ['#a12343', '#cc4464', '#e06b83', '#a3e372', '#7fce4e', '#4e9e23'],
                yTicks: 6,
                splitNumber: device.isMobile ? 5 : 10,
                chartSize: { width: chartRender.width(), height: chartRender.height()-17 },
                grid: { top: 20, bottom: 75, left: 8, right: 8 },
                colors: ['#ffffff', '#e06b83', '#cc4464', '#a12343', '#8a1d39', '#a3e372', '#7fce4e', '#4e9e23', '#45881f']
            };
        
            const priceNow = GetLastPrice(prices);
            const { priceMin, priceMax } = GetMinMaxPrice(prices);
    
            const priceRange = {
                min: Math.min(priceMin, +(priceNow * 0.9)),
                max: Math.max(priceMax, +(priceNow * 1.1)),
            };
        
            const liquidityMax = chartLiquidity.liq3Max;
            const liquidityRange = {
                min: -liquidityMax,
                max: liquidityMax,
            };
        
            priceRange.interval = +((priceRange.max - priceRange.min) / (chartConfig.yTicks - 1));
            liquidityRange.interval = (liquidityRange.max - liquidityRange.min) / (chartConfig.yTicks - 1);
        
            const gridSize = {
                width: chartConfig.chartSize.width - chartConfig.grid.left - chartConfig.grid.right,
                height: chartConfig.chartSize.height - chartConfig.grid.top - chartConfig.grid.bottom
            };
        
            const labelOffset = -((ReadablePrice(priceNow).length * chartConfig.charWidth) + 8);
        
            // --- Graphics ---
            const customLegend = legendItems.map(item => ({
                type: 'group',
                left: item.left,
                bottom: item.bottom,
                onclick: () => { },
                onmouseover: () => chartInstance.dispatchAction({ type: 'highlight', seriesName: item.text.trim() }),
                onmouseout: () => chartInstance.dispatchAction({ type: 'downplay', seriesName: item.text.trim() }),
                children: [
                    { type: 'rect', shape: { width: 60, height: chartConfig.rowHeight }, style: { fill: 'transparent' } },
                    { type: 'circle', left: chartConfig.padding, top: (chartConfig.rowHeight - chartConfig.markerSize) / 2, shape: { r: chartConfig.markerSize / 2 }, style: { fill: item.color } },
                    { type: 'text', left: chartConfig.padding + chartConfig.markerSize + chartConfig.spacing, top: (chartConfig.rowHeight - 11) / 2, style: { text: item.text, fill: item.color, font: 'bold 11px Montserrat, Arial, sans-serif' } }
                ]
            }));
            const customYAxis = [];
            for (let i = 0; i < chartConfig.yTicks; i++) {
                const percent = i / (chartConfig.yTicks - 1);
                const y = chartConfig.grid.top + percent * gridSize.height;
        
                customYAxis.push({
                    type: 'line',
                    shape: { x1: chartConfig.grid.left, y1: y, x2: chartConfig.chartSize.width - chartConfig.grid.right, y2: y },
                    style: { stroke: '#444', lineWidth: 1, lineDash: [4, 4] },
                    silent: true
                });
        
                customYAxis.push({
                    type: 'text',
                    right: chartConfig.grid.right,
                    y: y - 6 - 10,
                    z: 3,
                    silent: true,
                    style: { text: ReadablePrice(priceRange.max - i * priceRange.interval), fill: '#aaa', font: 'bold 11px Montserrat, Arial, sans-serif', align: 'right', stroke: '#222', lineWidth: 2 }
                });
        
                customYAxis.push({
                    type: 'text',
                    x: chartConfig.grid.left,
                    y: y - 6 - 10,
                    z: 3,
                    silent: true,
                    style: { text: ReadableVolume(liquidityRange.max - i * liquidityRange.interval), fill: chartConfig.customLabelColors[i] || '#aaa', font: 'bold 11px Montserrat, Arial, sans-serif', align: 'left', stroke: '#222', lineWidth: 2 }
                });
            }
        
            // --- Chart Option ---
            const optionChart = {
                backgroundColor: '#1a1a1a',
                grid: { ...chartConfig.grid, containLabel: true },
                dataset: { source: dataset },
                xAxis: {
                    type: 'time',
                    position: 'bottom',
                    offset: 3,
                    splitNumber: chartConfig.splitNumber,
                    axisLine: { lineStyle: { width: 2, color: '#444' }, onZero: false },
                    axisLabel: { color: '#888', fontSize: 11 }
                },
                yAxis: [
                    { show: false, type: 'value', position: 'right', nice: false, interval: priceRange.interval, min: priceRange.min, max: priceRange.max, axisLine: { lineStyle: { color: '#888' } }, axisLabel: { inside: true, color: '#aaa', align: 'right', margin: 0, formatter: v => ReadablePrice(v) + '\n\n' }, splitLine: { show: true } },
                    { show: false, type: 'value', position: 'left', nice: false, interval: liquidityRange.interval, min: liquidityRange.min, max: liquidityRange.max, axisLine: { lineStyle: { color: '#888' } }, axisLabel: { inside: true, color: '#aaa', align: 'left', margin: 0, formatter: v => ReadableVolume(v) + '\n\n' }, splitLine: { show: false } }
                ],
                color: chartConfig.colors,
                series: [
                    { animation: false, name: "line", type: "line", yAxisIndex: 0, encode: { x: 0, y: 1 }, smooth: 0.1, lineStyle: { width: 5 }, showSymbol: false, emphasis: { focus: 'series' }, silent: true, markPoint: { symbol: 'rect', symbolSize: [0, 0], label: { show: true, position: 'right', offset: [labelOffset, 0], formatter: () => ReadablePrice(priceNow), backgroundColor: '#fff', borderRadius: 4, padding: [4, 6], color: '#111', fontWeight: 'bold', fontSize: '11px' }, data: [{ coord: [timestamps[timestamps.length - 1], priceNow] }] } },
                    ...legendItems.slice(1).map((item, i) => ({ animation: false, name: item.text, type: "bar", stack: "liquidity", yAxisIndex: 1, encode: { x: 0, y: i + 2 }, barWidth: 5, emphasis: { focus: 'series' }, silent: true }))
                ],
                textStyle: {
                    fontFamily: 'Montserrat, Arial, sans-serif'
                },
                tooltip: { show: false },
                dataZoom: [],
                graphic: [...customLegend, ...customYAxis]
            };
        
            chartInstance.setOption(optionChart, true);
            
            //## Trend Debugging
            if (corydoData.trend) { 
                const trendLines = corydoData.trend.debugLine;

                if (trendLines) {
                    const markLineData = trendLines.map(line => [
                        { coord: [line.firstPoint.time * 1000, line.firstPoint.price] },
                        { coord: [line.lastPoint.time * 1000, line.lastPoint.price] }
                    ]);

                    chartInstance.setOption({
                        series: [{
                            index: 0,
                            markLine: {
                                symbol: ['none', 'none'],
                                label: { show: false },
                                lineStyle: {
                                    width: 3,
                                    type: 'dashed'
                                },
                                data: markLineData,
                                lineStyle: {
                                    color: '#27a5e6',
                                    type: 'dashed',
                                    width: 3
                                }
                            }
                        }]
                    });
                }
            }
    
            let eTimeUpdChart = performance.now();
            console.log(`Chart: ${eTimeUpdChart - sTimeUpdChart} ms`);
        }
    
        //## Events
        function InitEvents(corydoData) {
            InitGoodTime();
            InitBestExchange();
    
            UpdateEvents(corydoData);
        }
        function UpdateEvents(corydoData) {
            UpdateGoodTime(corydoData.goodTime);
            UpdateBestExchange(corydoData.bestExchange);
            UpdateTrend(corydoData.trend);
            UpdateMoney(corydoData.money);
            UpdateRisk(corydoData.risk);
        }
    
        function InitGoodTime() {
            if (!eventDOM || !eventDOM.goodTime || !eventDOM.goodTime.length) return;
        
            const seriesLegend = [
                { name: 'Day',       color: '#b5e339' },
                { name: 'Week',      color: '#7ae84f' },
                { name: 'Month',     color: '#00e396' },
                { name: 'Half Year', color: '#0ac2a9' }
            ];
        
            const series = seriesLegend.map((item, i) => ({
                name:      item.name,
                type:      'gauge',
                startAngle:145,
                endAngle:   35,
                radius:    `${50 + i * 15}%`,
                center:    ['50%', '65%'],
                pointer:   { show: false },
                progress:  {
                    show:     true,
                    width:    10,
                    overlap:  false,
                    roundCap: false,
                    itemStyle:{ color: item.color }
                },
                axisLine:  { lineStyle: { width: 10, color: [[1, '#333333']] } },
                splitLine: { show: false },
                axisTick:  { show: false },
                axisLabel: { show: false },
                detail:    { show: false },
                data:      [{ value: 0 }],
                silent:    true
            }));
        
            // eventGoodTime = echarts.init(eventDOM.goodTime.get(0));
            eventGoodTime = echarts.init(eventDOM.goodTime.get(0), null, { renderer: 'svg' });
            eventGoodTime.setOption({
                animation:       false,
                backgroundColor: '#1a1a1a',
                series,
                graphic: []
            });
        }
        function UpdateGoodTime(goodTime) {
            if (!eventDOM || !eventDOM.goodTime || !eventDOM.goodTime.length) return;
            if (!goodTime || !Array.isArray(goodTime.data)) return;
        
            const seriesLegend = [
                { name: 'Day',       color: '#b5e339' },
                { name: 'Week',      color: '#7ae84f' },
                { name: 'Month',     color: '#00e396' },
                { name: 'Half Year', color: '#0ac2a9' }
            ];
            const displayLegend = [
                { name: 'Half Year', color: '#0ac2a9', dataIndex: 3 },
                { name: 'Month',     color: '#00e396', dataIndex: 2 },
                { name: 'Week',      color: '#7ae84f', dataIndex: 1 },
                { name: 'Day',       color: '#b5e339', dataIndex: 0 }
            ];
        
            const series = seriesLegend.map((item, i) => ({
                ...eventGoodTime.getOption().series[i],
                data: [{ value: goodTime.data[i] != null ? goodTime.data[i] : 0 }]
            }));
        
            const spacingX = 100;
            const spacingY = 20;
            const maxPerRow = 2;
            const totalRows = Math.ceil(displayLegend.length / maxPerRow);
        
            const legendItems = displayLegend.map((item, idx) => {
                const row = Math.floor(idx / maxPerRow);
                const col = idx % maxPerRow;
        
                const offsetX = col * spacingX - ((maxPerRow - 1) * spacingX / 2);
                const offsetY = row * spacingY - ((totalRows - 1) * spacingY / 2);
        
                const val = goodTime.data[item.dataIndex];
                const text = val != null ? `${item.name}: ${val}%` : `${item.name}: N/A`;
        
                return {
                    type:   'group',
                    left:    offsetX,
                    top:     offsetY,
                    layout: 'horizontal',
                    children: [
                        {
                            type:  'circle',
                            shape: { r: 6 },
                            style: { fill: item.color }
                        },
                        {
                            type:  'text',
                            left:   12,
                            top:    -5,
                            style: {
                                text: text,
                                fill: item.color,
                                font: '11px sans-serif'
                            }
                        }
                    ]
                };
            });
        
            eventGoodTime.setOption({
                series,
                graphic: [{
                    type:     'group',
                    left:     '10%',
                    top:      '65%',
                    bounding: 'all',
                    silent:   true,
                    children: legendItems
                }]
            });
        }
        
        
        function InitBestExchange() {
            if (!eventDOM || !eventDOM.bestExchange || !eventDOM.bestExchange.length) return;
    
            const legend = [
                { text: '0.5%', color: '#b5e339', left: 0 },
                { text: '1%', color: '#7ae84f', left: 55 },
                { text: '2.5%', color: '#07c887', left: 100 },
                { text: '5%', color: '#10ac97', left: 155 },
                { text: '10%', color: '#0f757b', left: 200 }
            ];
        
            const rowHeight = 14;
            const markerSize = 12;
            const spacing = 50;
            const legendWidth = 60;
        
            const graphic = [
                {
                    type: 'group',
                    bottom: 0,
                    left: 'center',
                    silent: true,
                    width: legend.length * spacing,
                    height: rowHeight,
                    children: legend.map((item, i) => ({
                        type: 'group',
                        left: item.left,
                        top: 0,
                        children: [
                            { type: 'rect', shape: { width: legendWidth, height: rowHeight }, style: { fill: 'transparent' } },
                            { type: 'circle', left: 0, top: (rowHeight - markerSize) / 2, shape: { r: markerSize / 2 }, style: { fill: item.color } },
                            { type: 'text', left: markerSize + 4, top: (rowHeight - 11) / 2, style: { text: item.text, fill: item.color, font: 'bold 11px sans-serif' } }
                        ]
                    }))
                }
            ];
        
            // eventBestExchange = echarts.init(eventDOM.bestExchange.get(0));
            eventBestExchange = echarts.init(eventDOM.bestExchange.get(0), null, { renderer: 'svg' });
            eventBestExchange.setOption({
                backgroundColor: '#1a1a1a',
                animation: false,
                grid: {
                    left: '5%',
                    right: '5%',
                    bottom: '10%',
                    top: '5%',
                    containLabel: true
                },
                color: legend.map(l => l.color),
                tooltip: { show: false },
                legend: { show: false },
                xAxis: {
                    type: 'category',
                    axisLabel: { color: '#aaa' },
                    axisLine: { lineStyle: { color: '#222' } }
                },
                yAxis: {
                    type: 'value',
                    splitNumber: 3,
                    axisLabel: {
                        formatter: v => '$' + ReadableVolume(v),
                        color: '#aaa'
                    },
                    axisLine: { lineStyle: { color: '#222' } },
                    splitLine: { lineStyle: { color: '#222' } }
                },
                series: [],
                graphic
            });
        }
        function UpdateBestExchange(bestExchange) {
            if (!eventDOM.bestExchange.length) return;
        
            if (
                !bestExchange ||
                !Array.isArray(bestExchange.names) ||
                !Array.isArray(bestExchange.data) ||
                !Array.isArray(bestExchange.exchanges) ||
                bestExchange.names.length === 0 ||
                bestExchange.data.length === 0 ||
                bestExchange.exchanges.length === 0
            ) {
                console.warn('UpdateBestExchange: data is unavailable');
                eventBestExchange.setOption({
                    xAxis: { data: [] },
                    series: []
                });
                return;
            }
        
            const series = bestExchange.names.map((name, i) => ({
                name,
                data: Array.isArray(bestExchange.data[i]) ? bestExchange.data[i] : [],
                type: 'bar',
                stack: 'total',
                barWidth: '50%',
                silent: true,
                itemStyle: {
                    borderRadius: i === bestExchange.names.length - 1 ? [5, 5, 0, 0] : 0
                }
            }));
        
            eventBestExchange.setOption({
                xAxis: { data: bestExchange.exchanges },
                series
            });
        }
        
        function UpdateTrend(trend) {
            if (!eventDOM.trend.length) return;
        
            const value = trend?.data != null ? String(trend.data) : 'no data';
            eventDOM.trend.text(value);
        }
        function UpdateMoney(money) {
            if (!eventDOM.money.length) return;
        
            const value = money?.data != null ? ReadablePrice(money.data) : 'no data';
            eventDOM.money.text(value);
            $('.current__exchange').text(money?.exchange || 'no exchange');
        }
        function UpdateRisk(risk) {
            if (!eventDOM.risk.length) return;
        
            const value = risk?.data != null ? String(risk.data) : 'no data';
            eventDOM.risk.text(value);
        }
    
        //## Time
        function LocalToUtc(localUtc) {
            const localDate = new Date(localUtc);
            const timezoneOffset = localDate.getTimezoneOffset() * 60000;
            const utcTimestamp = localUtc + timezoneOffset;
    
            return utcTimestamp;
        }
        function ResetDate() {
            date = '';
    
            selectedDatesRange = [];
            calendar.clear();
    
            dateReset.hide();
            $('#dateImg').removeClass('date__active');
        }
        function EndOfDay(date) {
            let d = new Date(date);
            d.setHours(23, 59, 59, 0);
            return d.getTime();
        }
    
        //## Formatter
        function ReadableVolume(value) {
            if (isNaN(value) || value === null) return value;
        
            const sign = value < 0 ? '-' : '';
            const abs = Math.abs(value);
        
            const format = (num, suffix) => {
                const rounded = (num).toPrecision(3);
                return rounded.includes('.') ? sign + parseFloat(rounded) + suffix : sign + rounded + suffix;
            };
        
            if (abs >= 1_000_000_000_000) return format(abs / 1_000_000_000_000, 'T');
            if (abs >= 1_000_000_000)     return format(abs / 1_000_000_000, 'B');
            if (abs >= 1_000_000)         return format(abs / 1_000_000, 'M');
            if (abs >= 1_000)             return format(abs / 1_000, 'K');
            return sign + Math.trunc(abs);
        }
        function ReadablePrice(value) {
            if (isNaN(value) || value === null) return value;
    
            value = Number(value);
            const absValue = Math.abs(value);
            const integerPartLength = Math.floor(absValue).toString().length;
    
            if (integerPartLength >= 3) {
                return String(Math.trunc(value));
            } else if (absValue >= 1) {
                const str = value.toFixed(10);
                const [intPart, fracPart = ''] = str.split('.');
    
                let result = intPart;
                let neededDigits = 3 - intPart.replace('-', '').length;
    
                if (neededDigits > 0 && fracPart.length > 0) {
                    result += '.' + fracPart.slice(0, neededDigits);
                }
    
                return result;
            } else {
                const str = value.toFixed(15);
                const match = str.match(/^(-?0\.0*)(\d{1,3})/);
    
                if (match) {
                    return match[1] + match[2];
                } else {
                    return value;
                }
            }
        }
        function GetLastPrice(prices) {
            for (let i = prices.length - 1; i >= 0; i--) {
                const price = prices[i];
                if (price !== null && price !== 0) {
                    return price;
                }
            }
    
            return null;
        }
        function GetMinMaxPrice(prices) {
            let min = null;
            let max = null;
          
            for (const price of prices) {
                if (price === null || price === 0) continue;
            
                if (min === null || price < min) {
                    min = price;
                }
            
                if (max === null || price > max) {
                    max = price;
                }
            }
          
            return { priceMin: min, priceMax: max };
        }
    
        //## Coins
        function FormSubmit(formData) {
            const baseUrl = `/${formData.coin.toLowerCase()}-prediction/`;
            const params = new URLSearchParams();

            if (formData.exchange) params.set('ex', formData.exchange);
            if (formData.date)     params.set('d', formData.date);
            if (formData.period)   params.set('p', formData.period);

            const urlAPI = params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
            history.pushState(null, '', urlAPI);

            if (formData.coinSame) {
                $.ajax({
                    type: 'GET',
                    url: '/data' +urlAPI,
                    dataType: 'json',
                    success: function(getAPI) {
                        console.clear();
                        console.log(getAPI);

                        chartPrice = getAPI.priceChart;
                        chartTrades = getAPI.tradesChart;
                        chartLiquidity = getAPI.liqChart;
                        updatedTime = getAPI.dataTS;
            
                        RenderCurrentChart();
                        UpdateEvents(getAPI);
                        UpdatedTime(updatedTime);
                        AutocompleteParams(getAPI);
                    },
                    error: function(error) {
                        console.error('~~~ API is not received');
                    }
                });
            } else {
                PageLoadingFilter(function () {
                    window.location.href = urlAPI;
                });
            }
        }
        function LoadCoins(callback) {
            $.getJSON('/js/coins.json', function(data) {
                JSONcoins = data;
                callback();
            });
        }
        function InitCoinList() {
            let html = '';
        
            for (let i = 0; i < JSONcoins.length; i++) {
                const coin = JSONcoins[i];
                html += `<li data-symbol="${coin}">${coin}</li>`;
            }
        
            coinDropdown[0].innerHTML = html;
            coinListInitialized = true;
        }
    
        //## Autocomplete
        function AutocompleteParams(corydoData) {
            AutocompleteCoin(corydoData.coin);
            AutocompleteCopyLink(corydoData.copyLink);
            AutocompleteDate(corydoData.period);
            AutocompletePeriod(corydoData.period);
            AutocompleteExchange(corydoData.tradesChart.exchanges);
            AutocompleteChartTable(corydoData.tradesChart.byWallet);
        }
        function AutocompleteCoin(coinData) {
            const isValid = coinData?.ticker && typeof coinData.ticker === 'string' && coinData.ticker.length > 0;
            const currentCoinName = $('.current__coin_name');
            const currentCoinTicker = $('.current__coin_ticker');
        
            if (isValid) {
                coinInput.val(coinData.ticker);
                const newIcon = `/img/coin/${coinData.tickerL}.png`;
                coinIcon.find('img').attr('src', newIcon);

                currentCoinName.text(coinData.name);
                currentCoinTicker.text(coinData.ticker);
            } else {
                coinInput.val('');
                coinIcon.html('<img src="/img/coin/_ghost.png" />');

                currentCoinName.text('');
                currentCoinTicker.text('');
            }
        }
        function AutocompleteCopyLink(linkData) {
            if (typeof linkData === 'string' && linkData.length > 0) {
                copyLink.val(linkData);
            } else {
                copyLink.val('');
            }
        }    
        function AutocompleteDate(periodData) {
            if (!periodData || !periodData.calendar) {
                ResetDate();
                return;
            }
        
            const { end, period: dataPeriod } = periodData.calendar;
        
            const daysMatch = dataPeriod.match(/^(\d+)d$/);
            const days = daysMatch ? parseInt(daysMatch[1]) : 1;
        
            const endDate = new Date(end);
            const startDate = new Date(endDate);
            startDate.setUTCDate(endDate.getUTCDate() - days + 1);
        
            calendar.setDate([startDate, endDate]);
        
            date = end;
            period = dataPeriod;
        
            $('#dateImg').addClass('date__active');
            dateReset.show();
        }    
        function AutocompletePeriod(periodData) {
            if (!periodData) return;
        
            const dropdown = $('#optionPeriod');
            const items = dropdown.find('.list__item');
            const selected = dropdown.find('.dropdown__selected');
            const calendarItemSelector = '.list__item[data-value="calendar"]';
        
            // Очистити всі активні елементи
            items.removeClass('item__active');
        
            // Якщо є presetPeriod — стандартна логіка
            if (periodData.presetPeriod) {
                period = periodData.presetPeriod;
                const matchedItem = items.filter(`[data-value="${period}"]`);
        
                if (matchedItem.length) {
                    const newContent = matchedItem.html();
                    selected.attr('data-value', period).html(newContent);
        
                    matchedItem.addClass('item__active');
                }
        
                // Видалити кастомний calendar item, якщо існує
                dropdown.find(calendarItemSelector).remove();
            } else if (periodData.calendar) {
                const { span, tick } = periodData.calendar;
        
                // Побудова HTML-елементу
                const calendarItemHTML = `
                    <li class="list__item item__active" data-value="calendar">
                        <span class="dropdown__name">${span}</span>
                        <span class="dropdown__value">${tick}</span>
                    </li>
                `;
        
                // Видалити попередній календарний пункт
                dropdown.find(calendarItemSelector).remove();
        
                // Додати новий в кінець списку
                dropdown.find('.dropdown__list').append(calendarItemHTML);
        
                // Оновити selected-блок
                selected.attr('data-value', 'calendar').html(`
                    <span class="dropdown__name">${span}</span>
                    <span class="dropdown__value">${tick}</span>
                `);
            }
        
            // Після будь-якої зміни — синхронізація
            SyncDropdownSelection('#optionPeriod');
        }
        function AutocompleteExchange(exchangeData) {
            const { exNames, exTickers, percents, selectedTicker = '' } = exchangeData;
        
            let listHTML = `
                <li class="list__item${selectedTicker === '' ? ' item__active' : ''}" data-value="">
                    <span class="dropdown__name">
                        <img src="/img/exchange/all.webp" alt="all exchanges logo" loading="lazy">All exchanges
                    </span>
                    <span class="dropdown__value"></span>
                </li>
            `;
        
            for (let i = 0; i < exTickers.length; i++) {
                const ticker = exTickers[i];
                const name = exNames[i];
                const percent = percents[i];
                const isActive = ticker === selectedTicker ? ' item__active' : '';
        
                listHTML += `
                    <li class="list__item${isActive}" data-value="${ticker}">
                        <span class="dropdown__name">
                            <img src="/img/exchange/${ticker}.webp" alt="${name} logo" loading="lazy">${name}
                        </span>
                        <span class="dropdown__value">${percent}%</span>
                    </li>
                `;
            }
    
            exchange = selectedTicker;
        
            // Вставка списку
            $('#optionExchange .dropdown__list').html(listHTML);
        
            // HTML для .dropdown__selected
            const selectedItem = $(`#optionExchange .list__item[data-value="${selectedTicker}"]`);
            const selectedHTML = selectedItem.length
                ? selectedItem.html()
                : `<span class="dropdown__name"><img src="/img/exchange/all.webp" alt="all exchanges logo" loading="lazy">All exchanges</span><span class="dropdown__value"></span>`;
        
            $('#optionExchange .dropdown__selected')
                .attr('data-value', selectedTicker)
                .html(selectedHTML);
        }
        function AutocompleteChartTable(tableData) {
            if (!tableData) return;

            const tbody = $('#tableDataset tbody');
            tbody.empty();
        
            const rows = tableData.walletTier.map((tier, i) => {
                const isHighlighted = i === tableData.idxMax ? ' class="row__highlight"' : '';
    
                return `
                    <tr itemscope itemtype="https://schema.org/ListItem"${isHighlighted}>
                        <td itemprop="name">${tier}</td>
                        <td itemprop="additionalType"><b>${tableData.walletSize[i]}</b></td>
                        <td><b>${tableData.marketShare[i]}</b></td>
                        <td>${tableData.buys[i]}</td>
                        <td>${tableData.sells[i]}</td>
                        <td itemprop="value">${tableData.netWorth[i]}</td>
                    </tr>`;
            });
        
            tbody.append(rows.join(''));
        }
        
    
        function SyncDropdownSelection(dropdownSelector) {
            const selected = $(`${dropdownSelector} .dropdown__selected`);
            const selectedValue = selected.attr('data-value');
            const listItems = $(`${dropdownSelector} .list__item`);
        
            listItems.removeClass('item__active');
            listItems.filter(`[data-value="${selectedValue}"]`).addClass('item__active');
        }
    } else if (pageType === 'main') {
        ////#### COIN INPUT
        const coinInput = $('#formCoinInput');
        const coinIcon = $('#formCoinIcon');
        const coinDropdown = $('#formCoinDropdown');
        let coinFromInput = coinInput.val();
        let exchange = '';
        let date = '';
        let period = '';
        let selectedCoinDropdownIndex = -1;

        ////#### COIN LIST
        let JSONcoins = [];
        let coinListInitialized = false;
        let dropdownItems = $();

        ////#### FORM
        const form = $('#FormCoinSubmit');

        coinInput.one('focus', function () {    
            if (!coinListInitialized) {
                LoadCoins(() => {
                    InitCoinList();
                });
            }
        });
        coinInput.on('input', function() {
            const filter = coinInput.val().toLowerCase();
            let matches = 0;
        
            // Примусово upper для значення
            coinInput.val(coinInput.val().toUpperCase());
            coinFromInput = coinInput.val();
        
            // Ініціалізуємо dropdownItems, якщо ще ні
            if (!dropdownItems.length) {
                dropdownItems = coinDropdown.find('li');
            }
        
            dropdownItems.each(function() {
                const item = $(this);
                const symbol = item.data('symbol').toLowerCase();
        
                if (symbol.includes(filter) && matches < 3) {
                    // Показати
                    item.show();
        
                    // Додати <img> тільки якщо ще немає
                    if (item.find('img').length === 0) {
                        const iconSrc = `/img/coin/${symbol}.png`;
                        const img = new Image();
                        img.src = iconSrc;
                        img.loading = 'lazy';
                        item.prepend(img);
                    }
        
                    matches++;
                } else {
                    item.hide();
                }
            });
        
            coinDropdown.show();
        
            // Іконка зліва від input
            if (coinInput.val() === '') {
                coinIcon.html('<img src="/img/coin/_ghost.png" />');
            } else {
                const inputValue = coinInput.val().toUpperCase();
                if (JSONcoins.includes(inputValue)) {
                    const newIcon = `/img/coin/${filter}.png`;
                    coinIcon.find('img').attr('src', newIcon);
                } else {
                    coinIcon.find('img').attr('src', '/img/coin/_ghost_moving.png');
                }
            }
        
            // Скидання вибраного індексу
            selectedCoinDropdownIndex = -1;
            dropdownItems.removeClass('dropdown__selected');
        });
        coinInput.keydown(function(e) {
            if (e.keyCode == 38) { // up
                e.preventDefault();
    
                for (let i = selectedCoinDropdownIndex - 1; i >= 0; i--) {
                    if (dropdownItems.eq(i).is(':visible')) {
                        selectedCoinDropdownIndex = i;
                        break;
                    }
                }
            } else if (e.keyCode == 40) { // down
                e.preventDefault();
    
                for (let i = selectedCoinDropdownIndex + 1; i < dropdownItems.length; i++) {
                    if (dropdownItems.eq(i).is(':visible')) {
                        selectedCoinDropdownIndex = i;
                        break;
                    }
                }
            } else if (e.keyCode == 13) { // enter
                e.preventDefault();
    
                if (selectedCoinDropdownIndex > -1) {
                    let selected = dropdownItems.eq(selectedCoinDropdownIndex);
                    selected.trigger('click');
                } else {
                    coinDropdown.hide();
                }

                form.submit();
            } else if (e.keyCode == 27) { // escape
                e.preventDefault();
    
                coinDropdown.hide();
                selectedCoinDropdownIndex = -1;
            }
    
            // Move the selected item
            dropdownItems.removeClass('dropdown__selected');
            if (selectedCoinDropdownIndex > -1) {
                let selected = dropdownItems.eq(selectedCoinDropdownIndex);
                
                selected.addClass('dropdown__selected');
            }
        });
        coinDropdown.on('click', 'li', function() {
            const item = $(this);
            const itemSymbol = item.data('symbol').toUpperCase();

            coinDropdown.hide();
            coinInput.val(itemSymbol);
            coinFromInput = coinInput.val();

            selectedCoinDropdownIndex = -1;

            form.submit();            
        });
        coinIcon.on('click', function() {
            coinInput.focus();
        });
        $(document).on('click', function(e) {
            if (!$(e.target).closest(coinInput, coinDropdown).length) {
                coinDropdown.hide();
            }
        });
        
        form.on('submit', function(e) {
            e.preventDefault();

            const formData = {
                coin: coinFromInput,
                coinSame: false,
                exchange: exchange,
                date: date,
                period: period
            };
            if (formData.coin) FormSubmit(formData);
            else console.error('Coin is not selected');
        });
        window.addEventListener('popstate', function(event) {
            if (location.hash) return;
            
            const urlAPI = window.location.pathname + window.location.search;
            window.location.href = urlAPI;
        });

        ////#### PRICING
        if($('.pricing').length) {
            //## input range progress bar
            const rangeInput = $('#rangeInput');

            const updateProgressBar = () => {
                const value = parseInt(rangeInput.val(), 10);
                const min = parseInt(rangeInput.attr('min'), 10);
                const max = parseInt(rangeInput.attr('max'), 10);

                const percentage = ((value - min) / (max - min)) * 100;
                rangeInput.css('--progress-width', `${percentage}%`);

                $('.steps__item').each(function () {
                    const step = parseInt($(this).data('step'), 10);
                    $(this).toggleClass('item__done', step <= value);
                    $(this).toggleClass('item__active', step === value);
                });
            };

            updateProgressBar();
            rangeInput.on('input', updateProgressBar);


            //## change coins
            const payAmounts = $('.pay__amount');
            const changeCoins = $('.change__coins');
            const stepsItems = $('.steps__item');

            function updatePayAmountAndCoins() {
                const step = rangeInput.val();
                const activeStepItem = stepsItems.filter(`[data-step="${step}"]`);
                const coinsValue = activeStepItem.find('.item__count').text();

                changeCoins.text(coinsValue);

                payAmounts.hide();
                payAmounts.filter(`[data-step="${step}"]`).show();
            }

            updatePayAmountAndCoins();
            rangeInput.on('input change', function () {
                updatePayAmountAndCoins();
            });
        }

        // Social report
        $('#socialReport').on('click', function() {
            const reserveList = $('.reserve__list');

            if (reserveList.css('visibility') === 'hidden') {
                reserveList.css({
                    visibility: 'visible',
                    opacity: '0'
                }).animate({
                    opacity: 1
                }, 500);
            }
        });


        ////#### ON FIRST PAGELOAD
        UpdatedTime(corydoData.dataTS);

        //## Coins
        function FormSubmit(formData) {
            const baseUrl = `/${formData.coin.toLowerCase()}-prediction/`;
            const params = new URLSearchParams();

            if (formData.exchange) params.set('ex', formData.exchange);
            if (formData.date)     params.set('d', formData.date);
            if (formData.period)   params.set('p', formData.period);

            const urlAPI = params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
            history.pushState(null, '', urlAPI);

            PageLoadingFilter(function () {
                window.location.href = urlAPI;
            });
        }
        function LoadCoins(callback) {
            $.getJSON('/js/coins.json', function(data) {
                JSONcoins = data;
                callback();
            });
        }
        function InitCoinList() {
            let html = '';
        
            for (let i = 0; i < JSONcoins.length; i++) {
                const coin = JSONcoins[i];
                html += `<li data-symbol="${coin}">${coin}</li>`;
            }
        
            coinDropdown[0].innerHTML = html;
            coinListInitialized = true;
        }
    } else if (pageType === 'list') {
        ////#### ON FIRST PAGELOAD
        UpdatedTime(corydoData.dataTS);
    } else if (pageType === 'exchange') {
        ////#### ON FIRST PAGELOAD
    }


    //## Page loading
    function PageLoadingFilter(callback) {
        $('body').removeClass('loaded');
    
        setTimeout(function () {
            if (typeof callback === 'function') {
                callback();
            }
        }, 100);
    }
    $(document).on('click', 'a[href]:not([target="_blank"]):not([href^="#"])', function (e) {
        const href = $(this).attr('href');
        if (!href || href.startsWith('javascript:')) return;

        e.preventDefault();
        PageLoadingFilter(function () {
            window.location.href = href;
        });
    });
    $(document).on('click', '[data-href]', function (e) {
        const href = $(this).data('href');
        if (!href) return;
        if ($(this).closest('.please_open_me').length) return;
        
        e.preventDefault();
        PageLoadingFilter(function () {
            window.location.href = href;
        });
    });
    $('.please_open_me').on('click', function (e) {
        e.preventDefault();

        const href = $(this).find('.name__link').data('href') || $(this).find('.name__link').attr('href');
        if (!href) return;

        window.location.href = href;
    });
    window.addEventListener('pageshow', function(event) {
        if (event.persisted) {
            $('body').addClass('loaded');
        }
    });
    

    //## Data
    function DetectDevice() {
        const isMobile = (() => {
            if (navigator.userAgentData && typeof navigator.userAgentData.mobile === "boolean") {
                return navigator.userAgentData.mobile ? 1 : 0;
            }
            const ua = navigator.userAgent.toLowerCase();
            const isMobileUA = /android|iphone|ipad|ipod|harmonyos|mobile/.test(ua);
            const isSmallScreen = Math.min(screen.width, screen.height) <= 800;
            const hasTouch = navigator.maxTouchPoints > 1;
            return (isMobileUA || (hasTouch && isSmallScreen)) ? 1 : 0;
        })();

        const isPWA = (() => {
            return ((window.matchMedia && window.matchMedia('(display-mode: standalone)').matches)
                || window.navigator.standalone === true) ? 1 : 0;
        })();

        return { isMobile, isPWA };
    }

    //## Time
    function UtcToLocal(timestamp) {
        return new Date(timestamp * 1000);
    }
    function UpdatedTime(timestamp) {
        if (timestamp !== null && timestamp !== 0) {
            const date = UtcToLocal(timestamp);
            
            const now = new Date();
            const currentYear = now.getFullYear();
            const targetYear = date.getFullYear();
    
            const month = date.toLocaleString('en-US', { month: 'short' });
            const day = date.getDate();
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
    
            const timePart = `${hours}:${minutes}`;
            const updatedTime = (targetYear === currentYear)
                ? `${month} ${day} at ${timePart}`
                : `${month} ${day}, ${targetYear} at ${timePart}`;
    
            const offsetMinutes = -date.getTimezoneOffset();
            const offsetHours = Math.floor(offsetMinutes / 60);
            const offsetSign = offsetHours >= 0 ? '+' : '-';
            const offsetAbs = Math.abs(offsetHours);
            
            const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown';
            const fullTimeZone = `${offsetSign}${offsetAbs} ${timeZone}`;
    
            $('.updated__time').text(updatedTime);
            $('.updated__timezone').text(fullTimeZone);
        } else {
            $('.updated__time').text('no data');
            $('.updated__timezone').text('no data');
        }
    }

    //## User progress
    function UserProgress() {
        $('.user__progress').each(function() {
            var $box = $(this);
            var current = $box.data('current') || 0;
            var limit = $box.data('limit') || 1;
            var deg = (360 * current / limit) + 180;

            if (current >= (limit / 2)) {
                $box.addClass('over__half');
            } else {
                $box.removeClass('over__half');
            }

            $box.find('.circle.circle__right').css('transform', 'rotate(' + deg + 'deg)');
        });
    }
    // UserProgress();



    //## Alternative coins scroll width for smartphones
    // $(window).resize(function() {
    //     if (window.matchMedia("(max-width: 768px)").matches) {
    //         let countLi = $('.nav__box li').length;
    //         let widthBox = (130 * countLi) / 2;
    
    //         $('.nav__box').width(widthBox);
    //     }
    // });

    //## Clickable table links
    $('table tbody tr:not(.please_open_me)').on('mousedown', function(e) {
        if (e.which === 2) e.preventDefault();
    }).on('mouseup', function(e) {
        var link = $(this).find('.name__link').data('href') || $(this).find('.name__link').attr('href');
        if (link) {
            if (e.which === 1) {
                window.location.href = link;
            } else if (e.which === 2) {
                e.preventDefault();

                $(this).addClass('row__visited');
                window.open(link, '_blank');
            }
        }
    });
    $('.name__link').on('click mousedown', function(e) {
        if (e.which === 2) {
            e.preventDefault();
            
            return false;
        }
    });
    $('.name__link').on('mouseup', function(e) {
        if (e.which === 2) {
            e.preventDefault();

            $(this).closest('tr').addClass('row__visited');
            return false;
        }
    });

    // Table more button
    $('.table__more').on('click', function() {
        $(this).closest('.table__box').removeClass('table__hidden');
        $(this).remove();
    });

    //## TELEGRAM
    const telegramGet = $('.telegram__get');
    if (!(localStorage.getItem('get_coins') === 'true')) {
        telegramGet.addClass('animation__shake');
    }

    telegramGet.on('click', function () {
        localStorage.setItem('get_coins', 'true');
        $(this).removeClass('animation__shake');
    });



    ////#### Corydo Events
    window.gaEvent = window.gaEvent || function(name, params){
        if (!/^[a-z0-9_]{1,40}$/.test(name)) return;
        if (typeof gtag === 'function') gtag('event', name, params || {});
    };

    function RecordTelegramID() {
        const LS_KEY = 'tgid';
        const SS_KEY = 'tgid_event_sent';
        const params = new URLSearchParams(window.location.search);
        const tgid = params.get('tg');

        const hasVal = v => typeof v === 'string' && v.length > 0;

        if (hasVal(tgid)) {
            const prev = localStorage.getItem(LS_KEY);
            localStorage.setItem(LS_KEY, tgid);

            if (prev !== tgid) sessionStorage.removeItem(SS_KEY);

            if (!sessionStorage.getItem(SS_KEY)) {
            window.gaEvent('tgid', {
                tgid: tgid,
                page: window.location.pathname
            });
            sessionStorage.setItem(SS_KEY, '1');
            }

            if (typeof clarity === 'function') clarity('set', 'tgid', tgid);
            return;
        }

        const stored = localStorage.getItem(LS_KEY);
        if (hasVal(stored)) {
            if (!sessionStorage.getItem(SS_KEY)) {
            window.gaEvent('tgid', {
                tgid: stored,
                page: window.location.pathname
            });
            sessionStorage.setItem(SS_KEY, '1');
            }
            if (typeof clarity === 'function') clarity('set', 'tgid', stored);
        }
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            setTimeout(RecordTelegramID, 50);
        });
    } else {
        setTimeout(RecordTelegramID, 50);
    }
});