// === Koiflix API Service (Jikan v4) ===
const BASE_URL = 'https://api.jikan.moe/v4';

const ApiService = {
    // Obtener animes populares para el slider
    async getPopular() {
        const res = await fetch(`${BASE_URL}/top/anime?filter=bypopularity&limit=5`);
        const { data } = await res.json();
        return data;
    },

    // Obtener animes recientes/tendencia
    async getRecent() {
        const res = await fetch(`${BASE_URL}/seasons/now?limit=12`);
        const { data } = await res.json();
        return data;
    },

    // Obtener animes hentai
    async getHentai() {
        const res = await fetch(`${BASE_URL}/anime?genres=12&sfw=false&limit=12`);
        const { data } = await res.json();
        return data;
    },

    async getTopFavorites() {
        const response = await fetch('https://api.jikan.moe/v4/top/anime?filter=favorite&limit=10');
        const data = await response.json();
        return data.data;
    },

    // Buscar animes
    async search(query) {
        const res = await fetch(`${BASE_URL}/anime?q=${query}&limit=6`);
        const { data } = await res.json();
        return data;
    },

    // Detalles de un anime por ID
    async getDetails(id) {
        const res = await fetch(`${BASE_URL}/anime/${id}/full`);
        const { data } = await res.json();
        return data;
    },

    // Obtener episodios
    async getEpisodes(id) {
        const res = await fetch(`${BASE_URL}/anime/${id}/episodes`);
        const { data } = await res.json();
        return data;
    }
};

// Exportar para uso global
window.ApiService = ApiService;

/** * BLOQUEADOR DE PUBLICIDAD BÁSICO (Sandboxing)

* Previene que los iframes abran popups o ejecuten scripts externos maliciosos

*/

function createSafeIframe(url) {

    const iframe = document.createElement('iframe');

    iframe.src = url;

    iframe.setAttribute('allowfullscreen', 'true');

    iframe.setAttribute('frameborder', '0');

    // El atributo sandbox es la clave para bloquear publicidad

    iframe.setAttribute('sandbox', 'allow-forms allow-scripts allow-same-origin');

    return iframe;

}

window.createSafeIframe = createSafeIframe; 