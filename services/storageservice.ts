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

    // 1. Verifica se o usuário está realmente logado (Requisito de Segurança RLS)
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (!session || !session.user) {
      console.error('Erro: Usuário não autenticado para upload');
      alert('Sua sessão expirou ou você não está logado. Por favor, faça login novamente antes de enviar a imagem.');
      throw new Error('Usuário não logado');
    }

    console.log('Usuário autenticado para upload:', session.user.id);

    // 2. Gerar nome de arquivo único para evitar colisões
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    console.log(`[STORAGE] Iniciando upload para: uploads/${filePath}`);

    // 3. Executar Upload no bucket 'uploads'
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

    // 4. Obter URL Pública (Certifique-se que o bucket 'uploads' é público no Supabase)
    const { data: { publicUrl } } = supabase.storage
      .from('uploads')
      .getPublicUrl(filePath);

    console.log('Upload sucesso:', publicUrl);
    return publicUrl;
  }
};