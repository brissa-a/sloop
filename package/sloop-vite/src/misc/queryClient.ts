import { notifications } from "@mantine/notifications";
import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
    queryCache: new QueryCache({
        onError: (error) => {
            if (error.message === 'Failed to fetch') {
                notifications.show({
                    id: 'query-error',
                    title: 'Erreur ' + error.name,
                    message: error.message.length > 90 ? error.message.slice(0, 100) + '...' : error.message,
                    color: 'red'
                })
            } else {
                notifications.show({
                    title: 'Erreur ' + error.name,
                    message: error.message.length > 90 ? error.message.slice(0, 100) + '...' : error.message,
                    color: 'red'
                })
            }
            import.meta.env.DEV && console.error(error.stack)
        },
    }),
    mutationCache: new MutationCache({
        onError: (error) => {
            if (error.message === 'Failed to fetch') {
                notifications.show({
                    id: 'query-error',
                    title: 'Erreur ' + error.name,
                    message: error.message.length > 90 ? error.message.slice(0, 100) + '...' : error.message,
                    color: 'red'
                })
            } else {
                notifications.show({
                    title: 'Erreur ' + error.name,
                    message: error.message.length > 90 ? error.message.slice(0, 100) + '...' : error.message,
                    color: 'red'
                })
            }
            import.meta.env.DEV && console.error(error.stack)
        },
    })
})