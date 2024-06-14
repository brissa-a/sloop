import fs from 'fs';
import pathModule from 'path';

//Write file and create missing folder if needed
export function writeFileSync(filepath: string, data: string) {
    const dirname = pathModule.dirname(filepath);
    if (!fs.existsSync(dirname)) {
        fs.mkdirSync(dirname, { recursive: true });
    }
    fs.writeFileSync(filepath, data);
}