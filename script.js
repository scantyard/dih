// Import the functions you need from the SDKs you need
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDHyIL-EiJLQrX7ZGPbaWJgo7Wn2OLWVXI",
  authDomain: "fiz-tech.firebaseapp.com",
  projectId: "fiz-tech",
  storageBucket: "fiz-tech.firebasestorage.app",
  messagingSenderId: "153911951873",
  appId: "1:153911951873:web:e106d952ba837ea2383600",
  measurementId: "G-G4WPS4K5R0"
};

// Инициализация Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const modal = document.getElementById('newsModal');
const openBtn = document.getElementById('openModalBtn');
const cancelBtn = document.getElementById('cancelBtn');
const form = document.getElementById('newsForm');
const broadcastsList = document.getElementById('broadcastsList');

// Открыть модальное окно
openBtn.addEventListener('click', () => {
    modal.showModal();
});

// Закрыть по кнопке "Отмена"
cancelBtn.addEventListener('click', () => modal.close());

// Закрыть при клике по темному фону вокруг окна
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.close();
    }
});

// Загрузка объявлений из базы при открытии сайта в реальном времени
db.collection("news").orderBy("timestamp", "desc").onSnapshot((snapshot) => {
    // Удаляем старые карточки (кроме кнопки добавления)
    const existingCards = broadcastsList.querySelectorAll('.news-card');
    existingCards.forEach(card => card.remove());

    snapshot.forEach((doc) => {
        const data = doc.data();
        renderNewsCard(data.text, data.date);
    });
});

// Отправка формы в базу данных
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const text = document.getElementById('newsText').value.trim();
    if (!text) return;

    const now = new Date();
    const dateStr = now.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }) + 
                    ', ' + now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

    try {
        // Добавляем запись в облачную базу Firestore
        await db.collection("news").add({
            text: text,
            date: dateStr,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Очищаем форму и закрываем модалку
        form.reset();
        modal.close();
    } catch (error) {
        console.error("Ошибка при добавлении объявления: ", error);
        alert("Не удалось отправить объявление. Проверьте подключение.");
    }
});

// Функция отрисовки карточки на экране
function renderNewsCard(text, dateStr) {
    const card = document.createElement('div');
    card.className = 'news-card';
    card.innerHTML = `
        <p>${escapeHTML(text)}</p>
        <span class="news-meta">${dateStr}</span>
    `;
    // Вставляем карточку сразу после кнопки добавления
    broadcastsList.appendChild(card);
}

// Защита от XSS (вставки вредного кода)
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
    }[tag]));
}