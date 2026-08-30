# Mettre le site en ligne (vraie connexion, vrai contact, vrai paiement)

Ton site reste hébergé sur **GitHub Pages** (statique). Il s'appuie sur 3 services externes gratuits pour la partie "dynamique" :

| Besoin | Service | Pourquoi |
|---|---|---|
| Connexion / création de compte | **Supabase** | GitHub Pages ne peut pas stocker de comptes lui-même |
| Paiement Stripe | **Cloudflare Workers** | La clé secrète Stripe ne doit JAMAIS être dans le HTML/JS public |
| Formulaire de contact | **Web3Forms** | Envoie un vrai email sans backend |

---

## 1. Supabase (connexion)

1. Crée un compte sur https://supabase.com → **New project**.
2. Dans **Authentication > Providers**, vérifie que "Email" est activé.
3. Dans **Authentication > Settings**, tu peux désactiver "Confirm email" si tu veux que les comptes soient utilisables immédiatement sans clic de confirmation (sinon garde-le activé, c'est plus sûr).
4. Va dans **Project Settings > API** et copie :
   - `Project URL` → colle-le dans `config.js` → `SUPABASE_URL`
   - `anon public` key → colle-la dans `config.js` → `SUPABASE_ANON_KEY`
5. C'est tout — `login.html` et `index.html` sont déjà câblés dessus.

## 2. Cloudflare Worker (paiement Stripe)

1. Récupère ta clé secrète Stripe : Dashboard Stripe → **Développeurs > Clés API** → `Clé secrète` (commence par `sk_test_...` en mode test, `sk_live_...` en production). **Ne la mets jamais dans le site**, uniquement dans le Worker.
2. Installe l'outil Cloudflare (une fois, sur ton ordinateur) :
   ```
   npm install -g wrangler
   wrangler login
   ```
3. Dans le dossier du site, crée `wrangler.toml` :
   ```toml
   name = "seiko-mod-api"
   main = "worker.js"
   compatibility_date = "2024-01-01"

   [vars]
   SUCCESS_URL = "https://TON-USER.github.io/TON-REPO/success.html"
   CANCEL_URL = "https://TON-USER.github.io/TON-REPO/index.html"
   ALLOWED_ORIGIN = "https://TON-USER.github.io"
   ```
4. Ajoute la clé secrète (elle ne sera jamais visible publiquement) :
   ```
   wrangler secret put STRIPE_SECRET_KEY
   ```
   (colle ta clé quand demandé)
5. Déploie :
   ```
   wrangler deploy
   ```
6. Wrangler te donne une URL du type `https://seiko-mod-api.tonpseudo.workers.dev` → colle-la dans `config.js` → `STRIPE_WORKER_URL`.

**Test avant de passer en vrai paiement :** utilise ta clé Stripe `sk_test_...` et la carte de test `4242 4242 4242 4242` (date future, CVC quelconque) pour vérifier tout le tunnel d'achat avant de basculer sur `sk_live_...`.

## 3. Web3Forms (contact)

1. Va sur https://web3forms.com, entre ton email → tu reçois une **clé d'accès** gratuite (pas de mot de passe à gérer).
2. Colle-la dans `config.js` → `WEB3FORMS_ACCESS_KEY`.
3. Chaque message envoyé depuis le site arrivera directement dans ta boîte mail.

## 4. Mettre à jour et publier

1. Remplace les valeurs dans `config.js`.
2. Pousse tous les fichiers (`index.html`, `login.html`, `success.html`, `config.js`, images) sur la branche que GitHub Pages sert.
3. Teste : créer un compte, se connecter, envoyer un message de contact, faire un paiement test.

---

## ⚠️ À faire avant d'ouvrir la boutique au public

Les deux montres actuelles reproduisent sur le cadran des mentions déposées par Rolex (*Oyster Perpetual*, *Superlative Chronometer Officially Certified*, *Daytona*). J'ai renommé le produit "Daytona panda" → "chronographe panda" dans les textes du site, mais **les photos elles-mêmes (`panda.jpg`, `images.jpg`) contiennent encore ce texte sur le cadran** — il faudra les remplacer par des photos où ce texte a été retiré ou modifié avant de vendre réellement, sans quoi le risque juridique (contrefaçon de marque) et le risque Stripe (fermeture de compte pour violation des CGU) restent entiers.

## Pour aller plus loin (non inclus ici, dis-moi si tu veux que je le fasse)

- Webhook Stripe pour enregistrer automatiquement les commandes payées et envoyer un email de confirmation personnalisé.
- Page "Mon compte" listant l'historique de commandes d'un utilisateur connecté.
- Mentions légales / CGV (obligatoires en France pour un site marchand).
