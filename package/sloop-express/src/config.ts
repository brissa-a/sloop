//Add your required environment variables HERE
//You can't nest objects, only flat key-value pairs
const config = {
    JWT_SECRET: process.env.JWT_SECRET ?? null,
    JWT_DURATION: process.env.JWT_DURATION ?? null,
    SESSION_DURATION: process.env.SESSION_DURATION ?? null,
} satisfies Record<string, string | null>


//Below is just helpers to make sure you have all the required environment variables
//warns you if you have missing environment variables at startup
//throws an error if you try to access an empty environment variable

const emptyConfig = Object.entries(config).filter(([, value]) => value === null)
if (emptyConfig.length > 0) {
    console.warn(`The following environment variables are empty: ${emptyConfig.map(([key,]) => key).join(', ')}`);
    console.warn(`Some features may not work as expected.`);
}

type NullableProperties<T> = {
    [P in keyof T]: T[P] | null;
};

type ThrowingAccessors<T> = {
    [P in keyof T]: () => Exclude<T[P], null>;
};

function createThrowingAccessors<T extends object>(obj: NullableProperties<T>): ThrowingAccessors<T> {
    const handler: ThrowingAccessors<T> = {} as ThrowingAccessors<T>;

    for (const key of Object.keys(obj) as Array<keyof T>) {
        handler[key] = () => {
            const value = obj[key];
            if (value === null) {
                throw new Error(`Property '${String(key)}' is probably not set in your .env file`);
            }
            return value as Exclude<T[keyof T], null>;
        };
    }

    return handler;
}

export default createThrowingAccessors(config)