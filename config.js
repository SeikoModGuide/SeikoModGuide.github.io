// ⚠️ Ce fichier est PUBLIC (visible dans le code source du site).
// Ne jamais y mettre de clé secrète (ex: clé secrète Stripe sk_live_...).
// Seules des clés "publiques"/"anon" doivent apparaître ici.

// --- Supabase (authentification) ---
// Dashboard Supabase > Project Settings > API
window.SUPABASE_URL = "https://ogrfixpuuhrzcizvddhj.supabase.co";
window.SUPABASE_ANON_KEY = "sb_publishable_Y92hkwd73s3gey4xvSXY5Q_nnnv6bg3";

// --- Cloudflare Worker (création des paiements Stripe) ---
// URL de votre Worker déployé (voir worker.js + README)
window.STRIPE_WORKER_URL = "https://seiko-mod-api.sk-mod-api-8x2qq.workers.dev";

// --- Web3Forms (envoi du formulaire de contact par email) ---
// Clé d'accès gratuite obtenue sur https://web3forms.com
window.WEB3FORMS_ACCESS_KEY = "VOTRE_CLE_WEB3FORMS";
