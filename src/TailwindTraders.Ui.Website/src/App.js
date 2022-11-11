import React, { Component, Fragment } from "react";
import { Route, Router, Redirect } from "react-router-dom";
import { connect } from "react-redux";
import { CartService } from "./services";
import Meeting from './pages/home/components/videoCall/Meeting';

import { Header, Footer ,Appbar } from "./shared";
import {
  Home,
  List,
  MyCoupons,
  Detail,
  SuggestedProductsList,
  Profile,
  ShoppingCart,
  Arrivals,
} from "./pages";

import "./i18n";
import "./main.scss";

import { createBrowserHistory } from "history";
// import { ai } from "./services/telemetryClient";
// add appinsights
const history = createBrowserHistory({ basename: "" });
// (async () => {
//   await ConfigService.loadSettings();
//   if (ConfigService._applicationInsightsIntrumentationKey) {
//     ai.initialize(ConfigService._applicationInsightsIntrumentationKey, {
//       history,
//     });
//   }
// })();

class App extends Component {
  constructor() {
    super();
    this.state = {
      shoppingCart: [],
      quantity: null,
      path: '/',
    };
  }

  async componentDidMount() {
    if (this.props.userInfo.token) {
      const shoppingCart = await CartService.getShoppingCart(
        this.props.userInfo.token
      );
      if (shoppingCart) {
        this.setState({ shoppingCart });
      }
    }

    if (this.state.shoppingCart != null) {
      const quantity = this.state.shoppingCart.reduce(
        (oldQty, { qty }) => oldQty + qty,
        0
      );
      this.setState({ quantity });
    }
  }

  ShoppingCart = (quantity) => {
    this.setState({ quantity });
  };

  sumProductInState = () => {
    this.setState((prevState) => {
      return { quantity: prevState.quantity + 1 };
    });
  };

  setPathname = (path) => {
    this.setState({ path });
  }
  render() {
    const { quantity } = this.state;

    const PrivateRoute = ({ component: Component, ...rest }) => (
      <Route
        {...rest}
        render={(props) =>
          this.props.userInfo.loggedIn === true ? (
            <Component {...props} {...rest} />
          ) : (
            <Redirect to="/" />
          )
        }
      />
    );

    return (
      <div className="App">
        <Router history={history}>
          <Fragment>
            <div className="mainHeader">
              <Appbar />
              {this.state.path === '/' || this.state.path === '/new-arrivals'?
              <Header quantity={quantity} setPathname={this.setPathname}/>
              :
              <div id="box"></div>}
            </div>
            <Route exact path="/" component={Home} />
            <Route exact path="/new-arrivals" component={Arrivals} />
            <Route exact path="/meeting" component={Meeting} />
            <Route exact path="/list" component={List} />
            <Route exact path="/list/:code" component={List} />
            <Route
              path="/suggested-products-list"
              component={SuggestedProductsList}
            />
            <Route
              path="/product/detail/:productId"
              render={(props) => (
                <Detail sumProductInState={this.sumProductInState} {...props} />
              )}
            />
            <PrivateRoute path="/coupons" component={MyCoupons} />
            <PrivateRoute path="/profile" component={Profile} />
            <PrivateRoute
              path="/shopping-cart"
              component={ShoppingCart}
              ShoppingCart={this.ShoppingCart}
              quantity={this.state.quantity}
            />
            <Footer />
          </Fragment>
        </Router>
      </div>
    );
  }
}

const mapStateToProps = (state) => state.login;

export default connect(mapStateToProps)(App);
