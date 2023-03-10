import {Route, Routes} from "react-router-dom";

import {Main} from "./pages/Main/Main";
import {Room} from "./pages/Room/Room";
import {Default} from "./pages/Default/Default";

function App() {
  return (
      <Routes>
          <Route exact path="/room/:id" element={<Room />}/>
          <Route exact path="/" element={<Main />}/>
          <Route path="*" element={<Default />}/>
      </Routes>
  );
}

export default App;
