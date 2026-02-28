const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function moderateImage(filePath) {
    try {
        const data = new FormData();
        data.append('media', fs.createReadStream(filePath));
        data.append('models', 'nudity,wad,offensive');
        data.append('api_user', process.env.SIGHTENGINE_API_USER);
        data.append('api_secret', process.env.SIGHTENGINE_API_SECRET);

        const response = await axios({
            method: 'post',
            url: 'https://api.sightengine.com/1.0/check.json',
            data: data,
            headers: data.getHeaders(),
        });

        const { nudity, weapon, drugs, alcohol, offensive } = response.data;

        // Lógica simple: si hay más de 0.5 de probabilidad en algo "malo", rechazar
        if (nudity.render > 0.5 || nudity.sexual_activity > 0.5 || nudity.suggestive > 0.5) {
            return { safe: false, reason: 'Contenido inapropiado detectado.' };
        }
        if (weapon > 0.5 || drugs > 0.5 || alcohol > 0.5) {
            return { safe: false, reason: 'Contenido violento o no permitido detectado.' };
        }
        if (offensive.prob > 0.5) {
            return { safe: false, reason: 'Imagen ofensiva detectada.' };
        }

        return { safe: true };
    } catch (err) {
        console.error('Error en Sightengine:', err.message);
        // En caso de error de la API, decidimos si permitimos o bloqueamos.
        // Aquí dejaremos pasar por precaución de no bloquear por error técnico, 
        // pero podrías cambiarlo a false si quieres máxima seguridad.
        return { safe: true };
    }
}

module.exports = { moderateImage };
