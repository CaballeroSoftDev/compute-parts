export interface ShippingAddress {
  first_name: string;
  last_name: string;
  phone?: string;
  address_line_1: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

/**
 * Formatea una dirección de envío desde JSON a texto legible
 */
export function formatShippingAddress(address: string | ShippingAddress | null): string {
  if (!address) {
    return 'Sin dirección';
  }

  // Si es un string JSON, intentar parsearlo
  if (typeof address === 'string') {
    try {
      const parsedAddress = JSON.parse(address) as ShippingAddress;
      return formatAddressObject(parsedAddress);
    } catch (error) {
      // Si no es JSON válido, devolver el string tal como está
      return address;
    }
  }

  // Si es un objeto, formatearlo directamente
  if (typeof address === 'object') {
    return formatAddressObject(address);
  }

  return 'Sin dirección';
}

/**
 * Formatea un objeto de dirección a texto legible
 */
function formatAddressObject(address: ShippingAddress): string {
  const parts = [
    `${address.first_name} ${address.last_name}`,
    address.address_line_1,
    `${address.city}, ${address.state} ${address.postal_code}`,
    address.country,
  ];

  // Filtrar partes vacías y unir con saltos de línea
  return parts.filter((part) => part && part.trim()).join('\n');
}

/**
 * Obtiene solo el nombre de la dirección
 */
export function getAddressName(address: string | ShippingAddress | null): string {
  if (!address) {
    return 'Sin nombre';
  }

  if (typeof address === 'string') {
    try {
      const parsedAddress = JSON.parse(address) as ShippingAddress;
      return `${parsedAddress.first_name} ${parsedAddress.last_name}`;
    } catch (error) {
      return 'Sin nombre';
    }
  }

  if (typeof address === 'object') {
    return `${address.first_name} ${address.last_name}`;
  }

  return 'Sin nombre';
}

/**
 * Obtiene solo la dirección física
 */
export function getAddressLocation(address: string | ShippingAddress | null): string {
  if (!address) {
    return '';
  }

  if (typeof address === 'string') {
    try {
      const parsedAddress = JSON.parse(address) as ShippingAddress;
      return `${parsedAddress.address_line_1}, ${parsedAddress.city}, ${parsedAddress.state} ${parsedAddress.postal_code}`;
    } catch (error) {
      return '';
    }
  }

  if (typeof address === 'object') {
    return `${address.address_line_1}, ${address.city}, ${address.state} ${address.postal_code}`;
  }

  return '';
}

/**
 * Obtiene el teléfono de la dirección
 */
export function getAddressPhone(address: string | ShippingAddress | null): string {
  if (!address) {
    return '';
  }

  if (typeof address === 'string') {
    try {
      const parsedAddress = JSON.parse(address) as ShippingAddress;
      return parsedAddress.phone || '';
    } catch (error) {
      return '';
    }
  }

  if (typeof address === 'object') {
    return address.phone || '';
  }

  return '';
}
