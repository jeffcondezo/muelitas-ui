import React from 'react';
import { withRouter } from "react-router-dom";  // Allow us access to route props

class Odontograma extends React.Component {
  constructor(props){
    super();
    this.state = {
      cita: props.data.cita,
      ctx: false,
      teeth: false,
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
    // Odontogram data
    this.build_data = {
      build_adult_top: [
        {key: 18, orientation: 'U', type: 0, root: 3, incidents: [{component: 11, type: 2, value:1}, {component: 13, type: 2, value:3}]},
        {key: 17, orientation: 'U', type: 0, root: 3, incidents: [{component: 12, type: 2, value:2}, {component: 13, type: 2, value:4}]},
        {key: 16, orientation: 'U', type: 0, root: 3, incidents: []},
        {key: 15, orientation: 'U', type: 1, root: 1, incidents: [{component: 11, type: 2, value:1}]},
        {key: 14, orientation: 'U', type: 2, root: 2, incidents: [{component: 11, type: 2, value:1}]},
        {key: 13, orientation: 'U', type: 3, incidents: [{component: 11, type: 2, value:1}, {component: 13, type: 2, value:1}]},
        {key: 12, orientation: 'U', type: 3, incidents: [{component: 12, type: 2, value:1}, {component: 14, type: 2, value:1}]},
        {key: 11, orientation: 'U', type: 3, incidents: [{component: 11, type: 2, value:1}, {component: 12, type: 2, value:1}]},
        {key: 21, orientation: 'U', type: 3, incidents: [{component: 13, type: 2, value:1}, {component: 14, type: 2, value:1}]},
        {key: 22, orientation: 'U', type: 3, incidents: [{type: 4, value:{xo: 2, yo: 22, xf: 26, yf: 58}}]},
        {key: 23, orientation: 'U', type: 3, incidents: []},
        {key: 24, orientation: 'U', type: 1, root: 2, incidents: [{component: 11, type: 2, value:1}]},
        {key: 25, orientation: 'U', type: 1, root: 1, incidents: [{component: 11, type: 2, value:1}]},
        {key: 26, orientation: 'U', type: 0, root: 3, incidents: [{component: 11, type: 2, value:1}]},
        {key: 27, orientation: 'U', type: 0, root: 3, incidents: [{component: 11, type: 2, value:1}]},
        {key: 28, orientation: 'U', type: 0, root: 3, incidents: [{component: 11, type: 2, value:1}]},
      ],
      build_kid_top: [
        {key: 55, orientation: 'U', type: 0, root: 3, incidents: [{component: 13, type: 2, value:1}]},
        {key: 54, orientation: 'U', type: 0, root: 3, incidents: [{component: 12, type: 2, value:1}]},
        {key: 53, orientation: 'U', type: 3, incidents: [{component: 11, type: 2, value:1}]},
        {key: 52, orientation: 'U', type: 3, incidents: [{component: 11, type: 2, value:1}]},
        {key: 51, orientation: 'U', type: 3, incidents: [{component: 11, type: 2, value:1}]},
        {key: 61, orientation: 'U', type: 3, incidents: [{component: 11, type: 2, value:1}]},
        {key: 62, orientation: 'U', type: 3, incidents: [{component: 11, type: 2, value:1}]},
        {key: 63, orientation: 'U', type: 3, incidents: [{component: 11, type: 2, value:1}]},
        {key: 64, orientation: 'U', type: 0, root: 3, incidents: [{component: 11, type: 2, value:1}]},
        {key: 65, orientation: 'U', type: 0, root: 3, incidents: [{component: 11, type: 2, value:1}]},
      ],
      build_adult_bottom: [
        {key: 48, orientation: 'D', type: 0, root: 2, incidents: [{component: 13, type: 2, value:1}]},
        {key: 47, orientation: 'D', type: 0, root: 2, incidents: [{component: 11, type: 2, value:1}]},
        {key: 46, orientation: 'D', type: 0, root: 2, incidents: [{component: 13, type: 2, value:1}]},
        {key: 45, orientation: 'D', type: 1, root: 1, incidents: [{component: 11, type: 2, value:1}]},
        {key: 44, orientation: 'D', type: 1, root: 1, incidents: [{component: 11, type: 2, value:1}]},
        {key: 43, orientation: 'D', type: 3, incidents: [{component: 11, type: 2, value:1}]},
        {key: 42, orientation: 'D', type: 3, incidents: [{component: 11, type: 2, value:1}]},
        {key: 41, orientation: 'D', type: 3, incidents: [{component: 11, type: 2, value:1}]},
        {key: 31, orientation: 'D', type: 3, incidents: [{component: 11, type: 2, value:1}]},
        {key: 32, orientation: 'D', type: 3, incidents: [{component: 11, type: 2, value:1}]},
        {key: 33, orientation: 'D', type: 3, incidents: [{component: 11, type: 2, value:1}]},
        {key: 34, orientation: 'D', type: 1, root: 1, incidents: [{component: 11, type: 2, value:1}]},
        {key: 35, orientation: 'D', type: 1, root: 1, incidents: [{component: 11, type: 2, value:1}]},
        {key: 36, orientation: 'D', type: 0, root: 2, incidents: [{component: 11, type: 2, value:1}]},
        {key: 37, orientation: 'D', type: 0, root: 2, incidents: [{component: 11, type: 2, value:1}]},
        {key: 38, orientation: 'D', type: 0, root: 2, incidents: [{component: 11, type: 2, value:1}]},
      ],
      build_kid_bottom: [
        {key: 85, orientation: 'D', type: 0, root: 2, incidents: [{component: 12, type: 2, value:1}]},
        {key: 84, orientation: 'D', type: 0, root: 2, incidents: [{component: 12, type: 2, value:1}]},
        {key: 83, orientation: 'D', type: 3, incidents: [{component: 11, type: 2, value:1}]},
        {key: 82, orientation: 'D', type: 3, incidents: [{component: 11, type: 2, value:1}]},
        {key: 81, orientation: 'D', type: 3, incidents: [{component: 11, type: 2, value:1}]},
        {key: 71, orientation: 'D', type: 3, incidents: [{component: 11, type: 2, value:1}]},
        {key: 72, orientation: 'D', type: 3, incidents: [{component: 11, type: 2, value:1}]},
        {key: 73, orientation: 'D', type: 3, incidents: [{component: 11, type: 2, value:1}]},
        {key: 74, orientation: 'D', type: 0, root: 2, incidents: [{component: 11, type: 2, value:1}]},
        {key: 75, orientation: 'D', type: 0, root: 2, incidents: [{component: 11, type: 2, value:1}]},
      ],
    }
    this.odontogram_squares = {
      square_top: null,
      square_bottom: null
    }
    this.currentTooth = {
      tooth: null,
      path: null
    }
  }
  // Classes
  Tooth = class {
    constructor(settings, ctx, x, y, key, orientation, body, incidents){
      this.settings = settings;
      this.ctx = ctx;
      this.key = key;
      this.orientation = orientation;
      this.x = x;
      this.y = y;
      this.body = body;
      this.incidents = incidents;
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

      // General area
      let _area = new Path2D();
      _y = this.orientation=='U' ? y : y-(data_space+data_height);  // Fix pixel
      _area.rect(x, _y, width, height);
      this.area = _area;
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

      // Top part
      let tooth_top = new Path2D();
      tooth_top.moveTo(x, y);
      tooth_top.lineTo(x+width*tooth_line_left, y+height*tooth_line_up);
      tooth_top.lineTo(x+width*tooth_line_right, y+height*tooth_line_up);
      tooth_top.lineTo(x+width, y);
      this.tooth_top = tooth_top;
      // Bottom part
      let tooth_bottom = new Path2D();
      tooth_bottom.moveTo(x, y+height);
      tooth_bottom.lineTo(x+width*tooth_line_left, y+height*tooth_line_down);
      tooth_bottom.lineTo(x+width*tooth_line_right, y+height*tooth_line_down);
      tooth_bottom.lineTo(x+width, y+height);
      this.tooth_bottom = tooth_bottom;
      // Left part
      let tooth_left = new Path2D();
      tooth_left.moveTo(x, y);
      tooth_left.lineTo(x+width*tooth_line_left, y+height*tooth_line_up);
      tooth_left.lineTo(x+width*tooth_line_left, y+height*tooth_line_down);
      tooth_left.lineTo(x, y+height);
      this.tooth_left = tooth_left;
      // Right part
      let tooth_right = new Path2D();
      tooth_right.moveTo(x+width, y);
      tooth_right.lineTo(x+width*tooth_line_right, y+height*tooth_line_up);
      tooth_right.lineTo(x+width*tooth_line_right, y+height*tooth_line_down);
      tooth_right.lineTo(x+width, y+height);
      this.tooth_right = tooth_right;
      // Center part
      let tooth_center = new Path2D();
      let tooth_center_tl = new Path2D();
      let tooth_center_tr = new Path2D();
      let tooth_center_bl = new Path2D();
      let tooth_center_br = new Path2D();
      if(this.body==2){
        // Center area
        tooth_center.moveTo(x+width*tooth_line_left, y+height*tooth_line_up);
        tooth_center.lineTo(x+width*tooth_line_right, y+height*tooth_line_up);
        tooth_center.lineTo(x+width*tooth_line_right, y+height*tooth_line_down);
        tooth_center.lineTo(x+width*tooth_line_left, y+height*tooth_line_down);
        // Center top left
        tooth_center_tl.moveTo(x+width*tooth_line_left, y+height*tooth_line_up);
        tooth_center_tl.lineTo(x+width/2, y+height*tooth_line_up);
        tooth_center_tl.lineTo(x+width/2, y+height/2);
        tooth_center_tl.lineTo(x+width*tooth_line_left, y+height/2);
        // Center top right
        tooth_center_tr.lineTo(x+width/2, y+height*tooth_line_up);
        tooth_center_tr.lineTo(x+width*tooth_line_right, y+height*tooth_line_up);
        tooth_center_tr.lineTo(x+width*tooth_line_right, y+height/2);
        tooth_center_tr.lineTo(x+width/2, y+height/2);
        // Center bottom right
        tooth_center_br.moveTo(x+width/2, y+height/2);
        tooth_center_br.lineTo(x+width*tooth_line_right, y+height/2);
        tooth_center_br.lineTo(x+width*tooth_line_right, y+height*tooth_line_down);
        tooth_center_br.lineTo(x+width/2, y+height*tooth_line_down);
        // Center bottom left
        tooth_center_bl.moveTo(x+width*tooth_line_left, y+height/2);
        tooth_center_bl.lineTo(x+width/2, y+height/2);
        tooth_center_bl.lineTo(x+width/2, y+height*tooth_line_down);
        tooth_center_bl.lineTo(x+width*tooth_line_left, y+height*tooth_line_down);
      }
      this.tooth_center = tooth_center;
      this.tooth_center_tl = tooth_center_tl;
      this.tooth_center_tr = tooth_center_tr;
      this.tooth_center_bl = tooth_center_bl;
      this.tooth_center_br = tooth_center_br;
    }
    drawKey(){
      let x = this.x;
      let y = this.y;
      let width = this.body==2 ? this.settings.width*1.3 : this.settings.width;  // Fix width by body
      let height = this.settings.height;
      let data_height = this.settings.data_height;
      let data_space = this.settings.data_space;
      // Tooth key
      if(this.orientation=='U') this.ctx.strokeText(this.key, x-6+width/2, y-data_space+12);
      else if(this.orientation=='D') this.ctx.strokeText(this.key, x-6+width/2, y-(data_space+data_height)+height+data_space-3);
    }
    strokeBold(e){
      this.ctx.beginPath(); this.ctx.lineWidth = 1.5;  // Bold line width
      this.ctx.stroke(e);
      this.ctx.beginPath(); this.ctx.lineWidth = 1;  // Restore line width
    }

    /* abbreviation with colors
    */

    // Incidents from Manual_Odontograma_Electronico
    drawIncidents(){
      if(!this.incidents) return;  // There is no incidents
      let data = [];  // Array to store tooth incident data
      // Print incident
      this.incidents.forEach((v) => {
        // Select tooth part
        let component;
        switch(v.component){
          case 11: component=this.tooth_top; break;
          case 12: component=this.tooth_right; break;
          case 13: component=this.tooth_bottom; break;
          case 14: component=this.tooth_left; break;
          default: component=undefined;
        }
        // Select incident function
        let _txt;
        switch(v.type){
          case 1: _txt = this.inc_LCD(component, v.value); break;
          case 2: _txt = this.inc_DDE(component, v.value); break;
          case 3: _txt = this.inc_Sellante(component, v.value); break;
          case 4: _txt = this.inc_Fractura(component, v.value); break;
          case 5: _txt = this.inc_FFP(component, v.value); break;
          case 6: _txt = this.inc_PDAusente(component, v.value); break;
          case 7: _txt = this.inc_PDErupcion(component, v.value); break;
          case 8: _txt = this.inc_RestDef(component, v.value); break;
          case 9: _txt = this.inc_RestTemp(component, v.value); break;
          case 10: _txt = this.inc_EdentuloTotal(component, v.value); break;
        }
        if(_txt) data.push(_txt);  // Add to tooth incident data when method returned
      });
      // Print tooth incident data
      data.forEach((d, inx) => {
        let x = this.x + 4;
        let y = this.y + 12*(inx+1);
        let height = this.settings.height;
        let data_height = this.settings.data_height;
        let data_space = this.settings.data_space;
        y = this.orientation=='U' ? y-(data_space+data_height) : y-data_height+height;
        this.ctx.strokeStyle = "blue";
        this.ctx.strokeText(d, x, y);
        this.ctx.strokeStyle = "black";
      });
    }
    inc_LCD(c, v){  // 5.3.1  Lesión de caries dental
      console.log("caries");
      let txt;
      switch(v){
        case 1: txt = "MB"; break;
        case 2: txt = "CE"; break;
        case 3: txt = "CD"; break;
        case 4: txt = "CDP"; break;
      }
      return txt;
    }
    inc_DDE(c, v){  //* 5.3.2  Defectos de desarrollo de esmalte
      console.log("DDE | data:", v);
      this.ctx.fillStyle = "red";
      this.ctx.fill(c);
      this.ctx.fillStyle = "#0000";
      let txt;
      switch(v){
        case 1: txt = "HP"; break;
        case 2: txt = "HM"; break;
        case 3: txt = "O"; break;
        case 4: txt = "D"; break;
        case 5: txt = "Fluorosis"; break;
      }
      return txt;
    }
    inc_Sellante(c, v){  // 5.3.3  Sellantes
      console.log("sellante");
      return "S";
    }
    inc_Fractura(c, v){  //* 5.3.4  Fractura
      console.log("Fractura | data:", v);
      this.ctx.strokeStyle = "red";
      this.ctx.lineWidth = 3;
      let xo = this.x + v.xo;
      let yo = this.y + v.yo;
      let xf = this.x + v.xf;
      let yf = this.y + v.yf;
      this.ctx.moveTo(xo, yo);
      this.ctx.lineTo(xf, yf);
      this.ctx.stroke();
      this.ctx.strokeStyle = "#0000";
      this.ctx.lineWidth = 1;
    }
    inc_FFP(c, v){  //* 5.3.5  Fosas y fisuras profundas
      console.log("FFP");
      return "FFP";
    }
    inc_PDAusente(c, v){  //* 5.3.6  Pieza dentaria ausente
      console.log("PDAusente | data:", v);
      // Draw a blue x mark
      this.ctx.strokeStyle = "blue";
      let xf = this.x + v.xf;
      let yf = this.y + v.yf;
      this.ctx.moveTo(this.x, this.y);
      this.ctx.lineTo(this.x+this.settings.width, this.y+this.settings.height);
      this.ctx.moveTo(this.x+this.settings.width, this.y);
      this.ctx.lineTo(this.x, this.y+this.settings.height);
      this.ctx.strokeStyle = "#0000";
    }
    inc_PDErupcion(c, v){  // 5.3.7  Pieza dentaria en erupción
      console.log("PDErupcion");
    }
    inc_RestDef(c, v){  // 5.3.8  Restauración definitiva
      console.log("Restauracion definitiva");
    }
    inc_RestTemp(c, v){  // 5.3.9  Restauración temporal
      console.log("RestTemp");
    }
    inc_EdentuloTotal(c, v){  // 5.3.10  Edéntulo Total
      console.log("EdentuloTotal");
    }
    inc_PDSupernumeraria(){  // 5.3.11  Pieza dentaria supernumeraria
      console.log("PDSupernumeraria");
    }
    inc_PDExtruida(){  // 5.3.12  Pieza dentaria extruida
      console.log("PDExtruida");
    }
    inc_PDIntruida(){  // 5.3.13  Pieza dentaria intruida
      console.log("PDIntruida");
    }
    inc_Diastema(){  // 5.3.14  Diastema
      console.log("Diastema");
    }
    inc_Giroversion(){  // 5.3.15  Giroversión
      console.log("Giroversion");
    }
    inc_PosDent(){  // 5.3.16  Posición dentaria
      console.log("PosDent");
    }
    inc_PDClavija(){  // 5.3.17  Pieza dentaria en clavija
      console.log("PDClavija");
    }
    inc_PDEctopica(){  // 5.3.18  Pieza dentaria ectópica
      console.log("PDEctopica");
    }
    inc_Macrodoncia(){  // 5.3.19  Macrodoncia
      console.log("Macrodoncia");
    }
    inc_Microdoncia(){  // 5.3.20  Microdoncia
      console.log("Microdoncia");
    }
    inc_Fusion(){  // 5.3.21  Fusión
      console.log("Fusion");
    }
    inc_Geminacion(){  // 5.3.22  Geminación
      console.log("Geminacion");
    }
    inc_Impactacion(){  // 5.3.23  Impactación
      console.log("Impactacion");
    }
    inc_SupDesg(){  // 5.3.24  Superficie desgastada
      console.log("SupDesg");
    }
    inc_RemRad(){  // 5.3.25  Remanente radicular
      console.log("RemRad");
    }
    inc_MovPat(){  // 5.3.26  Movilidad Patológica
      console.log("MovPat");
    }
    inc_CoronaTemp(){  // 5.3.27  Corona temporal
      console.log("CoronaTemp");
    }
    inc_Corona(){  // 5.3.28  Corona
      console.log("Corona");
    }
    inc_EM(){  // 5.3.29  Espigo muñon
      console.log("EM");
    }
    inc_ImplanteDental(){  // 5.3.30  Implante dental
      console.log("ImplanteDental");
    }
    inc_AOF(){  // 5.3.31  Aparato ortodóntico fijo
      console.log("AOF");
    }
    inc_AOR(){  // 5.3.32  Aparato ortodóntico removible
      console.log("AOR");
    }
    inc_PF(){  // 5.3.33  Prótesis fija
      console.log("PF");
    }
    inc_PR(){  // 5.3.34  Prótesis removible
      console.log("PR");
    }
    inc_PT(){  // 5.3.35  Prótesis total
      console.log("PT");
    }
    inc_TP(){  // 5.3.36  Tratamiento pulpar
      console.log("TP");
    }
    inc_Transposicion(){  // 5.3.37  Transposición
      console.log("Transposicion");
    }
  }
  Molar = class extends this.Tooth {
    constructor(settings, ctx, x, y, key, orientation, root, incidents){
      // body: 2
      super(settings, ctx, x, y, key, orientation, 2, incidents);
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
      this.ctx.strokeStyle = "#000";
      this.strokeBold(this.tooth);
      this.strokeBold(this.tooth_top);
      this.strokeBold(this.tooth_bottom);
      this.strokeBold(this.tooth_left);
      this.strokeBold(this.tooth_right);
      this.drawRoot();
      this.molarBase();

      this.ctx.stroke(this.data_area);
      this.drawKey();
      this.drawIncidents();
    }
  }
  Premolar = class extends this.Tooth {
    constructor(settings, ctx, x, y, key, orientation, root, incidents){
      // body: 2
      super(settings, ctx, x, y, key, orientation, 2, incidents);
      this._root = root;
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
      let direction = ["1", "4", "5", "8"].includes(String(this.key)[0]);
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
        if(direction){  // Direction
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
      this.ctx.strokeStyle = "#000";
      this.strokeBold(this.tooth);
      this.strokeBold(this.tooth_top);
      this.strokeBold(this.tooth_bottom);
      this.strokeBold(this.tooth_left);
      this.strokeBold(this.tooth_right);
      this.drawRoot();
      this.premolarBase();

      this.ctx.stroke(this.data_area);
      this.drawKey();
      this.drawIncidents();
    }
  }
  Canine = class extends this.Tooth {
    constructor(settings, ctx, x, y, key, orientation, root, incidents){
      // body: 2
      super(settings, ctx, x, y, key, orientation, 2, incidents);
      this._root = root;
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
      let direction = ["1", "4", "5", "8"].includes(String(this.key)[0]);
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
        if(direction){  // Direction
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
      this.ctx.strokeStyle = "#000";
      this.strokeBold(this.tooth);
      this.strokeBold(this.tooth_top);
      this.strokeBold(this.tooth_bottom);
      this.strokeBold(this.tooth_left);
      this.strokeBold(this.tooth_right);
      this.drawRoot();

      this.ctx.stroke(this.data_area);
      this.drawIncidents();
    }
    draw(){
      this.ctx.strokeStyle = "#000";
      this.strokeBold(this.tooth);
      this.strokeBold(this.tooth_top);
      this.strokeBold(this.tooth_bottom);
      this.strokeBold(this.tooth_left);
      this.strokeBold(this.tooth_right);
      this.drawRoot();

      this.ctx.stroke(this.data_area);
      this.drawKey();
      this.drawIncidents();
    }
  }
  Incisor = class extends this.Tooth {
    constructor(settings, ctx, x, y, key, orientation, incidents){
      // body: 1
      super(settings, ctx, x, y, key, orientation, 1, incidents);
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
      this.root = [_root];
    }
    draw(){
      this.ctx.strokeStyle = "#000";
      this.strokeBold(this.tooth);
      this.strokeBold(this.tooth_top);
      this.strokeBold(this.tooth_bottom);
      this.strokeBold(this.tooth_left);
      this.strokeBold(this.tooth_right);
      this.ctx.stroke(this.root[0]);

      this.ctx.stroke(this.data_area);
      this.drawKey();
      this.drawIncidents();
    }
  }

  printTeeth(type='A'){
    // Elements
    let odontogram_el = document.getElementById('odontogram');
    let ctx = this.state.ctx;
    // Canvas context settings
    this.state.ctx.fillStyle = "#D227";
    this.state.ctx.font = "10px Open Sans";

    // Clear canvas
    this.state.ctx.clearRect(0, 0, odontogram_el.width, odontogram_el.height);

    // General
    let _left = (
      // Odontogram element width
      odontogram_el.width-
      // Tooth with plus tooth spacing
      (this.settings.width+this.settings.tooth_spacing)*(2+ (type=='A'?16:10))
    )/2;  // Half of the total space left
    let _top = 30;
    let _build_data;
    let _last_tooth;

    // Upper teeth
    let upper_teeth = [];
    _top += this.settings.data_height+this.settings.data_space;
    _build_data = type=='A' ? this.build_data.build_adult_top : this.build_data.build_kid_top;
    _build_data.forEach((v, i)=>{
      // Calc coordinates
      let _x = _left;
      if(upper_teeth.length){
        let last_tooth = upper_teeth[upper_teeth.length-1];
        _x = last_tooth.x + this.settings.tooth_spacing;
        _x += last_tooth.body==2 ? this.settings.width*1.3 : this.settings.width;
      }

      // Create object with properties
      let a;
      switch(v.type){
        case 0: a = new this.Molar(this.settings, this.state.ctx, _x, _top, v.key, v.orientation, v.root, v.incidents); break;
        case 1: a = new this.Premolar(this.settings, this.state.ctx, _x, _top, v.key, v.orientation, v.root, v.incidents); break;
        case 2: a = new this.Canine(this.settings, this.state.ctx, _x, _top, v.key, v.orientation, v.root, v.incidents); break;
        case 3: a = new this.Incisor(this.settings, this.state.ctx, _x, _top, v.key, v.orientation, v.incidents); break;
      }
      a.draw();
      upper_teeth.push(a);
    });
    // Genereate square_top
    let _square_top = new Path2D();
    _last_tooth = upper_teeth[upper_teeth.length-1];
    _square_top.moveTo(_left, _top-this.settings.data_space-this.settings.data_height);
    _square_top.lineTo(_left, _top+this.settings.height);
    _square_top.lineTo(_last_tooth.x+this.settings.width*(_last_tooth.body==2?1.3:1), _top+this.settings.height);
    _square_top.lineTo(_last_tooth.x+this.settings.width*(_last_tooth.body==2?1.3:1), _top-this.settings.data_space-this.settings.data_height);
    this.odontogram_squares.square_top = _square_top;

    // Lower teeth
    let lower_teeth = [];
    _top *= 2.7;  // Dependant of canvas
    _build_data = type=='A' ? this.build_data.build_adult_bottom : this.build_data.build_kid_bottom;
    _build_data.forEach((v, i)=>{
      // Calc coordinates
      let _x = _left;
      if(lower_teeth.length){
        let last_tooth = lower_teeth[lower_teeth.length-1];
        _x = last_tooth.x + this.settings.tooth_spacing;
        _x += last_tooth.body==2 ? this.settings.width*1.3 : this.settings.width;
      }

      // Create object with properties
      let a;
      switch(v.type){
        case 0: a = new this.Molar(this.settings, this.state.ctx, _x, _top, v.key, v.orientation, v.root, v.incidents); break;
        case 1: a = new this.Premolar(this.settings, this.state.ctx, _x, _top, v.key, v.orientation, v.root, v.incidents); break;
        case 2: a = new this.Canine(this.settings, this.state.ctx, _x, _top, v.key, v.orientation, v.root, v.incidents); break;
        case 3: a = new this.Incisor(this.settings, this.state.ctx, _x, _top, v.key, v.orientation, v.incidents); break;
      }
      a.draw();
      lower_teeth.push(a);
    });
    // Genereate square_top
    let _square_bottom = new Path2D();
    _last_tooth = lower_teeth[lower_teeth.length-1];
    _square_bottom.moveTo(_left, _top-this.settings.data_space-this.settings.data_height);
    _square_bottom.lineTo(_left, _top+this.settings.height);
    _square_bottom.lineTo(_last_tooth.x+this.settings.width*(_last_tooth.body==2?1.3:1), _top+this.settings.height);
    _square_bottom.lineTo(_last_tooth.x+this.settings.width*(_last_tooth.body==2?1.3:1), _top-this.settings.data_space-this.settings.data_height);
    this.odontogram_squares.square_bottom = _square_bottom;

    // Save in this.state
    let clone = Object.assign({}, this.state);
    clone.teeth = {upper_teeth: upper_teeth, lower_teeth: lower_teeth};
    this.setState(clone, ()=>console.log(this));
  }
  mouseInCanvas(e){
    console.log(this, e);
    let ctx = this.state.ctx;
    let odontogram_el = ctx.canvas;
    let x = e.offsetX;
    let y = e.offsetY;
    // Check if mouse is in big squares
    let top = ctx.isPointInPath(this.odontogram_squares.square_top, x, y);
    let bottom = ctx.isPointInPath(this.odontogram_squares.square_bottom, x, y);
    if(top || bottom){
      // Clear canvas area
      // ctx.clearRect(0,0,odontogram_el.width, odontogram_el.height)
      ctx.fillStyle = "skyblue";
      let check_in_teeth;
      if(top){  // Square TOP is hover
        check_in_teeth = this.state.teeth.upper_teeth;  // Check in upper_teeth
      }else if(bottom){  // Square BOTTOM is hover
        check_in_teeth = this.state.teeth.lower_teeth;  // Check in lower_teeth
      }

      let noevenone = check_in_teeth.some((e) => {
        let isIn = ctx.isPointInPath(e.area, x, y);  // Is point in tooth area?
        if(isIn){  // Point is in tooth area
          // If it's not the current tooth (point has moved to other tooth)
          if(this.currentTooth.tooth && e!=this.currentTooth.tooth) this.clearTooth();  // Clear tooth

          // Check if mouse is over root or tooth
          let e_selected;
          let root_area = ctx.isPointInPath(e.root_area, x, y);
          let tooth = ctx.isPointInPath(e.tooth, x, y);
          let paths;
          if(root_area){
            e_selected = e.root_area;
            paths = e.root;
          }else if(tooth){
            e_selected = e.tooth;
            paths = [
              e.tooth_top,
              e.tooth_bottom,
              e.tooth_left,
              e.tooth_right,
              // e.tooth_center,
              e.tooth_center_tl,
              e.tooth_center_tr,
              e.tooth_center_bl,
              e.tooth_center_br,
            ];
          }

          // Check what path is mouse over
          paths.some((path) => {
            let found = ctx.isPointInPath(path, x, y);  // Is point in tooth area?
            if(found){
              // If it's not the current path (point has moved to other tooth component)
              if(this.currentTooth.path && path!=this.currentTooth.path) this.clearTooth();  // Clear tooth
              this.currentTooth.tooth = e;  // Save this as current tooth

              // Print tooth part
              ctx.fill(path);
              this.currentTooth.path = path;

              return true;
            }
            return false;
          });

          return true;  // End loop
        }
        return false;  // Continue loop
      });
      console.log(noevenone);
      if(!noevenone && this.currentTooth.tooth) this.clearTooth();
      /**/
    }else if(this.currentTooth.tooth) this.clearTooth();
  }
  clearTooth(){
    // Clear tooth
    let margin = 2;
    this.state.ctx.clearRect(
      this.currentTooth.tooth.x-margin,
      this.currentTooth.tooth.y-this.settings.data_height-this.settings.data_space-margin,
      this.settings.width*(this.currentTooth.tooth.body==2?1.3:1)+margin*2,
      this.settings.height+this.settings.data_height+this.settings.data_space+margin*2
    );
    this.currentTooth.tooth.draw();
    // Remove current tooth reference
    this.currentTooth.tooth = null;
    this.currentTooth.path = null;
  }
  toothPartClickHandle(){
    if(!this.currentTooth.tooth) return;
    console.log("currentTooth:", this.currentTooth);
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
    odontogram_el.onmouseenter = ()=>{odontogram_el.onmousemove = (e)=>{this.mouseInCanvas(e)}}
    odontogram_el.onmouseleave = ()=>{odontogram_el.onmousemove = null}
    odontogram_el.onclick = ()=>{this.toothPartClickHandle()};

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
