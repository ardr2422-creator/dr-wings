/* =====================================================================
   C'EST MON DESSERT — Catalogue produits (source unique)
   Prix en euros. Images : photos officielles du réseau.
   ===================================================================== */
(function () {
  "use strict";

  var IMG = "images/images/menu_images_complet_cest_mon_dessert/";

  window.CMD_CATEGORIES = [
    {
      id: "tiramisus",
      nom: "Tiramisus bowls",
      tagline: "Le crémeux qui fait fermer les yeux. Servis bien froids, dans leur bol.",
      items: [
        {
          id: "tira-bueno-white",
          nom: "Tiramisu Bueno White",
          prix: 8.90,
          desc: "Crème Bueno White, éclats de Bueno blanc sur le dessus. Doux, lacté, dangereusement facile à finir.",
          img: IMG + "TIRAMISUS_BOWLS/01_TIRAMISU_BUENO_WHITE.jpg",
          tags: ["star"]
        },
        {
          id: "tira-chocobon-nutella",
          nom: "Tiramisu Chocobon Nutella",
          prix: 8.90,
          desc: "Nutella, éclats de Chocobon et cookies croquants. La cuillère traverse le crémeux et tombe sur le croquant.",
          img: IMG + "TIRAMISUS_BOWLS/02_TIRAMISU_CHOCOBON_NUTELLA.jpg",
          tags: []
        },
        {
          id: "tira-speculoos-nutella",
          nom: "Tiramisu Spéculoos Nutella",
          prix: 8.90,
          desc: "Nutella fondant et spéculoos concassé. Le duo qui ne rate jamais son effet.",
          img: IMG + "TIRAMISUS_BOWLS/03_TIRAMISU_SPECULOOS_NUTELLA.jpg",
          tags: ["star"]
        },
        {
          id: "tira-kinder-country",
          nom: "Tiramisu Kinder Country",
          prix: 8.90,
          desc: "Nutella fondant, éclats de Kinder Country croquants. Le goûter d'enfance en version bol.",
          img: IMG + "TIRAMISUS_BOWLS/04_TIRAMISU_KINDER_COUNTRY.jpg",
          tags: []
        },
        {
          id: "tira-speculoos-caramel",
          nom: "Tiramisu Spéculoos Caramel",
          prix: 8.90,
          desc: "Spéculoos croquant et caramel fondant. Sucré, beurré, réconfortant jusqu'à la dernière cuillère.",
          img: IMG + "TIRAMISUS_BOWLS/05_TIRAMISU_SPECULOOS_CARAMEL.jpg",
          tags: []
        },
        {
          id: "tira-bueno-bueno",
          nom: "Tiramisu Bueno Bueno",
          prix: 12.90,
          desc: "Double dose : crème Bueno et copeaux de Kinder Bueno. Le grand format pour les soirs sans compromis.",
          img: IMG + "TIRAMISUS_BOWLS/06_TIRAMISU_BUENO_BUENO.jpg",
          tags: ["xl"]
        }
      ]
    },
    {
      id: "donuts",
      nom: "Box donuts",
      tagline: "Quatre donuts moelleux, glacés et garnis. La boîte qu'on ouvre à plusieurs (ou pas).",
      items: [
        {
          id: "box-kinder-cream",
          nom: "Box Kinder Cream",
          prix: 14.90,
          desc: "Quatre donuts : Kinder Country Nutella, Nutella White, Kinder Maxi White, Bueno White. La box la plus chocolatée de la carte.",
          img: IMG + "BOX_DONUTS/01_BOX_KINDER_CREAM.jpg",
          tags: ["star"]
        },
        {
          id: "box-american-cream",
          nom: "Box American Cream",
          prix: 14.90,
          desc: "Quatre donuts : Spéculoos Nutella, Brownie White, Snickers Nutella, Oreo White. Direction le coffee shop américain.",
          img: IMG + "BOX_DONUTS/02_BOX_AMERICAN_CREAM.jpg",
          tags: []
        }
      ]
    },
    {
      id: "beignets",
      nom: "Box beignets XL",
      tagline: "Des beignets gonflés, fourrés à cœur. On mord, ça coule.",
      items: [
        {
          id: "kinder-maxi-duo",
          nom: "Kinder Maxi Duo",
          prix: 12.90,
          desc: "Deux beignets XL : un Kinder Maxi fourré Nutella, un Kinder Maxi White fourré fraise. Le sucré et le fruité, côte à côte.",
          img: IMG + "BOX_BEIGNETS_XL/01_KINDER_MAXI_DUO.jpg",
          tags: []
        },
        {
          id: "box-xl-nutella-white",
          nom: "Box XL Nutella White",
          prix: 15.90,
          desc: "Quatre beignets fourrés Nutella : spéculoos, chocobon blanc, caramel, Bueno White. La box pour les vrais gourmands de Nutella.",
          img: IMG + "BOX_BEIGNETS_XL/02_BOX_XL_NUTELLA_WHITE.jpg",
          tags: ["xl"]
        }
      ]
    },
    {
      id: "boissons",
      nom: "Bubble tea & boissons",
      tagline: "Les perles qui éclatent, les sirops qui rafraîchissent. À siroter avec le dessert.",
      items: [
        {
          id: "bubble-fraise-peche",
          nom: "Bubble Tea Fraise Pêche",
          prix: 5.90,
          desc: "Thé glacé fraise et pêche, perles de tapioca gourmandes au fond du gobelet.",
          img: IMG + "BOISSONS_BUBBLE_TEA/01_BUBBLE_TEA_FRAISE_PECHE.jpg",
          tags: ["star"]
        },
        {
          id: "bubble-mangue-passion",
          nom: "Bubble Tea Mangue Passion",
          prix: 5.90,
          desc: "Mangue et fruit de la passion, perles fondantes. L'évasion tropicale en gobelet.",
          img: IMG + "BOISSONS_BUBBLE_TEA/02_BUBBLE_TEA_MANGUE_PASSION.jpg",
          tags: []
        },
        {
          id: "red-velvet",
          nom: "Red Velvet Fruits Rouges",
          prix: 5.90,
          desc: "Sirop fraise et grenadine, robe rouge profonde. Fruité, vif, gourmand.",
          img: IMG + "BOISSONS_BUBBLE_TEA/03_RED_VELVET_FRUITS_ROUGES.jpg",
          tags: []
        },
        {
          id: "do-brazil",
          nom: "Do Brazil Curaçao Passion",
          prix: 5.90,
          desc: "Blue Curaçao et passion, mélange exotique bleu lagon. Celui qu'on commande pour la couleur, qu'on garde pour le goût.",
          img: IMG + "BOISSONS_BUBBLE_TEA/04_DO_BRAZIL_CURACAO_PASSION.jpg",
          tags: []
        }
      ]
    },
    {
      id: "coffrets",
      nom: "Coffrets gourmands",
      tagline: "Tout réuni dans une boîte. L'offre à dégainer quand on reçoit.",
      items: [
        {
          id: "coffret-bleus",
          nom: "Coffret Allez les Bleus !",
          prix: 29.90,
          desc: "Deux tiramisus au choix plus une box au choix (donuts ou beignets). De quoi régaler la tablée d'un seul coup.",
          img: IMG + "COFFRETS_GOURMANDS/01_COFFRET_ALLEZ_LES_BLEUS.jpg",
          tags: ["star"]
        }
      ]
    }
  ];

  /* Index plat id -> produit (+ catégorie) pour le panier */
  var map = {};
  window.CMD_CATEGORIES.forEach(function (cat) {
    cat.items.forEach(function (p) {
      map[p.id] = {
        id: p.id,
        nom: p.nom,
        prix: p.prix,
        img: p.img,
        cat: cat.nom
      };
    });
  });
  window.CMD_PRODUCT_MAP = map;

  /* Helpers de formatage partagés */
  window.CMD_FORMAT = {
    price: function (n) {
      return n.toFixed(2).replace(".", ",") + " €";
    }
  };

  /* Config marque — à compléter par l'équipe (numéro WhatsApp réel, etc.) */
  window.CMD_CONFIG = {
    whatsapp: "33600000000", // format international sans +, à remplacer par le vrai numéro
    instagram: "https://www.instagram.com/cestmondessertofficiel/",
    ubereats: "https://www.ubereats.com/fr/store/cest-mon-dessert/oUGzjJaMVGSAT-oWrFMP5w"
  };
})();
