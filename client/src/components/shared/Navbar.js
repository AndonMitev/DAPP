import React from 'react';
import { NavLink } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary ">
            <NavLink className="navbar-brand text-white mb-1" to="/">Decentralized Store</NavLink>
            <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNavDropdown">
                <ul className="nav bg-dark bg-transparent">
                    <li className="nav-item">
                        <NavLink className="nav-link text-white mr-3" to="/home">Home <span className="sr-only">(current)</span></NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink className="nav-link  text-white mr-3" to="/new/offer">Post offer</NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink className="nav-link  text-white mr-3" to="/my/offers">My offers</NavLink>
                    </li>
                    <li className="nav-item dropdown">
                    </li>
                </ul>
            </div>
        </nav>
    );
}
export default Navbar;