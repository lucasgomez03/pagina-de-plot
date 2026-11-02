# PLOT + Mercado Pago

El proyecto ahora tiene un checkout completo preparado para conectar Mercado Pago Checkout Pro.

## 1. Qué está hecho

- Carrito con cantidades + / -.
- Eliminar productos.
- Subtotal y total.
- Checkout con datos personales.
- Elección de entrega.
- Resumen del pedido.
- Botón preparado para crear una preferencia de Mercado Pago.
- Backend Node.js/Express preparado en `backend/server.js`.
- Endpoint `POST /api/create-preference`.
- Páginas de retorno para pago aprobado, rechazado y pendiente.
- Webhook inicial preparado en `/api/mercadopago/webhook`.

## 2. Conectar Mercado Pago

1. Crear una aplicación desde Mercado Pago Developers.
2. Obtener las credenciales de prueba.
3. Entrar a `backend/` y ejecutar:

```bash
npm install
```

4. Copiar `.env.example` como `.env`.
5. Colocar el Access Token en:

```env
MP_ACCESS_TOKEN=TU_ACCESS_TOKEN
BASE_URL=http://localhost:3000
PORT=3000
```

6. Iniciar:

```bash
npm start
```

7. Abrir:

`http://localhost:3000/`

## 3. Antes de producción

El ejemplo permite avanzar con el flujo, pero para una tienda real el backend debe validar el precio y los productos contra una base de datos. Nunca se debe confiar en el precio enviado por el navegador.

También hay que configurar las notificaciones/webhooks de Mercado Pago y actualizar el estado del pedido cuando Mercado Pago confirme el pago.

No subir `.env` ni el Access Token a GitHub.
