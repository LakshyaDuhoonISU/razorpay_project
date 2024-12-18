import { Navigate } from "react-router-dom"

function Auth(props) {
  let isLoggedIn = localStorage.getItem('authToken');
  return isLoggedIn ? props.children : <Navigate to="/login" />
}

export default Auth