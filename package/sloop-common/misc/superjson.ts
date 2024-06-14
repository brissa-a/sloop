import { Prisma } from '@prisma/generated';
import { serialize, deserialize, SuperJSONResult } from 'superjson';

export function toPrismaSuperjson(json: any): Prisma.InputJsonValue {
    return serialize(json) as unknown as Prisma.InputJsonValue;
}

export function fromPrismaSuperjson(json: Prisma.JsonValue): any {
    return deserialize(json as unknown as SuperJSONResult);
}