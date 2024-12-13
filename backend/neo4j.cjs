const neo4j = require('neo4j-driver');

// Connect to the Neo4j database
const driver = neo4j.driver(
    'bolt://localhost:7687', // Default Neo4j bolt protocol
    neo4j.auth.basic('neo4j', '12345678') 
);

const session = driver.session({
    database: 'neo4j', // Your database name
});

module.exports = { driver, session };