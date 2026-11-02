document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY = 'plot_carrito';
  const ORDER_KEY = 'plot_pedido_enviado';

  // CONFIGURACIÓN DE EMAILJS
  // Reutiliza el servicio y template ya configurados para el formulario de contacto.
  const EMAILJS_CONFIG = {
    publicKey: '14Ah8OLEyQi3DQtMe',
    serviceId: 'service_r9vz5p4',
    orderTemplateId: 'template_q02bojj'
  };

  const itemsEl = document.getElementById('checkout-items');
  const subtotalEl = document.getElementById('checkout-subtotal');
  const totalEl = document.getElementById('checkout-total');
  const shippingEl = document.getElementById('checkout-shipping');
  const form = document.getElementById('checkout-form');
  const message = document.getElementById('checkout-message');
  const submitButton = document.getElementById('submit-order');
  const addressFields = document.getElementById('address-fields');

  let items = [];
  try {
    items = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch (_) {
    items = [];
  }

  const money = value => `$${Number(value).toLocaleString('es-AR')}`;
  const subtotal = () => items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, c => ({
      '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;'
    }[c]));
  }

  function render() {
    if (!items.length) {
      itemsEl.innerHTML = '<p class="checkout-empty">Tu carrito está vacío. <a href="catalogo.html">Volver al catálogo</a></p>';
      subtotalEl.textContent = '$0';
      totalEl.textContent = '$0';
      submitButton.disabled = true;
      return;
    }

    itemsEl.innerHTML = items.map(item => `
      <div class="checkout-product">
        <div>
          <strong>${escapeHtml(item.title)}</strong>
          <span>${item.quantity} × ${money(item.price)}</span>
        </div>
        <strong>${money(item.price * item.quantity)}</strong>
      </div>
    `).join('');

    subtotalEl.textContent = money(subtotal());
    totalEl.textContent = money(subtotal());
  }

  function updateDelivery() {
    const selected = form.querySelector('input[name="entrega"]:checked');
    const domicilio = selected?.value === 'domicilio';

    addressFields.hidden = !domicilio;
    shippingEl.textContent = domicilio ? 'A coordinar' : 'Retiro';

    ['direccion', 'localidad', 'codigoPostal'].forEach(name => {
      const field = form.elements[name];
      if (field) field.required = domicilio;
    });
  }

  document.querySelectorAll('input[name="entrega"]').forEach(input => {
    input.addEventListener('change', updateDelivery);
  });

  function emailjsReady() {
    return typeof emailjs !== 'undefined' &&
      EMAILJS_CONFIG.publicKey !== 'TU_PUBLIC_KEY' &&
      EMAILJS_CONFIG.serviceId !== 'TU_SERVICE_ID' &&
      EMAILJS_CONFIG.orderTemplateId !== 'TU_TEMPLATE_PEDIDOS_ID';
  }

  function createOrder(data) {
    return {
      orderId: `PLOT-${Date.now()}`,
      createdAt: new Date().toISOString(),
      customer: {
        nombre: data.nombre,
        apellido: data.apellido,
        email: data.email,
        telefono: data.telefono,
        entrega: data.entrega,
        direccion: data.direccion || '',
        localidad: data.localidad || '',
        codigoPostal: data.codigoPostal || ''
      },
      items: items.map(item => ({
        title: String(item.title),
        quantity: Number(item.quantity),
        price: Number(item.price)
      })),
      total: subtotal(),
      status: 'Pendiente de coordinación'
    };
  }

  function deliveryText(order) {
    if (order.customer.entrega === 'retiro') {
      return 'Retiro — a coordinar';
    }
    return [
      'Envío a domicilio',
      `Dirección: ${order.customer.direccion}`,
      `Localidad: ${order.customer.localidad}`,
      `Código postal: ${order.customer.codigoPostal}`
    ].join('\n');
  }

  function orderMessage(order) {
    return [
      `PEDIDO: ${order.orderId}`,
      `Fecha: ${new Date(order.createdAt).toLocaleString('es-AR')}`,
      `Estado: ${order.status}`,
      '',
      'PRODUCTOS:',
      ...order.items.map(item =>
        `- ${item.title} × ${item.quantity} — ${money(item.price * item.quantity)}`
      ),
      '',
      `ENTREGA:\n${deliveryText(order)}`,
      '',
      `TOTAL: ${money(order.total)}`
    ].join('\n');
  }

  async function sendOrderEmail(order) {
    if (!emailjsReady()) {
      throw new Error('EMAILJS_NOT_CONFIGURED');
    }

    const templateParams = {
      from_name: `${order.customer.nombre} ${order.customer.apellido}`,
      from_email: order.customer.email,
      phone: order.customer.telefono,
      book: `Pedido ${order.orderId}`,
      message: orderMessage(order)
    };

    // Los nombres de parámetros coinciden con el template del formulario de contacto.
    return emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.orderTemplateId,
      templateParams
    );
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();
    message.className = 'checkout-message';
    message.textContent = '';

    if (!items.length) return;

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    if (!emailjsReady()) {
      message.className = 'checkout-message error';
      message.textContent = typeof emailjs === 'undefined'
        ? 'No se pudo cargar EmailJS. Revisá la conexión a internet o el bloqueo del CDN y volvé a intentar.'
        : 'Falta configurar la Public Key, Service ID o Template ID de EmailJS. Revisá la configuración del checkout.';
      return;
    }

    const data = Object.fromEntries(new FormData(form).entries());
    const order = createOrder(data);

    submitButton.disabled = true;
    submitButton.textContent = 'Enviando pedido…';

    try {
      await sendOrderEmail(order);

      localStorage.setItem(ORDER_KEY, JSON.stringify(order));
      localStorage.removeItem(STORAGE_KEY);
      window.location.href = `pedido-enviado.html?pedido=${encodeURIComponent(order.orderId)}`;
    } catch (error) {
      console.error('Error enviando pedido:', error);
      message.className = 'checkout-message error';
      const emailjsError = error?.text || error?.message;
      message.textContent = emailjsError
        ? `EmailJS no pudo enviar el pedido: ${emailjsError}`
        : 'No pudimos enviar el pedido. Revisá la configuración del template de EmailJS o intentá nuevamente.';
      submitButton.disabled = false;
      submitButton.textContent = 'Enviar pedido';
    }
  });

  if (typeof emailjs !== 'undefined' && EMAILJS_CONFIG.publicKey !== 'TU_PUBLIC_KEY') {
    emailjs.init({ publicKey: EMAILJS_CONFIG.publicKey });
  }

  updateDelivery();
  render();
});

// FIN DE CODIGO 