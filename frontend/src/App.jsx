import Login from "./components/Login"
import Register from "./components/Register"
import { BrowserRouter as Router, Routes,Route } from "react-router-dom"



function App() {


  return (
   <div>
    <Router>
      <Routes>
      <Route path="/" element={<Login/>} ></Route>
      <Route path="/register" element={<Register/>}> </Route>
      </Routes>
    </Router>

   </div>
  )
}

export default App
