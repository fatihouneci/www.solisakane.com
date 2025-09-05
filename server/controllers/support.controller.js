/**
 * @file support.controller.js
 * @description
 * EN: This file contains the controller functions for help and support operations.
 * FR: Ce fichier contient les fonctions du contrôleur pour les opérations d'aide et de support.
 */
import User from "../models/user.model.js";
import Errors from "../helpers/Errors.js";
import CatchAsyncError from "../helpers/CatchAsyncError.js";
import { v4 as uuidv4 } from 'uuid';

/**
 * EN: Get FAQ (Frequently Asked Questions)
 * FR: Récupérer la FAQ (Questions Fréquemment Posées)
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const getFAQ = CatchAsyncError(async (req, res, next) => {
  try {
    const { category } = req.query;

    // EN: FAQ data organized by categories / FR: Données FAQ organisées par catégories
    const faqData = {
      general: [
        {
          id: 'faq-001',
          question: 'Qu\'est-ce que Solisakane ?',
          answer: 'Solisakane est une application de communication moderne qui vous permet de discuter, passer des appels audio et vidéo, partager des fichiers et bien plus encore avec vos contacts.',
          category: 'general',
          tags: ['introduction', 'fonctionnalités']
        },
        {
          id: 'faq-002',
          question: 'Comment créer un compte ?',
          answer: 'Pour créer un compte, cliquez sur "Créer un compte" sur l\'écran de connexion, remplissez vos informations personnelles, puis vérifiez votre email avec le code reçu.',
          category: 'general',
          tags: ['compte', 'inscription']
        },
        {
          id: 'faq-003',
          question: 'Comment récupérer mon mot de passe ?',
          answer: 'Cliquez sur "Mot de passe oublié" sur l\'écran de connexion, entrez votre email, puis suivez les instructions reçues par email pour réinitialiser votre mot de passe.',
          category: 'general',
          tags: ['mot de passe', 'récupération']
        }
      ],
      chat: [
        {
          id: 'faq-101',
          question: 'Comment démarrer une conversation ?',
          answer: 'Cliquez sur "Nouveau Chat" depuis l\'écran d\'accueil, sélectionnez un contact ou ajoutez-en un nouveau, puis commencez à taper votre message.',
          category: 'chat',
          tags: ['conversation', 'nouveau chat']
        },
        {
          id: 'faq-102',
          question: 'Comment créer un groupe ?',
          answer: 'Dans un chat existant, cliquez sur les informations du chat, puis sur "Ajouter des participants" pour créer un groupe de discussion.',
          category: 'chat',
          tags: ['groupe', 'participants']
        },
        {
          id: 'faq-103',
          question: 'Comment partager des fichiers ?',
          answer: 'Dans une conversation, cliquez sur l\'icône de pièce jointe, sélectionnez le fichier à partager, et il sera envoyé instantanément.',
          category: 'chat',
          tags: ['fichiers', 'partage']
        }
      ],
      calls: [
        {
          id: 'faq-201',
          question: 'Comment passer un appel audio ?',
          answer: 'Dans une conversation, cliquez sur l\'icône d\'appel audio. L\'autre personne recevra une notification d\'appel entrant.',
          category: 'calls',
          tags: ['appel audio', 'notification']
        },
        {
          id: 'faq-202',
          question: 'Comment passer un appel vidéo ?',
          answer: 'Dans une conversation, cliquez sur l\'icône d\'appel vidéo. Assurez-vous que votre caméra et microphone sont autorisés.',
          category: 'calls',
          tags: ['appel vidéo', 'caméra', 'microphone']
        },
        {
          id: 'faq-203',
          question: 'Comment enregistrer un appel ?',
          answer: 'Pendant un appel, cliquez sur l\'icône d\'enregistrement. L\'enregistrement sera sauvegardé dans votre galerie de médias.',
          category: 'calls',
          tags: ['enregistrement', 'sauvegarde']
        }
      ],
      media: [
        {
          id: 'faq-301',
          question: 'Comment accéder à ma galerie ?',
          answer: 'Cliquez sur "Galerie" depuis l\'écran d\'accueil pour voir tous vos fichiers partagés, photos, vidéos et documents.',
          category: 'media',
          tags: ['galerie', 'fichiers']
        },
        {
          id: 'faq-302',
          question: 'Quels types de fichiers puis-je partager ?',
          answer: 'Vous pouvez partager des images (JPG, PNG, GIF), des vidéos (MP4, MOV), des fichiers audio (MP3, WAV) et des documents (PDF, DOC, TXT).',
          category: 'media',
          tags: ['types de fichiers', 'formats']
        },
        {
          id: 'faq-303',
          question: 'Comment rechercher dans mes fichiers ?',
          answer: 'Dans la galerie, utilisez la barre de recherche pour trouver des fichiers par nom, type ou date de création.',
          category: 'media',
          tags: ['recherche', 'filtres']
        }
      ],
      settings: [
        {
          id: 'faq-401',
          question: 'Comment modifier mes paramètres de notification ?',
          answer: 'Allez dans Paramètres > Notifications pour personnaliser vos préférences de notification, sons et mode ne pas déranger.',
          category: 'settings',
          tags: ['notifications', 'paramètres']
        },
        {
          id: 'faq-402',
          question: 'Comment changer mon thème ?',
          answer: 'Dans Paramètres > Thème, vous pouvez choisir entre le mode clair, sombre ou automatique selon l\'heure.',
          category: 'settings',
          tags: ['thème', 'apparence']
        },
        {
          id: 'faq-403',
          question: 'Comment activer l\'authentification à deux facteurs ?',
          answer: 'Dans Paramètres > Sécurité, cliquez sur "Configurer 2FA" et suivez les instructions pour scanner le code QR.',
          category: 'settings',
          tags: ['sécurité', '2FA', 'authentification']
        }
      ],
      privacy: [
        {
          id: 'faq-501',
          question: 'Mes conversations sont-elles privées ?',
          answer: 'Oui, toutes vos conversations sont chiffrées de bout en bout. Seuls vous et vos contacts pouvez lire les messages.',
          category: 'privacy',
          tags: ['confidentialité', 'chiffrement']
        },
        {
          id: 'faq-502',
          question: 'Comment bloquer un utilisateur ?',
          answer: 'Dans le profil de l\'utilisateur, cliquez sur "Bloquer" pour empêcher cette personne de vous contacter.',
          category: 'privacy',
          tags: ['blocage', 'sécurité']
        },
        {
          id: 'faq-503',
          question: 'Comment supprimer mon compte ?',
          answer: 'Dans Paramètres > Sécurité, vous trouverez l\'option pour supprimer définitivement votre compte et toutes vos données.',
          category: 'privacy',
          tags: ['suppression', 'compte']
        }
      ]
    };

    let faq = [];
    if (category && faqData[category]) {
      faq = faqData[category];
    } else {
      // EN: Return all FAQ if no category specified / FR: Retourner toute la FAQ si aucune catégorie spécifiée
      Object.values(faqData).forEach(categoryFaq => {
        faq = faq.concat(categoryFaq);
      });
    }

    res.status(200).json({
      success: true,
      faq,
      categories: Object.keys(faqData),
      message: "FAQ récupérée avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Search FAQ
 * FR: Rechercher dans la FAQ
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const searchFAQ = CatchAsyncError(async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q) {
      return next(new Errors("Terme de recherche requis", 400));
    }

    // EN: Get all FAQ data / FR: Récupérer toutes les données FAQ
    const allFAQ = [
      // General FAQ
      {
        id: 'faq-001',
        question: 'Qu\'est-ce que Solisakane ?',
        answer: 'Solisakane est une application de communication moderne qui vous permet de discuter, passer des appels audio et vidéo, partager des fichiers et bien plus encore avec vos contacts.',
        category: 'general',
        tags: ['introduction', 'fonctionnalités']
      },
      {
        id: 'faq-002',
        question: 'Comment créer un compte ?',
        answer: 'Pour créer un compte, cliquez sur "Créer un compte" sur l\'écran de connexion, remplissez vos informations personnelles, puis vérifiez votre email avec le code reçu.',
        category: 'general',
        tags: ['compte', 'inscription']
      },
      // Add more FAQ items as needed...
    ];

    // EN: Search in questions, answers, and tags / FR: Rechercher dans les questions, réponses et tags
    const searchTerm = q.toLowerCase();
    const results = allFAQ.filter(item => 
      item.question.toLowerCase().includes(searchTerm) ||
      item.answer.toLowerCase().includes(searchTerm) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );

    res.status(200).json({
      success: true,
      results,
      query: q,
      totalResults: results.length,
      message: "Recherche FAQ terminée avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Submit a support ticket
 * FR: Soumettre un ticket de support
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const submitSupportTicket = CatchAsyncError(async (req, res, next) => {
  try {
    const userId = req.auth._id;
    const { subject, category, priority, description, attachments } = req.body;

    // EN: Validate required fields / FR: Valider les champs requis
    if (!subject || !category || !description) {
      return next(new Errors("Sujet, catégorie et description sont requis", 400));
    }

    // EN: Create support ticket / FR: Créer un ticket de support
    const ticketId = uuidv4();
    const ticket = {
      ticketId,
      userId,
      subject,
      category,
      priority: priority || 'medium',
      description,
      status: 'open',
      attachments: attachments || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // EN: In a real application, you would save this to a database
    // FR: Dans une vraie application, vous sauvegarderiez cela dans une base de données
    console.log('EN: Support ticket created / FR: Ticket de support créé:', ticket);

    res.status(201).json({
      success: true,
      ticket: {
        ticketId: ticket.ticketId,
        subject: ticket.subject,
        category: ticket.category,
        priority: ticket.priority,
        status: ticket.status,
        createdAt: ticket.createdAt
      },
      message: "Ticket de support créé avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Get support tickets for user
 * FR: Récupérer les tickets de support pour l'utilisateur
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const getUserSupportTickets = CatchAsyncError(async (req, res, next) => {
  try {
    const userId = req.auth._id;
    const { status, page = 1, limit = 10 } = req.query;

    // EN: In a real application, you would query the database
    // FR: Dans une vraie application, vous interrogeriez la base de données
    const mockTickets = [
      {
        ticketId: 'ticket-001',
        subject: 'Problème de connexion',
        category: 'technical',
        priority: 'high',
        status: 'open',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
      },
      {
        ticketId: 'ticket-002',
        subject: 'Question sur les paramètres',
        category: 'general',
        priority: 'medium',
        status: 'resolved',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      }
    ];

    let tickets = mockTickets;
    if (status) {
      tickets = tickets.filter(ticket => ticket.status === status);
    }

    // EN: Pagination / FR: Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedTickets = tickets.slice(startIndex, endIndex);

    res.status(200).json({
      success: true,
      tickets: paginatedTickets,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(tickets.length / limit),
        totalTickets: tickets.length,
        hasNextPage: endIndex < tickets.length,
        hasPrevPage: page > 1
      },
      message: "Tickets de support récupérés avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Get tutorials
 * FR: Récupérer les tutoriels
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const getTutorials = CatchAsyncError(async (req, res, next) => {
  try {
    const { category } = req.query;

    // EN: Tutorial data organized by categories / FR: Données de tutoriels organisées par catégories
    const tutorialData = {
      getting_started: [
        {
          id: 'tutorial-001',
          title: 'Bienvenue dans Solisakane',
          description: 'Découvrez les fonctionnalités principales de l\'application',
          category: 'getting_started',
          duration: '5 min',
          difficulty: 'beginner',
          steps: [
            'Créer votre compte',
            'Compléter votre profil',
            'Ajouter vos premiers contacts',
            'Démarrer votre première conversation'
          ],
          videoUrl: '/tutorials/welcome.mp4',
          thumbnail: '/tutorials/welcome-thumb.jpg'
        }
      ],
      chat: [
        {
          id: 'tutorial-101',
          title: 'Maîtriser les conversations',
          description: 'Apprenez à utiliser toutes les fonctionnalités de chat',
          category: 'chat',
          duration: '8 min',
          difficulty: 'beginner',
          steps: [
            'Démarrer une conversation',
            'Envoyer des messages',
            'Partager des fichiers',
            'Utiliser les réactions',
            'Créer des groupes'
          ],
          videoUrl: '/tutorials/chat.mp4',
          thumbnail: '/tutorials/chat-thumb.jpg'
        }
      ],
      calls: [
        {
          id: 'tutorial-201',
          title: 'Appels audio et vidéo',
          description: 'Guide complet pour les appels et l\'enregistrement',
          category: 'calls',
          duration: '10 min',
          difficulty: 'intermediate',
          steps: [
            'Passer un appel audio',
            'Passer un appel vidéo',
            'Gérer les paramètres audio/vidéo',
            'Enregistrer un appel',
            'Partager l\'écran'
          ],
          videoUrl: '/tutorials/calls.mp4',
          thumbnail: '/tutorials/calls-thumb.jpg'
        }
      ],
      media: [
        {
          id: 'tutorial-301',
          title: 'Gestion des médias',
          description: 'Organisez et partagez vos fichiers efficacement',
          category: 'media',
          duration: '6 min',
          difficulty: 'beginner',
          steps: [
            'Accéder à la galerie',
            'Téléverser des fichiers',
            'Organiser vos médias',
            'Rechercher des fichiers',
            'Partager des fichiers'
          ],
          videoUrl: '/tutorials/media.mp4',
          thumbnail: '/tutorials/media-thumb.jpg'
        }
      ],
      settings: [
        {
          id: 'tutorial-401',
          title: 'Personnaliser votre expérience',
          description: 'Configurez l\'application selon vos préférences',
          category: 'settings',
          duration: '7 min',
          difficulty: 'beginner',
          steps: [
            'Paramètres de notification',
            'Thèmes et apparence',
            'Confidentialité et sécurité',
            'Authentification à deux facteurs',
            'Sauvegarde et synchronisation'
          ],
          videoUrl: '/tutorials/settings.mp4',
          thumbnail: '/tutorials/settings-thumb.jpg'
        }
      ]
    };

    let tutorials = [];
    if (category && tutorialData[category]) {
      tutorials = tutorialData[category];
    } else {
      // EN: Return all tutorials if no category specified / FR: Retourner tous les tutoriels si aucune catégorie spécifiée
      Object.values(tutorialData).forEach(categoryTutorials => {
        tutorials = tutorials.concat(categoryTutorials);
      });
    }

    res.status(200).json({
      success: true,
      tutorials,
      categories: Object.keys(tutorialData),
      message: "Tutoriels récupérés avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Contact support
 * FR: Contacter le support
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const contactSupport = CatchAsyncError(async (req, res, next) => {
  try {
    const userId = req.auth._id;
    const { name, email, subject, message, category } = req.body;

    // EN: Validate required fields / FR: Valider les champs requis
    if (!name || !email || !subject || !message) {
      return next(new Errors("Tous les champs sont requis", 400));
    }

    // EN: In a real application, you would send an email or save to database
    // FR: Dans une vraie application, vous enverriez un email ou sauvegarderiez en base de données
    const contactId = uuidv4();
    const contact = {
      contactId,
      userId,
      name,
      email,
      subject,
      message,
      category: category || 'general',
      status: 'received',
      createdAt: new Date()
    };

    console.log('EN: Support contact received / FR: Contact support reçu:', contact);

    res.status(201).json({
      success: true,
      contact: {
        contactId: contact.contactId,
        subject: contact.subject,
        category: contact.category,
        status: contact.status,
        createdAt: contact.createdAt
      },
      message: "Message envoyé au support avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

export default {
  getFAQ,
  searchFAQ,
  submitSupportTicket,
  getUserSupportTickets,
  getTutorials,
  contactSupport
};
