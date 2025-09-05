/**
 * @file SupportPage.tsx
 * @description
 * EN: This page displays help and support features including FAQ, tutorials, and contact support.
 * FR: Cette page affiche les fonctionnalités d'aide et de support incluant la FAQ, les tutoriels et le contact support.
 */
import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserProvider';
import axios from 'axios';

// EN: Icons from Lucide React / FR: Icônes de Lucide React
import { 
  HelpCircle, 
  BookOpen, 
  MessageCircle, 
  Search, 
  ChevronDown, 
  ChevronUp,
  Play,
  Clock,
  Star,
  Send,
  Ticket,
  Mail,
  Phone,
  MapPin,
  ExternalLink
} from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
}

interface Tutorial {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  difficulty: string;
  steps: string[];
  videoUrl: string;
  thumbnail: string;
}

interface SupportTicket {
  ticketId: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function SupportPage() {
  const { user, token } = useUser();
  
  // EN: State management / FR: Gestion d'état
  const [activeTab, setActiveTab] = useState('faq');
  const [faq, setFaq] = useState<FAQItem[]>([]);
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [showTicketForm, setShowTicketForm] = useState(false);
  
  // EN: Form states / FR: États des formulaires
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: 'general'
  });
  
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    category: 'technical',
    priority: 'medium',
    description: ''
  });

  // EN: Load FAQ data / FR: Charger les données FAQ
  const loadFAQ = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/support/faq`, {
        params: { category: selectedCategory === 'all' ? undefined : selectedCategory }
      });
      setFaq(data.faq);
    } catch (error) {
      console.error('EN: Error loading FAQ / FR: Erreur de chargement FAQ:', error);
    }
  };

  // EN: Load tutorials data / FR: Charger les données de tutoriels
  const loadTutorials = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/support/tutorials`, {
        params: { category: selectedCategory === 'all' ? undefined : selectedCategory }
      });
      setTutorials(data.tutorials);
    } catch (error) {
      console.error('EN: Error loading tutorials / FR: Erreur de chargement des tutoriels:', error);
    }
  };

  // EN: Load support tickets / FR: Charger les tickets de support
  const loadTickets = async () => {
    if (!token) return;
    
    try {
      const { data } = await axios.get(`${API_URL}/support/tickets`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTickets(data.tickets);
    } catch (error) {
      console.error('EN: Error loading tickets / FR: Erreur de chargement des tickets:', error);
    }
  };

  // EN: Search FAQ / FR: Rechercher dans la FAQ
  const searchFAQ = async () => {
    if (!searchTerm.trim()) {
      loadFAQ();
      return;
    }

    try {
      const { data } = await axios.get(`${API_URL}/support/faq/search`, {
        params: { q: searchTerm }
      });
      setFaq(data.results);
    } catch (error) {
      console.error('EN: Error searching FAQ / FR: Erreur de recherche FAQ:', error);
    }
  };

  // EN: Submit contact form / FR: Soumettre le formulaire de contact
  const submitContactForm = async () => {
    try {
      await axios.post(`${API_URL}/support/contact`, contactForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setContactForm({ name: '', email: '', subject: '', message: '', category: 'general' });
      setShowContactForm(false);
      alert('Message envoyé au support avec succès !');
    } catch (error) {
      console.error('EN: Error submitting contact form / FR: Erreur de soumission du formulaire de contact:', error);
      alert('Erreur lors de l\'envoi du message');
    }
  };

  // EN: Submit ticket form / FR: Soumettre le formulaire de ticket
  const submitTicketForm = async () => {
    try {
      await axios.post(`${API_URL}/support/tickets`, ticketForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setTicketForm({ subject: '', category: 'technical', priority: 'medium', description: '' });
      setShowTicketForm(false);
      await loadTickets();
      alert('Ticket de support créé avec succès !');
    } catch (error) {
      console.error('EN: Error submitting ticket form / FR: Erreur de soumission du formulaire de ticket:', error);
      alert('Erreur lors de la création du ticket');
    }
  };

  // EN: Load data on component mount / FR: Charger les données au montage du composant
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([
        loadFAQ(),
        loadTutorials(),
        loadTickets()
      ]);
      setIsLoading(false);
    };

    loadData();
  }, [selectedCategory, token]);

  // EN: Search when search term changes / FR: Rechercher quand le terme de recherche change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm) {
        searchFAQ();
      } else {
        loadFAQ();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // EN: Tab configuration / FR: Configuration des onglets
  const tabs = [
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
    { id: 'tutorials', label: 'Tutoriels', icon: BookOpen },
    { id: 'contact', label: 'Contact', icon: MessageCircle },
    { id: 'tickets', label: 'Mes Tickets', icon: Ticket }
  ];

  // EN: Categories for filtering / FR: Catégories pour le filtrage
  const categories = [
    { id: 'all', label: 'Toutes les catégories' },
    { id: 'general', label: 'Général' },
    { id: 'chat', label: 'Chat' },
    { id: 'calls', label: 'Appels' },
    { id: 'media', label: 'Médias' },
    { id: 'settings', label: 'Paramètres' },
    { id: 'privacy', label: 'Confidentialité' }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de l'aide...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* EN: Header / FR: En-tête */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Aide & Support</h1>
              <p className="text-sm text-gray-500">Trouvez des réponses et obtenez de l'aide</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* EN: Sidebar Navigation / FR: Navigation latérale */}
          <div className="lg:col-span-1">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === tab.id
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>

            {/* EN: Category Filter / FR: Filtre de Catégorie */}
            {(activeTab === 'faq' || activeTab === 'tutorials') && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Catégories</h3>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* EN: Content Area / FR: Zone de Contenu */}
          <div className="lg:col-span-3">
            {/* EN: FAQ Tab / FR: Onglet FAQ */}
            {activeTab === 'faq' && (
              <div className="space-y-6">
                {/* EN: Search Bar / FR: Barre de Recherche */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher dans la FAQ..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                {/* EN: FAQ Items / FR: Éléments FAQ */}
                <div className="space-y-4">
                  {faq.map((item) => (
                    <div key={item.id} className="bg-white rounded-lg shadow-sm border">
                      <button
                        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50"
                        onClick={() => setExpandedFAQ(expandedFAQ === item.id ? null : item.id)}
                      >
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{item.question}</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {item.category} • {item.tags.join(', ')}
                          </p>
                        </div>
                        {expandedFAQ === item.id ? (
                          <ChevronUp className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                      
                      {expandedFAQ === item.id && (
                        <div className="px-6 pb-4">
                          <div className="border-t border-gray-200 pt-4">
                            <p className="text-gray-700 leading-relaxed">{item.answer}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {faq.length === 0 && (
                  <div className="text-center py-12">
                    <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune question trouvée</h3>
                    <p className="text-gray-500">
                      {searchTerm ? 'Aucune question ne correspond à votre recherche.' : 'Aucune question disponible dans cette catégorie.'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* EN: Tutorials Tab / FR: Onglet Tutoriels */}
            {activeTab === 'tutorials' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {tutorials.map((tutorial) => (
                    <div key={tutorial.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                      <div className="aspect-video bg-gray-100 flex items-center justify-center">
                        <div className="text-center">
                          <Play className="h-12 w-12 text-indigo-600 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">Vidéo tutoriel</p>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                            {tutorial.category}
                          </span>
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="h-4 w-4 mr-1" />
                            {tutorial.duration}
                          </div>
                        </div>
                        
                        <h3 className="text-lg font-medium text-gray-900 mb-2">{tutorial.title}</h3>
                        <p className="text-gray-600 text-sm mb-4">{tutorial.description}</p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 mr-1" />
                            <span className="text-sm text-gray-500 capitalize">{tutorial.difficulty}</span>
                          </div>
                          <button className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200">
                            <Play className="h-4 w-4 mr-1" />
                            Regarder
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {tutorials.length === 0 && (
                  <div className="text-center py-12">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun tutoriel trouvé</h3>
                    <p className="text-gray-500">Aucun tutoriel disponible dans cette catégorie.</p>
                  </div>
                )}
              </div>
            )}

            {/* EN: Contact Tab / FR: Onglet Contact */}
            {activeTab === 'contact' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* EN: Contact Information / FR: Informations de Contact */}
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Informations de Contact</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <Mail className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Email</p>
                          <p className="text-sm text-gray-500">support@solisakane.com</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <Phone className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Téléphone</p>
                          <p className="text-sm text-gray-500">+33 1 23 45 67 89</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Adresse</p>
                          <p className="text-sm text-gray-500">123 Rue de la Paix, 75001 Paris</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Heures d'ouverture</h4>
                      <p className="text-sm text-gray-500">Lundi - Vendredi: 9h00 - 18h00</p>
                      <p className="text-sm text-gray-500">Samedi: 10h00 - 16h00</p>
                    </div>
                  </div>

                  {/* EN: Contact Form / FR: Formulaire de Contact */}
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Nous Contacter</h3>
                    
                    <form onSubmit={(e) => { e.preventDefault(); submitContactForm(); }} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                        <input
                          type="text"
                          required
                          value={contactForm.name}
                          onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          required
                          value={contactForm.email}
                          onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sujet</label>
                        <input
                          type="text"
                          required
                          value={contactForm.subject}
                          onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                        <select
                          value={contactForm.category}
                          onChange={(e) => setContactForm({ ...contactForm, category: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                          <option value="general">Général</option>
                          <option value="technical">Technique</option>
                          <option value="billing">Facturation</option>
                          <option value="feature">Demande de fonctionnalité</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                        <textarea
                          required
                          rows={4}
                          value={contactForm.message}
                          onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                      
                      <button
                        type="submit"
                        className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Envoyer le Message
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* EN: Tickets Tab / FR: Onglet Tickets */}
            {activeTab === 'tickets' && (
              <div className="space-y-6">
                {token ? (
                  <>
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-medium text-gray-900">Mes Tickets de Support</h2>
                      <button
                        onClick={() => setShowTicketForm(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                      >
                        <Ticket className="h-4 w-4 mr-2" />
                        Nouveau Ticket
                      </button>
                    </div>

                    <div className="space-y-4">
                      {tickets.map((ticket) => (
                        <div key={ticket.ticketId} className="bg-white rounded-lg shadow-sm border p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">{ticket.subject}</h3>
                              <p className="text-sm text-gray-500 mt-1">
                                {ticket.category} • {ticket.priority} • {new Date(ticket.createdAt).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                ticket.status === 'open' ? 'bg-red-100 text-red-800' :
                                ticket.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                                ticket.status === 'resolved' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {ticket.status}
                              </span>
                              <button className="text-indigo-600 hover:text-indigo-900">
                                <ExternalLink className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {tickets.length === 0 && (
                      <div className="text-center py-12">
                        <Ticket className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun ticket</h3>
                        <p className="text-gray-500 mb-4">Vous n'avez pas encore créé de ticket de support.</p>
                        <button
                          onClick={() => setShowTicketForm(true)}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                          <Ticket className="h-4 w-4 mr-2" />
                          Créer un Ticket
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Connexion requise</h3>
                    <p className="text-gray-500">Veuillez vous connecter pour voir vos tickets de support.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* EN: Ticket Form Modal / FR: Modal de Formulaire de Ticket */}
      {showTicketForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Nouveau Ticket</h3>
              <button
                onClick={() => setShowTicketForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); submitTicketForm(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sujet</label>
                <input
                  type="text"
                  required
                  value={ticketForm.subject}
                  onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                <select
                  value={ticketForm.category}
                  onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="technical">Technique</option>
                  <option value="billing">Facturation</option>
                  <option value="feature">Demande de fonctionnalité</option>
                  <option value="bug">Rapport de bug</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priorité</label>
                <select
                  value={ticketForm.priority}
                  onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="low">Faible</option>
                  <option value="medium">Moyenne</option>
                  <option value="high">Élevée</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  required
                  rows={4}
                  value={ticketForm.description}
                  onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowTicketForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Créer le Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
