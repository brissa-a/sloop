// import { prisma } from "../src/misc/prisma"

// type Edge = {
//     voter: string
//     scores: {
//         opt: string
//         score: number
//     }[]
//     delegateTo?: never
//     pv: number
// } | {
//     voter: string
//     scores?: never
//     delegateTo: string
//     pv: number
// }

// //pnpm script script/voteResolveAlg.ts
// async function main() {
//     //await dbWarning()

//     const typicalCase: Edge[] = [
//         {
//             voter: 'A', pv: 0.5, scores: [
//                 { opt: 'Yes', score: 1 },
//                 { opt: 'No', score: 0 }
//             ]
//         },
//         { voter: 'A', delegateTo: 'B', pv: 0.5 },
//         {
//             voter: 'B', pv: 0.5, scores: [
//                 { opt: 'Yes', score: 0 },
//                 { opt: 'No', score: 1 }
//             ]
//         },

//         {
//             voter: 'B', pv: 0.3, scores: [
//                 { opt: 'Yes', score: 0.5 },
//                 { opt: 'No', score: 0.5 }
//             ]
//         },
//         { voter: 'B', delegateTo: 'C', pv: 0.2 },
//         {
//             voter: 'C', pv: 0.5, scores: [
//                 { opt: 'Yes', score: 0 },
//                 { opt: 'No', score: 1 }
//             ]
//         },
//         { voter: 'C', delegateTo: 'A', pv: 0.5 },
//         { voter: 'Z', delegateTo: 'Y', pv: 0.5 },
//         { voter: 'Y', delegateTo: 'Z', pv: 0.5 }
//     ]


//     // const extremeCircleCase: Edge[] = [
//     //     { voter: 'A', opt: 'Yes', pv: 0.01, score: 1 },
//     //     { voter: 'A', delegateTo: 'B', pv: 0.99 },
//     //     { voter: 'B', opt: 'No', pv: 0.01, score: 1 },
//     //     { voter: 'B', delegateTo: 'C', pv: 0.99 },
//     //     { voter: 'C', opt: 'No', pv: 0.01, score: 1 },
//     //     { voter: 'C', delegateTo: 'A', pv: 0.99 },
//     // ]

//     // //@ts-expect-error
//     // const generateMostExtremeCase = (n: number) => {
//     //     const res: Edge[] = []
//     //     const voters = Array.from({ length: n }, (_, i) => nanoid())
//     //     const answers = voters.slice(0, 10)
//     //     for (const [index, voter] of voters.entries()) {
//     //         const next = voters[(index + 1) % n]!
//     //         //console.log(voter, '->', next)
//     //         res.push({ voter: voter, delegateTo: next, pv: 0.99 })
//     //         res.push({ voter: voter, opt: answers[(index + 1) % answers.length]!, pv: 0.01, score: 1 })
//     //     }
//     //     return res
//     // }

//     // const generateRandomCase = (n: number) => {
//     //     const res: Edge[] = []
//     //     const voters = Array.from({ length: n }, (_, i) => nanoid())
//     //     const answers = voters.slice(0, 10)
//     //     for (const voter of voters) {
//     //         const chosen = round(Math.random())
//     //         const delegated = round(1 - chosen)
//     //         res.push({ voter: voter, opt: answers[Math.floor(Math.random() * answers.length)]!, pv: chosen, score: 1 })
//     //         res.push({ voter: voter, delegateTo: voters[Math.floor(Math.random() * voters.length)]!, pv: delegated })
//     //     }
//     //     return res
//     // }
//     // generateMostExtremeCase(600)
//     // return;
//     //const edge = extremeCircleCase
//     //const edge = generateMostExtremeCase(500)
//     // const votersCount = Math.floor(Math.random() * 1000) + 1
//     // const edge = generateRandomCase(votersCount)
//     const edge = typicalCase

//     const voters = Array.from(new Set(edge.flatMap(e => e.voter ? [e.voter] : [])))
//     const answers = Array.from(new Set(edge.flatMap(e => e.scores?.map(x => x.opt) || [])))

//     const voterRes = []
//     for (const voter of voters) {
//         const answerRes = [];
//         for (const answer of answers) {
//             const beforeRound = resolveAnswerScore(voter, edge, answer)
//             const result = Math.round(beforeRound * precision)
//             answerRes.push({ answer, result })
//             //console.log('voter -', voter, '- answer -', answer, '- result', result)
//         }
//         voterRes.push({ voter, answerRes })
//     }
//     const totalRes = []
//     for (const answer of answers) {
//         const sum = voterRes.reduce((acc, voter) => acc + voter.answerRes.find(a => a.answer === answer)!.result, 0)
//         totalRes.push({ answer, sum })
//         console.log('total -', answer, '- result', sum)
//     }
//     const sum = totalRes.reduce((acc, b) => acc + b.sum, 0)
//     //console.log('Total vote exprimé', sum, '/', votersCount * precision)
// }

// function resolveAnswerScore(voter: string, edge: Edge[], answer: string, weight = 1, stackSize = 0): number {
//     const voterEdge = edge.filter(e => e.voter === voter)
//     return voterEdge.reduce((acc, e) => {
//         if (e.opt === answer) {
//             return acc + e.pv * weight
//         } else if (e.delegateTo) {
//             const nextWeight = e.pv * weight
//             if (nextWeight < (1 / (precision * 10))) {
//                 //if the weight is < to 1 vote, we stop the recursion
//                 return acc + e.pv * weight
//             }
//             return acc + resolveAnswerScore(e.delegateTo, edge, answer, e.pv * weight, stackSize + 1)
//         } else {//concern another answer
//             return acc
//         }
//     }, 0)
// }



// main().finally(() => prisma.$disconnect())
