import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const client = new ApolloClient({
  link: new HttpLink({
    uri: 'http://localhost:8000/graphql', // Your GraphQL endpoint
    headers: {
      Authorization: `Bearer ${localStorage.getItem('authToken')}`, // Include the token from local storage
    },
  }),
  cache: new InMemoryCache(),
});

export default client;
