// Ждем полной загрузки страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log("Скрипт загружен");

    // --- ЛОГИКА ДЛЯ ФОРМЫ (index.html) ---
    const form = document.getElementById('ticketForm');

    if (form) {
        console.log("Форма найдена");
        
        form.addEventListener('submit', function(event) {
            event.preventDefault();
            console.log("Форма отправлена");

            // Автоматически берем текущую дату и время
            const now = new Date();
            
            const day = String(now.getDate()).padStart(2, '0');
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const year = now.getFullYear();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            const formattedDate = `${day}.${month}.${year}, ${hours}:${minutes}:${seconds}`;

            // Собираем данные
            const ticketData = {
                type: document.getElementById('transportType').value,
                route: document.getElementById('routeNumber').value,
                vehicle: document.getElementById('vehicleNumber').value,
                price: document.getElementById('ticketPrice').value,
                date: formattedDate
            };

            console.log("Данные билета:", ticketData);

            localStorage.setItem('userTicket', JSON.stringify(ticketData));
            console.log("Данные сохранены, переходим на ticket.html");
            
            window.location.href = 'ticket.html';
        });
    }

    // --- ЛОГИКА ДЛЯ БИЛЕТА (ticket.html) ---
    const timerDisplay = document.getElementById('timerDisplay');

    if (timerDisplay) {
        console.log("Страница билета обнаружена");
        const savedData = localStorage.getItem('userTicket');
        
        if (!savedData) {
            console.log("Данных нет, показываем ошибку");
            document.body.innerHTML = '<div style="text-align:center; padding:50px; font-family:sans-serif;"><h2>Данные билета не найдены</h2><p>Пожалуйста, вернитесь на <a href="index.html">главную страницу</a> и заполните форму.</p></div>';
            return;
        }

        const data = JSON.parse(savedData);
        console.log("Загруженные данные:", data);
        
        // Подставляем данные в HTML билета
        document.getElementById('displayType').textContent = data.type;
        document.getElementById('displayRoute').textContent = data.route;
        document.getElementById('displayVehicle').textContent = data.vehicle;
        document.getElementById('displayPrice').textContent = data.price;
        document.getElementById('displayDate').textContent = data.date;

        // Формирование QR-кода
        const typeEng = data.type === 'Автобус' ? 'bus' : 'trolleybus';
        const qrText = `Транспорт: ${typeEng}, Маршрут: ${data.route}, ТС: ${data.vehicle}, Время входа: ${data.date}, Стоимость: ${data.price}₽`;
        console.log("QR-текст:", qrText);
        
        document.getElementById('qrCode').src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrText)}`;

        // Таймер: счет вверх от 0 (бесконечно)
        let timeElapsed = 0;

        function updateTimer() {
            const hours = Math.floor(timeElapsed / 3600);
            const minutes = Math.floor((timeElapsed % 3600) / 60);
            const seconds = timeElapsed % 60;

            timerDisplay.textContent = 
                String(hours).padStart(2, '0') + ':' + 
                String(minutes).padStart(2, '0') + ':' + 
                String(seconds).padStart(2, '0');

            timeElapsed++;
        }

        updateTimer();
        setInterval(updateTimer, 1000);

        // Скачивание билета
        const downloadBtn = document.getElementById('downloadBtn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', function() {
                const ticketElement = document.getElementById('ticketToDownload');
                html2canvas(ticketElement).then(canvas => {
                    const link = document.createElement('a');
                    link.download = 'ticket.png';
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                });
            });
        }
    }
});
