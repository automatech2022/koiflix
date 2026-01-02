// === Variables Globales ===
let videoData = null;
window.currentAnimeData = null;

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const animeId = params.get('id');

    if (!animeId) {
        window.location.href = 'index.html';
        return;
    }

    try {
        await cargarBaseDatosVideos(animeId);
        window.currentAnimeData = await ApiService.getDetails(animeId);
        const episodes = await ApiService.getEpisodes(animeId);

        document.title = `Koiflix - ${window.currentAnimeData.title}`;

        renderDetalles(window.currentAnimeData);
        renderEpisodios(episodes, window.currentAnimeData.title);

    } catch (error) {
        console.error("Error cargando detalles:", error);
    }
});

/* ================= RENDER ================= */

function renderDetalles(anime) {
    const container = document.getElementById('detalleContent');

    const generoMap = {
        Action: "Acción", Adventure: "Aventura", Comedy: "Comedia", Drama: "Drama",
        Fantasy: "Fantasía", Romance: "Romance", "Sci-Fi": "Ciencia Ficción",
        "Slice of Life": "Recuentos de la vida", Supernatural: "Sobrenatural",
        Mystery: "Misterio", Horror: "Terror", Psychological: "Psicológico",
        Sports: "Deportes", Ecchi: "Ecchi", Suspense: "Suspenso", "Award Winning": "Premiados"
    };

    const generos = anime.genres
        .map(g => `<span>${generoMap[g.name] || g.name}</span>`)
        .join('');

    const statusMap = {
        "Currently Airing": "En Emisión",
        "Finished Airing": "Finalizado",
        "Not yet aired": "Próximamente"
    };

    container.innerHTML = `
        <div class="anime-header">
            <img src="${anime.images.jpg.large_image_url}">
            <div class="info-extra">
                <h1>${anime.title}</h1>
                <div class="generos">${generos}</div>
                <p>⭐ ${anime.score || 'N/A'}</p>
                <p>${statusMap[anime.status] || anime.status}</p>
                <p>${anime.synopsis || 'Sin descripción.'}</p>
            </div>
        </div>
        <div class="episode-section">
            <h2>Lista de Episodios</h2>
            <div id="episodeList" class="episode-list"></div>
        </div>
    `;
}

function renderEpisodios(episodes, animeTitle) {
    const list = document.getElementById('episodeList');
    list.innerHTML = '';

    if ((!episodes || episodes.length === 0) && videoData) {
        Object.keys(videoData).forEach(id => {
            list.appendChild(crearEpisodio(id, `Parte ${id}`, animeTitle));
        });
        return;
    }

    if (!episodes || episodes.length === 0) {
        list.innerHTML = '<p>No hay episodios.</p>';
        return;
    }

    episodes.forEach(ep => {
        list.appendChild(crearEpisodio(ep.mal_id, ep.title, animeTitle));
    });
}

function crearEpisodio(id, titulo, animeTitle) {
    const div = document.createElement('div');
    const url = videoData ? videoData[id] : null;

    div.className = 'episode-item';
    div.innerHTML = `
        <span>Episodio ${id}: ${titulo || 'Sin título'}</span>
        <span style="color:${url ? 'var(--primary)' : '#666'}">
            ${url ? '▶ Reproducir' : 'Próximamente'}
        </span>
    `;

    div.onclick = () => {
        url ? abrirReproductor(url, `Episodio ${id} - ${animeTitle}`) : mostrarAlertaEpisodio();
    };

    return div;
}

/* ================= VIDEO ================= */

async function cargarBaseDatosVideos(animeId) {
    try {
        const res = await fetch('./assets/data/videos.json');
        const json = await res.json();
        videoData = json[animeId] || null;
    } catch (e) {
        console.error("videos.json error", e);
    }
}

function abrirReproductor(url, episodeTitle) {
    const modal = document.getElementById('videoModal');
    const container = document.getElementById('videoContainer');
    const title = document.getElementById('playingTitle');

    container.innerHTML = '';
    title.innerText = episodeTitle;

    container.appendChild(window.createSafeIframe(url));
    modal.style.display = 'flex';

    localStorage.setItem('koiflix_ultimo_visto', JSON.stringify({
        animeId: window.currentAnimeData.mal_id,
        animeTitle: window.currentAnimeData.title,
        episodeTitle,
        image: window.currentAnimeData.images.jpg.large_image_url,
        url,
        fecha: Date.now()
    }));
}

document.querySelector('.close-modal').onclick = () => {
    document.getElementById('videoModal').style.display = 'none';
    document.getElementById('videoContainer').innerHTML = '';
};

// Función para mostrar el modal de alerta
function mostrarAlertaEpisodio() {
    const modal = document.getElementById('alertModal');
    modal.classList.add('active');
    
    // Cerrar al hacer clic en el botón
    document.getElementById('closeAlert').onclick = () => {
        modal.classList.remove('active');
    };

    // Cerrar al hacer clic fuera del cuadro blanco
    modal.onclick = (e) => {
        if(e.target === modal) modal.classList.remove('active');
    }
}
