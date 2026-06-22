export const ETH_PHONE_PATTERN = /^(?:\+?2519\d{8}|09\d{8}|9\d{8})$/;

export function normalizeEthiopianPhone(phone: string): string | null {
  const phoneString = phone.replace(/\D/g, '').replace(/^0+/, '');

  if (phoneString.startsWith('251')) {
    return phoneString.substring(3);
  }

  if (phoneString.length === 9 && phoneString.startsWith('9')) {
    return phoneString;
  }

  return null;
}

export function formatEthiopianPhoneWithCountryCode(phone: string): string | null {
  const normalized = normalizeEthiopianPhone(phone);
  if (!normalized) {
    return null;
  }

  return `251${normalized}`;
}
