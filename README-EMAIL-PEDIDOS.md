# PLOT — Pedidos por email con EmailJS

Esta versión de PLOT permite que el cliente arme el carrito, complete sus datos y envíe el pedido por email. No realiza ningún cobro.

## 1. ¿Qué necesitás?

Una cuenta de EmailJS. El checkout reutiliza el servicio y el template que ya están configurados para el formulario de contacto, por lo que no depende del ID inexistente `template_lu6rmb`.

El mensaje del pedido se envía usando las variables existentes del template de contacto: `from_name`, `from_email`, `phone`, `book` y `message`. El detalle completo de productos, entrega y total va dentro de `message`.

## 2. (Opcional) Crear un template exclusivo para pedidos

En EmailJS creá un template nuevo, por ejemplo:

**Nombre:** `PLOT - Nuevo pedido`

El template debe poder utilizar estas variables:

```text
{{order_id}}
{{order_date}}
{{customer_name}}
{{customer_email}}
{{customer_phone}}
{{delivery}}
{{products}}
{{total}}
{{status}}
{{to_email}} (opcional, solo si el destinatario se define desde el código)
{{recipient_type}}
{{reply_to}}
```

### Ejemplo de asunto

```text
Nuevo pedido {{order_id}} — PLOT
```

### Ejemplo de cuerpo

```text
NUEVO PEDIDO PLOT

Pedido: {{order_id}}
Fecha: {{order_date}}
Estado: {{status}}

CLIENTE
Nombre: {{customer_name}}
Email: {{customer_email}}
Teléfono: {{customer_phone}}

ENTREGA
{{delivery}}

PRODUCTOS
{{products}}

TOTAL
{{total}}
```

## 3. Configurar el destinatario

Para recibir el pedido vos, lo más simple y recomendable es configurar el campo de destinatario del template con tu email de PLOT.

El pedido se envía al destinatario configurado en el Template de EmailJS. En el template actual, usá `{{from_email}}` como **Reply To** para poder responderle al cliente.

## 4. Configuración actual del checkout

El checkout en `js/checkout.js` usa los mismos datos que el formulario de contacto:

```javascript
publicKey: '14Ah8OLEyQi3DQtMe',
serviceId: 'service_r9vz5p4',
orderTemplateId: 'template_q02bojj'
```

El destinatario se define en **To Email** del template existente. Si creás un template exclusivo para pedidos, además de su ID tendrás que ajustar los nombres de parámetros enviados por el código para que coincidan con las variables de ese template. Verificá que el template pertenezca a la misma cuenta EmailJS y que el `serviceId` corresponda al servicio elegido.

Si el template existente tiene configurado **Reply To** con `{{from_email}}`, podrás responder directamente al cliente desde el correo recibido.

## 5. ¿Qué recibe PLOT?

Cada pedido genera un número único, por ejemplo:

```text
PLOT-1756570000000
```

El email incluye:
- Nombre y apellido
- Email
- Teléfono / WhatsApp
- Modalidad de entrega
- Dirección
- Localidad
- Código postal
- Libros seleccionados
- Cantidades
- Precio por libro
- Total
- Fecha y hora

## 6. Flujo actual

```text
Cliente
  ↓
Carrito
  ↓
Checkout
  ↓
Completa datos
  ↓
Enviar pedido
  ↓
EmailJS
  ├──→ PLOT recibe el pedido
  └──→ Cliente recibe confirmación
  ↓
PLOT contacta al cliente
  ↓
Se coordina pago + entrega
```

## 7. Importante

Esta versión es ideal para una etapa inicial, pero EmailJS funciona desde el navegador. No guardes contraseñas, datos de tarjetas ni información financiera sensible en este formulario.

Cuando PLOT pase a una tienda real, conviene migrar el registro de pedidos a un backend y una base de datos. Más adelante podemos conectar Mercado Pago y usar webhooks para confirmar pagos automáticamente.
