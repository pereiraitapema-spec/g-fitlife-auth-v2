import { supabase } from '../backend/supabaseClient';

/**
 * SERVIÇO DE STORAGE G-FITLIFE
 * Padroniza o envio de mídia para o bucket corporativo 'uploads'.
 * Regra de Segurança: Requer sessão ativa (auth.uid() IS NOT NULL).
 */

export const storageService = {
  async upload(file: File, folder: string = 'public'): Promise<string> {
    if (!supabase) {
      console.error("[GFIT-STORAGE] Supabase não inicializado.");
      throw new Error('Sistema de arquivos offline.');
    }

    // 1. Validação de Sessão Obrigatória para cumprir RLS
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (!session || !session.user || sessionError) {
      const msg = 'Sua sessão expirou ou você não está logado. Upload negado.';
      console.warn('[GFIT-STORAGE]', msg);
      alert(msg);
      throw new Error('Não autorizado');
    }

    // 2. Preparação do arquivo
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    console.log(`[STORAGE] Iniciando upload: uploads/${filePath} (User: ${session.user.id})`);

    // 3. Executar Upload no bucket 'uploads'
    const { data, error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('[GFIT-STORAGE-ERROR]', uploadError);
      
      // Tratamento de erros comuns
      if (uploadError.message.includes('bucket not found')) {
        throw new Error('O bucket "uploads" não foi encontrado no Supabase. Crie-o como público.');
      }
      if (uploadError.message.includes('row-level security')) {
        throw new Error('Permissão negada pela política RLS do storage.');
      }
      
      throw new Error(`Erro no servidor de arquivos: ${uploadError.message}`);
    }

    // 4. Gerar e retornar URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('uploads')
      .getPublicUrl(filePath);

    return publicUrl;
  }
};