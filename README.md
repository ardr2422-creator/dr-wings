# C'est Mon Dessert

Site e-commerce de livraison de desserts (tiramisus, donuts, beignets XL, bubble tea, coffrets) en Île-de-France. Préparé le soir, livré tard, jusqu'à 4h30.

## Stack

Site statique multi-pages (HTML / CSS / JS vanilla), hébergé sur Vercel (`framework: null`), avec fonctions serverless pour la commande et le contact. Panier en `localStorage`. Aucun runtime de framework, pensé pour la performance mobile.

## Lancer en local

```bash
npm install
npm run dev        # http://localhost:3000  (ou PORT=2000 npm run dev)
```

Le serveur statique (`server.js`) sert aussi `/api/order` et `/api/contact` en local.

## Structure

- `index.html`, `menu.html`, `panier.html`, `notre-histoire.html`, `nous-trouver.html`, `contact.html`, `404.html`, pages légales
- `assets/css/style.css` — design system (tokens, composants)
- `assets/js/` — `products.js` (catalogue, source unique), `cart.js` (panier + drawer), `menu.js` (carte), `checkout.js`, `locator.js` + `locations-data.js`, `reviews.js`, `main.js`
- `api/order.js`, `api/contact.js` — fonctions serverless (Resend)
- `images/` — logo, illustrations, photos produits

## Configuration à compléter

1. **Numéro WhatsApp** : `CMD_CONFIG.whatsapp` dans `assets/js/products.js` (placeholder actuel).
2. **Emails** : variables Vercel `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` (voir `.env.example`). Sans elles, la commande reste valide via WhatsApp et l'email est désactivé proprement.
3. **Domaine** : remplacer `cestmondessert.fr` dans les balises `canonical` / `og:` et `sitemap.xml`.
4. **Mentions légales** : compléter la raison sociale et les coordonnées du responsable de traitement.

## Sécurité

Validation client et serveur sur les formulaires, recalcul du total de commande côté serveur, échappement systématique, en-têtes durcis (CSP, HSTS, X-Frame-Options) dans `vercel.json`, aucun secret en dur.
