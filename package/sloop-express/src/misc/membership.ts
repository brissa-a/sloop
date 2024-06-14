
type Membership = {
    userId: string;
    startDate: Date;
    expirationDate: Date | null;
}
export function validMembershipByUser<T>(memberships: (Membership & T)[]) {
    return membershipsByUser(memberships.filter(isBetweenStartAndExpiration))
}

export function membershipsByUser<T>(memberships: (Membership & T)[]) {

    type Members = Record<string /*userId*/, Omit<{
        userId: string;
        startDate: Date;
        expirationDate: Date | null;
    } & T, "userId">[]>

    const grouped = memberships.reduce((acc, { userId, ...remains }) => {
        acc[userId] = acc[userId] || [];
        acc[userId]!.push(remains);
        return acc;
    }, {} as Members);

    return Object.entries(grouped).flatMap(([userId, userMemberships]) => {
        if (userMemberships.length === 0) return []
        const entry = [userId, userMemberships] as const
        return [entry]
    })
}

export const isMemberOf = (userId: string, memberships: Membership[]) => memberships.filter(isBetweenStartAndExpiration).map(x => x.userId).includes(userId)

export const isCaptainOf = (userId: string, memberships: (Membership & { role: "CAPTAIN" | "MEMBER" })[]) => memberships.filter(m => m.role === "CAPTAIN").filter(isBetweenStartAndExpiration).map(x => x.userId).includes(userId)

export const isBetweenStartAndExpiration = (membership: { startDate: Date, expirationDate: Date | null }) => {
    return membership.startDate < new Date() && (membership.expirationDate === null || membership.expirationDate > new Date())
}