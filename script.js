// Все машины
const cars = [
  {
    id: 1,
    name: "Mercedes-Benz E-Class",
    plate: "А777РТ 77",
    img: "images/mercedes.jpg",
    bookings: []
  },
  {
    id: 2,
    name: "Cadillac Hearse",
    plate: "В123АС 99",
    img: "images/cadillac.jpg",
    bookings: []
  },
  {
    id: 3,
    name: "Lincoln Funeral Car",
    plate: "С555КХ 97",
    img: "images/lincoln.jpg",
    bookings: []
  }
];

const temporaryBookings = {};
const container = document.getElementById("carsContainer");

// Загружаем данные из localStorage
function loadData() {
  const saved = localStorage.getItem("funeralBookings");
  if (saved) {
    const data = JSON.parse(saved);
    data.forEach((d, i) => (cars[i].bookings = d.bookings));
  }
}

// Сохраняем данные в localStorage
function saveData() {
  localStorage.setItem("funeralBookings", JSON.stringify(cars));
}

// Время
function generateTimes() {
  const times = [];
  for (let h = 0; h < 24; h++) {
    times.push(h.toString().padStart(2, "0") + ":00");
  }
  return times;
}
const allTimes = generateTimes();

// Отрисовка
function renderCars() {
  container.innerHTML = "";

  cars.forEach(car => {
    const card = document.createElement("div");
    card.classList.add("car-card");

    const options = allTimes
      .map(time => {
        const confirmed = car.bookings.find(b => b.time === time);
        const pending = temporaryBookings[car.id]?.time === time;

        let label = time;
        if (confirmed) label += " — занято";
        else if (pending) label += " — ожидает подтверждения";

        return `<option value="${time}" ${(confirmed || pending) ? "disabled" : ""}>${label}</option>`;
      })
      .join("");

    const hasPending = !!temporaryBookings[car.id];

    card.innerHTML = `
      <img src="${car.img}" alt="${car.name}">
      <div class="car-info">
        <h3>${car.name}</h3>
        <p>Гос. номер: <strong>${car.plate}</strong></p>

        <label>Ваше имя:</label>
        <input type="text" id="name-${car.id}" placeholder="Введите имя">

        <label>Выберите время:</label>
        <select id="time-${car.id}">
          <option value="">-- выбрать --</option>
          ${options}
        </select>

        <div class="btns">
          <button onclick="bookCar(${car.id})">Забронировать</button>
          <button onclick="confirmBooking(${car.id})" class="confirm" ${hasPending ? "" : "disabled"}>Подтвердить</button>
        </div>

        ${
          hasPending
            ? `<p class="pending">Ожидает подтверждения</p>`
            : ""
        }
      </div>
    `;
    container.appendChild(card);
  });
}

// Временная бронь
function bookCar(id) {
  const car = cars.find(c => c.id === id);
  const nameInput = document.getElementById(`name-${id}`);
  const select = document.getElementById(`time-${id}`);
  const time = select.value.trim();
  const name = nameInput.value.trim();

  if (!name) return alert("Введите имя перед бронированием!");
  if (!time) return alert("Выберите время!");
  if (car.bookings.find(b => b.time === time)) return alert("Это время уже занято!");
  if (temporaryBookings[id]) return alert("У вас уже есть временная бронь для этой машины!");

  const timeoutId = setTimeout(() => {
    delete temporaryBookings[id];
    alert(`Бронь ${car.name} на ${time} отменена — не подтверждена.`);
    renderCars();
  }, 15 * 60 * 1000);

  temporaryBookings[id] = { name, time, timeoutId };
  renderCars();
  alert(`Бронь ${car.name} (${time}) создана на 15 минут.`);
}

// Подтверждение
function confirmBooking(id) {
  const car = cars.find(c => c.id === id);
  const pending = temporaryBookings[id];

  if (!pending) return alert("Нет временной брони для подтверждения!");

  clearTimeout(pending.timeoutId);
  car.bookings.push({ time: pending.time, client: pending.name });
  delete temporaryBookings[id];
  saveData();
  renderCars();
  alert(`✅ Бронь подтверждена на ${pending.time}.`);
}

loadData();
renderCars();
