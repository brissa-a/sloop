import { Box, Select, SimpleGrid } from "@mantine/core";
import { useState } from "react";

type View = 'week' | 'month';

export const Agenda = () => {
    const [view, setView] = useState<View>('month');

    return <Box>
        <Select
            data={[
                { value: 'week', label: 'Week' }
                , { value: 'month', label: 'Month' }
            ]}
            onChange={(_value, option) => setView(option.value as View)}
        />
        <View view={view} />
    </Box>;
};

const View = ({ view }: { view: View }) => {
    if (view === 'week') {
        return <WeekView />;
    } else if (view === 'month') {
        return <MonthView />;
    } else {
        return null;
    }
};

const MonthView = () => {
    return <Box>
        <SimpleGrid cols={7} spacing="xs">
            {Array.from({ length: 31 }).map((_, i) => <Box w={50} h={50} key={i}>{i + 1}</Box>)}
        </SimpleGrid>
    </Box>;
};

const WeekView = () => {
    return <Box>
        <SimpleGrid cols={7} spacing="xs">
            <Box>Monday</Box>
            <Box>Tuesday</Box>
            <Box>Wednesday</Box>
            <Box>Thursday</Box>
            <Box>Friday</Box>
            <Box>Saturday</Box>
            <Box>Sunday</Box>
        </SimpleGrid>
    </Box>;
};