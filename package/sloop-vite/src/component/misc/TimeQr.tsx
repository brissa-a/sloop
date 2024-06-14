import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Stack, Text } from '@mantine/core';

const TimedQr: React.FC = () => {
    const timeout = 2500;
    const qrData = useTimedQr(timeout);
    return (
        qrData ? <Stack>
            <img width={350} height={350} src={qrData.qr} />
            <Text>{qrData.value}</Text>
            <Text>Expires in {msToTime(timeout)}</Text>
            <Text>Scan this QR code with your phone to connect to the app</Text>
        </Stack> : <div>loading...</div>
    );
};

//milliseconds to wait before updating the QR code
function msToTime(duration: number) {
    const seconds = (duration % 60000) / 1000,
        minutes = Math.floor((duration / (1000 * 60)) % 60),
        hours = Math.floor(duration / (1000 * 60 * 60));

    let timeStr = '';
    if (hours > 0) timeStr += hours + "h ";
    if (hours > 0 || minutes > 0) timeStr += minutes + "m ";
    timeStr += seconds + "s";

    return timeStr.trim();
}

const useTimedQr = (timeout: number) => {
    const [qr, setQr] = useState<{ qr: string, value: string } | null>(null);

    useEffect(() => {
        const updateQr = () => {
            const date = new Date();
            QRCode.toDataURL(date.toString())
                .then(url => {
                    setQr({ qr: url, value: date.toString() });
                })
                .catch(err => {
                    console.error(err);
                });
        };
        //updateQr();
        const interval = setInterval(updateQr, timeout);
        return () => {
            clearInterval(interval);
        };
    }, [qr]);
    return qr;
};


export default TimedQr;
