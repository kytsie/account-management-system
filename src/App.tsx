import React from "react";
import { HashRouter, Route, Switch } from "react-router-dom";
import routeList from "./route";

function App() {
  return (
    <HashRouter>
      <Switch>
        {routeList.map((route) => (
          <Route {...route} key={route.path?.toString()} />
        ))}
      </Switch>
    </HashRouter>
  );
}

export default App;
