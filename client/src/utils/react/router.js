import React from 'react';
import { Switch, Route } from 'react-router-dom';
import HomeComponent from '../../components/HomeComponent/HomeComponent';
import CreateOfferComponent from '../../components/CreateOfferComponent/CreateOfferComponent';
import MyOffersComponent from '../../components/MyOffersComponent/MyOffersComponent';
import OfferDetailsComponent from '../../components/OfferDetailsComponent/OfferDetailsComponent';

const AppRoutes = () =>
    <Switch>
        <Route path='/' exact component={HomeComponent} />
        <Route path='/home' component={HomeComponent} />
        <Route path='/new/offer' component={CreateOfferComponent} />
        <Route path='/my/offers' component={MyOffersComponent} />
        <Route path='/offer/details/:from/:idx' component={OfferDetailsComponent} />
    </Switch>


export default AppRoutes;