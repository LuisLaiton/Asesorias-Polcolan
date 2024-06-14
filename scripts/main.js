let datos = []; // Arreglo global para almacenar datos de los profesores.
const $TBODY = document.getElementById("horarios_agendados"); // Obtiene el cuerpo de la tabla HTML.
const $DROPDOWN = document.getElementById("lista-docentes");
const $NOMBRE = document.getElementById("nombre-docente");

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

/**
 * Muestra un mensaje de carga en la tabla.
 * Inserta un indicador de carga en la tabla, abarcando todas las columnas disponibles.
 */
function loading() {
    $TBODY.innerHTML = `
            <td colspan="7">
                <div class="d-flex align-items-center mx-5">
                    <strong role="status">Cargando horario...</strong>
                    <div class="spinner-border ms-auto" aria-hidden="true"></div>
                </div>
            </td>
        `;
}

/**
 * Convierte un nombre de día en español a su índice correspondiente.
 * @param {string} day - Nombre del día en español.
 * @returns {number} - Índice correspondiente al día de la semana (1 para Lunes, 2 para Martes, etc.).
 */
function weekday(day) {
    switch (day) {
        case "Lunes":
            return 1;
            break;
        case "Martes":
            return 2;
            break;
        case "Miercoles":
            return 3;
            break;
        case "Jueves":
            return 4;
            break;
        case "Viernes":
            return 5;
            break;
        case "Sabado":
            return 6;
            break;
        default:
            console.log(`Error en el dia de la semana ${day}`);
            break;
    }
}

/**
 * Genera una tabla de horarios en bloques de 30 minutos para un conjunto de intervalos de tiempo.
 * @param {Array} hoursTeacher - Arreglo de objetos con las horas de inicio y fin de los intervalos.
 * @returns {Array} - Matriz de horarios en bloques de 30 minutos.
 */
function matrixBoard(hoursTeacher) {
    let board = []; // Matriz que almacenará los horarios.
    let timeSet = new Set(); // Set para rastrear los tiempos ya procesados.

    hoursTeacher.forEach(element => {
        let startTime = timeToMinutes(element.start_time); // Convierte la hora de inicio a minutos.
        const rows = diffBlocks(element.start_time, element.ending_time); // Calcula el número de bloques de 30 minutos.

        // Agrega bloques de 30 minutos a la tabla.
        for (let i = 0; i < rows; i++) {
            const formattedTime = minutesToTime(startTime); // Convierte los minutos a formato 'HH:MM'.

            // Busca la fila en la matriz board que tiene el tiempo formattedTime.
            let row = board.find(r => r[0] === formattedTime);

            if (!row) {
                // Si no encuentra la fila, crea una nueva.
                row = [formattedTime, '', '', '', '', '', ''];
                board.push(row);
                timeSet.add(formattedTime);
            }

            // Actualiza la fila con la marca en el día correspondiente.
            row[weekday(element.Day)] = "X";
            startTime += 30;
        }
    });
    console.log(board);
    return board;
}

/**
 * Muestra los horarios en una tabla HTML.
 * @param {Array} hoursTeacher - Arreglo de objetos con las horas de inicio y fin de los intervalos.
 */
function showTutorials(matrixCalendar, name) {
    $TBODY.innerHTML = "";

    for (const row of matrixCalendar) {
        const tr = document.createElement("tr"); // Crea una nueva fila.
        for (const col of row) {
            const td = document.createElement("td"); // Crea un nuevo encabezado de fila.
            td.scope = "row";
            td.textContent = "";
            if (col == "X") {
                td.classList.add("bg-warning");
            } else if (col != "") {
                td.textContent = `${col} - ${minutesToTime(timeToMinutes(col) + 30)}`;
                td.classList.add("table-dark");
            }
            tr.appendChild(td);
        }
        $TBODY.appendChild(tr);
    }
    $NOMBRE.textContent = name;
}

/**
 * Filtra y muestra la información de tutorías de un docente específico.
 * @param {string} name - Nombre del docente.
 */
function selectInfo(name) {
    datos.forEach(element => {
        if (name == element.Name) {
            showTutorials(matrixBoard(element.Tutorships.Planned), element.Name);
        }
    });
}

/**
 * Genera y muestra una lista de docentes.
 * Crea elementos de lista para cada docente y añade eventos de clic para mostrar sus tutorías.
 */
function showTeachers() {
    datos.forEach(element => {
        const li = document.createElement("li");
        li.textContent = element.Name;
        li.id = element.Name;
        li.classList.add("dropdown-item");
        
        // Añade un evento de clic que muestra las tutorías del docente cuando se selecciona.
        li.addEventListener("click", (event) => {
            selectInfo(event.target.textContent);
        });

        $DROPDOWN.appendChild(li);
    });
}

/**
 * Inicializa los datos llamando a la función fetchData y luego muestra los horarios.
 */
async function initializeData() {
    const url = "https://raw.githubusercontent.com/LuisLaiton/Asesorias-Polcolan/Luis-Felipe-Laiton-Cortes/data/tutorships.json";

    // Obtiene los datos de los profesores.
    datos = await fetchData(url);

    if (datos) {
        showTutorials(matrixBoard(datos[0].Tutorships.Planned), datos[0].Name); // Genera y muestra la matriz de horarios.
        showTeachers(); // Genera y muestra una lista con los nombres de los docentes
    } else {
        loading();
    }
}

// Inicializa los datos llamando a la función fetchData y mostrando los horarios.
initializeData();