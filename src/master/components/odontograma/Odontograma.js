import React from 'react';
import { withRouter } from "react-router-dom";  // Allow us access to route props

class Odontograma extends React.Component {
  constructor(props){
    super();
    this.state = {
      cita: props.cita,
      ctx: false,
    }
    // Objects properties
    this.scale = .9;
    this.settings = {
      tooth_spacing: 7*this.scale,
      width: 30*this.scale,
      height: 65*this.scale,
      root_height: 32*this.scale,
      data_height: 35*this.scale,
      data_space: 60*this.scale,
    }
  }
  // Classes
  Tooth = class {
    constructor(settings, ctx, x, y, key, orientation, body){
      this.settings = settings;
      this.ctx = ctx;
      this.key = key;
      this.orientation = orientation;
      this.x = x;
      this.y = y;
      this.body = body;
      // Generate general elements
      this.drawBase();
      this.drawToothComponents();
    }
    drawBase(){
      let x = this.x;
      let y = this.y;
      let body = this.body;
      let width = this.body==2 ? this.settings.width*1.3 : this.settings.width;  // Fix width by body
      let height = this.settings.height;
      let root_height = this.settings.root_height;
      let data_height = this.settings.data_height;
      let data_space = this.settings.data_space;
      let _y;

      // Data area
      let _data_area = new Path2D();
      _y = this.orientation=='U' ? y-(data_space+data_height) : y-data_height+height;
      _data_area.rect(x, _y, width, data_height);
      this.data_area = _data_area;
      // Tooth key
      if(this.orientation=='U') this.ctx.strokeText(this.key, x-6+width/2, y-data_space+12);
      else if(this.orientation=='D') this.ctx.strokeText(this.key, x-6+width/2, y-(data_space+data_height)+height+data_space-3);

      // Root area
      let _root_area = new Path2D();
      _y = this.orientation=='U' ? y : y-data_space-2;  // Fix pixel
      _root_area.rect(x, _y, width, root_height);
      this.root_area = _root_area;
      // Tooth area
      let _tooth = new Path2D();
      _y = this.orientation=='U' ? y+root_height : y-(data_space+data_height);
      _tooth.rect(x, _y, width, height-root_height);
      this.tooth = _tooth;
    }
    drawToothComponents(){
      let x = this.x;
      let y = this.y;
      let data_height = this.settings.data_height;
      let data_space = this.settings.data_space;
      y = this.orientation=='U' ? y+this.settings.root_height : y-(data_space+data_height);
      let root = this.root;
      let width = this.body==2 ? this.settings.width*1.3 : this.settings.width;  // Fix width by body
      let height = this.settings.height-this.settings.root_height;
      // line into tooth
      let tooth_line_up = 0;
      let tooth_line_down = 0;
      let tooth_line_right = 0;
      let tooth_line_left = 0;
      if(this.body==2){
        tooth_line_up = 1/4;
        tooth_line_down = 3/4;
        tooth_line_left = 1/4;
        tooth_line_right = 3/4;
      }else if(this.body==1){
        tooth_line_up = 1/2;
        tooth_line_down = 1/2;
        tooth_line_left = 1/3;
        tooth_line_right = 2/3;
      }

      // Top stroke
      let tooth_top = new Path2D();
      tooth_top.moveTo(x, y);
      tooth_top.lineTo(x+width*tooth_line_left, y+height*tooth_line_up);
      tooth_top.lineTo(x+width*tooth_line_right, y+height*tooth_line_up);
      tooth_top.lineTo(x+width, y);
      this.tooth_top = tooth_top;
      // Bottom stroke
      let tooth_bottom = new Path2D();
      tooth_bottom.moveTo(x, y+height);
      tooth_bottom.lineTo(x+width*tooth_line_left, y+height*tooth_line_down);
      tooth_bottom.lineTo(x+width*tooth_line_right, y+height*tooth_line_down);
      tooth_bottom.lineTo(x+width, y+height);
      this.tooth_bottom = tooth_bottom;
      // Left line
      let tooth_left = new Path2D();
      tooth_left.moveTo(x+width*tooth_line_left, y+height*tooth_line_down);
      tooth_left.lineTo(x+width*tooth_line_left, y+height*tooth_line_up);
      this.tooth_left = tooth_left;
      // Right line
      let tooth_right = new Path2D();
      tooth_right.moveTo(x+width*tooth_line_right, y+height*tooth_line_down);
      tooth_right.lineTo(x+width*tooth_line_right, y+height*tooth_line_up);
      this.tooth_right = tooth_right;
    }
    strokeBold(e){
      this.ctx.beginPath(); this.ctx.lineWidth = 1.5;  // Bold line width
      this.ctx.stroke(e);
      this.ctx.beginPath(); this.ctx.lineWidth = 1;  // Restore line width
    }
  }
  Molar = class extends this.Tooth {
    constructor(settings, ctx, x, y, key, orientation, root=3){
      // body: 2
      super(settings, ctx, x, y, key, orientation, 2);
      this._crown = 4;
      this._root = root;
      this.genRoot();
    }
    molarBase(){
      let x = this.x;
      let y = this.y;
      let data_height = this.settings.data_height;
      let data_space = this.settings.data_space;
      y = this.orientation=='U' ? y+this.settings.root_height : y-(data_space+data_height);
      let width = this.settings.width*1.3;
      let height = this.settings.height-this.settings.root_height;

      // Chains
      let _line = new Path2D();
      _line.moveTo(x+width/4, y+height*4/10);
      _line.lineTo(x+width*3/4, y+height*4/10);
      _line.moveTo(x+width/4, y+height*6/10);
      _line.lineTo(x+width*3/4, y+height*6/10);
      _line.moveTo(x+width*3/8, y+height/4);
      _line.lineTo(x+width*3/8, y+height*3/4);
      _line.moveTo(x+width*5/8, y+height/4);
      _line.lineTo(x+width*5/8, y+height*3/4);
      this.strokeBold(_line)
    }
    genRoot(){
      let x = this.x;
      let y = this.y;
      let width = this.settings.width*1.3;
      let height = this.settings.root_height;
      let root = this._root;
      let data_height = this.settings.data_height;
      let data_space = this.settings.data_space;
      if(this.orientation=='D'){
        y = y-(data_space + data_height)+height*2+1;  // Fix pixel
        height *= -1;
      }

      // Root area
      let _root = [];
      let _temp;
      if(root==3){
        // Left
        _temp = new Path2D();
        _temp.moveTo(x+width*0/8, y+height);
        _temp.lineTo(x+width*2/8, y);
        _temp.lineTo(x+width*3/8, y+height/2);
        _temp.lineTo(x+width*2/8, y+height);
        _root.push(_temp);

        // Right
        _temp = new Path2D();
        _temp.moveTo(x+width*2/8, y+height);
        _temp.lineTo(x+width*4/8, y);
        _temp.lineTo(x+width*6/8, y+height);
        _root.push(_temp);

        // Right
        _temp = new Path2D();
        _temp.moveTo(x+width*8/8, y+height);
        _temp.lineTo(x+width*6/8, y);
        _temp.lineTo(x+width*5/8, y+height/2);
        _temp.lineTo(x+width*6/8, y+height);
        _root.push(_temp);
      }else if(root==2){
        // Left
        _temp = new Path2D();
        _temp.moveTo(x+width*0/4, y+height);
        _temp.lineTo(x+width*1/4, y);
        _temp.lineTo(x+width*2/4, y+height);
        _root.push(_temp);

        // Right
        _temp = new Path2D();
        _temp.moveTo(x+width*2/4, y+height);
        _temp.lineTo(x+width*3/4, y);
        _temp.lineTo(x+width*4/4, y+height);
        _root.push(_temp);
      }
      this.root = _root;
    }
    drawRoot(){
      this.root.forEach((i) => {
        this.ctx.stroke(i);
      });
    }
    draw(){
      this.strokeBold(this.tooth);
      this.strokeBold(this.tooth_top);
      this.strokeBold(this.tooth_bottom);
      this.strokeBold(this.tooth_left);
      this.strokeBold(this.tooth_right);
      this.drawRoot();
      this.molarBase();

      this.ctx.stroke(this.data_area);
    }
  }
  Premolar = class extends this.Tooth {
    constructor(settings, ctx, x, y, key, orientation, root=2, direction=true){
      // body: 2
      super(settings, ctx, x, y, key, orientation, 2);
      this._crown = 4;
      this._root = root;
      this._direction = direction;  // True: right  False: left
      this.genRoot();
    }
    premolarBase(){
      let x = this.x;
      let y = this.y+this.settings.root_height;  // Y coordinate of tooth
      let width = this.settings.width*1.3;
      let height = this.settings.height-this.settings.root_height;
      let data_height = this.settings.data_height;
      let data_space = this.settings.data_space;
      if(this.orientation=='D'){
        y = y-(data_space + data_height);  // Fix pixel
        height *= -1;
      }

      // horizontal line
      this.ctx.beginPath();
      this.ctx.moveTo(x+width/4, y+height/2);
      this.ctx.lineTo(x+width*3/4, y+height/2);
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
      this.ctx.lineWidth = 1;
    }
    genRoot(){
      let x = this.x;
      let y = this.y;
      let width = this.settings.width*1.3;
      let height = this.settings.root_height;
      let root = this._root;
      let data_height = this.settings.data_height;
      let data_space = this.settings.data_space;
      if(this.orientation=='D'){
        y = y-(data_space + data_height)+height*2+1;  // Fix pixel
        height *= -1;
      }

      // Root area
      let _root = [];
      let _temp;
      if(root==1){
        _temp = new Path2D();
        _temp.moveTo(x+width*1/4, y+height);
        _temp.lineTo(x+width*2/4, y);
        _temp.lineTo(x+width*3/4, y+height);
        _root.push(_temp);
      }else if(root==2){
        // Behind
        _temp = new Path2D();
        _temp.moveTo(x+width*1/5, y+height);
        _temp.lineTo(x+width*2/5, y);
        if(this._direction){  // Direction
          _temp.lineTo(x+width*1/2, y+height/2);
          _temp.lineTo(x+width*2/5, y+height);
        }else{
          _temp.lineTo(x+width*3/5, y+height);
        }
        _root.push(_temp);

        // Main
        _temp = new Path2D();
        _temp.moveTo(x+width*4/5, y+height);
        _temp.lineTo(x+width*3/5, y);
        if(!this._direction){  // Direction
          _temp.lineTo(x+width*1/2, y+height/2);
          _temp.lineTo(x+width*3/5, y+height);
        }else{
          _temp.lineTo(x+width*2/5, y+height);
        }
        _root.push(_temp);
      }
      this.root = _root;
    }
    drawRoot(){
      this.root.forEach((i) => {
        this.ctx.stroke(i);
      });
    }
    draw(){
      this.strokeBold(this.tooth);
      this.strokeBold(this.tooth_top);
      this.strokeBold(this.tooth_bottom);
      this.strokeBold(this.tooth_left);
      this.strokeBold(this.tooth_right);
      this.drawRoot();
      this.premolarBase();

      this.ctx.stroke(this.data_area);
    }
  }
  Canine = class extends this.Tooth {
    constructor(settings, ctx, x, y, key, orientation, root=2, direction=true){
      // body: 2
      super(settings, ctx, x, y, key, orientation, 2);
      this._crown = 4;
      this._root = root;
      this._direction = direction;  // True: right  False: left
      this.genRoot();
    }
    genRoot(){
      let x = this.x;
      let y = this.y;
      let width = this.settings.width*1.3;
      let height = this.settings.root_height;
      let root = this._root;
      let data_height = this.settings.data_height;
      let data_space = this.settings.data_space;
      if(this.orientation=='D'){
        y = y-(data_space + data_height)+height*2+1;  // Fix pixel
        height *= -1;
      }

      // Root area
      let _root = [];
      let _temp;
      if(root==1){
        _temp = new Path2D();
        _temp.moveTo(x+width*1/4, y+height);
        _temp.lineTo(x+width*2/4, y);
        _temp.lineTo(x+width*3/4, y+height);
        _root.push(_temp);
      }else if(root==2){
        // Behind
        _temp = new Path2D();
        _temp.moveTo(x+width*1/5, y+height);
        _temp.lineTo(x+width*2/5, y);
        if(this._direction){  // Direction
          _temp.lineTo(x+width*1/2, y+height/2);
          _temp.lineTo(x+width*2/5, y+height);
        }else{
          _temp.lineTo(x+width*3/5, y+height);
        }
        _root.push(_temp);

        // Main
        _temp = new Path2D();
        _temp.moveTo(x+width*4/5, y+height);
        _temp.lineTo(x+width*3/5, y);
        if(!this._direction){  // Direction
          _temp.lineTo(x+width*1/2, y+height/2);
          _temp.lineTo(x+width*3/5, y+height);
        }else{
          _temp.lineTo(x+width*2/5, y+height);
        }
        _root.push(_temp);
      }
      this.root = _root;
    }
    drawRoot(){
      this.root.forEach((i) => {
        this.ctx.stroke(i);
      });
    }
    draw(){
      this.strokeBold(this.tooth);
      this.strokeBold(this.tooth_top);
      this.strokeBold(this.tooth_bottom);
      this.strokeBold(this.tooth_left);
      this.strokeBold(this.tooth_right);
      this.drawRoot();

      this.ctx.stroke(this.data_area);
    }
  }
  Incisor = class extends this.Tooth {
    constructor(settings, ctx, x, y, key, orientation){
      // body: 1
      super(settings, ctx, x, y, key, orientation, 1);
      this._crown = 4;
      this._root = 3;
      this.drawRoot();
    }
    drawRoot(){
      let x = this.x;
      let y = this.y;
      let width = this.settings.width;
      let height = this.settings.root_height;
      let data_height = this.settings.data_height;
      let data_space = this.settings.data_space;
      if(this.orientation=='D'){
        y = y-(data_space + data_height)+height*2+1;  // Fix pixel
        height *= -1;
      }

      // Root area
      let _root = new Path2D();
      _root.moveTo(x, y+height);
      _root.lineTo(x+width/2, y);
      _root.lineTo(x+width, y+height);
      this.root = _root;
    }
    draw(){
      this.strokeBold(this.tooth);
      this.strokeBold(this.tooth_top);
      this.strokeBold(this.tooth_bottom);
      this.strokeBold(this.tooth_left);
      this.strokeBold(this.tooth_right);
      this.ctx.stroke(this.root);

      this.ctx.stroke(this.data_area);
    }
  }

