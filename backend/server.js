// Backend de PLOT preparado para Mercado Pago Checkout Pro.
// IMPORTANTE: nunca pongas el Access Token en el HTML ni en JavaScript del navegador.
// Creá un archivo .env con MP_ACCESS_TOKEN=TU_ACCESS_TOKEN

const express = require('express');
const path = require('path');
const { MercadoPagoConfig, Preference } = require('mercadopago');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || ''
});

app.post('/api/create-preference', async (req, res) => {
  try {
    if (!process.env.MP_ACCESS_TOKEN) {
      return res.status(500).json({ message: 'Falta configurar MP_ACCESS_TOKEN en el archivo .env' });
    }

    const { items, customer, orderId } = req.body;
    if (!Array.isArray(items) || !items.length) {
      return res.status(400).json({ message: 'El carrito está vacío.' });
    }

    // En producción, el backend debe validar precios/productos contra una base de datos.
    const preference = new Preference(client);
    const response = await preference.create({
      body: {
        items: items.map(item => ({
          id: String(item.id || item.title),
          title: String(item.title),
          quantity: Number(item.quantity),
          currency_id: 'ARS',
          unit_price: Number(item.price)
        })),
        payer: customer?.email ? {
          name: customer.nombre,
          surname: customer.apellido,
          email: customer.email
        } : undefined,
        external_reference: String(orderId || `PLOT-${Date.now()}`),
        back_urls: {
          success: `${BASE_URL}/pago-exitoso.html`,
          failure: `${BASE_URL}/pago-fallido.html`,
          pending: `${BASE_URL}/pago-pendiente.html`
        },
        auto_return: 'approved'
      }
    });

    res.json({
      id: response.id,
      init_point: response.init_point,
      sandbox_init_point: response.sandbox_init_point
    });
  } catch (error) {
    console.error('Mercado Pago:', error);
    res.status(500).json({ message: 'No se pudo crear la preferencia de pago.' });
  }
});

// Endpoint reservado para Webhooks/notificaciones de Mercado Pago.
app.post('/api/mercadopago/webhook', express.json(), (req, res) => {
  console.log('Notificación Mercado Pago:', req.body);
  // En producción: consultar el pago en la API de Mercado Pago y actualizar el pedido en DB.
  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`PLOT funcionando en ${BASE_URL}`);
});
