
import { supabase } from '../backend/supabaseClient';

/**
 * SERVIÇO DE STORAGE G-FITLIFE
 * Padroniza o envio de mídia para o bucket corporativo 'uploads'.
 */

export const storageService = {
  async upload(file: File, folder: string = 'public'): Promise<string> {
    if (!supabase) throw new Error('Cliente Supabase não inicializado.');

    // 1. Gerar nome de arquivo único
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    console.log(`[STORAGE] Iniciando upload para: uploads/${filePath}`);

    // 2. Executar Upload
    const { data, error } = await supabase.storage
      .from('uploads')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('[STORAGE-ERROR]', error);
      throw new Error(`Falha no upload: ${error.message}`);
    }

    // 3. Obter URL Pública
    const { data: { publicUrl } } = supabase.storage
      .from('uploads')
      .getPublicUrl(filePath);

    return publicUrl;
  }
};
