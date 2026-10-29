# ADR-006 : Gestion des Transactions Financières et Journal d'Audit Immuable

- **Statut :** Accepté
- **Date :** 21 octobre 2026
- **Décideurs :** Équipe Architecture My Community

---

## Contexte
La gestion des cotisations associatives et des dépenses en monnaie locale (`XOF`) nécessite une transparence absolue pour éviter tout litige financier. Les opérations financières ne doivent pas être traitées comme de simples ressources CRUD modifiables ou effaçables à volonté.

## Décision
1. **Immutabilité des écritures :** Toute transaction financière confirmée (`status = 'POSTED'`) ne peut être ni modifiée ni supprimée. Toute correction doit obligatoirement faire l'objet d'une opération compensatrice explicite (`ADJUSTMENT`).
2. **Calcul serveur des soldes :** Le solde restant dû d'une cotisation est toujours recalculé par le serveur à partir de la somme des versements confirmés (`amount_due - sum(payments)`). Aucune valeur de solde calculée par le client n'est acceptée.
3. **Journal d'Audit Immuable :** Toute décision administrative, suspension d'adhésion ou mouvement financier déclenche l'écriture synchrone dans la table `audit_logs` au sein de la même transaction PostgreSQL.

## Conséquences
- **Positives :**
  - Valeur probante et traçabilité légale irréprochable.
  - Prévention de la fraude interne et des erreurs de caisse dans les associations.
- **Négatives :**
  - Impossibilité de "corriger une faute de frappe" sur une transaction confirmée sans générer une écriture d'ajustement.
