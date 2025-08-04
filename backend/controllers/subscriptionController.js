// backend/controllers/subscriptionController.js

// Données simulées pour les abonnements
const mockSubscriptions = [
  { id: 1, userId: 101, userEmail: 'user1@example.com', plan: 'Premium', status: 'Actif', startDate: '2023-01-15', endDate: '2024-01-15' },
  { id: 2, userId: 102, userEmail: 'user2@example.com', plan: 'Standard', status: 'Actif', startDate: '2023-03-20', endDate: '2024-03-20' },
  { id: 3, userId: 103, userEmail: 'user3@example.com', plan: 'Premium', status: 'Annulé', startDate: '2022-11-01', endDate: '2023-11-01' },
];

// Récupérer tous les abonnements (simulés)
exports.getAllSubscriptions = async (req, res) => {
  try {
    // Dans une application réelle, vous feriez une requête à votre base de données ici
    res.status(200).json(mockSubscriptions);
  } catch (error) {
    console.error('Erreur lors de la récupération des abonnements:', error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};

// Annuler un abonnement (simulé)
exports.cancelSubscription = async (req, res) => {
  const { id } = req.params;

  try {
    // Dans une application réelle, vous interagiriez avec l'API de votre fournisseur de paiement (ex: Stripe)
    const subscription = mockSubscriptions.find(sub => sub.id === parseInt(id));
    if (!subscription) {
      return res.status(404).json({ message: 'Abonnement non trouvé.' });
    }

    if (subscription.status === 'Annulé') {
      return res.status(400).json({ message: 'L\'abonnement est déjà annulé.' });
    }

    // Simulons l'annulation
    subscription.status = 'Annulé';

    res.status(200).json({ message: 'Abonnement annulé avec succès.', subscription });
  } catch (error) {
    console.error('Erreur lors de l\'annulation de l\'abonnement:', error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};
