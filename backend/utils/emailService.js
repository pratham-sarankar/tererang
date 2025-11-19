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
    COMPANY_GST_NUMBER,
    COMPANY_GST_LEGAL_NAME,
    COMPANY_REGISTERED_ADDRESS,
    COMPANY_SUPPORT_EMAIL,
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

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;
const resolveGstRate = () => {
    const raw = Number(process.env.GST_RATE ?? process.env.GST_RATE_PERCENT ?? 0.05);
    if (!Number.isFinite(raw) || raw <= 0) return 0.05;
    return raw > 1 ? raw / 100 : raw;
};
const GST_RATE = resolveGstRate();
const GST_PERCENT_DISPLAY = (GST_RATE * 100).toFixed(2).replace(/\.00$/, '');

const getOrderTag = (order) => String(order?._id || '').slice(-6).toUpperCase() || 'ORDER';

const buildItemsRows = (order) =>
    (order.items || [])
        .map(
            (item) => `
        <tr>
          <td style="padding:8px 12px;border:1px solid #eee;">
            <strong>${item.name}</strong><br/>
            Qty: ${item.quantity} ${item.size ? `| Size: ${item.size}` : ''} ${item.height ? `| Height: ${item.height}` : ''}
          </td>
          <td style="padding:8px 12px;border:1px solid #eee;text-align:right;">
                        ${formatCurrency(item.price * item.quantity)}
          </td>
        </tr>
      `
        )
        .join('');

const buildShippingBlock = (order) => {
    if (!order.shippingAddress) return '';
    return `
        <div style="margin-top:16px;padding:16px;border:1px solid #eee;border-radius:8px;">
            <p style="margin:0 0 8px 0;font-weight:bold;">Shipping address</p>
            <p style="margin:0;color:#333;line-height:1.6;">
                ${order.shippingAddress.contactName}<br/>
                ${order.shippingAddress.phoneNumber}<br/>
                ${order.shippingAddress.line1}${order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ''}<br/>
                ${order.shippingAddress.landmark ? `${order.shippingAddress.landmark}, ` : ''}${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}<br/>
                ${order.shippingAddress.country || 'India'}
            </p>
        </div>
    `;
};

const buildGstBlock = () => {
    if (!COMPANY_GST_NUMBER) return '';
    return `
        <div style="margin-top:16px;padding:16px;border:1px solid #eee;border-radius:8px;background:#f9fbff;">
            <p style="margin:0 0 8px 0;font-weight:bold;">GST & Seller Details</p>
            <p style="margin:0;color:#333;line-height:1.6;">
                ${COMPANY_GST_LEGAL_NAME || BRAND_NAME}<br/>
                GSTIN: <strong>${COMPANY_GST_NUMBER}</strong><br/>
                ${COMPANY_REGISTERED_ADDRESS || ''}
            </p>
        </div>
    `;
};

