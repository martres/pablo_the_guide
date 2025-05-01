.PHONY: start check-env help

help:
	@echo "🚀 Pablo The Guide"
	@echo "\nCommandes disponibles:"
	@echo "  make start     - Démarre l'application"
	@echo "  make check-env - Vérifie l'environnement de développement"

check-env:
	@echo "🔍 Vérification de l'environnement..."
	@command -v node >/dev/null 2>&1 || { echo "❌ Node.js requis"; exit 1; }
	@echo "✅ Environnement OK"

start:
	@echo "🚀 Démarrage de l'application..."
	@npx expo start 