// --- ЛОГИКА ДЛЯ ФОРМЫ (index.html) ---
const form = document.getElementById('ticketForm');

if (form) {
    form.addEventListener('submit', function(event) {
        event.preventDefault();

        // Автоматически берем текущую дату и время
        const now = new Date();
        
        // Форматируем в "04.10.2026, 16:49:31"
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
            date: formattedDate // Сохраняем уже готовую строку
        };

        localStorage.setItem('userTicket', JSON.stringify(ticketData));
        window.location.href = 'ticket.html';
    });
}

// --- ЛОГИКА ДЛЯ БИЛЕТА (ticket.html) ---
const timerDisplay = document.getElementById('timerDisplay');

if (timerDisplay) {
    const savedData = localStorage.getItem('userTicket');
    
    // ЗАЩИТА ОТ БЕСКОНЕЧНОГО ЦИКЛА:
    // Если данных нет, мы не перезагружаем страницу, а показываем сообщение
    if (!savedData) {
        document.body.innerHTML = '<div style="text-align:center; padding:50px; font-family:sans-serif;"><h2>Данные билета не найдены</h2><p>Пожалуйста, вернитесь на <a href="index.html">главную страницу</a> и заполните форму.</p></div>';
    } else {
        const data = JSON.parse(savedData);
        
        // Подставляем данные в HTML билета
        document.getElementById('displayType').textContent = data.type;
        document.getElementById('displayRoute').textContent = data.route;
        document.getElementById('displayVehicle').textContent = data.vehicle;
        document.getElementById('displayPrice').textContent = data.price;
        document.getElementById('displayDate').textContent = data.date;

        // --- ФОРМИРОВАНИЕ QR-КОДА (ТОЧНО ПО ТВОЕМУ ЗАПРОСУ) ---
        // Переводим "Автобус" -> "bus", "Троллейбус" -> "trolleybus"
        const typeEng = data.type === 'Автобус' ? 'bus' : 'trolleybus';
        
        // Собираем строку: Транспорт: bus, Маршрут: 125, ТС: 455, Время входа: 04.10.2026, 16:49:31, Стоимость: 40₽
        const qrText = `Транспорт: ${typeEng}, Маршрут: ${data.route}, ТС: ${data.vehicle}, Время входа: ${data.date}, Стоимость: ${data.price}₽`;
        
        document.getElementById('qrCode').src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrText)}`;

        // Таймер (2 часа)
        let timeLeft = 7200; 

        function updateTimer() {
            const hours = Math.floor(timeLeft / 3600);
            const minutes = Math.floor((timeLeft % 3600) / 60);
            const seconds = timeLeft % 60;

            timerDisplay.textContent = 
                String(hours).padStart(2, '0') + ':' + 
                String(minutes).padStart(2, '0') + ':' + 
                String(seconds).padStart(2, '0');

            if (timeLeft > 0) {
                timeLeft--;
            } else {
                clearInterval(timerInterval);
                alert("Время действия билета истекло!");
            }
        }

        updateTimer();
        const timerInterval = setInterval(updateTimer, 1000);

        // Скачивание билета
        document.getElementById('downloadBtn').addEventListener('click', function() {
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
