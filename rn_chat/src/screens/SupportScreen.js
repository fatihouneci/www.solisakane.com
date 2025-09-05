/**
 * @file SupportScreen.js
 * @description
 * EN: This screen displays help and support features including FAQ, tutorials, and contact support.
 * FR: Cet écran affiche les fonctionnalités d'aide et de support incluant la FAQ, les tutoriels et le contact support.
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
  Linking
} from 'react-native';
import { useUser } from '../contexts/UserProvider';
import axios from 'axios';
import LinearGradient from 'react-native-linear-gradient';

// EN: Icons from react-native-vector-icons / FR: Icônes de react-native-vector-icons
import Icon from 'react-native-vector-icons/MaterialIcons';

const API_URL = 'http://localhost:3000/api';

export default function SupportScreen({ navigation }) {
  const { user, token } = useUser();

  // EN: State management / FR: Gestion d'état
  const [activeTab, setActiveTab] = useState('faq');
  const [faq, setFaq] = useState([]);
  const [tutorials, setTutorials] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedFAQ, setExpandedFAQ] = useState(null);
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
      Alert.alert('Succès', 'Message envoyé au support avec succès !');
    } catch (error) {
      console.error('EN: Error submitting contact form / FR: Erreur de soumission du formulaire de contact:', error);
      Alert.alert('Erreur', 'Erreur lors de l\'envoi du message');
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
      Alert.alert('Succès', 'Ticket de support créé avec succès !');
    } catch (error) {
      console.error('EN: Error submitting ticket form / FR: Erreur de soumission du formulaire de ticket:', error);
      Alert.alert('Erreur', 'Erreur lors de la création du ticket');
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
    { id: 'faq', label: 'FAQ', icon: 'help' },
    { id: 'tutorials', label: 'Tutoriels', icon: 'book' },
    { id: 'contact', label: 'Contact', icon: 'message' },
    { id: 'tickets', label: 'Tickets', icon: 'support-agent' }
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

  // EN: Render FAQ item / FR: Rendre l'élément FAQ
  const renderFAQItem = (item) => (
    <TouchableOpacity
      key={item.id}
      style={styles.faqItem}
      onPress={() => setExpandedFAQ(expandedFAQ === item.id ? null : item.id)}
    >
      <View style={styles.faqHeader}>
        <View style={styles.faqInfo}>
          <Text style={styles.faqQuestion}>{item.question}</Text>
          <Text style={styles.faqCategory}>{item.category} • {item.tags.join(', ')}</Text>
        </View>
        <Icon
          name={expandedFAQ === item.id ? 'expand-less' : 'expand-more'}
          size={24}
          color="#6b7280"
        />
      </View>

      {expandedFAQ === item.id && (
        <View style={styles.faqAnswer}>
          <Text style={styles.faqAnswerText}>{item.answer}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  // EN: Render tutorial item / FR: Rendre l'élément tutoriel
  const renderTutorialItem = (tutorial) => (
    <TouchableOpacity key={tutorial.id} style={styles.tutorialItem}>
      <View style={styles.tutorialThumbnail}>
        <Icon name="play-circle-filled" size={40} color="#6366f1" />
        <Text style={styles.tutorialThumbnailText}>Vidéo</Text>
      </View>

      <View style={styles.tutorialContent}>
        <View style={styles.tutorialHeader}>
          <View style={styles.tutorialBadge}>
            <Text style={styles.tutorialBadgeText}>{tutorial.category}</Text>
          </View>
          <View style={styles.tutorialDuration}>
            <Icon name="access-time" size={16} color="#6b7280" />
            <Text style={styles.tutorialDurationText}>{tutorial.duration}</Text>
          </View>
        </View>

        <Text style={styles.tutorialTitle}>{tutorial.title}</Text>
        <Text style={styles.tutorialDescription}>{tutorial.description}</Text>

        <View style={styles.tutorialFooter}>
          <View style={styles.tutorialDifficulty}>
            <Icon name="star" size={16} color="#fbbf24" />
            <Text style={styles.tutorialDifficultyText}>{tutorial.difficulty}</Text>
          </View>
          <TouchableOpacity style={styles.tutorialButton}>
            <Icon name="play-arrow" size={16} color="#ffffff" />
            <Text style={styles.tutorialButtonText}>Regarder</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  // EN: Render ticket item / FR: Rendre l'élément ticket
  const renderTicketItem = (ticket) => (
    <View key={ticket.ticketId} style={styles.ticketItem}>
      <View style={styles.ticketHeader}>
        <Text style={styles.ticketSubject}>{ticket.subject}</Text>
        <View style={[styles.ticketStatus, styles[`ticketStatus${ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}`]]}>
          <Text style={styles.ticketStatusText}>{ticket.status}</Text>
        </View>
      </View>
      <Text style={styles.ticketInfo}>
        {ticket.category} • {ticket.priority} • {new Date(ticket.createdAt).toLocaleDateString('fr-FR')}
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Chargement de l'aide...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* EN: Header / FR: En-tête */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Aide & Support</Text>
          <Text style={styles.headerSubtitle}>Trouvez des réponses</Text>
        </View>
      </View>

      <View style={styles.content}>
        {/* EN: Tab Navigation / FR: Navigation par onglets */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.activeTab]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Icon
                name={tab.icon}
                size={20}
                color={activeTab === tab.id ? '#ffffff' : '#6b7280'}
              />
              <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* EN: Content Area / FR: Zone de Contenu */}
        <ScrollView style={styles.contentArea} showsVerticalScrollIndicator={false}>
          {/* EN: FAQ Tab / FR: Onglet FAQ */}
          {activeTab === 'faq' && (
            <View style={styles.tabContent}>
              {/* EN: Category Filter / FR: Filtre de Catégorie */}
              <View style={styles.filterContainer}>
                <Text style={styles.filterLabel}>Catégorie</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      style={[styles.filterChip, selectedCategory === category.id && styles.activeFilterChip]}
                      onPress={() => setSelectedCategory(category.id)}
                    >
                      <Text style={[styles.filterChipText, selectedCategory === category.id && styles.activeFilterChipText]}>
                        {category.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* EN: Search Bar / FR: Barre de Recherche */}
              <View style={styles.searchContainer}>
                <Icon name="search" size={20} color="#6b7280" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Rechercher dans la FAQ..."
                  value={searchTerm}
                  onChangeText={setSearchTerm}
                />
              </View>

              {/* EN: FAQ Items / FR: Éléments FAQ */}
              <View style={styles.faqContainer}>
                {faq.map(renderFAQItem)}
              </View>

              {faq.length === 0 && (
                <View style={styles.emptyState}>
                  <Icon name="help" size={48} color="#9ca3af" />
                  <Text style={styles.emptyStateTitle}>Aucune question trouvée</Text>
                  <Text style={styles.emptyStateText}>
                    {searchTerm ? 'Aucune question ne correspond à votre recherche.' : 'Aucune question disponible dans cette catégorie.'}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* EN: Tutorials Tab / FR: Onglet Tutoriels */}
          {activeTab === 'tutorials' && (
            <View style={styles.tabContent}>
              {/* EN: Category Filter / FR: Filtre de Catégorie */}
              <View style={styles.filterContainer}>
                <Text style={styles.filterLabel}>Catégorie</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      style={[styles.filterChip, selectedCategory === category.id && styles.activeFilterChip]}
                      onPress={() => setSelectedCategory(category.id)}
                    >
                      <Text style={[styles.filterChipText, selectedCategory === category.id && styles.activeFilterChipText]}>
                        {category.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* EN: Tutorial Items / FR: Éléments Tutoriels */}
              <View style={styles.tutorialsContainer}>
                {tutorials.map(renderTutorialItem)}
              </View>

              {tutorials.length === 0 && (
                <View style={styles.emptyState}>
                  <Icon name="book" size={48} color="#9ca3af" />
                  <Text style={styles.emptyStateTitle}>Aucun tutoriel trouvé</Text>
                  <Text style={styles.emptyStateText}>Aucun tutoriel disponible dans cette catégorie.</Text>
                </View>
              )}
            </View>
          )}

          {/* EN: Contact Tab / FR: Onglet Contact */}
          {activeTab === 'contact' && (
            <View style={styles.tabContent}>
              {/* EN: Contact Information / FR: Informations de Contact */}
              <View style={styles.contactInfoCard}>
                <Text style={styles.contactInfoTitle}>Informations de Contact</Text>

                <View style={styles.contactInfoItem}>
                  <Icon name="email" size={20} color="#6b7280" />
                  <View style={styles.contactInfoContent}>
                    <Text style={styles.contactInfoLabel}>Email</Text>
                    <Text style={styles.contactInfoValue}>support@solisakane.com</Text>
                  </View>
                </View>

                <View style={styles.contactInfoItem}>
                  <Icon name="phone" size={20} color="#6b7280" />
                  <View style={styles.contactInfoContent}>
                    <Text style={styles.contactInfoLabel}>Téléphone</Text>
                    <Text style={styles.contactInfoValue}>+33 1 23 45 67 89</Text>
                  </View>
                </View>

                <View style={styles.contactInfoItem}>
                  <Icon name="location-on" size={20} color="#6b7280" />
                  <View style={styles.contactInfoContent}>
                    <Text style={styles.contactInfoLabel}>Adresse</Text>
                    <Text style={styles.contactInfoValue}>123 Rue de la Paix, 75001 Paris</Text>
                  </View>
                </View>

                <View style={styles.contactHours}>
                  <Text style={styles.contactHoursTitle}>Heures d'ouverture</Text>
                  <Text style={styles.contactHoursText}>Lundi - Vendredi: 9h00 - 18h00</Text>
                  <Text style={styles.contactHoursText}>Samedi: 10h00 - 16h00</Text>
                </View>
              </View>

              {/* EN: Contact Form Button / FR: Bouton de Formulaire de Contact */}
              <TouchableOpacity
                style={styles.contactFormButton}
                onPress={() => setShowContactForm(true)}
              >
                <Icon name="message" size={20} color="#ffffff" />
                <Text style={styles.contactFormButtonText}>Nous Contacter</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* EN: Tickets Tab / FR: Onglet Tickets */}
          {activeTab === 'tickets' && (
            <View style={styles.tabContent}>
              {token ? (
                <>
                  <View style={styles.ticketsHeader}>
                    <Text style={styles.ticketsTitle}>Mes Tickets de Support</Text>
                    <TouchableOpacity
                      style={styles.newTicketButton}
                      onPress={() => setShowTicketForm(true)}
                    >
                      <Icon name="add" size={20} color="#ffffff" />
                      <Text style={styles.newTicketButtonText}>Nouveau</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.ticketsContainer}>
                    {tickets.map(renderTicketItem)}
                  </View>

                  {tickets.length === 0 && (
                    <View style={styles.emptyState}>
                      <Icon name="support-agent" size={48} color="#9ca3af" />
                      <Text style={styles.emptyStateTitle}>Aucun ticket</Text>
                      <Text style={styles.emptyStateText}>Vous n'avez pas encore créé de ticket de support.</Text>
                      <TouchableOpacity
                        style={styles.emptyStateButton}
                        onPress={() => setShowTicketForm(true)}
                      >
                        <Text style={styles.emptyStateButtonText}>Créer un Ticket</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              ) : (
                <View style={styles.emptyState}>
                  <Icon name="lock" size={48} color="#9ca3af" />
                  <Text style={styles.emptyStateTitle}>Connexion requise</Text>
                  <Text style={styles.emptyStateText}>Veuillez vous connecter pour voir vos tickets de support.</Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </View>

      {/* EN: Contact Form Modal / FR: Modal de Formulaire de Contact */}
      <Modal
        visible={showContactForm}
        transparent
        animationType="slide"
        onRequestClose={() => setShowContactForm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nous Contacter</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowContactForm(false)}
              >
                <Icon name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Nom</Text>
                <TextInput
                  style={styles.formInput}
                  value={contactForm.name}
                  onChangeText={(value) => setContactForm({ ...contactForm, name: value })}
                  placeholder="Votre nom"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Email</Text>
                <TextInput
                  style={styles.formInput}
                  value={contactForm.email}
                  onChangeText={(value) => setContactForm({ ...contactForm, email: value })}
                  placeholder="votre@email.com"
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Sujet</Text>
                <TextInput
                  style={styles.formInput}
                  value={contactForm.subject}
                  onChangeText={(value) => setContactForm({ ...contactForm, subject: value })}
                  placeholder="Sujet de votre message"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Message</Text>
                <TextInput
                  style={[styles.formInput, styles.formTextArea]}
                  value={contactForm.message}
                  onChangeText={(value) => setContactForm({ ...contactForm, message: value })}
                  placeholder="Décrivez votre problème ou question..."
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => setShowContactForm(false)}
                >
                  <Text style={styles.modalCancelButtonText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalConfirmButton}
                  onPress={submitContactForm}
                >
                  <Text style={styles.modalConfirmButtonText}>Envoyer</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* EN: Ticket Form Modal / FR: Modal de Formulaire de Ticket */}
      <Modal
        visible={showTicketForm}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTicketForm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nouveau Ticket</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowTicketForm(false)}
              >
                <Icon name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Sujet</Text>
                <TextInput
                  style={styles.formInput}
                  value={ticketForm.subject}
                  onChangeText={(value) => setTicketForm({ ...ticketForm, subject: value })}
                  placeholder="Sujet du ticket"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Catégorie</Text>
                <View style={styles.formSelect}>
                  <Text style={styles.formSelectText}>{ticketForm.category}</Text>
                  <Icon name="arrow-drop-down" size={24} color="#6b7280" />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Priorité</Text>
                <View style={styles.formSelect}>
                  <Text style={styles.formSelectText}>{ticketForm.priority}</Text>
                  <Icon name="arrow-drop-down" size={24} color="#6b7280" />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Description</Text>
                <TextInput
                  style={[styles.formInput, styles.formTextArea]}
                  value={ticketForm.description}
                  onChangeText={(value) => setTicketForm({ ...ticketForm, description: value })}
                  placeholder="Décrivez votre problème en détail..."
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => setShowTicketForm(false)}
                >
                  <Text style={styles.modalCancelButtonText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalConfirmButton}
                  onPress={submitTicketForm}
                >
                  <Text style={styles.modalConfirmButtonText}>Créer</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  tabContainer: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  activeTab: {
    backgroundColor: '#6366f1',
  },
  tabText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#ffffff',
  },
  contentArea: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  activeFilterChip: {
    backgroundColor: '#6366f1',
  },
  filterChipText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  activeFilterChipText: {
    color: '#ffffff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  faqContainer: {
    marginBottom: 16,
  },
  faqItem: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  faqInfo: {
    flex: 1,
    marginRight: 16,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  faqCategory: {
    fontSize: 14,
    color: '#6b7280',
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  faqAnswerText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginTop: 12,
  },
  tutorialsContainer: {
    marginBottom: 16,
  },
  tutorialItem: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  tutorialThumbnail: {
    height: 120,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tutorialThumbnailText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  tutorialContent: {
    padding: 16,
  },
  tutorialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  tutorialBadge: {
    backgroundColor: '#ddd6fe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tutorialBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#5b21b6',
  },
  tutorialDuration: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tutorialDurationText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  tutorialTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  tutorialDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  tutorialFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tutorialDifficulty: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tutorialDifficultyText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  tutorialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366f1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  tutorialButtonText: {
    fontSize: 12,
    color: '#ffffff',
    marginLeft: 4,
    fontWeight: '500',
  },
  contactInfoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  contactInfoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  contactInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactInfoContent: {
    marginLeft: 12,
  },
  contactInfoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  contactInfoValue: {
    fontSize: 14,
    color: '#6b7280',
  },
  contactHours: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  contactHoursTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  contactHoursText: {
    fontSize: 14,
    color: '#6b7280',
  },
  contactFormButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366f1',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  contactFormButtonText: {
    fontSize: 16,
    color: '#ffffff',
    marginLeft: 8,
    fontWeight: '500',
  },
  ticketsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  ticketsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  newTicketButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366f1',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  newTicketButtonText: {
    fontSize: 14,
    color: '#ffffff',
    marginLeft: 4,
    fontWeight: '500',
  },
  ticketsContainer: {
    marginBottom: 16,
  },
  ticketItem: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  ticketHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  ticketSubject: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  ticketStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ticketStatusOpen: {
    backgroundColor: '#fee2e2',
  },
  ticketStatusInProgress: {
    backgroundColor: '#fef3c7',
  },
  ticketStatusResolved: {
    backgroundColor: '#dcfce7',
  },
  ticketStatusText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  ticketInfo: {
    fontSize: 14,
    color: '#6b7280',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyStateButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  emptyStateButtonText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  formTextArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  formSelect: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
  },
  formSelectText: {
    fontSize: 16,
    color: '#111827',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  modalCancelButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
  },
  modalCancelButtonText: {
    fontSize: 16,
    color: '#374151',
  },
  modalConfirmButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    marginLeft: 8,
    backgroundColor: '#6366f1',
    borderRadius: 8,
  },
  modalConfirmButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
});
