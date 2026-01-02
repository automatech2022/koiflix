// === Variables Globales ===
let videoData = null;

// === Lógica Principal (Un solo DOMContentLoaded) ===
document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const animeId = params.get('id');

    if (!animeId) {
        window.location.href = 'index.html';
        return;
    }

    try {
        // 1. Cargar base de datos de videos local y datos de la API en paralelo
        await cargarBaseDatosVideos(animeId);
        const anime = await ApiService.getDetails(animeId);
        const episodes = await ApiService.getEpisodes(animeId);

        // 2. Actualizar título de la pestaña
        document.title = `Koiflix - ${anime.title}`;

        // 3. Renderizar componentes
        renderDetalles(anime);
        renderEpisodios(episodes, anime.title);

    } catch (error) {
        console.error("Error cargando la página de detalles:", error);
        document.title = "Koiflix - Error";
    }
});

// === Funciones de Renderizado ===

function renderDetalles(anime) {
    const container = document.getElementById('detalleContent');

    // 1. Diccionario de traducción para Géneros
    const generoMap = {
        "Action": "Acción", "Adventure": "Aventura", "Comedy": "Comedia", "Drama": "Drama",
        "Fantasy": "Fantasía", "Romance": "Romance", "Sci-Fi": "Ciencia Ficción",
        "Slice of Life": "Recuentos de la vida", "Supernatural": "Sobrenatural",
        "Mystery": "Misterio", "Horror": "Terror", "Psychological": "Psicológico",
        "Sports": "Deportes", "Ecchi": "Ecchi", "Suspense": "Suspenso", "Award Winning": "Premiados"
    };

    const generos = anime.genres.map(g => `<span>${generoMap[g.name] || g.name}</span>`).join('');

    // 2. Diccionario para Estados
    const statusMap = {
        "Currently Airing": "En Emisión",
        "Finished Airing": "Finalizado",
        "Not yet aired": "Próximamente"
    };

    // 3. Lógica para el Icono de Temporada
    const seasonMap = {
        "winter": { nombre: "Invierno", icono: "fa-snowflake" },
        "spring": { nombre: "Primavera", icono: "fa-seedling" },
        "summer": { nombre: "Verano", icono: "fa-sun" },
        "fall": { nombre: "Otoño", icono: "fa-leaf" }
    };

    const temporadaInfo = seasonMap[anime.season] || null;
    const temporadaHTML = temporadaInfo
        ? `<div class="season-tag">
            <i class="fas ${temporadaInfo.icono}"></i> 
            ${temporadaInfo.nombre} ${anime.year || ''}
           </div>`
        : '';

    container.innerHTML = `
        <div class="anime-header">
            <img src="${anime.images.jpg.large_image_url}" alt="${anime.title}">
            <div class="info-extra">
                ${temporadaHTML}
                <h1>${anime.title}</h1>
                <div class="generos" style="margin: 15px 0;">${generos}</div>
                <p><strong>Puntuación:</strong> ⭐ ${anime.score || 'N/A'}</p>
                <p><strong>Estado:</strong> ${statusMap[anime.status] || anime.status}</p>
                <p style="margin-top: 20px; line-height: 1.6;">${anime.synopsis || 'Sin descripción disponible.'}</p>
            </div>
        </div>
        <div class="episode-section">
            <h2>Lista de Episodios</h2>
            <div id="episodeList" class="episode-list"></div>
        </div>
    `;
}

function renderEpisodios(episodes, animeTitle) {
    const listContainer = document.getElementById('episodeList');
    listContainer.innerHTML = ''; 

    // 1. Verificar si tenemos datos manuales en videos.json para este ID
    // videoData viene de la función cargarBaseDatosVideos(animeId)
    const tieneVideosLocales = videoData && Object.keys(videoData).length > 0;

    // 2. Si la API no trae nada PERO nosotros sí tenemos links en el JSON
    if ((!episodes || episodes.length === 0) && tieneVideosLocales) {
        Object.keys(videoData).forEach(epId => {
            const item = crearElementoEpisodio(epId, `Parte ${epId}`, animeTitle);
            listContainer.appendChild(item);
        });
        return;
    }

    // 3. Si realmente no hay nada en ningún lado
    if ((!episodes || episodes.length === 0) && !tieneVideosLocales) {
        listContainer.innerHTML = '<p class="no-episodes">No hay episodios listados. Revisa más tarde.</p>';
        return;
    }

    // 4. Si la API trae episodios, los listamos normalmente
    episodes.forEach(ep => {
        const item = crearElementoEpisodio(ep.mal_id, ep.title, animeTitle);
        listContainer.appendChild(item);
    });
}

// Función auxiliar para crear el HTML del episodio y evitar repetir código
function crearElementoEpisodio(id, titulo, animeTitle) {
    const item = document.createElement('div');
    item.className = 'episode-item';
    
    const urlVideo = videoData ? videoData[id] : null;

    item.innerHTML = `
        <span>Episodio ${id}: ${titulo || 'Sin título'}</span>
        <span class="status-link" style="color: ${urlVideo ? 'var(--primary)' : '#666'}">
            ${urlVideo ? '▶ Reproducir' : 'Próximamente'}
        </span>
    `;

    item.onclick = () => {
        if (urlVideo) {
            abrirReproductor(urlVideo, `Episodio ${id} - ${animeTitle}`);
        } else {
            mostrarAlertaEpisodio();
        }
    };
    return item;
}

// === Funciones de Soporte y Modales ===

async function cargarBaseDatosVideos(animeId) {
    try {
        const response = await fetch('./assets/data/videos.json');
        const data = await response.json();
        videoData = data[animeId] || null;
    } catch (e) {
        console.error("Error al cargar videos.json:", e);
    }
}

function abrirReproductor(url, title) {
    const modal = document.getElementById('videoModal');
    const container = document.getElementById('videoContainer');
    const titleDisplay = document.getElementById('playingTitle');

    container.innerHTML = '';
    titleDisplay.innerText = title;

    const iframe = window.createSafeIframe(url);
    container.appendChild(iframe);

    modal.style.display = 'flex';
}

function mostrarAlertaEpisodio() {
    const modal = document.getElementById('alertModal');
    modal.classList.add('active');

    document.getElementById('closeAlert').onclick = () => modal.classList.remove('active');
    modal.onclick = (e) => { if (e.target === modal) modal.classList.remove('active'); };
}

// Evento para cerrar el reproductor
document.querySelector('.close-modal').onclick = () => {
    document.getElementById('videoModal').style.display = 'none';
    document.getElementById('videoContainer').innerHTML = '';
};