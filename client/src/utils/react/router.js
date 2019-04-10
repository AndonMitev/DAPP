import React from 'react';
import { Switch, Route } from 'react-router-dom';
import HomeComponent from '../../components/HomeComponent/HomeComponent';
import CreateOfferComponent from '../../components/CreateOfferComponent/CreateOfferComponent';
import MyOffersComponent from '../../components/MyOffersComponent/MyOffersComponent';
import OfferDetailsComponent from '../../components/OfferDetailsComponent/OfferDetailsComponent';
import JoinInTheTeamComponent from '../../components/JoinInTheTeamComponent/JoinInTheTeamComponent';
import ViewAllCandidatesComponent from '../../components/ViewAllCandidatesComponent/ViewAllCandidatesComponent';
import TeamComponent from '../../components/TeamComponent/TeamComponent';
import EditOfferComponent from '../../components/EditOfferComponent/EditOfferComponent';
import ViewContractInformationComponent from '../../components/ViewContractInformationComponent/ViewContractInformationComponent';

const AppRoutes = () =>
    <Switch>
        <Route path='/' exact component={HomeComponent} />
        <Route path='/home' component={HomeComponent} />
        <Route path='/new/offer' component={CreateOfferComponent} />
        <Route path='/my/offers' component={MyOffersComponent} />
        <Route path='/offer/details/:from/:idx' component={OfferDetailsComponent} />
        <Route path='/join' component={JoinInTheTeamComponent}></Route>
        <Route path='/candidates' component={ViewAllCandidatesComponent}></Route>
        <Route path='/team' component={TeamComponent}></Route>
        <Route path='/offer/edit/:from/:idx' component={EditOfferComponent}></Route>
        <Route path='/contract' component={ViewContractInformationComponent}></Route>
    </Switch>


export default AppRoutes;