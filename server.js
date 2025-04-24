require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// ✅ Test di salute
app.get('/', (req, res) => {
  res.send('✅ Backend attivo e funzionante!');
});

// ✅ Creazione azienda su Openapi
app.post('/api/crea-azienda', async (req, res) => {
  const dati = req.body;
  console.log('📩 Ricevuti dati da Flutter:', dati);

  if (!dati.partitaIva || !dati.ragioneSociale || !dati.codiceFiscale || !dati.indirizzo) {
    return res.status(400).json({ errore: 'Tutti i campi fiscali sono obbligatori' });
  }

  try {
    const risposta = await axios.post(
      'https://invoice.openapi.com/IT-configurations',
      {
        tax_id: dati.partitaIva,
        company_name: dati.ragioneSociale,
        contact_email: dati.email || 'no-reply@azienda.it',
        contact_phone: dati.telefono || '',
        fiscal_code: dati.codiceFiscale || '',
        address: dati.indirizzo || '',
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAPI_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Azienda registrata:', risposta.data);
    res.status(200).json({ success: true, datiOpenapi: risposta.data });

  } catch (errore) {
    if (errore.response?.status === 409) {
      return res.status(200).json({ success: true, messaggio: 'Azienda già presente su Openapi' });
    }
    console.error('❌ Errore Openapi:', errore.response?.data || errore.message);
    res.status(500).json({ errore: 'Errore durante creazione azienda su Openapi' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server avviato su porta ${PORT}`);
});