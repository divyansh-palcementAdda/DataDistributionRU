import { BrowserRouter } from "react-router-dom";
import Allroutes from "./Allroutes";
import { AppProvider } from "./AppContext";

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Allroutes />
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
