// --- ЛОГИКА ДЛЯ ФОРМЫ (index.html) ---
const form = document.getElementById('ticketForm');

if (form) {
    form.addEventListener('submit', function(event) {
        event.preventDefault();

        // Собираем данные
        const ticketData = {
            type: document.getElementById('transportType').value,
            route: document.getElementById('routeNumber').value,
            vehicle: document.getElementById('vehicleNumber').value,
            price: document.getElementById('ticketPrice').value,
            date: document.getElementById('ticketDate').value // Получаем дату
        };

        localStorage.setItem('userTicket', JSON.stringify(ticketData));
        window.location.href = 'ticket.html';
    });
}

// --- ЛОГИКА ДЛЯ БИЛЕТА (ticket.html) ---
const timerDisplay = document.getElementById('timerDisplay');

if (timerDisplay) {
    const savedData = localStorage.getItem('userTicket');
    
    if (savedData) {
        const data = JSON.parse(savedData);
        
        // Форматируем дату из "2026-09-30T13:00" в "30.09.2026 13:00"
        const dateObj = new Date(data.date);
        const formattedDate = dateObj.toLocaleDateString('ru-RU') + ' ' + 
                              dateObj.toLocaleTimeString('ru-RU', {hour: '2-digit', minute:'2-digit'});

        // Подставляем данные
        document.getElementById('displayType').textContent = data.type;
        document.getElementById('displayRoute').textContent = data.route;
        document.getElementById('displayVehicle').textContent = data.vehicle;
        document.getElementById('displayPrice').textContent = data.price;
        document.getElementById('displayDate').textContent = formattedDate;

        // Генерируем QR-код
        const qrText = `Билет: ${data.type} №${data.route}, ТС: ${data.vehicle}, Дата: ${formattedDate}, Цена: ${data.price}р.`;
        document.getElementById('qrCode').src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrText)}`;
    } else {
        window.location.href = 'index.html';
    }

    // Таймер (например, на 2 часа = 7200 секунд)
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

    // --- ЛОГИКА СКАЧИВАНИЯ БИЛЕТА ---
    document.getElementById('downloadBtn').addEventListener('click', function() {
        const ticketElement = document.getElementById('ticketToDownload');
        
        // Используем html2canvas для создания картинки из HTML
        html2canvas(ticketElement).then(canvas => {
            // Создаем ссылку для скачивания
            const link = document.createElement('a');
            link.download = 'ticket.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        });
    });
}