  printTeeth(type='A'){
    // Elements
    let odontogram_el = document.getElementById('odontogram');
    let ctx = this.state.ctx;
    // Canvas context settings
    this.state.ctx.fillStyle = "#D227";
    this.state.ctx.font = "10px Open Sans";

    // Objects properties
    let scale = .9;
    let settings = {
      tooth_spacing: 7*scale,
      width: 30*scale,
      height: 65*scale,
      root_height: 32*scale,
      data_height: 35*scale,
      data_space: 60*scale,
    }

    // Clear canvas
    this.state.ctx.clearRect(0, 0, odontogram_el.width, odontogram_el.height);

    // General
    let build_adult_top = [
      {key: 18, orientation: 'U', type: 0, data: [3]},
      {key: 17, orientation: 'U', type: 0, data: [3]},
      {key: 16, orientation: 'U', type: 0, data: [3]},
      {key: 15, orientation: 'U', type: 1, data: [1]},
      {key: 14, orientation: 'U', type: 2, data: [2, 1]},
      {key: 13, orientation: 'U', type: 3, data: []},
      {key: 12, orientation: 'U', type: 3, data: []},
      {key: 11, orientation: 'U', type: 3, data: []},
      {key: 21, orientation: 'U', type: 3, data: []},
      {key: 22, orientation: 'U', type: 3, data: []},
      {key: 23, orientation: 'U', type: 3, data: []},
      {key: 24, orientation: 'U', type: 1, data: [2, 0]},
      {key: 25, orientation: 'U', type: 1, data: [1]},
      {key: 26, orientation: 'U', type: 0, data: [3]},
      {key: 27, orientation: 'U', type: 0, data: [3]},
      {key: 28, orientation: 'U', type: 0, data: [3]},
    ];
    let build_kid_top = [
      {key: 55, orientation: 'U', type: 0, data: [3]},
      {key: 54, orientation: 'U', type: 0, data: [3]},
      {key: 53, orientation: 'U', type: 3, data: []},
      {key: 52, orientation: 'U', type: 3, data: []},
      {key: 51, orientation: 'U', type: 3, data: []},
      {key: 61, orientation: 'U', type: 3, data: []},
      {key: 62, orientation: 'U', type: 3, data: []},
      {key: 63, orientation: 'U', type: 3, data: []},
      {key: 64, orientation: 'U', type: 0, data: [3]},
      {key: 65, orientation: 'U', type: 0, data: [3]},
    ];
    let build_adult_bottom = [
      {key: 48, orientation: 'D', type: 0, data: [2]},
      {key: 47, orientation: 'D', type: 0, data: [2]},
      {key: 46, orientation: 'D', type: 0, data: [2]},
      {key: 45, orientation: 'D', type: 1, data: [1]},
      {key: 44, orientation: 'D', type: 1, data: [1]},
      {key: 43, orientation: 'D', type: 3, data: []},
      {key: 42, orientation: 'D', type: 3, data: []},
      {key: 41, orientation: 'D', type: 3, data: []},
      {key: 31, orientation: 'D', type: 3, data: []},
      {key: 32, orientation: 'D', type: 3, data: []},
      {key: 33, orientation: 'D', type: 3, data: []},
      {key: 34, orientation: 'D', type: 1, data: [1]},
      {key: 35, orientation: 'D', type: 1, data: [1]},
      {key: 36, orientation: 'D', type: 0, data: [2]},
      {key: 37, orientation: 'D', type: 0, data: [2]},
      {key: 38, orientation: 'D', type: 0, data: [2]},
    ];
    let build_kid_bottom = [
      {key: 85, orientation: 'D', type: 0, data: [2]},
      {key: 84, orientation: 'D', type: 0, data: [2]},
      {key: 83, orientation: 'D', type: 3, data: []},
      {key: 82, orientation: 'D', type: 3, data: []},
      {key: 81, orientation: 'D', type: 3, data: []},
      {key: 71, orientation: 'D', type: 3, data: []},
      {key: 72, orientation: 'D', type: 3, data: []},
      {key: 73, orientation: 'D', type: 3, data: []},
      {key: 74, orientation: 'D', type: 0, data: [2]},
      {key: 75, orientation: 'D', type: 0, data: [2]},
    ];
    let _left = (
      // Odontogram element width
      odontogram_el.width-
      // Tooth with plus tooth spacing
      (settings.width+settings.tooth_spacing)*(2+ (type=='A'?16:10))
    )/2;  // Half of the total space left
    let _top = 30;
    let _build_data;

    // Upper teeth
    let upper_teeth = [];
    _top += settings.data_height+settings.data_space;
    _build_data = type=='A' ? build_adult_top : build_kid_top;
    _build_data.forEach((v, i)=>{
      // Calc coordinates
      let _x = _left;
      if(upper_teeth.length){
        let last_tooth = upper_teeth[upper_teeth.length-1];
        _x = last_tooth.x + settings.tooth_spacing;
        _x += last_tooth.body==2 ? settings.width*1.3 : settings.width;
      }

      // Create object with properties
      let a;
      switch(v.type){
        case 0: a = new this.Molar(this.settings, this.state.ctx, _x, _top, v.key, v.orientation, ...v.data); break;
        case 1: a = new this.Premolar(this.settings, this.state.ctx, _x, _top, v.key, v.orientation, ...v.data); break;
        case 2: a = new this.Canine(this.settings, this.state.ctx, _x, _top, v.key, v.orientation, ...v.data); break;
        case 3: a = new this.Incisor(this.settings, this.state.ctx, _x, _top, v.key, v.orientation, ...v.data); break;
      }
      a.draw();
      upper_teeth.push(a);
    });

    // Lower teeth
    let lower_teeth = [];
    _top *= 2.7;  // Dependant of canvas
    _build_data = type=='A' ? build_adult_bottom : build_kid_bottom;
    _build_data.forEach((v, i)=>{
      // Calc coordinates
      let _x = _left;
      if(lower_teeth.length){
        let last_tooth = lower_teeth[lower_teeth.length-1];
        _x = last_tooth.x + this.settings.tooth_spacing;
        _x += last_tooth.body==2 ? this.settings.width*1.3 : settings.width;
      }

      // Create object with properties
      let a;
      switch(v.type){
        case 0: a = new this.Molar(this.settings, this.state.ctx, _x, _top, v.key, v.orientation, ...v.data); break;
        case 1: a = new this.Premolar(this.settings, this.state.ctx, _x, _top, v.key, v.orientation, ...v.data); break;
        case 2: a = new this.Canine(this.settings, this.state.ctx, _x, _top, v.key, v.orientation, ...v.data); break;
        case 3: a = new this.Incisor(this.settings, this.state.ctx, _x, _top, v.key, v.orientation, ...v.data); break;
      }
      a.draw();
      lower_teeth.push(a);
    });
  }

