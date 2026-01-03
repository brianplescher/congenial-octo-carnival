export const graphData = {
  "nodes": [
    // Core Concepts
    { "id": "Woundwise", "group": "core", "val": 15 },
    { "id": "Abjective Ecology", "group": "core", "val": 12 },
    { "id": "Mutual Aid", "group": "core", "val": 12 },
    { "id": "Collapse", "group": "core", "val": 12 },
    { "id": "Dissolution", "group": "core", "val": 10 },

    // Essays / Topics
    { "id": "Mutual Aid as Metabolism", "group": "essay", "val": 6 },
    { "id": "The Collapse of Entitlement", "group": "essay", "val": 6 },
    { "id": "The Gift as Refusal", "group": "essay", "val": 6 },
    { "id": "Scarcity as Teacher", "group": "essay", "val": 6 },
    { "id": "Hunger as Signal", "group": "essay", "val": 6 },
    { "id": "The Gift That Remakes the World", "group": "essay", "val": 6 },
    { "id": "The Fantasy of Pure Media", "group": "essay", "val": 6 },
    
    // Sub-concepts
    { "id": "Post-Anthropocene", "group": "sub", "val": 4 },
    { "id": "Abandonment", "group": "sub", "val": 4 },
    { "id": "Entitlement", "group": "sub", "val": 4 }
  ],
  "links": [
    // Core Connections
    { "source": "Woundwise", "target": "Abjective Ecology" },
    { "source": "Woundwise", "target": "Dissolution" },
    { "source": "Abjective Ecology", "target": "Mutual Aid" },
    { "source": "Collapse", "target": "Mutual Aid" },
    { "source": "Collapse", "target": "Dissolution" },

    // Essay Connections
    { "source": "Mutual Aid", "target": "Mutual Aid as Metabolism" },
    { "source": "Mutual Aid as Metabolism", "target": "Hunger as Signal" },
    
    { "source": "Collapse", "target": "The Collapse of Entitlement" },
    { "source": "The Collapse of Entitlement", "target": "Entitlement" },
    
    { "source": "Mutual Aid", "target": "The Gift as Refusal" },
    { "source": "The Gift as Refusal", "target": "The Gift That Remakes the World" },
    
    { "source": "Abjective Ecology", "target": "Scarcity as Teacher" },
    { "source": "Scarcity as Teacher", "target": "Abandonment" },
    
    { "source": "Dissolution", "target": "The Fantasy of Pure Media" },
    
    { "source": "Post-Anthropocene", "target": "Abjective Ecology" },
    { "source": "Post-Anthropocene", "target": "Woundwise" }
  ]
};
