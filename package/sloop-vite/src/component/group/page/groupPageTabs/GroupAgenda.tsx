import frLocale from '@fullcalendar/core/locales/fr';
import dayGridPlugin from '@fullcalendar/daygrid';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import { TrpcOut, trpcReact } from "@sloop-vite/misc/trpc";
import { useNavigate } from "@tanstack/react-router";

const empty: TrpcOut['meeting']['list'] = []

export function GroupAgenda(props: {
    group: {
        id: string,
        slug: string
    }
}) {
    const group = trpcReact.group.byId.useQuery({ id: props.group.id }).data;

    const sloopMeetings = trpcReact.meeting.list.useQuery({ groupId: group?.id || "whatever-its-disabled" }, {
        enabled: !!group,
    }).data || empty
    const fullCalendarEvent = sloopMeetings
        .map(x => ({
            title: x.title,
            start: x.scheduledStartAt,
            end: x.scheduledEndAt,
            id: x.id,
            slug: x.slug,
        }))

    const navigate = useNavigate()

    // return <div>
    //     {
    //         fullCalendarEvent.map(x => {
    //             return <div key={x.id} onClick={() => {
    //                 navigate({
    //                     to: '/meeting/$id/$slug',
    //                     params: {
    //                         id: x.id,
    //                         slug: x.slug
    //                     },
    //                 })
    //             }}>
    //                 {x.title}
    //             </div>
    //         })
    //     }
    // </div>

    return <FullCalendar
        locales={[frLocale]}
        locale="fr"
        plugins={[dayGridPlugin, timeGridPlugin]}
        initialView="timeGridWeek"
        height={"calc(100vh - 200px)"}
        events={fullCalendarEvent}
        eventClick={(info) => {
            console.log(info.event.id)
            info.jsEvent.preventDefault(); // don't let the browser navigate
            const event = info.event as unknown as typeof fullCalendarEvent[number]
            navigate({
                to: '/meeting/$id/$slug',
                params: {
                    id: event.id,
                    slug: event.slug
                },
            })
        }}
        eventMouseEnter={(info) => {
            info.el.style.cursor = 'pointer';
        }}
        eventMouseLeave={(info) => {
            info.el.style.cursor = '';
            navigate
        }}
        headerToolbar={{
            start: 'prev,next',
            center: 'title',
            end: 'today,timeGridWeek,timeGridDay,dayGridMonth'
        }}
    />
}