/**
 * Configuração do Firebase Storage
 * Configura credenciais e bucket para upload de imagens
 */

const { Storage } = require('@google-cloud/storage');

// Configuração do Firebase Storage
const FIREBASE_CONFIG = {
    // Nome do bucket (substitua pelo seu)
    BUCKET_NAME: process.env.FIREBASE_STORAGE_BUCKET || 'compreaqui-324df.appspot.com',
    
    // Credenciais (opcional - pode usar Application Default Credentials)
    KEY_FILE: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    
    // Configurações de cache
    CACHE_HEADERS: {
        cacheControl: 'public, max-age=31536000, immutable',
        metadata: {
            optimized: 'true',
            version: '1.0'
        }
    }
};

/**
 * Inicializa o cliente do Firebase Storage
 */
function initializeStorage() {
    const options = {};
    
    // Se tiver arquivo de credenciais, use ele
    if (FIREBASE_CONFIG.KEY_FILE) {
        options.keyFilename = FIREBASE_CONFIG.KEY_FILE;
    }
    
    return new Storage(options);
}

/**
 * Verifica se o bucket existe e está acessível
 */
async function verifyBucket() {
    try {
        const storage = initializeStorage();
        const bucket = storage.bucket(FIREBASE_CONFIG.BUCKET_NAME);
        
        const [exists] = await bucket.exists();
        if (!exists) {
            throw new Error(`Bucket ${FIREBASE_CONFIG.BUCKET_NAME} não encontrado`);
        }
        
        console.log(`✅ Bucket verificado: ${FIREBASE_CONFIG.BUCKET_NAME}`);
        return true;
    } catch (error) {
        console.error('❌ Erro ao verificar bucket:', error.message);
        console.log('\n💡 SOLUÇÕES:');
        console.log('1. Verifique se o bucket existe no Firebase Console');
        console.log('2. Configure as credenciais:');
        console.log('   export GOOGLE_APPLICATION_CREDENTIALS="caminho/para/service-account.json"');
        console.log('3. Ou use: firebase login');
        return false;
    }
}

/**
 * Lista arquivos no bucket
 */
async function listFiles(folder = '') {
    try {
        const storage = initializeStorage();
        const bucket = storage.bucket(FIREBASE_CONFIG.BUCKET_NAME);
        
        const [files] = await bucket.getFiles({ prefix: folder });
        
        console.log(`📁 Arquivos em ${folder}:`);
        files.forEach(file => {
            console.log(`  - ${file.name} (${file.metadata.size} bytes)`);
        });
        
        return files;
    } catch (error) {
        console.error('❌ Erro ao listar arquivos:', error.message);
        return [];
    }
}

/**
 * Deleta arquivos antigos (opcional)
 */
async function cleanupOldFiles(folder = '') {
    try {
        const storage = initializeStorage();
        const bucket = storage.bucket(FIREBASE_CONFIG.BUCKET_NAME);
        
        const [files] = await bucket.getFiles({ prefix: folder });
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        let deletedCount = 0;
        
        for (const file of files) {
            const created = new Date(file.metadata.timeCreated);
            if (created < oneWeekAgo) {
                await file.delete();
                console.log(`🗑️ Deletado: ${file.name}`);
                deletedCount++;
            }
        }
        
        console.log(`✅ ${deletedCount} arquivos antigos removidos`);
        return deletedCount;
    } catch (error) {
        console.error('❌ Erro ao limpar arquivos:', error.message);
        return 0;
    }
}

module.exports = {
    FIREBASE_CONFIG,
    initializeStorage,
    verifyBucket,
    listFiles,
    cleanupOldFiles
};






