/* eslint-env node */
import process from 'node:process';
import nodemailer from 'nodemailer';

const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    ORDER_NOTIFICATION_EMAIL,
    BRAND_NAME = 'TereRang',
} = process.env;

let transporter = null;

const initTransporter = () => {
    if (transporter !== null) return transporter;
    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
        console.warn('[emailService] SMTP credentials missing. Emails will be logged to console.');
        transporter = undefined;
        return transporter;
    }

    console.info('[emailService] Initializing SMTP transporter', {
        host: SMTP_HOST,
        port: Number(SMTP_PORT),
        secure: Number(SMTP_PORT) === 465,
        hasUser: Boolean(SMTP_USER),
    });

    transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT),
        secure: Number(SMTP_PORT) === 465,
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS,
        },
    });

    console.info('[emailService] SMTP transporter ready');

    return transporter;
};

const buildOrderHtml = (order, user) => {
    const itemsRows = order.items
        .map(
            (item) => `
        <tr>
          <td style="padding:8px 12px;border:1px solid #eee;">
            <strong>${item.name}</strong><br/>
            Qty: ${item.quantity} ${item.size ? `| Size: ${item.size}` : ''} ${item.height ? `| Height: ${item.height}` : ''}
          </td>
          <td style="padding:8px 12px;border:1px solid #eee;text-align:right;">
            ₹${(item.price * item.quantity).toLocaleString('en-IN')}
          </td>
        </tr>
      `
        )
        .join('');

    return `
    <div style="font-family:Arial,sans-serif;color:#111;padding:24px;">
      <h2>New Order Received</h2>
      <p>A new order has been placed on <strong>${BRAND_NAME}</strong>.</p>
      <p><strong>Customer:</strong> ${user.name || 'Unknown'} (${user.phoneNumber})</p>
      ${order.paymentReference ? `<p><strong>Payment Reference:</strong> ${order.paymentReference}</p>` : ''}
      <table style="border-collapse:collapse;width:100%;margin-top:16px;">
        <thead>
          <tr>
            <th style="padding:12px;border:1px solid #eee;text-align:left;">Items</th>
            <th style="padding:12px;border:1px solid #eee;text-align:right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
          <tr>
            <td style="padding:12px;border:1px solid #eee;text-align:left;font-weight:bold;">Subtotal</td>
            <td style="padding:12px;border:1px solid #eee;text-align:right;font-weight:bold;">₹${order.subtotal.toLocaleString('en-IN')}</td>
          </tr>
        </tbody>
      </table>
      ${order.notes ? `<p style="margin-top:16px;"><strong>Notes:</strong> ${order.notes}</p>` : ''}
      <p style="margin-top:24px;color:#666;font-size:12px;">This is an automated message. Please login to the dashboard to manage the order.</p>
    </div>
  `;
};

export const sendOrderConfirmationEmail = async ({ order, user }) => {
    const mailTo = ORDER_NOTIFICATION_EMAIL || SMTP_USER;
    console.log(mailTo);
    if (!mailTo) {
        console.info('[emailService] No destination email configured. Order details:', {
            subtotal: order.subtotal,
            paymentReference: order.paymentReference,
        });
        return;
    }

    const activeTransporter = initTransporter();

    if (!activeTransporter) {
        console.info('[emailService] Transporter unavailable. Logging order email instead:', {
            to: mailTo,
            subject: `New order ${order._id}`,
        });
        return;
    }

    console.info('[emailService] Sending order confirmation email', {
        orderId: order._id,
        itemCount: order.items.length,
        subtotal: order.subtotal,
        to: mailTo,
    });

    try {
        const response = await activeTransporter.sendMail({
            from: `${BRAND_NAME} <${SMTP_USER}>`,
            to: mailTo,
            subject: `New order placed • ${order.items.length} items • ₹${order.subtotal.toLocaleString('en-IN')}`,
            html: buildOrderHtml(order, user),
        });

        console.info('[emailService] Order email dispatched', {
            orderId: order._id,
            messageId: response.messageId,
            accepted: response.accepted,
            rejected: response.rejected,
        });
    } catch (error) {
        console.error('[emailService] Failed to send order email', {
            orderId: order._id,
            error: error.message,
        });
        throw error;
    }
};

export const checkSmtpConnectivity = async () => {
    const mailTo = ORDER_NOTIFICATION_EMAIL || SMTP_USER || null;
    const activeTransporter = initTransporter();

    if (!activeTransporter) {
        return {
            ok: false,
            status: 'disabled',
            message: 'SMTP credentials are missing or invalid. Emails will be logged to the console only.',
            targetEmail: mailTo,
        };
    }

    try {
        console.info('[emailService] Verifying SMTP connectivity');
        await activeTransporter.verify();
        console.info('[emailService] SMTP connectivity verified');
        return {
            ok: true,
            status: 'connected',
            targetEmail: mailTo,
        };
    } catch (error) {
        console.error('[emailService] SMTP connectivity failed', { error: error.message });
        return {
            ok: false,
            status: 'error',
            message: error.message,
            targetEmail: mailTo,
        };
    }
};