const buildOrderHtml = (order, user) => {
    const itemsRows = buildItemsRows(order);
    const gstAmount = typeof order.taxAmount === 'number' ? order.taxAmount : Number(((order.subtotal || 0) * GST_RATE).toFixed(2));
    const grandTotal = typeof order.grandTotal === 'number' && order.grandTotal > 0 ? order.grandTotal : (order.subtotal || 0) + gstAmount;

    const orderMetaRows = [
        ['Order ID', `#${String(order._id).slice(-8).toUpperCase()}`],
        ['Placed on', new Date(order.createdAt || Date.now()).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })],
        ['Payment method', (order.paymentMethod || 'UPI').toUpperCase()],
        ['Payment reference', order.paymentReference || 'Shared via checkout form'],
        ['Order notes', order.notes || '—'],
    ]
        .filter(([, value]) => Boolean(value))
        .map(
            ([label, value]) => `
                <tr>
                    <td style="padding:8px 12px;border:1px solid #eee;background:#fafafa;font-weight:600;width:30%;">${label}</td>
                    <td style="padding:8px 12px;border:1px solid #eee;">${value}</td>
                </tr>
            `
        )
        .join('');

    const formattedAddress = buildShippingBlock(order);
    const gstBlock = buildGstBlock();

    return `
    <div style="font-family:Arial,sans-serif;color:#111;padding:24px;">
      <h2>New Order Received</h2>
            <p>A new order has been placed on <strong>${BRAND_NAME}</strong>.</p>
      <p><strong>Customer:</strong> ${user.name || 'Unknown'} (${user.phoneNumber})</p>
            <table style="border-collapse:collapse;width:100%;margin-top:16px;">
                ${orderMetaRows}
            </table>
            ${formattedAddress}
            ${gstBlock}
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
                                                <td style="padding:12px;border:1px solid #eee;text-align:right;font-weight:bold;">${formatCurrency(order.subtotal)}</td>
                    </tr>
                    <tr>
                        <td style="padding:12px;border:1px solid #eee;text-align:left;">GST (${GST_PERCENT_DISPLAY}%)</td>
                        <td style="padding:12px;border:1px solid #eee;text-align:right;">${formatCurrency(gstAmount)}</td>
                    </tr>
                    <tr>
                        <td style="padding:12px;border:1px solid #eee;text-align:left;font-weight:bold;">Grand total (incl. GST)</td>
                        <td style="padding:12px;border:1px solid #eee;text-align:right;font-weight:bold;">${formatCurrency(grandTotal)}</td>
          </tr>
        </tbody>
      </table>
      ${order.notes ? `<p style="margin-top:16px;"><strong>Notes:</strong> ${order.notes}</p>` : ''}
            <p style="margin-top:24px;color:#666;font-size:12px;">
                This is an automated message. Please login to the dashboard to manage the order.${COMPANY_SUPPORT_EMAIL ? ` For escalations reach us at ${COMPANY_SUPPORT_EMAIL}.` : ''}
            </p>
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
        const orderTag = getOrderTag(order);
        const totalAmount = typeof order.grandTotal === 'number' && order.grandTotal > 0 ? order.grandTotal : order.subtotal;
        const response = await activeTransporter.sendMail({
            from: `${BRAND_NAME} <${SMTP_USER}>`,
            to: mailTo,
            subject: `Order ${orderTag} • ${order.items.length} items • ${formatCurrency(totalAmount)}`,
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

const buildCustomerOrderHtml = ({ order, user, type, reason }) => {
    const greeting = user?.name ? `Hi ${user.name.split(' ')[0]},` : 'Hi there,';
    const orderTag = getOrderTag(order);
    const intro =
        type === 'confirmed'
            ? `Your order <strong>#${orderTag}</strong> has been confirmed! Our atelier is now preparing your pieces with utmost care.`
            : `Your order <strong>#${orderTag}</strong> has been cancelled. We’re sorry for any inconvenience this may have caused.`;
    const supportLine = COMPANY_SUPPORT_EMAIL
        ? `If you have any questions, reply to this email or contact us at <a href="mailto:${COMPANY_SUPPORT_EMAIL}">${COMPANY_SUPPORT_EMAIL}</a>.`
        : 'You can reply to this email for any clarifications.';
    const reasonBlock = type === 'cancelled'
        ? `<p style="margin:12px 0;color:#444;">${reason || 'If payment was completed, the refund will be issued shortly. Please reach out if you need more details.'}</p>`
        : '';
    const paymentLine = order.paymentStatus === 'paid'
        ? 'Payment received via ' + (order.paymentMethod || 'UPI') + (order.paymentReference ? ` (reference: ${order.paymentReference})` : '')
        : 'Payment will be collected upon confirmation of your preferred method.';

    const itemsRows = buildItemsRows(order);
    const shippingBlock = buildShippingBlock(order);
    const gstBlock = buildGstBlock();
    const gstAmount = typeof order.taxAmount === 'number' ? order.taxAmount : Number(((order.subtotal || 0) * GST_RATE).toFixed(2));
    const grandTotal = typeof order.grandTotal === 'number' && order.grandTotal > 0 ? order.grandTotal : (order.subtotal || 0) + gstAmount;

    return `
        <div style="font-family:Arial,sans-serif;color:#111;padding:24px;background:#fdfdfd;">
            <h2 style="margin-top:0;">${BRAND_NAME} • Order ${orderTag}</h2>
            <p>${greeting}</p>
            <p style="color:#333;">${intro}</p>
            ${reasonBlock}
            <table style="border-collapse:collapse;width:100%;margin-top:12px;">
                <tr>
                    <td style="padding:8px 12px;border:1px solid #eee;background:#fafafa;font-weight:600;width:35%;">Order date</td>
                    <td style="padding:8px 12px;border:1px solid #eee;">${new Date(order.createdAt || Date.now()).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })}</td>
                </tr>
                <tr>
                    <td style="padding:8px 12px;border:1px solid #eee;background:#fafafa;font-weight:600;">Payment</td>
                    <td style="padding:8px 12px;border:1px solid #eee;">${paymentLine}</td>
                </tr>
                ${order.notes ? `<tr><td style="padding:8px 12px;border:1px solid #eee;background:#fafafa;font-weight:600;">Order notes</td><td style="padding:8px 12px;border:1px solid #eee;">${order.notes}</td></tr>` : ''}
            </table>
            <table style="border-collapse:collapse;width:100%;margin-top:16px;">
                <thead>
                    <tr>
                        <th style="padding:12px;border:1px solid #eee;text-align:left;background:#fafafa;">Items</th>
                        <th style="padding:12px;border:1px solid #eee;text-align:right;background:#fafafa;">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsRows}
                    <tr>
                        <td style="padding:12px;border:1px solid #eee;text-align:left;font-weight:bold;">Subtotal</td>
                        <td style="padding:12px;border:1px solid #eee;text-align:right;font-weight:bold;">${formatCurrency(order.subtotal)}</td>
                    </tr>
                    <tr>
                        <td style="padding:12px;border:1px solid #eee;text-align:left;">GST (${GST_PERCENT_DISPLAY}%)</td>
                        <td style="padding:12px;border:1px solid #eee;text-align:right;">${formatCurrency(gstAmount)}</td>
                    </tr>
                    <tr>
                        <td style="padding:12px;border:1px solid #eee;text-align:left;font-weight:bold;">Grand total (incl. GST)</td>
                        <td style="padding:12px;border:1px solid #eee;text-align:right;font-weight:bold;">${formatCurrency(grandTotal)}</td>
                    </tr>
                </tbody>
            </table>
            ${shippingBlock}
            ${gstBlock}
            <p style="margin-top:24px;color:#444;">${supportLine}</p>
            <p style="margin-top:12px;color:#999;font-size:12px;">This is an automated message from ${BRAND_NAME}. Please keep it for your records.</p>
        </div>
    `;
};

export const sendCustomerOrderStatusEmail = async ({ order, user, type, reason }) => {
    if (!user?.email) {
        console.warn('[emailService] Cannot notify customer, missing email', {
            orderId: order?._id,
        });
        return;
    }

    const activeTransporter = initTransporter();
    if (!activeTransporter) {
        console.info('[emailService] Transporter unavailable. Logging customer email instead:', {
            to: user.email,
            type,
            orderId: order?._id,
        });
        return;
    }

    const orderTag = getOrderTag(order);
    const subject =
        type === 'confirmed'
            ? `${BRAND_NAME} • Order ${orderTag} confirmed`
            : `${BRAND_NAME} • Order ${orderTag} cancelled`;

    try {
        const response = await activeTransporter.sendMail({
            from: `${BRAND_NAME} <${SMTP_USER}>`,
            to: user.email,
            subject,
            html: buildCustomerOrderHtml({ order, user, type, reason }),
        });
        console.info('[emailService] Customer order email dispatched', {
            orderId: order._id,
            type,
            messageId: response.messageId,
        });
    } catch (error) {
        console.error('[emailService] Failed to send customer order email', {
            orderId: order._id,
            type,
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