let datos = [];

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

async function initializeData() {
    const url = "https://raw.githubusercontent.com/LuisLaiton/Asesorias-Polcolan/Luis-Felipe-Laiton-Cortes/data/tutorships.json";
    datos = await fetchData(url);

    if (datos) {
        console.log(datos);

        showTutorials(datos[0].Tutorships.Planned);
    }
}

function showTutorials(hoursTeacher) {
    const $TABLA = document.getElementById("horarios_agendados");

    hoursTeacher.forEach((element, index) => {
        console.log(element.start_time, "-", element.ending_time)
        //console.log(`Docente ${index + 1}: ${element.Name}`);
    });

   //infoTeacher.Tutorships
}

initializeData();