  render(){
    return (
    <>
      {/* HEADER */}
      <div className="subheader">
        <h1 className="subheader-title">
          <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"
            data-prefix="fas" data-icon="tooth" className="svg-inline--fa fa-tooth fa-w-14"
            role="img" viewBox="0 0 448 512" style={{width: "15px", height: "16px", verticalAlign: "baseline", filter: "opacity(.9)"}}>
              <path fill="currentColor" d="M443.98 96.25c-11.01-45.22-47.11-82.06-92.01-93.72-32.19-8.36-63 5.1-89.14 24.33-3.25 2.39-6.96 3.73-10.5 5.48l28.32 18.21c7.42 4.77 9.58 14.67 4.8 22.11-4.46 6.95-14.27 9.86-22.11 4.8L162.83 12.84c-20.7-10.85-43.38-16.4-66.81-10.31-44.9 11.67-81 48.5-92.01 93.72-10.13 41.62-.42 80.81 21.5 110.43 23.36 31.57 32.68 68.66 36.29 107.35 4.4 47.16 10.33 94.16 20.94 140.32l7.8 33.95c3.19 13.87 15.49 23.7 29.67 23.7 13.97 0 26.15-9.55 29.54-23.16l34.47-138.42c4.56-18.32 20.96-31.16 39.76-31.16s35.2 12.85 39.76 31.16l34.47 138.42c3.39 13.61 15.57 23.16 29.54 23.16 14.18 0 26.48-9.83 29.67-23.7l7.8-33.95c10.61-46.15 16.53-93.16 20.94-140.32 3.61-38.7 12.93-75.78 36.29-107.35 21.95-29.61 31.66-68.8 21.53-110.43z"/>
          </svg> Odontograma
        </h1>
        <div className="btn-group btn-group-toggle" data-toggle="buttons">
          <label className="btn btn-info waves-effect waves-themed active" onClick={()=>this.printTeeth('A')}>
            <input type="radio" name="odontogram_type" defaultChecked /> Adulto
          </label>
          <label className="btn btn-info waves-effect waves-themed" onClick={()=>this.printTeeth('K')}>
            <input type="radio" name="odontogram_type" /> Infante
          </label>
        </div>
      </div>
      <div>
        <div className="odontogram_container">
          <canvas id="odontogram" width="800" height="400"></canvas>
        </div>
      </div>
    </>
    )
  }
  componentDidMount(){
    // Elements
    let odontogram_el = document.getElementById('odontogram');
    let ctx = odontogram_el.getContext('2d');

    let clone = Object.assign({}, this.state);
    clone.ctx = ctx;
    this.setState(clone, this.printTeeth);
  }
}

/* Export by giving access to route props
  Source:
  https://reacttraining.com/react-router/web/api/withRouter
*/
export default withRouter(Odontograma);
