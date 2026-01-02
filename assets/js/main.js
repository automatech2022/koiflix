// Funcion del Buscador
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');

let timeout = null;

searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();

    clearTimeout(timeout);

    if (query.length < 3) {
        searchResults.style.display = 'none';
        return;
    }

    timeout = setTimeout(async () => {
        const data = await ApiService.search(query);
        renderResults(data);
    }, 500);
});

function renderResults(animes) {
    searchResults.innerHTML = '';

    if (animes.length === 0) {
        searchResults.style.display = 'none';
        return;
    }

    animes.forEach(anime => {
        const div = document.createElement('div');
        div.className = 'result-item';
        div.innerHTML = `
            <img src="${anime.images.jpg.image_url}" alt="${anime.title}">
            <div>
                <div style="font-weight: bold; font-size: 0.9rem;">${anime.title}</div>
                <div style="color: #888; font-size: 0.8rem;">${anime.type} - ${anime.score || 'N/A'}⭐</div>
            </div>
        `;
        div.onclick = () => {
            window.location.href = `detalle.html?id=${anime.mal_id}`;
        };
        searchResults.appendChild(div);
    });

    searchResults.style.display = 'block';
}

// Cerrar resultados al hacer clic fuera
document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-container')) {
        searchResults.style.display = 'none';
    }
});

// FUNCION DE MENU HAMBURGUESA
const menuToggle = document.getElementById('menuToggle');
const navGroup = document.getElementById('navGroup');

menuToggle.addEventListener('click', () => {
    navGroup.classList.toggle('active');
});

// SLIDER HERO
let currentSlide = 0;
let slides = [];

async function initHero() {
    const popularAnimes = await ApiService.getPopular();
    const sliderContent = document.getElementById('sliderContent');

    popularAnimes.forEach((anime, index) => {
        const slide = document.createElement('div');
        slide.className = `slider-item ${index === 0 ? 'active' : ''}`;
        // Usamos la imagen de gran tamaño (large_image_url) para el fondo
        slide.style.backgroundImage = `url(${anime.images.jpg.large_image_url})`;

        slide.innerHTML = `
            <div class="hero-info">
                <h1>${anime.title}</h1>
                <p>${anime.synopsis || 'Sin descripción disponible.'}</p>
                <button class="btn-play" onclick="verDetalles(${anime.mal_id})">Ver Ahora</button>
            </div>
        `;
        sliderContent.appendChild(slide);
    });

    slides = document.querySelectorAll('.slider-item');

    setInterval(nextSlide, 5000);
}

function showSlide(index) {
    slides[currentSlide].classList.remove('active');
    currentSlide = (index + slides.length) % slides.length;
    slides[currentSlide].classList.add('active');
}

function nextSlide() { showSlide(currentSlide + 1); }
function prevSlide() { showSlide(currentSlide - 1); }

// Eventos de botones
document.getElementById('nextBtn').addEventListener('click', nextSlide);
document.getElementById('prevBtn').addEventListener('click', prevSlide);

// Llamar a la función al cargar la página
initHero();

function verDetalles(id) {
    window.location.href = `detalle.html?id=${id}`;
}

// TARJETAS DE RECIENTES

async function initRecent() {
    const recentAnimes = await ApiService.getRecent();
    const recentGrid = document.getElementById('recentGrid');

    recentGrid.innerHTML = '';

    recentAnimes.forEach(anime => {
        const card = document.createElement('div');
        card.className = 'anime-card';
        card.innerHTML = `
            <div class="score-badge">${anime.score || 'N/A'}</div>
            <img src="${anime.images.jpg.large_image_url}" alt="${anime.title}" loading="lazy">
            <div class="anime-card-info">
                <h3>${anime.title}</h3>
                <span>${anime.type} • ${anime.episodes || '?'} Eps</span>
            </div>
        `;

        card.onclick = () => verDetalles(anime.mal_id);

        recentGrid.appendChild(card);
    });
}

async function initHentai() {
    const hentaiAnimes = await ApiService.getHentai();
    const HentaiGrid = document.getElementById('hentaiGrid');

    HentaiGrid.innerHTML = '';

    hentaiAnimes.forEach(anime => {
        const card = document.createElement('div');
        card.className = 'anime-card';
        card.innerHTML = `
            <div class="score-badge">${anime.score || 'N/A'}</div>
            <div class="badge-18">+18</div>
            <img src="${anime.images.jpg.large_image_url}" alt="${anime.title}" loading="lazy">
            <div class="anime-card-info">
                <h3>${anime.title}</h3>
                <span>${anime.type} • ${anime.episodes || '?'} Eps</span>
            </div>
        `;

        card.onclick = () => verDetalles(anime.mal_id);
        HentaiGrid.appendChild(card);
    });
}

async function initFavorites() {
    const topAnimes = await ApiService.getTopFavorites();
    const topGrid = document.getElementById('topFavoritesGrid');

    topGrid.innerHTML = '';

    // Solo tomamos los 10 primeros por si acaso
    topAnimes.slice(0, 10).forEach((anime, index) => {
        const card = document.createElement('div');
        card.className = 'top-card';

        card.innerHTML = `
            <span class="top-number">${index + 1}</span>
            <img src="${anime.images.jpg.large_image_url}" alt="${anime.title}" loading="lazy">
        `;

        card.onclick = () => verDetalles(anime.mal_id);
        topGrid.appendChild(card);
    });
}

function cargarHistorialInicio() {
    const raw = localStorage.getItem('koiflix_ultimo_visto');
    if (!raw) return;

    const h = JSON.parse(raw);

    document.getElementById('continuarViendoSection').style.display = 'block';

    document.getElementById('historialGrid').innerHTML = `
        <div class="anime-card" onclick="verDetalles(${h.animeId})">
            <div class="score-badge" style="background:var(--primary)">
                ▶ Reanudar
            </div>
            <img src="${h.image}">
            <div class="anime-card-info">
                <h3>${h.animeTitle}</h3>
                <span>${h.episodeTitle}</span>
            </div>
        </div>
    `;
}

// ACTUALIZA TU LISTENER EXISTENTE:
document.addEventListener('DOMContentLoaded', async () => {

    cargarHistorialInicio();

    try {
        await initHero();

        await new Promise(resolve => setTimeout(resolve, 500));

        await initFavorites();

        await new Promise(resolve => setTimeout(resolve, 500));

        await initRecent();

        await new Promise(resolve => setTimeout(resolve, 500));

        await initHentai();

    } catch (error) {
        console.error("Error cargando las secciones:", error);
    }
});

// Modales reutilizables

document.addEventListener('DOMContentLoaded', () => {
    const welcomeModal = document.getElementById('welcomeModal');
    const closeBtn = document.getElementById('closeWelcome');

    const hasVisited = localStorage.getItem('koiflix_welcomed');

    if (!hasVisited) {

        setTimeout(() => {
            welcomeModal.classList.add('active');
        }, 1000);
    }

    closeBtn.addEventListener('click', () => {
        welcomeModal.classList.remove('active');
        localStorage.setItem('koiflix_welcomed', 'true');
    });
});

function alertaCorreo() {
    const modal = document.getElementById('alertCorreo');
    modal.classList.add('active');

    document.getElementById('closeAlert').onclick = () => {
        modal.classList.remove('active');
    };

    modal.onclick = (e) => {
        if (e.target === modal) modal.classList.remove('active');
    }
}
