const { User } = require('../models');

// Récupérer tous les utilisateurs
exports.getAllUsers = async (req, res) => {
  console.log('📋 UserController: getAllUsers appelé');
  console.log('📋 UserController: Utilisateur connecté:', req.user?.email);
  
  try {
    console.log('📋 UserController: Récupération des utilisateurs...');
    
    const users = await User.findAll({
      attributes: ['id', 'firstName', 'lastName', 'email', 'isAdmin', 'isSubscribed', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });
    
    console.log(`📋 UserController: ${users.length} utilisateurs trouvés`);
    
    // Transformer isAdmin en role pour correspondre au frontend
    const usersWithRole = users.map(user => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.isAdmin ? 'admin' : 'user',
      isSubscribed: user.isSubscribed,
      createdAt: user.createdAt
    }));
    
    console.log('✅ UserController: Données transformées et prêtes à envoyer');
    res.status(200).json(usersWithRole);
  } catch (error) {
    console.error('❌ UserController: Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération des utilisateurs.',
      error: error.message 
    });
  }
};

// Mettre à jour le rôle d'un utilisateur
exports.updateUserRole = async (req, res) => {
  console.log('🔄 UserController: updateUserRole appelé');
  
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    console.log(`🔄 UserController: Mise à jour utilisateur ${id} vers rôle ${role}`);
    
    // Validation du rôle
    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Rôle invalide. Utilisez "user" ou "admin".' });
    }
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }
    
    // Empêcher un admin de se rétrograder lui-même
    if (user.id === req.user.id && role === 'user') {
      return res.status(400).json({ message: 'Vous ne pouvez pas vous rétrograder vous-même.' });
    }
    
    // Mettre à jour le rôle (role = 'admin' -> isAdmin = true)
    await user.update({
      isAdmin: role === 'admin'
    });
    
    console.log('✅ UserController: Rôle mis à jour avec succès');
    
    res.status(200).json({
      message: 'Rôle de l\'utilisateur mis à jour avec succès.',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.isAdmin ? 'admin' : 'user'
      }
    });
  } catch (error) {
    console.error('❌ UserController: Erreur lors de la mise à jour du rôle:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la mise à jour du rôle.',
      error: error.message 
    });
  }
};

// Supprimer un utilisateur
exports.deleteUser = async (req, res) => {
  console.log('🗑️ UserController: deleteUser appelé');
  
  try {
    const { id } = req.params;
    
    console.log(`🗑️ UserController: Suppression utilisateur ${id}`);
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }
    
    // Empêcher un admin de se supprimer lui-même
    if (user.id === req.user.id) {
      return res.status(400).json({ message: 'Vous ne pouvez pas supprimer votre propre compte.' });
    }
    
    await user.destroy();
    console.log('✅ UserController: Utilisateur supprimé avec succès');
    
    res.status(200).json({ message: 'Utilisateur supprimé avec succès.' });
  } catch (error) {
    console.error('❌ UserController: Erreur lors de la suppression de l\'utilisateur:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la suppression de l\'utilisateur.',
      error: error.message 
    });
  }
};