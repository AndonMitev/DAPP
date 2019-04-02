import React, { Component } from 'react';
import { Link, NavLink } from 'react-router-dom';
import Modal from 'react-responsive-modal';
import './ModalDialog.css';


export default class ModalDialog extends Component {
    state = {
        etherscanUrl: `https://ropsten.etherscan.io/tx/`,
    };

    render() {
        return (
            <div>
                <Modal open={this.props.showModal} onClose={() => null}>
                    <div>
                        <h2>Thank you! Your transaction was successful! You can check transaction status here:</h2>
                        <a target="_blank" href={this.state.etherscanUrl + this.props.txHash}>{this.props.txHash}</a>
                        <NavLink className="text-dark float-right d-block" to="/">Return to home page</NavLink>
                    </div>
                </Modal>
            </div>
        );
    }
}