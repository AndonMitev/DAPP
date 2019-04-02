import React from 'react';
import { Switch, Route } from "react-router-dom";
import HomePage from "../../components/HomePage/HomePage";
import CreateOfferPage from "../../components/CreateOfferPage/CreateOfferPage";
import MyOffersPage from "../../components/MyOffersPage/MyOffersPage";

const AppRoutes = () =>
    <Switch>
        <Route path="/" exact component={HomePage} />
        <Route path="/home" component={HomePage} />
        <Route path="/new-offer" component={CreateOfferPage} />
        <Route path="/my-offers" component={MyOffersPage} />
        />
    </Switch>


export default AppRoutes;