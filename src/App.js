// Evolutility-UI-React
// https://github.com/evoluteur/evolutility-ui-react

import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";

import config from "./config";
import { fetchModels } from "./utils/moMa";
import Spinner from "./components/shell/Spinner";
import Nav from "./components/shell/Nav";
import TopBar from "./components/shell/TopBar";
import Footer from "./components/shell/Footer";

import Home from "./components/pages/Home";
import Demo from "./components/pages/Demo";
import EvolRoutes from "./components/EvolRoutes";

import PageNotFound from "./components/pages/PageNotFound";

import "./App.scss";

let queryModels = config.queryModels || false;

const AppRoutes = () => (
  <Switch>
    <Route exact path="/" component={Home} />
    <Route exact path="/demo" component={Demo} />
    <EvolRoutes />
    <Route path="*" exact component={PageNotFound} />
  </Switch>
);

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: queryModels,
    };
  }

  componentDidMount() {
    if (queryModels) {
      fetchModels(
        () =>
          this.setState({
            loading: false,
          }),
        (err) => {
          this.setState({
            loading: false,
          });
          toast.error("Error fetching models: " + err.message);
        }
      );
      queryModels = false;
    }
  }

  render() {
    return (
      <div className="App">
        {this.state.loading ? (
          <div className="loading-evol">
            <Spinner message="Fetching Evolutility UI models..." />
          </div>
        ) : (
          <BrowserRouter>
            <Route path="*" exact component={TopBar} />
            <Route path="*" exact component={Nav} />
            <div className="pageContent" role="main">
              <AppRoutes />
            </div>
            <Footer />
          </BrowserRouter>
        )}
        <ToastContainer autoClose={5000} />
      </div>
    );
  }
}
