import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const client = new ApolloClient({
  link: new HttpLink({
    uri: 'http://localhost:8000/graphql', // GraphQL endpoint
    // headers: {
    //   Authorization: `Bearer ${localStorage.getItem('authToken')}`, // token from local storage
    // },
  }),
  cache: new InMemoryCache(),
});

export default client;