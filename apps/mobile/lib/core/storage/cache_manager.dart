/// Gestionnaire du cache local privé (Drift / SQLite)
/// Réf: ADR-008 : Purge systématique et intégrale à la déconnexion
abstract class LocalCacheManager {
  /// Purge totale et immédiate du cache local de l'utilisateur à la déconnexion
  Future<void> purgeOnLogout();

  /// Indique si l'application est en mode hors-ligne
  bool get isOffline;
}
