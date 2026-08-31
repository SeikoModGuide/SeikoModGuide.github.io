/**
 * Cloudflare Worker — crée des sessions Stripe Checkout pour le site
 * "Guide Seiko Mod" hébergé sur GitHub Pages.
 *
 * Déploiement : voir README-DEPLOIEMENT.md
 *
 * Variables/secrets attendus (Cloudflare Dashboard > Worker > Settings > Variables) :
 *   STRIPE_SECRET_KEY  (secret, ex: sk_live_... ou sk_test_...)
 *   SUCCESS_URL        (var, ex: https://tonuser.github.io/tonrepo/success.html)
 *   CANCEL_URL          (var, ex: https://tonuser.github.io/tonrepo/index.html)
 *   ALLOWED_ORIGIN      (var, ex: https://tonuser.github.io)
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const corsHeaders = {
      "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN || "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (url.pathname === "/create-checkout-session" && request.method === "POST") {
      try {
        const { items } = await request.json();

        if (!Array.isArray(items) || items.length === 0) {
          return json({ error: "Panier vide." }, 400, corsHeaders);
        }

        // Validation basique des montants côté serveur (ne jamais faire confiance au client)
        for (const item of items) {
          if (typeof item.price !== "number" || item.price <= 0 || item.price > 5000) {
            return json({ error: "Article invalide." }, 400, corsHeaders);
          }
          if (typeof item.qty !== "number" || item.qty <= 0 || item.qty > 20) {
            return json({ error: "Quantité invalide." }, 400, corsHeaders);
          }
        }

        const params = new URLSearchParams();
        params.append("mode", "payment");
        params.append("success_url", env.SUCCESS_URL + "?session_id={CHECKOUT_SESSION_ID}");
        params.append("cancel_url", env.CANCEL_URL);

        items.forEach((item, i) => {
          params.append(`line_items[${i}][quantity]`, String(item.qty));
          params.append(`line_items[${i}][price_data][currency]`, "eur");
          params.append(
            `line_items[${i}][price_data][unit_amount]`,
            String(Math.round(item.price * 100))
          );
          params.append(
            `line_items[${i}][price_data][product_data][name]`,
            String(item.name).slice(0, 200)
          );
        });

        const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: params.toString(),
        });

        const session = await stripeRes.json();

        if (!stripeRes.ok) {
          return json({ error: session.error?.message || "Erreur Stripe." }, 500, corsHeaders);
        }

        return json({ url: session.url }, 200, corsHeaders);
      } catch (err) {
        return json({ error: err.message || "Erreur serveur." }, 500, corsHeaders);
      }
    }

    // ---- Webhook Stripe (confirmation de paiement) ----
    // Optionnel pour un premier lancement : Stripe Dashboard montre déjà les paiements reçus.
    // Voir README-DEPLOIEMENT.md si tu veux automatiser l'envoi d'un email de confirmation
    // ou l'enregistrement des commandes.
    if (url.pathname === "/webhook" && request.method === "POST") {
      return new Response("ok", { status: 200 });
    }

    return new Response("Not found", { status: 404, headers: corsHeaders });
  },
};

function json(body, status, headers) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, "Content-Type": "application/json" },
  });
}
