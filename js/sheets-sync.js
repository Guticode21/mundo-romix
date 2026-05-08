/* =============================================
   MUNDO ROMIX — Google Sheets Engine
   ============================================= */

const SHEET_URL = "https://docs.google.com/spreadsheets/d/1NmkiUxbVjR6ce8EVIT0KC8dskNAjyhMq744NhWuOwJM/export?format=csv";

/**
 * Obtener datos desde Google Sheets (CSV)
 */
async function obtenerDatosExcel() {
  try {
    const response = await fetch(SHEET_URL + "&cache=" + Date.now());
    const csvText = await response.text();
    
    // El CSV suele venir como: "Mensaje","Fotos","PDF"
    // Usamos un parser simple de una sola línea
    const filas = csvText.split('\n');
    if (filas.length < 1) return null;

    // Procesar la primera fila de datos (asumimos que los datos están en la fila 1)
    const datos = filas[0].split(',').map(item => {
        // Limpiar comillas si Google las añade
        return item.replace(/^"|"$/g, '').trim();
    });

    return {
      mensaje: datos[0] || "",
      fotos: datos[1] || "",
      pdfHitos: datos[2] || ""
    };
  } catch (error) {
    console.error("Error leyendo Google Sheets:", error);
    return null;
  }
}
