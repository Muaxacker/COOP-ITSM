import { generateSecret, generateURI, verifySync } from 'otplib';
import QRCode from 'qrcode';

export interface TwoFactorSetupResult {
  secret: string;
  otpauthUrl: string;
  qrCodeDataUrl: string;
}

/**
 * Generates a new TOTP secret and QR code for Google Authenticator / Microsoft Authenticator
 */
export async function generateTwoFactorSetup(userEmail: string): Promise<TwoFactorSetupResult> {
  const secret = generateSecret();
  const issuer = 'COOP-ITSM (Coop Bank)';
  const otpauthUrl = generateURI({
    secret,
    issuer,
    label: userEmail,
  });

  const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl, {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 240,
    color: {
      dark: '#0B2545',
      light: '#FFFFFF',
    },
  });

  return {
    secret,
    otpauthUrl,
    qrCodeDataUrl,
  };
}

/**
 * Validates a 6-digit TOTP code against the user's secret
 */
export function verifyTwoFactorToken(token: string, secret: string): boolean {
  if (!token || !secret) return false;
  const cleaned = token.replace(/\s+/g, '');
  try {
    const result = verifySync({ token: cleaned, secret });
    return Boolean(result && result.valid);
  } catch (err) {
    return false;
  }
}
