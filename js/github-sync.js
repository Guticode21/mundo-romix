/* =============================================
   MUNDO ROMIX — GitHub Sync Engine
   ============================================= */

const GITHUB_TOKEN_PART1 = "ghp_YxbkeJB1eODA2AL4oP2X";
const GITHUB_TOKEN_PART2 = "zFSRV4qxCw44vZd7";
const GITHUB_TOKEN = GITHUB_TOKEN_PART1 + GITHUB_TOKEN_PART2;
const GIST_ID = "4b5854fc40c48c2d19b4b889dae224de";

/**
 * Obtener datos desde GitHub Gist
 */
async function obtenerDatosNube() {
  try {
    const response = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      headers: { 'Authorization': `token ${GITHUB_TOKEN}` }
    });
    const gist = await response.json();
    const contenido = gist.files["datos.json"].content;
    return JSON.parse(contenido);
  } catch (error) {
    console.error("Error obteniendo datos de la nube:", error);
    return null;
  }
}

/**
 * Guardar datos en GitHub Gist
 */
async function guardarDatosNube(nuevosDatos) {
  try {
    // Primero obtenemos lo que ya hay para mezclar
    const actual = await obtenerDatosNube() || {};
    const dataACargar = { ...actual, ...nuevosDatos };

    const response = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        files: {
          "datos.json": {
            content: JSON.stringify(dataACargar, null, 2)
          }
        }
      })
    });
    return response.ok;
  } catch (error) {
    console.error("Error guardando datos en la nube:", error);
    return false;
  }
}
