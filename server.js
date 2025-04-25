require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// ✅ Test semplice
app.get('/', (req, res) => {
  res.send('✅ Backend attivo e funzionante!');
});

// ✅ Endpoint per creare azienda su Openapi
app.post('/api/crea-azienda', async (req, res) => {
  const dati = req.body;

  console.log('📩 Dati ricevuti dal client:', dati);
  console.log('🔑 OPENAPI_KEY in uso:', process.env.OPENAPI_KEY);

  if (!dati.partitaIva || !dati.ragioneSociale || !dati.codiceFiscale || !dati.indirizzo) {
    console.warn('⚠️ Dati mancanti:', dati);
    return res.status(400).json({ errore: 'Tutti i campi fiscali sono obbligatori' });
  }

  try {
    console.log('📤 Invio richiesta a Openapi...');
    const risposta = await axios.post(
      'https://invoice.openapi.com/IT-configurations',
      {
        tax_id: dati.partitaIva,
        email: dati.email,
        company_name: dati.ragioneSociale,
        name: dati.ragioneSociale,
        contact_email: dati.email || 'no-reply@azienda.it',
        contact_phone: dati.telefono || '',
        fiscal_id: dati.codiceFiscale,
        address: dati.indirizzo,
      },
      {
        headers: {
            Authorization: `Bearer 67fff535b6f89ac63306bb35`, // ← metti qui la tua chiave vera
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Azienda registrata con successo:', risposta.data);
    res.status(200).json({ success: true, datiOpenapi: risposta.data });

  } catch (errore) {
    console.error('❌ Errore Openapi:', errore.response?.data || errore.message);
    console.error('📦 Errore completo:', {
      status: errore.response?.status,
      headers: errore.response?.headers,
      data: errore.response?.data,
    });

    if (errore.response?.status === 409) {
      console.warn('⚠️ Azienda già presente su Openapi');
      return res.status(200).json({ success: true, messaggio: 'Azienda già presente su Openapi' });
    }

    res.status(500).json({ errore: 'Errore durante creazione azienda su Openapi' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server avviato sulla porta ${PORT}`);
});