import React from 'react';
import { Link } from 'react-router-dom';

const CollectionOfProductsComponent = props => {
  if (props.allProducts && !Array.isArray(props.allProducts)) {
    return (
      <React.Fragment>
        <div className="card">
          <img className="card-img-top" style={{ objectFit: "cover", height: "150px" }} src={'data:image/jpeg;base64,' + Buffer.from(props.allProducts.imageAsArrayBuffer.data).toString('base64')} />
          <div className="card-body">
            <h5 className="card-title">{props.allProducts.title}</h5>
            <p className="card-text">{props.allProducts.description}</p>
            <Link to={`/offer/details/${props.allProducts.from}/${props.idx}`}>View details</Link>
          </div>
        </div>
      </React.Fragment>
    )
  }
  return (
    < React.Fragment >
      <div className="row">
        {props.allProducts.map((product, idx) => {
          return (
            <div key={idx} className="col-md-4 mt-5">
              <div className="card">
                <div style={{ height: "150px" }}>
                  <img className="card-img-top" style={{ height: "170px", maxWidth: "100%", backgroundSize: "cover" }} src={'data:image/jpeg;base64,' + Buffer.from(product.imageAsArrayBuffer.data).toString('base64')} />
                </div>
                <div className="card-body">
                  <h5 className="card-title text-center">{product.title}</h5>
                  <p className="card-text text-center">{product.description}</p>
                  <Link className="text-primary" style={{ textDecoration: "none" }} to={`/offer/details/${product.from}/${idx}`}>View details</Link>
                  <span>
                    <button className="btn w-100 btn-primary float-right mt-2">Buy</button>
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </React.Fragment >
  );
}

export default CollectionOfProductsComponent;