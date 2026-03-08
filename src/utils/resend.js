const { Resend } = require('resend');
const { STATUS_LABELS } = require('./whatsappBuilder');

const resend = new Resend(process.env.RESEND_API_KEY);
const EMAIL_FROM = process.env.EMAIL_FROM || 'onboarding@resend.dev';
const ALLOWED_EMAIL = process.env.ADMIN_EMAIL || 'ssantii200@gmail.com';

/**
 * Sends an order status update email.
 * @param {Object} order - The order object.
 * @param {Object} user - The user object (must have name and email).
 */
async function sendOrderStatusEmail(order, user) {
    if (!user || !user.email) {
        console.log('No user email found for order status notification');
        return;
    }

    // Check if email is allowed during development/domain restriction
    if (user.email.toLowerCase() !== ALLOWED_EMAIL.toLowerCase()) {
        const error = new Error(`Solo funciona con determinado mail (${ALLOWED_EMAIL}).`);
        error.status = 403;
        throw error;
    }

    const statusLabel = STATUS_LABELS[order.status] || order.status;
    const userName = user.name || 'Cliente';

    const htmlContent = `
    <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1a1a1a; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 40px;">
        <h1 style="font-family: 'Poppins', sans-serif; font-size: 28px; font-weight: 900; color: #f3701c; margin: 0; letter-spacing: -1px; text-transform: uppercase; font-style: italic;">
          PANCHOS
        </h1>
      </div>
      
      <div style="border-top: 4px solid #f3701c; padding-top: 30px;">
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px; color: #444;">
          Hola <strong>${userName}</strong>,
        </p>
        
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 25px; color: #444;">
          Te informamos que tu pedido <strong>#${order.orderNumber}</strong> ha actualizado su estado a:
        </p>
        
        <div style="background-color: #fff8f1; border: 1px solid #fcd4b0; border-radius: 12px; padding: 24px; margin-bottom: 30px; text-align: center;">
          <span style="font-size: 20px; font-weight: 800; color: #f3701c; text-transform: uppercase; tracking: 1px;">
            ${statusLabel}
          </span>
        </div>
        
        <p style="font-size: 15px; line-height: 1.6; margin-bottom: 20px; color: #666;">
          Realizamos este seguimiento para que estés al tanto de cada etapa de tu compra. Si tienes alguna consulta, nuestro equipo está a tu disposición a través de WhatsApp.
        </p>
      </div>
      
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
        <p style="font-size: 14px; font-weight: 600; color: #f3701c; margin-bottom: 10px;">
          ¡Gracias por tu preferencia!
        </p>
        <p style="font-size: 12px; color: #999; margin: 0;">
          Este es un correo automático de Pancho-App. Por favor, no respondas a este mensaje.
        </p>
      </div>
    </div>
  `;

    try {
        const { data, error } = await resend.emails.send({
            from: `Panchos <${EMAIL_FROM}>`,
            to: [user.email],
            subject: `Actualización de tu pedido #${order.orderNumber}`,
            html: htmlContent,
        });

        if (error) {
            console.error('Resend Error:', error);
            throw new Error('Error al enviar la notificación por correo.');
        }

        return data;
    } catch (err) {
        console.error('Email Service Error:', err);
        throw err;
    }
}

module.exports = { sendOrderStatusEmail };
