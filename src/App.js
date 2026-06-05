import React, { useState } from 'react';
import { MapPin, Phone, Clock, Facebook, Instagram, Twitter } from 'lucide-react';

export default function ChickenStory() {
  const [currentPage, setCurrentPage] = useState('home');

  const menuItems = [
    {
      category: 'Classiques',
      items: [
        { name: 'Poulet rôti fermier', description: 'Élevé en plein air, aromatisé aux herbes de Provence', price: '18€' },
        { name: 'Ailes croustillantes', description: 'Marinade maison 24h, sauce BBQ artisanale', price: '12€' },
        { name: 'Brochettes de poulet', description: 'Marinade citron-thym, grillades tendres', price: '14€' }
      ]
    },
    {
      category: 'Spécialités',
      items: [
        { name: 'Poulet fermier en croûte de sel', description: 'Texture incomparable, cuisson lente', price: '22€' },
        { name: 'Cou farcis aux truffes', description: 'Farce de foie gras et champignons de Paris', price: '24€' },
        { name: 'Aiguillettes aux poivres', description: 'Sélection de poivres du monde', price: '16€' }
      ]
    },
    {
      category: 'Accompagnements',
      items: [
        { name: 'Frites maison', description: 'Cuites deux fois, sel de Guérande', price: '5€' },
        { name: 'Légumes de saison rôtis', description: 'Provenance locale', price: '6€' },
        { name: 'Sauce maison (50ml)', description: 'Aïoli, BBQ ou herbes', price: '2€' }
      ]
    }
  ];

  const avis = [
    { author: 'Marie D.', rating: 5, text: 'Meilleur poulet de la région ! Les arômes, la tendreté... absolument délicieux. J\'y reviens chaque semaine.' },
    { author: 'Jean-Paul M.', rating: 5, text: 'Une vraie cuisine d\'excellence. Le chef maîtrise parfaitement la cuisson. À recommander sans hésiter !' },
    { author: 'Sophie B.', rating: 5, text: 'Accueil chaleureux, ambiance agréable et surtout une qualité de viande exceptionnelle.' }
  ];

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <div style={{ animation: 'fadeIn 0.6s ease-out' }}>
            <div style={{ background: 'linear-gradient(to bottom, #f0fdf4, #ffffff)', paddingTop: '80px', paddingBottom: '60px', textAlign: 'center' }}>
              <h1 style={{ fontSize: '48px', fontWeight: '300', color: '#1b5e20', marginBottom: '16px' }}>Chicken Story</h1>
              <p style={{ fontSize: '18px', color: '#558b2f' }}>Un voyage culinaire autour du poulet fermier</p>
            </div>

            <section style={{ maxWidth: '1024px', margin: '0 auto', padding: '64px 24px', textAlign: 'center' }}>
              <h2 style={{ fontSize: '32px', fontWeight: '300', color: '#1b5e20', marginBottom: '24px' }}>Bienvenue chez Chicken Story</h2>
              <p style={{ color: '#558b2f', lineHeight: '1.8', fontSize: '18px', marginBottom: '32px' }}>
                Depuis 2015, nous vous servons le meilleur poulet fermier de la région. Nos volailles proviennent de petits élevages locaux pratiquant l'élevage en liberté. Chaque pièce est préparée avec passion et savoir-faire pour sublimer la saveur naturelle de la viande.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px', marginTop: '48px' }}>
                <div>
                  <div style={{ fontSize: '40px', fontWeight: '300', color: '#b8860b', marginBottom: '8px' }}>100%</div>
                  <p style={{ fontSize: '14px', color: '#558b2f' }}>Fermiers locaux</p>
                </div>
                <div>
                  <div style={{ fontSize: '40px', fontWeight: '300', color: '#b8860b', marginBottom: '8px' }}>8h</div>
                  <p style={{ fontSize: '14px', color: '#558b2f' }}>Cuisson lente</p>
                </div>
                <div>
                  <div style={{ fontSize: '40px', fontWeight: '300', color: '#b8860b', marginBottom: '8px' }}>30+</div>
                  <p style={{ fontSize: '14px', color: '#558b2f' }}>Ans d'expérience</p>
                </div>
              </div>
            </section>

            <section style={{ maxWidth: '1024px', margin: '0 auto', padding: '48px 24px', textAlign: 'center' }}>
              <button onClick={() => setCurrentPage('menu')} style={{ padding: '12px 32px', backgroundColor: '#2d5016', color: 'white', fontSize: '18px', fontWeight: '500', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                Voir le menu
              </button>
            </section>
          </div>
        );

      case 'menu':
        return (
          <div style={{ maxWidth: '1024px', margin: '0 auto', padding: '48px 24px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '300', color: '#1b5e20', marginBottom: '48px', textAlign: 'center' }}>Notre Menu</h2>
            {menuItems.map((section, idx) => (
              <div key={idx} style={{ marginBottom: '48px' }}>
                <h3 style={{ fontSize: '24px', fontWeight: '300', color: '#2d5016', marginBottom: '24px', paddingBottom: '12px', borderBottom: '1px solid #ffd699' }}>{section.category}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {section.items.map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: '500', color: '#1b5e20' }}>{item.name}</p>
                        <p style={{ fontSize: '14px', color: '#558b2f' }}>{item.description}</p>
                      </div>
                      <p style={{ fontWeight: '500', color: '#b8860b', whiteSpace: 'nowrap' }}>{item.price}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );

      case 'avis':
        return (
          <div style={{ maxWidth: '1024px', margin: '0 auto', padding: '48px 24px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '300', color: '#1b5e20', marginBottom: '48px', textAlign: 'center' }}>Avis de nos clients</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {avis.map((av, idx) => (
                <div key={idx} style={{ padding: '24px', backgroundColor: '#faf5f0', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <p style={{ fontWeight: '500', color: '#1b5e20' }}>{av.author}</p>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {[...Array(av.rating)].map((_, i) => (
                        <span key={i} style={{ color: '#b8860b' }}>★</span>
                      ))}
                    </div>
                  </div>
                  <p style={{ color: '#558b2f', fontStyle: 'italic' }}>{av.text}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'contact':
        return (
          <div style={{ maxWidth: '1024px', margin: '0 auto', padding: '48px 24px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '300', color: '#1b5e20', marginBottom: '48px', textAlign: 'center' }}>Contactez-nous</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '48px' }}>
              <div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <MapPin style={{ color: '#2d5016', flexShrink: 0 }} size={24} />
                    <div>
                      <h3 style={{ fontWeight: '500', color: '#1b5e20', marginBottom: '4px' }}>Adresse</h3>
                      <p style={{ color: '#558b2f' }}>42, Rue des Saveurs<br />75010 Paris</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <Phone style={{ color: '#2d5016', flexShrink: 0 }} size={24} />
                    <div>
                      <h3 style={{ fontWeight: '500', color: '#1b5e20', marginBottom: '4px' }}>Téléphone</h3>
                      <p style={{ color: '#558b2f' }}>+33 (0)1 23 45 67 89</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <Clock style={{ color: '#2d5016', flexShrink: 0 }} size={24} />
                    <div>
                      <h3 style={{ fontWeight: '500', color: '#1b5e20', marginBottom: '4px' }}>Horaires</h3>
                      <p style={{ color: '#558b2f' }}>Lun-Jeu: 11h30-22h<br />Ven-Sam: 11h30-23h<br />Dimanche: 12h-22h</p>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ height: '256px', backgroundColor: '#f0fdf4', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <MapPin style={{ color: '#2d5016', margin: '0 auto 8px' }} size={32} />
                  <p style={{ color: '#558b2f' }}>Carte interactive à intégrer</p>
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: '#faf5f0', padding: '32px', borderRadius: '8px' }}>
              <h3 style={{ fontWeight: '500', color: '#1b5e20', marginBottom: '16px' }}>Suivez-nous</h3>
              <div style={{ display: 'flex', gap: '16px' }}>
                <a href="#" style={{ color: '#2d5016' }}><Facebook size={24} /></a>
                <a href="#" style={{ color: '#2d5016' }}><Instagram size={24} /></a>
                <a href="#" style={{ color: '#2d5016' }}><Twitter size={24} /></a>
              </div>
            </div>
          </div>
        );

      case 'apropos':
        return (
          <div style={{ maxWidth: '1024px', margin: '0 auto', padding: '48px 24px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '300', color: '#1b5e20', marginBottom: '48px', textAlign: 'center' }}>À propos</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', color: '#558b2f', fontSize: '18px', lineHeight: '1.8' }}>
              <p>
                Chicken Story est née d'une passion pour la gastronomie simple et authentique. En 2015, notre équipe a décidé de sublimer un ingrédient classique : le poulet fermier.
              </p>
              <p>
                Nous travaillons exclusivement avec des petits éleveurs locaux qui pratiquent l'élevage en liberté, offrant à nos volailles une vie respectueuse et une saveur incomparable.
              </p>
              <p>
                Chaque poulet est cuisiné selon des recettes traditionnelles, avec des techniques de cuisson lente qui préservent la tendreté et les arômes délicats de la viande.
              </p>
              <p>
                Notre mission : vous offrir une expérience culinaire inoubliable, où la qualité prime sur la quantité.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', color: '#1f2937' }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      <nav style={{ position: 'sticky', top: 0, zIndex: 50, backgroundColor: '#ffffff', borderBottom: '1px solid #ffd699', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ maxWidth: '1536px', margin: '0 auto', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '300', color: '#1b5e20', cursor: 'pointer' }} onClick={() => setCurrentPage('home')}>
            Chicken Story
          </h1>
          <div style={{ display: 'flex', gap: '32px', fontSize: '14px' }}>
            {[
              { key: 'home', label: 'Accueil' },
              { key: 'menu', label: 'Menu' },
              { key: 'apropos', label: 'À propos' },
              { key: 'avis', label: 'Avis' },
              { key: 'contact', label: 'Contact' }
            ].map(item => (
              <button
                key={item.key}
                onClick={() => setCurrentPage(item.key)}
                style={{
                  fontWeight: '300',
                  transition: 'color 0.3s',
                  paddingBottom: '8px',
                  borderBottom: currentPage === item.key ? '2px solid #2d5016' : '2px solid transparent',
                  color: currentPage === item.key ? '#1b5e20' : '#558b2f',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main style={{ backgroundColor: '#ffffff' }}>
        {renderPage()}
      </main>

      <footer style={{ backgroundColor: '#1b5e20', color: '#f5e6d3', marginTop: '64px' }}>
        <div style={{ maxWidth: '1024px', margin: '0 auto', padding: '32px 24px', textAlign: 'center', fontSize: '14px' }}>
          <p>© 2024 Chicken Story. Tous droits réservés.</p>
          <p style={{ marginTop: '8px', color: '#e8d5c8' }}>Qualité • Authenticité • Passion</p>
        </div>
      </footer>
    </div>
  );
}
