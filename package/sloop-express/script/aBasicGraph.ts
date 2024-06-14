import { prisma } from "../src/misc/prisma";

import Graph from 'graphology';

//pnpm script script/aBasicGraph.ts
async function main() {
    //await dbWarning()

    const graph = new Graph();
    graph.addNode('John');
    graph.addNode('Martha');

    graph.addEdgeWithKey('JohnMartha', 'John', 'Martha');
    console.log(graph)
}

await main().finally(() => prisma.$disconnect())

