import React, { useState } from 'react'; import { ChevronDown, MapPin, Phone, Mail, Clock, Facebook, Instagram, Twitter } from 'lucide-react'; export default function ChickenStory() { const [currentPage, setCurrentPage] = useState('home'); const [scrollY, setScrollY] = useState(0); React.useEffect(() => { const handleScroll = () => setScrollY(window.scrollY); window.addEventListener('scroll', handleScroll); return () => window.removeEventListener('scroll', handleScroll); }, []); const menuItems = [ { category: 'Classiques', items: [ { name: 'Poulet rôti fermier', description: 'Élevé en plein air, aromatisé aux herbes de Provence', price: '18€' }, { name: 'Ailes croustillantes', description: 'Marinade maison 24h, sauce BBQ artisanale', price: '12€' }, { name: 'Brochettes de poulet', description: 'Marinade citron-thym, grillades tendres', price: '14€' } ]}, { category: 'Spécialités', items: [ { name: 'Poulet fermier en croûte de sel', description: 'Texture incomparable, cuisson lente', price: '22€' }, { name: 'Cou farcis aux truffes', description: 'Farce de foie gras et champignons de Paris', price: '24€' }, { name: 'Aiguillettes aux poivres', description: 'Sélection de poivres du monde', price: '16€' } ]}, { category: 'Accompagnements', items: [ { name: 'Frites maison', description: 'Cuites deux fois, sel de Guérande', price: '5€' }, { name: 'Légumes de saison rôtis', description: 'Provenance locale', price: '6€' }, { name: 'Sauce maison (50ml)', description: 'Aïoli, BBQ ou herbes', price: '2€' } ]} ]; const avis = [ { author: 'Marie D.', rating: 5, text: 'Meilleur poulet de la région ! Les arômes, la tendreté... absolument délicieux. J\'y reviens chaque semaine.' }, { author: 'Jean-Paul M.', rating: 5, text: 'Une vraie cuisine d\'excellence. Le chef maîtrise parfaitement la cuisson. À recommander sans hésiter !' }, { author: 'Sophie B.', rating: 5, text: 'Accueil chaleureux, ambiance agréable et surtout une qualité de viande exceptionnelle.' } ]; const renderPage = () => { switch(currentPage) { case 'home': return (
{/* Hero Section */}
Chicken Story
Un voyage culinaire autour du poulet fermier

{/* Présentation */}
Bienvenue chez Chicken Story
Depuis 2015, nous vous servons le meilleur poulet fermier de la région. Nos volailles proviennent de petits élevages locaux pratiquant l'élevage en liberté. Chaque pièce est préparée avec passion et savoir-faire pour sublimer la saveur naturelle de la viande.

100%
Fermiers locaux

8h
Cuisson lente

30+
Ans d'expérience

{/* Call to Action */}
setCurrentPage('menu')} className="inline-block px-8 py-3 bg-green-700 text-white text-lg font-medium rounded-lg hover:bg-green-800 transition-colors"> Voir le menu
); case 'menu': return (
Notre Menu
{menuItems.map((section, idx) => (
{section.category}
{section.items.map((item, i) => (
{item.name}

{item.description}

{item.price}

))}
))}
); case 'avis': return (
Avis de nos clients
{avis.map((av, idx) => (
{av.author}

{[...Array(av.rating)].map((_, i) => ( ★ ))}
{av.text}

))}
); case 'contact': return (
Contactez-nous
Adresse
42, Rue des Saveurs
75010 Paris

Téléphone
+33 (0)1 23 45 67 89

Horaires
Lun-Jeu: 11h30-22h
Ven-Sam: 11h30-23h
Dimanche: 12h-22h

Carte interactive à intégrer

Suivez-nous
); case 'apropos': return (
À propos
Chicken Story est née d'une passion pour la gastronomie simple et authentique. En 2015, notre équipe a décidé de sublimer un ingrédient classique : le poulet fermier.

Nous travaillons exclusivement avec des petits éleveurs locaux qui pratiquent l'élevage en liberté, offrant à nos volailles une vie respectueuse et une saveur incomparable.

Chaque poulet est cuisiné selon des recettes traditionelles, avec des techniques de cuisson lente qui préservent la tendreté et les arômes délicats de la viande.

Notre mission : vous offrir une expérience culinaire inoubliable, où la qualité prime sur la quantité.

); } }; return (
{/* Navigation */}
setCurrentPage('home')}> Chicken Story
{['home', 'menu', 'apropos', 'avis', 'contact'].map(page => ( setCurrentPage(page)} className={`font-light transition-colors pb-2 border-b-2 ${ currentPage === page ? 'text-green-900 border-green-700' : 'text-green-700 border-transparent hover:text-green-900' }`} > {page === 'home' ? 'Accueil' : page === 'menu' ? 'Menu' : page === 'apropos' ? 'À propos' : page === 'avis' ? 'Avis' : 'Contact'}
))}
{/* Main Content */}
{renderPage()}
{/* Footer */}
© 2024 Chicken Story. Tous droits réservés.

Qualité • Authenticité • Passion

); }