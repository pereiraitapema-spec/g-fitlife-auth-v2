import { supabase } from '../backend/supabaseClient';

/**
 * SERVIÇO DE STORAGE G-FITLIFE
 * Padroniza o envio de mídia para o bucket corporativo 'uploads'.
 * Utiliza o cliente anon para respeitar as políticas RLS definidas no banco de dados.
 */

export const storageService = {
  async upload(file: File, folder: string = 'public'): Promise<string> {
    if (!supabase) {
      console.error("[GFIT-STORAGE] Erro: Cliente Supabase não inicializado.");
      throw new Error('Sistema de armazenamento offline. Verifique as chaves SUPABASE_URL e SUPABASE_ANON_KEY.');
    }

    // 1. Gerar nome de arquivo único
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    console.log(`[STORAGE] Iniciando upload para: uploads/${filePath}`);

    // 2. Executar Upload no bucket 'uploads'
    const { data, error } = await supabase.storage
      .from('uploads')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('[STORAGE-ERROR]', error);
      throw new Error(`Erro no servidor de arquivos: ${error.message}`);
    }

    // 3. Obter URL Pública (Certifique-se que o bucket 'uploads' é público no Supabase)
    const { data: { publicUrl } } = supabase.storage
      .from('uploads')
      .getPublicUrl(filePath);

    return publicUrl;
  }
};