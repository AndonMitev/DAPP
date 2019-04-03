import React, { Component } from 'react';
import ImageUploader from 'react-images-upload';

export default class FormComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      title: null,
      price: null,
      description: null,
      pictures: [],
      imageAsArrayBuffer: null,
      to: ''
    }
  }

  handleOnChange = async event => {
    event.preventDefault();
    const propName = event.target.name;
    this.setState({
      [propName]: event.target.value
    });
  }

  handleOnUpload = newPictures => {
    if (newPictures && newPictures.length) {
      const reader = new window.FileReader();
      reader.readAsArrayBuffer(...newPictures);
      reader.onloadend = () => {
        this.setState({ imageAsArrayBuffer: Buffer(reader.result) });
      }
    }
  }

  handleOnSubmit = event => {
    event.preventDefault();
    this.props.setNewOffer(this.state);
  }

  render = () => (
    <React.Fragment >
      <h2 className="text-center my-4">Set your awesome product</h2>
      <form onSubmit={this.handleOnSubmit} className="form">
        <div className="form-group">
          <label id="title">Product name*</label>
          <input onChange={this.handleOnChange} type="text" name="title" className="form-control" placeholder="Your product name..." />
        </div>
        <div className="form-group">
          <label>Price in wei*</label>
          <input onChange={this.handleOnChange} type="number" name="price" className="form-control" placeholder="Set price in wei" />
        </div>
        <div>
          <label>Description</label>
          <textarea onChange={this.handleOnChange} type="text" name="description" className="form-control" placeholder="Tell to people more details about your product..."></textarea>

        </div>
        <ImageUploader
          label="Image"
          buttonStyles={{ backgroundColor: '#007bff' }}
          withIcon={true}
          withPreview={true}
          buttonText='Choose images'
          onChange={this.handleOnUpload}
          imgExtension={['.jpg', '.gif', '.png', '.gif', '.jpeg']}
          maxFileSize={5242880}
        />
        <input type="submit" className="btn btn-primary offset-4 col-4 mt-3" value="Create" />
      </form>
    </React.Fragment>
  );
}
