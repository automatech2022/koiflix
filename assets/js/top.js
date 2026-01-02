let currentPage = 1;
const topGrid = document.getElementById('topGrid');
const loadMoreBtn = document.getElementById('loadMoreBtn');

// Función principal para obtener datos
async function fetchTopAnimes(page) {
    loadMoreBtn.innerText = "Cargando...";
    loadMoreBtn.disabled = true;

    try {
        const res = await fetch(`https://api.jikan.moe/v4/top/anime?page=${page}`);
        const { data, pagination } = await res.json();
        
        renderGrid(data);

        // Si no hay más páginas, ocultamos el botón
        if (!pagination.has_next_page) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.innerText = "Cargar más resultados";
            loadMoreBtn.disabled = false;
        }
    } catch (error) {
        console.error("Error cargando el top:", error);
        loadMoreBtn.innerText = "Error al cargar";
    }
}

function renderGrid(animes) {
    animes.forEach((anime) => {
        // Calculamos la posición real basada en la página y el índice
        // (Jikan suele traer 25 por página)
        const card = document.createElement('div');
        card.className = 'anime-card';
        card.innerHTML = `
            <div class="score-badge">⭐ ${anime.score || 'N/A'}</div>
            <img src="${anime.images.jpg.large_image_url}" alt="${anime.title}" loading="lazy">
            <div class="anime-card-info">
                <h3>${anime.title}</h3>
                <span>Rank: #${anime.rank || '?'}</span>
            </div>
        `;
        card.onclick = () => window.location.href = `detalle.html?id=${anime.mal_id}`;
        topGrid.appendChild(card);
    });
}

// Evento para el botón
loadMoreBtn.addEventListener('click', () => {
    currentPage++;
    fetchTopAnimes(currentPage);
});

// Carga inicial
document.addEventListener('DOMContentLoaded', () => {
    fetchTopAnimes(currentPage);
});