import { useLocalStorage } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { trpcWs } from "@sloop-vite/misc/trpc";
import { useEffect, useState } from "react";
import { useSloop } from "./sloop";



export function useVotingSubscription(id: string, onData: () => void, enable = true) {
    const [active, setActive] = useState(true)
    const { appInstanceId } = useSloop()
    const [jwt,] = useLocalStorage<string | null>({ key: 'jwt', defaultValue: null });

    useEffect(() => {
        if (enable) {
            console.log("Subscribing to voting", id)
            const subscription = trpcWs.event.voting.subscribe({ id }, {
                onData,
                onStarted: () => {
                    setActive(true)
                    console.log("Subscription started")
                    onData()
                },
                onError: (err) => {
                    notifications.show({
                        title: 'Error',
                        message: err.message,
                        color: 'red',
                    });
                    setActive(false)
                },
                onStopped: () => {
                    notifications.show({
                        title: 'Error',
                        message: 'Subscription stopped',
                        color: 'red',
                    });
                    setActive(false)
                }
            });

            return () => {
                setActive(false)
                subscription.unsubscribe()
            }
        }
    }, [id, onData, jwt, appInstanceId, enable])

    return { active }
}