import { supabase } from '../backend/supabaseClient';

/**
 * SERVIÇO DE STORAGE G-FITLIFE
 * Padroniza o envio de mídia para o bucket corporativo 'uploads'.
 * Segue a regra de segurança: auth.uid() IS NOT NULL.
 */

export const storageService = {
  async upload(file: File, folder: string = 'public'): Promise<string> {
    if (!supabase) {
      console.error("[GFIT-STORAGE] Erro: Cliente Supabase não inicializado.");
      throw new Error('Sistema de armazenamento offline.');
    }

    // 1. Validação Obrigatória de Sessão (RLS Client Side)
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (!session || !session.user || sessionError) {
      console.error('[GFIT-STORAGE] Tentativa de upload sem autenticação.');
      alert('Sua sessão expirou ou você não está logado. O upload é permitido apenas para usuários autenticados.');
      throw new Error('Usuário não autenticado');
    }

    // 2. Preparação do arquivo
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    console.log(`[STORAGE] Uploading: uploads/${filePath} | User: ${session.user.id}`);

    // 3. Executar Upload
    const { data, error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('[STORAGE-ERROR]', uploadError);
      // Erro comum: Bucket não existe ou RLS barrou
      if (uploadError.message.includes('not found')) {
        throw new Error('Bucket "uploads" não encontrado. Crie-o no painel do Supabase como público.');
      }
      throw new Error(`Falha no servidor de arquivos: ${uploadError.message}`);
    }

    // 4. Retornar URL Pública
    const { data: { publicUrl } } = supabase.storage
      .from('uploads')
      .getPublicUrl(filePath);

    return publicUrl;
  }
};