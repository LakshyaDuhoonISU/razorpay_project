import { Navigate } from "react-router-dom"

function CustAuth(props) {
    let isLoggedIn = JSON.parse(localStorage.getItem('customer'));
  return isLoggedIn ? props.children : <Navigate to="/custlogin" />
}

export default CustAuth