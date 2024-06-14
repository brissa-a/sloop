import Graph from 'graphology';

export type Copy = {
    copiedId: string;
    copierId: string;
    power: number;
};

export function copiesToGraphology(copies: Copy[]): Graph {
    const graph = new Graph({ multi: true, type: 'directed', allowSelfLoops: false });

    for (const copy of copies) {
        graph.mergeNode(copy.copiedId);
        graph.mergeNode(copy.copierId);
    }

    for (const copy of copies) {
        graph.addEdge(copy.copierId, copy.copiedId, {
            power: copy.power,
        });
    }

    return graph;
}

