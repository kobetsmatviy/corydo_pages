$(function() {
    $('body').addClass('loaded');
    
    //## User progress
    function userProgress() {
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
    userProgress();

    ////#### TELEGRAM TRIGGER
    const triggerGrabCoins = $('#triggerGrabCoins');
    const sTriggerGrabCoins = 'triggerTelegramClicked';

    if (localStorage.getItem(sTriggerGrabCoins)) {
        triggerGrabCoins.removeClass('animation__shake');
    }
    triggerGrabCoins.on('click', function () {
        if (!localStorage.getItem(sTriggerGrabCoins)) {
            localStorage.setItem(sTriggerGrabCoins, true);
            $(this).removeClass('animation__shake');

            $.ajax({
                url: '/tracker',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    elementId: 'triggerGrabCoins',
                    event: 'click',
                }),
                error: function () {
                    console.error('Failed to send #triggerGrabCoins tracker');
                },
            });
        }
    });

    //## Similar scroll width for smartphones
    $(window).resize(function() {
        if (window.matchMedia("(max-width: 768px)").matches) {
            let countLi = $('.nav__box li').length;
            let widthBox = (130 * countLi) / 2;
    
            $('.nav__box').width(widthBox);
        }
    });

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
                window.open(link, '_blank');
            }
        }
    });
    // Table more button
    $('.table__more').on('click', function() {
        $(this).closest('.table__box').removeClass('table__hidden');
        $(this).remove();
    });

    //## Clickable data-href
    $('.link__hidden').on('mousedown', function(event) {
        var link = $(this).data('href');
        var target = $(this).attr('target') || '_self';
    
        if (link) {
            if (event.which === 1) {
                // Ліва кнопка миші — відкриття у вказаному target
                window.open(link, target);
            } else if (event.which === 2) {
                // Середня кнопка миші — завжди відкриття в новій вкладці
                window.open(link, '_blank');
            }
        }
    });

    // ## Updated time for table
    var now = new Date();

    // Отримуємо компоненти дати
    var day = now.getDate().toString();
    var monthShort = now.toLocaleString('en-US', { month: 'short' });
    var hours = now.getHours().toString().padStart(2, '0');
    var minutes = now.getMinutes().toString().padStart(2, '0');

    // Формуємо текст оновлення
    var updatedTime = `${hours}:${minutes}`;
    var updatedDate = `${monthShort} ${day}`;
    var updatedText = `${updatedDate} at ${updatedTime}`;

    // Формуємо часовий пояс
    var timezoneOffsetInMinutes = -now.getTimezoneOffset();
    var timezoneOffsetInHours = timezoneOffsetInMinutes / 60;
    var timezoneSign = timezoneOffsetInHours >= 0 ? '+' : '-';
    var timezoneHoursISO = String(Math.floor(Math.abs(timezoneOffsetInHours))).padStart(2, '0');
    var timezoneMinutesISO = String(Math.abs(timezoneOffsetInMinutes % 60)).padStart(2, '0');
    var timeZoneName = Intl.DateTimeFormat().resolvedOptions().timeZone;

    var updatedTimezone = `${timezoneSign}${Math.floor(Math.abs(timezoneOffsetInHours))} ${timeZoneName}`;
    var localISOTime = new Date(now.getTime() + timezoneOffsetInMinutes * 60000).toISOString().slice(0, -1);
    var updatedISO = `${localISOTime}${timezoneSign}${timezoneHoursISO}:${timezoneMinutesISO}`;

    // Оновлюємо DOM
    $('.updated__iso').attr('datetime', updatedISO);
    $('.updated__time').text(updatedText);
    $('.updated__timezone').text(updatedTimezone);


    //#### Pricing
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

    // Telegram <iframe>
    const iframeTelegram = $('#iframeTelegram');
    const sIframeTelegramHover = 'iframeTelegramHovered';

    iframeTelegram.on('mouseover', function () {
        if (!localStorage.getItem(sIframeTelegramHover)) {
          localStorage.setItem(sIframeTelegramHover, 'true');

          $.ajax({
              url: '/tracker',
              method: 'POST',
              contentType: 'application/json',
              data: JSON.stringify({
                  iframeId: 'iframeTelegram',
                  event: 'hover'
              }),
              error: function () {
                  console.error('Failed to send #iframeTelegram tracker');
              },
          });
        }
    });

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
});