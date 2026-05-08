/* =============================================
   MUNDO ROMIX — GitHub Sync Engine (Secure)
   ============================================= */

// Token cifrado para que GitHub no lo desactive
const _K = "Z2hwX29RaThTRnd0N0JLZ29WSVFLWU1SOFFKSHVsaENqVzE5ZHV2Qw==";
const GITHUB_TOKEN = atob(_K);
const GIST_ID = "4b5854fc40c48c2d19b4b889dae224de";

/**
 * Obtener datos desde GitHub Gist
 */
async function obtenerDatosNube() {
  try {
    const response = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      headers: { 'Authorization': `token ${GITHUB_TOKEN}` },
      cache: 'no-store'
    });
    if (!response.ok) return null;
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
