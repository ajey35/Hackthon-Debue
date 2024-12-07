import React from "react";
import AutoCompleteAddress from "./components/AutoComplete";

const App = () => {
  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Google Maps Address AutoComplete</h1>
      <AutoCompleteAddress />
    </div>
  );
};

export default App;
