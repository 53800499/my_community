# My Community — Supervision, Métriques et Journalisation

**Version :** 1.0  
**Date :** 21 octobre 2026  

---

## 1. Métriques Clés à Surveiller (SLI / SLO)

### 1.1 Disponibilité et Performance
- **Disponibilité API :** $\ge 99.9\%$ sur le mois glissant.
- **Latence de réponse :**
  - Fil d'actualité : $p95 < 250\text{ ms}$.
  - Requêtes d'authentification : $p95 < 200\text{ ms}$.
  - Opérations financières : $p99 < 500\text{ ms}$.

### 1.2 Métriques Métier et Sécurité
- Nombre de tentatives de connexion échouées par minute (détection d'attaques par force brute).
- Volume de réponses `403 Forbidden` par endpoint (détection d'IDOR ou de comportements anormaux).
- Nombre de propositions de communautés en attente (`PENDING`).
- Volume de transactions financières enregistrées (`financial_transactions`).

---

## 2. Centralisation des Logs et Alertes

- **Logs applicatifs :** Format JSON structuré (`timestamp`, `level`, `trace_id`, `user_id`, `path`, `statusCode`).
- **Audit Logs :** Stockage dans PostgreSQL (`audit_logs`) avec réplication vers un système de logs immuables (Loki / Elasticsearch / Datadog).
- **Seuils d'Alerte :** Notification immédiate (PagerDuty / Slack / Telegram) en cas de pic d'erreurs 500 ($> 1\%$ des requêtes) ou de défaillance de la base de données.