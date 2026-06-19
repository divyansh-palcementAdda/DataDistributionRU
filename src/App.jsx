import { BrowserRouter } from "react-router-dom";
import Allroutes from "./Allroutes";
import { AppProvider } from "./AppContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Allroutes />
        <ToastContainer position="top-right" autoClose={3000} />
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
