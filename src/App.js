import React from 'react';
import './App.css';
import map_base from './map_base.png';
import footerStyles from './styles/footer.module.css';
import headerStyles from './styles/header.module.css';

import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

import Jimp from 'jimp';
import JSZip from 'jszip';
import { initGA, PageView, Event } from './Tracking';


function Header(props) {
  return (
    <header>
      <h1 className={headerStyles.title}>
        <a href="https://ixukw.github.io">ixukw</a>
      </h1>
      Image Splitter
    </header>
  );
}

function Footer(props) {
  return <footer className={footerStyles.footer}>ixukw</footer>;
}
/*
class Console extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      consoleOut: ""
    }
    this.addConsoleOut = this.addConsoleOut.bind(this);
  }
  addConsoleOut(r) {
    this.setState({
      consoleOut: this.state.consoleOut+r+"\n"
    })
  }
  render() {
    return (
      <div className="console flex-wrap">{this.state.consoleOut}</div>
    )
  }
}*/

class Input extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      inputFile: "",
      imgOut: [],
      downloadHref: "",
      downloadButton: false
    }
    this.handleFileSelected = this.handleFileSelected.bind(this);
    this.execute = this.execute.bind(this);
    this.download = this.download.bind(this);
  }
  componentDidMount() {
    initGA('UA-192734530-1');
    PageView();
  }
  handleFileSelected(r) {
    //console.log(Array.from(r.target.files)[0]);
    this.setState({
      inputFile: Array.from(r.target.files),
      imgOut: [],
      downloadHref: "",
      downloadButton: false
    })
  }
  execute() {
    var zip = new JSZip();
    var reader = new FileReader();
    this.setState({
      imgOut: [],
      downloadHref: "",
      downloadButton: false
    })
    var file = this.state.inputFile[0];
    var component = this;
    var base_image;
    var pixel_image;
    //var image_name_base = file.name.replace(/\.[^/.]+$/,"");
    //console.log(image_name_base);
    Jimp.read(map_base).then((image) => {
      base_image = image.clone();
    });
    new Jimp(1,1,'#FFC643', (e, image) => {
      pixel_image=image.clone();
    });
    reader.onload = function() {
      Jimp.read(this.result).then((image) => {
        for (var i=0; i<3; i++) {
          for (var j=0; j<9; j++) {
            var newImage = base_image.clone();
            var imageCrop = image.clone();
            imageCrop.crop(j*8,i*8,8,8);
            newImage.composite(imageCrop, 8, 8, {
              mode: Jimp.BLEND_SOURCE_OVER,
              opacitySource:1,
              opacityDest:1
            });
            newImage.composite(pixel_image, 4+Math.floor(Math.random()*3),4+Math.floor(Math.random()*3), {
              mode: Jimp.BLEND_SOURCE_OVER,
              opacitySource:1,
              opacityDest:1
            });
            newImage.getBase64(Jimp.MIME_PNG, (e, base64) => {
              if (e) alert("getBase64: "+e);
              var join = component.state.imgOut.concat(base64);
              component.setState({
                imgOut: join
              });
            });
            var fileName = `${27-(i*9+j)}.${newImage.getExtension()}`;
            newImage.getBuffer(Jimp.MIME_PNG, (e, buffer) => {
              if (e) alert("getBuffer: "+e);
              zip.file(fileName, buffer);
              //console.log("zipping "+fileName);
            });
          }
        }
      }).catch((e) => {
        alert(e);
        //console.log(e);
      }).then(() => {
        zip.generateAsync({
          type: "base64"
        }).then((content) => {
          component.setState({
            downloadHref: "data:application/zip;base64,"+content
          })
        });
        //console.log(component.state.imgOut);
        component.setState({
          downloadButton: true
        });
        Event("split-image-success", "Image splitted and zip created.", "IMG-EDIT");
      });
    }
    reader.readAsArrayBuffer(file);
  }
  download() {
    if (this.state.downloadButton) {
      Event("download-success", "Zip download", "IMG-EDIT");
      return this.state.downloadHref;
    } else {
      alert("You must input a file or run the program first.");
      Event("download-failure", "Zip download failure", "IMG-EDIT");
    }
  }
  render() {
    const imgItems = this.state.imgOut.map((image) => {
      return (<img src={image} className="images" alt="split-img"/>);
    });
    return (
      <div>
        <div className="justify-content-start d-flex align-items-center overflow-auto">
          <input className="overflow-hidden w-75" id="fileInput" type="file" onChange={this.handleFileSelected}/>
          <Button onClick={this.execute}>Go</Button>
        </div>
        <a href={this.state.downloadHref} onClick={this.download}>Download ZIP</a><br/>
        {imgItems}
      </div>
    )
  }
}
class App extends React.Component {
  render() {
    return (
      <Container className="justify-content-between d-flex flex-column">
        <Row className="">
          <Header />
        </Row>
        <Row className="main d-flex align-items-start flex-row">
          <Col>
            <Input />
            <div className="download">
          </div>
          </Col>
          <Col>
            Input 24x72<br />Preset skin file head at pixel 8,8 to 15,15 for 8x8<br/>1. Add input file.<br/>2. Press Go.<br/>3. Download ZIP.
          </Col>
        </Row>
        <Row className="">
          <Footer />
        </Row>
      </Container>
    )
  }
}

export default App;