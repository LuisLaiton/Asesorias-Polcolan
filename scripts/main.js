// Arreglo global para almacenar datos de los profesores.
let datos = [];

/**
 * Función asíncrona para obtener datos de una URL.
 * @param {string} url - URL del archivo JSON.
 * @returns {Array} - Arreglo de datos de los profesores.
 */
async function fetchData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Ocurrió un error en la respuesta de la red');
        }
        const data = await response.json();
        return data.Teachers;

    } catch (error) {
        console.error('Error al leer el archivo JSON:', error);
    }
}

/**
 * Inicializa los datos llamando a la función fetchData y luego muestra los horarios.
 */
async function initializeData() {
    const url = "https://raw.githubusercontent.com/LuisLaiton/Asesorias-Polcolan/Luis-Felipe-Laiton-Cortes/data/tutorships.json";
    
    // Obtiene los datos de los profesores.
    datos = await fetchData(url);
    
    if (datos) {
        console.log(datos[0].Tutorships.Planned);
        
        // Genera y muestra la matriz de horarios.
        matrizTabla(datos[0].Tutorships.Planned);
        
        // showTutorials(datos[0].Tutorships.Planned);
    }
}

/**
 * Genera una tabla de horarios en bloques de 30 minutos para un conjunto de intervalos de tiempo.
 * @param {Array} hoursTeacher - Arreglo de objetos con las horas de inicio y fin de los intervalos.
 * @returns {Array} - Matriz de horarios en bloques de 30 minutos.
 */
function matrizTabla(hoursTeacher) {
    let tabla = []; // Matriz que almacenará los horarios.
    let timeSet = new Set(); // Set para rastrear los tiempos ya procesados.

    hoursTeacher.forEach(element => {
        let startTime = timeToMinutes(element.start_time); // Convierte la hora de inicio a minutos.
        const rows = diffBlocks(element.start_time, element.ending_time); // Calcula el número de bloques de 30 minutos.

        // Agrega bloques de 30 minutos a la tabla.
        for (let i = 0; i < rows; i++) {
            const formattedTime = minutesToTime(startTime); // Convierte los minutos a formato 'HH:MM'.

            // Si el tiempo no ha sido procesado, añade una nueva fila.
            if (!timeSet.has(formattedTime)) {
                let row = [formattedTime, '', '', '', '', '', '']; 
                tabla.push(row);
                timeSet.add(formattedTime);
            }

            startTime += 30;
        }
    });

    console.log(tabla);
    return tabla;
}

/**
 * Muestra los horarios en una tabla HTML.
 * @param {Array} hoursTeacher - Arreglo de objetos con las horas de inicio y fin de los intervalos.
 */
function showTutorials(hoursTeacher) {
    const $TBODY = document.getElementById("horarios_agendados"); // Obtiene el cuerpo de la tabla HTML.

    let startMinutes = 0, endMinutes = 0, diffBlocks = 0;

    hoursTeacher.forEach(element => {
        let startTime = element.start_time;

        startMinutes = timeToMinutes(startTime); // Convierte la hora de inicio a minutos.
        endMinutes = timeToMinutes(element.ending_time); // Convierte la hora de finalización a minutos.
        diffBlocks = (endMinutes - startMinutes) / 30; // Calcula el número de bloques de 30 minutos.

        console.log(startTime, "-", element.ending_time);
        console.log(diffBlocks);

        // Agrega filas a la tabla HTML.
        for (let i = 0; i < diffBlocks; i++) {
            if (document.getElementById(startTime) != startTime) {
                const tr = document.createElement("tr"); // Crea una nueva fila.
                const th = document.createElement("th"); // Crea un nuevo encabezado de fila.
                th.id = startTime;
                th.scope = "row";
                th.textContent = startTime;

                tr.appendChild(th);

                // Crea columnas vacías para la fila.
                for (let i = 0; i < 6; i++) {
                    const td = document.createElement("td");
                    tr.appendChild(td);
                }

                $TBODY.appendChild(tr); // Añade la fila al cuerpo de la tabla.
                
                // Incrementa el tiempo en 30 minutos y convierte a formato 'HH:MM'.
                startTime = ((timeToMinutes(startTime) + 30) / 60).toFixed(2).replace('.', ':');
            }
        }
    });
}

/**
 * Convierte una hora en formato 'HH:MM' a minutos.
 * @param {string} time - Hora en formato 'HH:MM'.
 * @returns {number} - Número de minutos.
 */
function timeToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}

/**
 * Convierte minutos a una hora en formato 'HH:MM'.
 * @param {number} minutes - Número de minutos.
 * @returns {string} - Hora en formato 'HH:MM'.
 */
function minutesToTime(minutes) {
    const hours = String(Math.floor(minutes / 60)).padStart(2, '0');
    const mins = String(minutes % 60).padStart(2, '0');
    return `${hours}:${mins}`;
}

/**
 * Calcula el número de bloques de 30 minutos entre dos horas.
 * @param {string} start - Hora de inicio en formato 'HH:MM'.
 * @param {string} end - Hora de finalización en formato 'HH:MM'.
 * @returns {number} - Número de bloques de 30 minutos.
 */
function diffBlocks(start, end) {
    const startMinutes = timeToMinutes(start);
    const endMinutes = timeToMinutes(end);
    return (endMinutes - startMinutes) / 30;
}

// Inicializa los datos llamando a la función fetchData y mostrando los horarios.
initializeData();
