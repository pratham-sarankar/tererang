import twilio from 'twilio';

const {
    TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN,
    TWILIO_VERIFY_SERVICE_SID,
    TWILIO_DEFAULT_COUNTRY_CODE = '+91',
} = process.env;

const sanitizeDigits = (value = '') => value.replace(/\D/g, '');

const formatRecipient = (rawNumber = '') => {
    const trimmed = `${rawNumber}`.trim();
    if (!trimmed) {
        throw new Error('Recipient phone number is required');
    }
    if (trimmed.startsWith('+')) {
        return trimmed;
    }
    const digits = sanitizeDigits(trimmed);
    if (!digits) {
        throw new Error('Recipient phone number must contain digits');
    }
    return `${TWILIO_DEFAULT_COUNTRY_CODE}${digits}`;
};

let twilioClient = null;
if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
    twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
}

const verifyConfigured = Boolean(twilioClient && TWILIO_VERIFY_SERVICE_SID);

const requireVerifyConfig = () => {
    if (!verifyConfigured) {
        throw new Error('Twilio Verify is not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_VERIFY_SERVICE_SID.');
    }
};

export const sendLoginOtpSMS = async (phoneNumber) => {
    requireVerifyConfig();

    const to = formatRecipient(phoneNumber);
    const verification = await twilioClient.verify.v2
        .services(TWILIO_VERIFY_SERVICE_SID)
        .verifications.create({ to, channel: 'sms' });

    return {
        delivered: verification.status === 'pending',
        sid: verification.sid,
        status: verification.status,
        channel: verification.channel,
    };
};

export const verifyLoginOtp = async (phoneNumber, code) => {
    requireVerifyConfig();

    if (!code) {
        throw new Error('OTP code is required for verification');
    }

    const to = formatRecipient(phoneNumber);
    const verification = await twilioClient.verify.v2
        .services(TWILIO_VERIFY_SERVICE_SID)
        .verificationChecks.create({ to, code });

    return {
        sid: verification.sid,
        status: verification.status,
        approved: verification.status === 'approved',
    };
};

export const isSmsServiceConfigured = () => verifyConfigured;
