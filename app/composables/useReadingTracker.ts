import { ref, readonly, onMounted, onUnmounted, computed } from 'vue';

interface ReadingSession {
    id: number;
    startTime: Date;
    isActive: boolean;
}

interface ReadingTrackingOptions {
    autoStart?: boolean;
    trackInterval?: number; // millisecondes
    minReadingTime?: number; // secondes minimum avant de compter
}

export const useReadingTracker = (options: ReadingTrackingOptions = {}) => {
    const {
        autoStart = true,
        trackInterval = 30000, // 30 secondes
        minReadingTime = 10 // 10 secondes minimum
    } = options;

    // État du tracking
    const isTracking = ref(false);
    const currentSession = ref<ReadingSession | null>(null);
    const readingTime = ref(0); // temps en secondes
    const versesRead = ref(0);
    const chaptersVisited = ref<string[]>([]);

    // Timers
    let trackingInterval: NodeJS.Timeout | null = null;
    let visibilityTimer: NodeJS.Timeout | null = null;
    let lastActiveTime = Date.now();

    // Démarrer une session de lecture
    const startSession = async (versionId: number, deviceType = 'web') => {
        if (isTracking.value) return;

        try {
            const response = await $fetch<{ success: boolean; sessionId: number; }>('/api/reading/sessions', {
                method: 'POST',
                body: {
                    action: 'start',
                    versionId,
                    deviceType
                }
            });

            if (response.success) {
                currentSession.value = {
                    id: response.sessionId,
                    startTime: new Date(),
                    isActive: true
                };

                isTracking.value = true;
                startTracking();

                // Écouter la visibilité de la page
                document.addEventListener('visibilitychange', handleVisibilityChange);

                // Écouter les événements de fermeture
                window.addEventListener('beforeunload', handleBeforeUnload);

                console.log('Session de lecture démarrée:', response.sessionId);
            }
        } catch (error) {
            console.error('Erreur démarrage session:', error);
        }
    };

    // Arrêter la session de lecture
    const stopSession = async () => {
        if (!isTracking.value || !currentSession.value) return;

        try {
            // Ne sauvegarder que si le temps minimum est atteint
            if (readingTime.value >= minReadingTime) {
                await $fetch('/api/reading/sessions', {
                    method: 'POST',
                    body: {
                        action: 'end',
                        sessionId: currentSession.value.id
                    }
                });
            }

            // Nettoyer
            stopTracking();
            resetSession();

            console.log('Session de lecture terminée');
        } catch (error) {
            console.error('Erreur arrêt session:', error);
        }
    };

    // Enregistrer la progression de lecture
    const recordProgress = (bookCode: string, chapter: number) => {
        if (!isTracking.value) return;

        const chapterKey = `${bookCode}:${chapter}`;
        if (!chaptersVisited.value.includes(chapterKey)) {
            chaptersVisited.value.push(chapterKey);
        }

        // Ici on pourrait envoyer la progression au serveur
        // mais pour éviter trop d'appels API, on le fait dans l'intervalle de tracking
    };

    // Marquer des versets comme lus
    const recordVersesRead = (count: number) => {
        versesRead.value += count;
    };

    // Écouter l'activité utilisateur
    const updateActivity = () => {
        lastActiveTime = Date.now();
        if (currentSession.value && !currentSession.value.isActive) {
            resumeSession();
        }
    };

    // Démarrer le tracking interne
    const startTracking = () => {
        trackingInterval = setInterval(() => {
            if (isTracking.value && currentSession.value?.isActive) {
                // Vérifier si l'utilisateur est encore actif
                const now = Date.now();
                const timeSinceActive = (now - lastActiveTime) / 1000;

                // Si inactif depuis plus de 2 minutes, pause la session
                if (timeSinceActive > 120) {
                    pauseSession();
                } else {
                    readingTime.value += Math.floor(trackInterval / 1000);
                }
            }
        }, trackInterval);

        document.addEventListener('mousemove', updateActivity);
        document.addEventListener('keypress', updateActivity);
        document.addEventListener('scroll', updateActivity);
        document.addEventListener('click', updateActivity);
    };

    // Arrêter le tracking
    const stopTracking = () => {
        if (trackingInterval) {
            clearInterval(trackingInterval);
            trackingInterval = null;
        }

        if (visibilityTimer) {
            clearTimeout(visibilityTimer);
            visibilityTimer = null;
        }

        // Nettoyer les événements
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('beforeunload', handleBeforeUnload);

        const events = ['mousemove', 'keypress', 'scroll', 'click'];
        events.forEach((event) => {
            document.removeEventListener(event, updateActivity as EventListener);
        });
    };

    // Mettre en pause la session
    const pauseSession = () => {
        if (currentSession.value) {
            currentSession.value.isActive = false;
            console.log('Session en pause (inactivité)');
        }
    };

    // Reprendre la session
    const resumeSession = () => {
        if (currentSession.value) {
            currentSession.value.isActive = true;
            lastActiveTime = Date.now();
            console.log('Session reprise');
        }
    };

    // Réinitialiser les données de session
    const resetSession = () => {
        isTracking.value = false;
        currentSession.value = null;
        readingTime.value = 0;
        versesRead.value = 0;
        chaptersVisited.value = [];
    };

    // Gérer les changements de visibilité de page
    const handleVisibilityChange = () => {
        if (document.hidden) {
            // Page cachée - démarrer un timer pour pause
            visibilityTimer = setTimeout(() => {
                pauseSession();
            }, 30000); // 30 secondes avant pause
        } else {
            // Page visible - annuler le timer et reprendre
            if (visibilityTimer) {
                clearTimeout(visibilityTimer);
                visibilityTimer = null;
            }
            resumeSession();
        }
    };

    // Gérer la fermeture de page
    const handleBeforeUnload = () => {
        if (isTracking.value) {
            // Tentative de sauvegarde rapide avant fermeture
            navigator.sendBeacon('/api/reading/sessions', JSON.stringify({
                action: 'end',
                sessionId: currentSession.value?.id
            }));
        }
    };

    // Démarrage automatique si demandé
    onMounted(() => {
        if (autoStart) {
            // Démarrer avec la version par défaut (à adapter selon votre logique)
            startSession(1); // ID de version par défaut
        }
    });

    // Nettoyage automatique
    onUnmounted(() => {
        stopSession();
    });

    // Formater le temps de lecture
    const formattedReadingTime = computed(() => {
        const hours = Math.floor(readingTime.value / 3600);
        const minutes = Math.floor((readingTime.value % 3600) / 60);
        const seconds = readingTime.value % 60;

        if (hours > 0) {
            return `${hours}h ${minutes}m ${seconds}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds}s`;
        } else {
            return `${seconds}s`;
        }
    });

    return {
        // État
        isTracking: readonly(isTracking),
        currentSession: readonly(currentSession),
        readingTime: readonly(readingTime),
        versesRead: readonly(versesRead),
        chaptersVisited: readonly(chaptersVisited),
        formattedReadingTime,

        // Actions
        startSession,
        stopSession,
        recordProgress,
        recordVersesRead,
        pauseSession,
        resumeSession
    };
};
