import { supabase } from '@/lib/supabase';

export interface ShippingAddress {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  phone?: string;
  address_line_1: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateShippingAddressData {
  first_name: string;
  last_name: string;
  phone?: string;
  address_line_1: string;
  city: string;
  state: string;
  postal_code: string;
  country?: string;
  is_default?: boolean;
}

export interface UpdateShippingAddressData extends Partial<CreateShippingAddressData> {
  id: string;
}

export class ShippingAddressService {
  // Verificar si el usuario está autenticado
  private static async checkAuth(): Promise<string> {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        if (
          authError.message.includes('Auth session missing') ||
          authError.message.includes('AuthSessionMissingError')
        ) {
          throw new Error('Usuario no autenticado');
        }
        throw authError;
      }

      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      return user.id;
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message.includes('Auth session missing') || error.message.includes('AuthSessionMissingError'))
      ) {
        throw new Error('Usuario no autenticado');
      }
      throw error;
    }
  }

  // Obtener todas las direcciones de envío del usuario
  static async getShippingAddresses(): Promise<ShippingAddress[]> {
    try {
      const userId = await this.checkAuth();

      const { data, error } = await supabase
        .from('shipping_addresses')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error obteniendo direcciones de envío:', error);
        throw new Error('Error al obtener las direcciones de envío');
      }

      return data || [];
    } catch (error) {
      if (error instanceof Error && error.message === 'Usuario no autenticado') {
        return [];
      }
      throw error;
    }
  }

  // Obtener una dirección específica
  static async getShippingAddress(addressId: string): Promise<ShippingAddress | null> {
    try {
      const userId = await this.checkAuth();

      const { data, error } = await supabase
        .from('shipping_addresses')
        .select('*')
        .eq('id', addressId)
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No se encontró la dirección
        }
        console.error('Error obteniendo dirección de envío:', error);
        throw new Error('Error al obtener la dirección de envío');
      }

      return data;
    } catch (error) {
      if (error instanceof Error && error.message === 'Usuario no autenticado') {
        return null;
      }
      throw error;
    }
  }

  // Crear nueva dirección de envío
  static async createShippingAddress(addressData: CreateShippingAddressData): Promise<ShippingAddress> {
    const userId = await this.checkAuth();

    // Si se marca como predeterminada, quitar la marca de otras direcciones
    if (addressData.is_default) {
      await supabase
        .from('shipping_addresses')
        .update({ is_default: false })
        .eq('user_id', userId)
        .eq('is_default', true);
    }

    const { data, error } = await supabase
      .from('shipping_addresses')
      .insert({
        user_id: userId,
        ...addressData,
        country: addressData.country || 'México',
        is_default: addressData.is_default || false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creando dirección de envío:', error);
      throw new Error('Error al crear la dirección de envío');
    }

    return data;
  }

  // Actualizar dirección de envío
  static async updateShippingAddress(addressData: UpdateShippingAddressData): Promise<ShippingAddress> {
    const userId = await this.checkAuth();

    // Verificar que la dirección pertenece al usuario
    const existingAddress = await this.getShippingAddress(addressData.id);
    if (!existingAddress) {
      throw new Error('Dirección de envío no encontrada');
    }

    // Si se marca como predeterminada, quitar la marca de otras direcciones
    if (addressData.is_default) {
      await supabase
        .from('shipping_addresses')
        .update({ is_default: false })
        .eq('user_id', userId)
        .eq('is_default', true)
        .neq('id', addressData.id);
    }

    const { data, error } = await supabase
      .from('shipping_addresses')
      .update(addressData)
      .eq('id', addressData.id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error actualizando dirección de envío:', error);
      throw new Error('Error al actualizar la dirección de envío');
    }

    return data;
  }

  // Eliminar dirección de envío
  static async deleteShippingAddress(addressId: string): Promise<void> {
    const userId = await this.checkAuth();

    // Verificar que la dirección pertenece al usuario
    const existingAddress = await this.getShippingAddress(addressId);
    if (!existingAddress) {
      throw new Error('Dirección de envío no encontrada');
    }

    const { error } = await supabase.from('shipping_addresses').delete().eq('id', addressId).eq('user_id', userId);

    if (error) {
      console.error('Error eliminando dirección de envío:', error);
      throw new Error('Error al eliminar la dirección de envío');
    }
  }

  // Establecer dirección como predeterminada
  static async setDefaultAddress(addressId: string): Promise<void> {
    const userId = await this.checkAuth();

    // Verificar que la dirección pertenece al usuario
    const existingAddress = await this.getShippingAddress(addressId);
    if (!existingAddress) {
      throw new Error('Dirección de envío no encontrada');
    }

    // Quitar la marca de predeterminada de todas las direcciones
    await supabase.from('shipping_addresses').update({ is_default: false }).eq('user_id', userId);

    // Establecer la nueva dirección como predeterminada
    const { error } = await supabase
      .from('shipping_addresses')
      .update({ is_default: true })
      .eq('id', addressId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error estableciendo dirección predeterminada:', error);
      throw new Error('Error al establecer la dirección predeterminada');
    }
  }

  // Obtener dirección predeterminada
  static async getDefaultAddress(): Promise<ShippingAddress | null> {
    try {
      const userId = await this.checkAuth();

      const { data, error } = await supabase
        .from('shipping_addresses')
        .select('*')
        .eq('user_id', userId)
        .eq('is_default', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No hay dirección predeterminada
        }
        console.error('Error obteniendo dirección predeterminada:', error);
        throw new Error('Error al obtener la dirección predeterminada');
      }

      return data;
    } catch (error) {
      if (error instanceof Error && error.message === 'Usuario no autenticado') {
        return null;
      }
      throw error;
    }
  }

  // Verificar si el usuario tiene direcciones de envío
  static async hasShippingAddresses(): Promise<boolean> {
    try {
      const addresses = await this.getShippingAddresses();
      return addresses.length > 0;
    } catch (error) {
      console.error('Error verificando direcciones de envío:', error);
      return false;
    }
  }

  // Validar datos de dirección
  static validateAddressData(addressData: CreateShippingAddressData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validar nombre
    if (!addressData.first_name?.trim()) {
      errors.push('El nombre es requerido');
    } else if (addressData.first_name.trim().length < 2) {
      errors.push('El nombre debe tener al menos 2 caracteres');
    }

    // Validar apellido
    if (!addressData.last_name?.trim()) {
      errors.push('El apellido es requerido');
    } else if (addressData.last_name.trim().length < 2) {
      errors.push('El apellido debe tener al menos 2 caracteres');
    }

    // Validar teléfono (opcional pero si se ingresa debe ser válido)
    if (addressData.phone && !/^\d{10}$/.test(addressData.phone.replace(/\s/g, ''))) {
      errors.push('El teléfono debe tener 10 dígitos');
    }

    // Validar dirección
    if (!addressData.address_line_1?.trim()) {
      errors.push('La dirección es requerida');
    } else if (addressData.address_line_1.trim().length < 5) {
      errors.push('La dirección debe tener al menos 5 caracteres');
    }

    // Validar ciudad
    if (!addressData.city?.trim()) {
      errors.push('La ciudad es requerida');
    } else if (addressData.city.trim().length < 2) {
      errors.push('La ciudad debe tener al menos 2 caracteres');
    }

    // Validar estado
    if (!addressData.state?.trim()) {
      errors.push('El estado es requerido');
    } else if (addressData.state.trim().length < 2) {
      errors.push('El estado debe tener al menos 2 caracteres');
    }

    // Validar código postal
    if (!addressData.postal_code?.trim()) {
      errors.push('El código postal es requerido');
    } else if (!/^\d{5}$/.test(addressData.postal_code.trim())) {
      errors.push('El código postal debe tener exactamente 5 dígitos');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
