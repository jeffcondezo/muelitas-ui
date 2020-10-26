import React, { useState, useEffect, useRef , useCallback } from 'react';
import { useParams } from 'react-router-dom'
import { handleErrorResponse, capitalizeFirstLetter as cFL } from '../../functions';
import { getDataByPK, simpleGet } from '../../functions';
import { ModalCancel, RegularModalCentered } from '../bits';


// Constant
const __debug__ = process.env.REACT_APP_DEBUG

// General properties
let teeth;
let teeth_a=[], teeth_k=[];
let ctx;  // Context 2d
let select_type = 4;  // Tooth select
let currentTooth = {tooth: null, path: null, preserve: false};
// Objects properties
const scale = 0.9;
const preview_scale = 2.5;
const preview_margin = 3;
const preview_select_margin = 2;
// General settings
const settings = {
  strokeColor: "black",
  hovercolor: "orange",
  toothhovercolor: "#0002",
  tooth_spacing: 7*scale,
  width: 30*scale,
  height: 65*scale,
  root_height: 32*scale,
  data_height: 35*scale,
  data_space: 80*scale,
}
// Odontogram constant data
let build_data = {
  build_adult_top: [
    {key: 18, orientation: 'U', type: 0, root: 3},
    {key: 17, orientation: 'U', type: 0, root: 3},
    {key: 16, orientation: 'U', type: 0, root: 3},
    {key: 15, orientation: 'U', type: 1, root: 1},
    {key: 14, orientation: 'U', type: 2, root: 2},
    {key: 13, orientation: 'U', type: 3},
    {key: 12, orientation: 'U', type: 3},
    {key: 11, orientation: 'U', type: 3},
    {key: 21, orientation: 'U', type: 3},
    {key: 22, orientation: 'U', type: 3},
    {key: 23, orientation: 'U', type: 3},
    {key: 24, orientation: 'U', type: 1, root: 2},
    {key: 25, orientation: 'U', type: 1, root: 1},
    {key: 26, orientation: 'U', type: 0, root: 3},
    {key: 27, orientation: 'U', type: 0, root: 3},
    {key: 28, orientation: 'U', type: 0, root: 3},
  ],
  build_kid_top: [
    {key: 55, orientation: 'U', type: 0, root: 3},
    {key: 54, orientation: 'U', type: 0, root: 3},
    {key: 53, orientation: 'U', type: 3},
    {key: 52, orientation: 'U', type: 3},
    {key: 51, orientation: 'U', type: 3},
    {key: 61, orientation: 'U', type: 3},
    {key: 62, orientation: 'U', type: 3},
    {key: 63, orientation: 'U', type: 3},
    {key: 64, orientation: 'U', type: 0, root: 3},
    {key: 65, orientation: 'U', type: 0, root: 3},
  ],
  build_adult_bottom: [
    {key: 48, orientation: 'D', type: 0, root: 2},
    {key: 47, orientation: 'D', type: 0, root: 2},
    {key: 46, orientation: 'D', type: 0, root: 2},
    {key: 45, orientation: 'D', type: 1, root: 1},
    {key: 44, orientation: 'D', type: 1, root: 1},
    {key: 43, orientation: 'D', type: 3},
    {key: 42, orientation: 'D', type: 3},
    {key: 41, orientation: 'D', type: 3},
    {key: 31, orientation: 'D', type: 3},
    {key: 32, orientation: 'D', type: 3},
    {key: 33, orientation: 'D', type: 3},
    {key: 34, orientation: 'D', type: 1, root: 1},
    {key: 35, orientation: 'D', type: 1, root: 1},
    {key: 36, orientation: 'D', type: 0, root: 2},
    {key: 37, orientation: 'D', type: 0, root: 2},
    {key: 38, orientation: 'D', type: 0, root: 2},
  ],
  build_kid_bottom: [
    {key: 85, orientation: 'D', type: 0, root: 2},
    {key: 84, orientation: 'D', type: 0, root: 2},
    {key: 83, orientation: 'D', type: 3},
    {key: 82, orientation: 'D', type: 3},
    {key: 81, orientation: 'D', type: 3},
    {key: 71, orientation: 'D', type: 3},
    {key: 72, orientation: 'D', type: 3},
    {key: 73, orientation: 'D', type: 3},
    {key: 74, orientation: 'D', type: 0, root: 2},
    {key: 75, orientation: 'D', type: 0, root: 2},
  ]
}
let odontogram_squares = {square_top: null, square_bottom: null};
// Classes
class Tooth {
  constructor(ctx, x, y, key, orientation, body, incidents){
    this.teeth = false;  // To be setted later on
    this.ctx = ctx;
    this.key = key;
    this.orientation = orientation;
    this.x = x;
    this.y = y;
    this.body = body;
    this.incidents = incidents ? incidents : [];
    // Generate general elements
    this.drawBase();
    this.drawToothComponents();
  }
  drawBase(){
    let x = this.x;
    let y = this.y;
    let width = this.body===2 ? settings.width*1.3 : settings.width;  // Fix width by body
    let height = settings.height;
    let root_height = settings.root_height;
    let data_height = settings.data_height;
    let data_space = settings.data_space;
    let _y;

    // Data area
    let _data_area = new Path2D();
    _y = this.orientation==='U' ? y-(data_space+data_height) : y-data_height+height;
    _data_area.rect(x, _y, width, data_height);
    this.data_area = _data_area;

    // General area
    let _area = new Path2D();
    _y = this.orientation==='U' ? y : y-(data_space+data_height);
    _area.rect(x, _y, width, height);
    this.area = _area;
    // Root area
    let _root_area = new Path2D();
    _y = this.orientation==='U' ? y : y-data_space-2;  // Fix pixel
    _root_area.rect(x, _y, width, root_height);
    this.root_area = _root_area;
    // Tooth area
    let _tooth = new Path2D();
    _y = this.orientation==='U' ? y+root_height : y-(data_space+data_height);
    _tooth.rect(x, _y, width, height-root_height);
    this.tooth = _tooth;
  }
  drawToothComponents(){
    let x = this.x;
    let y = this.y;
    let data_height = settings.data_height;
    let data_space = settings.data_space;
    y = this.orientation==='U' ? y+settings.root_height : y-(data_space+data_height);
    let width = this.body===2 ? settings.width*1.3 : settings.width;  // Fix width by body
    let height = settings.height-settings.root_height;
    // line into tooth
    let tooth_line_up = 0;
    let tooth_line_down = 0;
    let tooth_line_right = 0;
    let tooth_line_left = 0;
    if(this.body===2){
      tooth_line_up = 1/4;
      tooth_line_down = 3/4;
      tooth_line_left = 1/4;
      tooth_line_right = 3/4;
    }else if(this.body===1){
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
    tooth_top.moveTo(x+width-1, y);  // Fix pixel
    tooth_top.lineTo(x, y);
    this.tooth_top = tooth_top;
    // Bottom part
    let tooth_bottom = new Path2D();
    tooth_bottom.moveTo(x, y+height);
    tooth_bottom.lineTo(x+width*tooth_line_left, y+height*tooth_line_down);
    tooth_bottom.lineTo(x+width*tooth_line_right, y+height*tooth_line_down);
    tooth_bottom.lineTo(x+width, y+height);
    tooth_bottom.moveTo(x+width-1, y+height);  // Fix pixel
    tooth_bottom.lineTo(x, y+height);
    this.tooth_bottom = tooth_bottom;
    // Left part
    let tooth_left = new Path2D();
    tooth_left.moveTo(x, y);
    tooth_left.lineTo(x+width*tooth_line_left, y+height*tooth_line_up);
    tooth_left.lineTo(x+width*tooth_line_left, y+height*tooth_line_down);
    tooth_left.lineTo(x, y+height);
    tooth_left.moveTo(x, y+height);  // Fix pixel
    tooth_left.lineTo(x, y);
    this.tooth_left = tooth_left;
    // Right part
    let tooth_right = new Path2D();
    tooth_right.moveTo(x+width, y);
    tooth_right.lineTo(x+width*tooth_line_right, y+height*tooth_line_up);
    tooth_right.lineTo(x+width*tooth_line_right, y+height*tooth_line_down);
    tooth_right.lineTo(x+width, y+height);
    tooth_right.moveTo(x+width, y+height);  // Fix pixel
    tooth_right.lineTo(x+width, y);
    this.tooth_right = tooth_right;
    // Center part
    let tooth_center = new Path2D();
    let tooth_center_tl = new Path2D();
    let tooth_center_tr = new Path2D();
    let tooth_center_bl = new Path2D();
    let tooth_center_br = new Path2D();
    if(this.body===2){
      // Center area
      tooth_center.moveTo(x+width*tooth_line_left, y+height*tooth_line_up);
      tooth_center.lineTo(x+width*tooth_line_right, y+height*tooth_line_up);
      tooth_center.lineTo(x+width*tooth_line_right, y+height*tooth_line_down);
      tooth_center.lineTo(x+width*tooth_line_left, y+height*tooth_line_down);
      tooth_center.lineTo(x+width*tooth_line_left, y+height*tooth_line_up);  // Return
      // Center top left
      tooth_center_tl.moveTo(x+width*tooth_line_left, y+height*tooth_line_up);
      tooth_center_tl.lineTo(x+width/2, y+height*tooth_line_up);
      tooth_center_tl.lineTo(x+width/2, y+height/2);
      tooth_center_tl.lineTo(x+width*tooth_line_left, y+height/2);
      tooth_center_tl.lineTo(x+width*tooth_line_left, y+height*tooth_line_up);
      // Center top right
      tooth_center_tr.moveTo(x+width/2, y+height*tooth_line_up);
      tooth_center_tr.lineTo(x+width*tooth_line_right, y+height*tooth_line_up);
      tooth_center_tr.lineTo(x+width*tooth_line_right, y+height/2);
      tooth_center_tr.lineTo(x+width/2, y+height/2);
      tooth_center_tr.lineTo(x+width/2, y+height*tooth_line_up);
      // Center bottom right
      tooth_center_br.moveTo(x+width/2, y+height/2);
      tooth_center_br.lineTo(x+width*tooth_line_right, y+height/2);
      tooth_center_br.lineTo(x+width*tooth_line_right, y+height*tooth_line_down);
      tooth_center_br.lineTo(x+width/2, y+height*tooth_line_down);
      tooth_center_br.lineTo(x+width/2, y+height/2);
      // Center bottom left
      tooth_center_bl.moveTo(x+width*tooth_line_left, y+height/2);
      tooth_center_bl.lineTo(x+width/2, y+height/2);
      tooth_center_bl.lineTo(x+width/2, y+height*tooth_line_down);
      tooth_center_bl.lineTo(x+width*tooth_line_left, y+height*tooth_line_down);
      tooth_center_bl.lineTo(x+width*tooth_line_left, y+height/2);
    }
    this.tooth_center = tooth_center;
    this.tooth_center_tl = tooth_center_tl;
    this.tooth_center_tr = tooth_center_tr;
    this.tooth_center_bl = tooth_center_bl;
    this.tooth_center_br = tooth_center_br;

    // Lines
    // IMPORTANT: Do not change the order of the following variables, it'd cause bugs at saving incidence
    this.tooth_lines = [];

    let line_t = new Path2D();  // Top
    line_t.moveTo(x, y);
    line_t.lineTo(x+width, y);
    this.tooth_lines.push(line_t);

    let line_r = new Path2D();  // Right
    line_r.moveTo(x+width, y);
    line_r.lineTo(x+width, y+height);
    this.tooth_lines.push(line_r);

    let line_b = new Path2D();  // Bottom
    line_b.moveTo(x, y+height);
    line_b.lineTo(x+width, y+height);
    this.tooth_lines.push(line_b);

    let line_l = new Path2D();  // Left
    line_l.moveTo(x, y);
    line_l.lineTo(x, y+height);
    this.tooth_lines.push(line_l);

    let line_tl = new Path2D();  // Top left
    line_tl.moveTo(x, y);
    line_tl.lineTo(x+width*tooth_line_left, y+height*tooth_line_up);
    this.tooth_lines.push(line_tl);

    let line_tr = new Path2D();  // Top right
    line_tr.moveTo(x+width, y);
    line_tr.lineTo(x+width*tooth_line_right, y+height*tooth_line_up);
    this.tooth_lines.push(line_tr);

    let line_br = new Path2D();  // Bottom right
    line_br.moveTo(x+width, y+height);
    line_br.lineTo(x+width*tooth_line_right, y+height*tooth_line_down);
    this.tooth_lines.push(line_br);

    let line_bl = new Path2D();  // Bottom left
    line_bl.moveTo(x, y+height);
    line_bl.lineTo(x+width*tooth_line_left, y+height*tooth_line_down);
    this.tooth_lines.push(line_bl);

    let line_ct1 = new Path2D();  // Center top 1
    let line_ct2 = new Path2D();  // Center top 2
    let line_cr1 = new Path2D();  // Center right 1
    let line_cr2 = new Path2D();  // Center right 2
    let line_cb1 = new Path2D();  // Center bottom 1
    let line_cb2 = new Path2D();  // Center bottom 2
    let line_cl1 = new Path2D();  // Center left 1
    let line_cl2 = new Path2D();  // Center left 2
    let line_cct = new Path2D();  // Center center top
    let line_ccr = new Path2D();  // Center center right
    let line_ccb = new Path2D();  // Center center bottom
    let line_ccl = new Path2D();  // Center center left
    let line_ccc = new Path2D();  // Center center line
    if(this.body===2){
      // Center top 1
      line_ct1.moveTo(x+width*tooth_line_left, y+height*tooth_line_up);
      line_ct1.lineTo(x+width/2, y+height*tooth_line_up);
      // Center center top
      line_cct.moveTo(x+width/2, y+height*tooth_line_up);
      line_cct.lineTo(x+width/2, y+height/2);
      // Center center left
      line_ccl.moveTo(x+width/2, y+height/2);
      line_ccl.lineTo(x+width*tooth_line_left, y+height/2);
      // Center left 2
      line_cl2.moveTo(x+width*tooth_line_left, y+height/2);
      line_cl2.lineTo(x+width*tooth_line_left, y+height*tooth_line_up);
      // Center top 2
      line_ct2.moveTo(x+width/2, y+height*tooth_line_up);
      line_ct2.lineTo(x+width*tooth_line_right, y+height*tooth_line_up);
      // Center right 1
      line_cr1.moveTo(x+width*tooth_line_right, y+height*tooth_line_up);
      line_cr1.lineTo(x+width*tooth_line_right, y+height/2);
      // Center center right
      line_ccr.moveTo(x+width*tooth_line_right, y+height/2);
      line_ccr.lineTo(x+width/2, y+height/2);
      // Center right 2
      line_cr2.moveTo(x+width*tooth_line_right, y+height/2);
      line_cr2.lineTo(x+width*tooth_line_right, y+height*tooth_line_down);
      // Center bottom 1
      line_cb1.moveTo(x+width*tooth_line_right, y+height*tooth_line_down);
      line_cb1.lineTo(x+width/2, y+height*tooth_line_down);
      // Center center bottom
      line_ccb.moveTo(x+width/2, y+height*tooth_line_down);
      line_ccb.lineTo(x+width/2, y+height/2);
      // Center bottom 2
      line_cb2.moveTo(x+width/2, y+height*tooth_line_down);
      line_cb2.lineTo(x+width*tooth_line_left, y+height*tooth_line_down);
      // Center left 1
      line_cl1.moveTo(x+width*tooth_line_left, y+height*tooth_line_down);
      line_cl1.lineTo(x+width*tooth_line_left, y+height/2);
    }else{
      // Center area
      line_ccc.moveTo(x+width*tooth_line_left, y+height*tooth_line_up);
      line_ccc.lineTo(x+width*tooth_line_right, y+height*tooth_line_up);
    }
    this.tooth_lines.push(line_ct1);
    this.tooth_lines.push(line_ct2);
    this.tooth_lines.push(line_cr1);
    this.tooth_lines.push(line_cr2);
    this.tooth_lines.push(line_cb1);
    this.tooth_lines.push(line_cb2);
    this.tooth_lines.push(line_cl1);
    this.tooth_lines.push(line_cl2);
    this.tooth_lines.push(line_cct);
    this.tooth_lines.push(line_ccr);
    this.tooth_lines.push(line_ccb);
    this.tooth_lines.push(line_ccl);
    this.tooth_lines.push(line_ccc);
  }
  drawKey(){
    let x = this.x;
    let y = this.y;
    let width = this.body===2 ? settings.width*1.3 : settings.width;  // Fix width by body
    let height = settings.height;
    let data_height = settings.data_height;
    let data_space = settings.data_space;
    // Tooth key
    this.ctx.strokeStyle = settings.strokeColor;
    if(this.orientation==='U') this.ctx.strokeText(this.key, x-6+width/2, y-data_space+18);
    else if(this.orientation==='D') this.ctx.strokeText(this.key, x-6+width/2, y-(data_space+data_height)+height+data_space-10);
  }
  strokeBold(e){
    this.ctx.beginPath(); this.ctx.lineWidth = 1.5;  // Bold line width
    this.ctx.stroke(e);
    this.ctx.beginPath(); this.ctx.lineWidth = 1;  // Restore line width
  }
  // Setter
  setTeeth(_teeth){
    this.teeth = _teeth
  }

  // Incidents from Manual_Odontograma_Electronico
  selectComponent(key){
    if(typeof(key)==="undefined") return null;  // If component is not specified
    if(key === null) return null;  // If component is not specified
    // Select tooth part
    if(typeof(key)==="number") key = [key];  // Fake array
    // Array of components
    let component = [];
    key.forEach((k) => {
      // IMPORTANT: Do not change the keys of the following cases, it'd cause bugs at saving incidence
      switch(k){
        case 1001: component.push(this.tooth_top); break;
        case 1002: component.push(this.tooth_right); break;
        case 1003: component.push(this.tooth_bottom); break;
        case 1004: component.push(this.tooth_left); break;
        case 1005: component.push(this.tooth_center_tl); break;
        case 1006: component.push(this.tooth_center_tr); break;
        case 1007: component.push(this.tooth_center_br); break;
        case 1008: component.push(this.tooth_center_bl); break;
        // Lines
        case 1100: component.push(this.tooth_lines[0]); break;  // line_t
        case 1101: component.push(this.tooth_lines[1]); break;  // line_r
        case 1102: component.push(this.tooth_lines[2]); break;  // line_b
        case 1103: component.push(this.tooth_lines[3]); break;  // line_l
        case 1104: component.push(this.tooth_lines[4]); break;  // line_tl
        case 1105: component.push(this.tooth_lines[5]); break;  // line_tr
        case 1106: component.push(this.tooth_lines[6]); break;  // line_br
        case 1107: component.push(this.tooth_lines[7]); break;  // line_bl
        case 1108: component.push(this.tooth_lines[8]); break;  // line_ct1
        case 1109: component.push(this.tooth_lines[9]); break;  // line_ct2
        case 1110: component.push(this.tooth_lines[10]); break;  // line_cr1
        case 1111: component.push(this.tooth_lines[11]); break;  // line_cr2
        case 1112: component.push(this.tooth_lines[12]); break;  // line_cb1
        case 1113: component.push(this.tooth_lines[13]); break;  // line_cb2
        case 1114: component.push(this.tooth_lines[14]); break;  // line_cl1
        case 1115: component.push(this.tooth_lines[15]); break;  // line_cl2
        case 1116: component.push(this.tooth_lines[16]); break;  // line_cct
        case 1117: component.push(this.tooth_lines[17]); break;  // line_ccr
        case 1118: component.push(this.tooth_lines[18]); break;  // line_ccb
        case 1119: component.push(this.tooth_lines[19]); break;  // line_ccl
        case 1120: component.push(this.tooth_lines[20]); break;  // line_ccc
        // default: component.push(k); break;
        default: break;
      }
    });

    return component;
  }
  drawIncidents(){
    if(!this.teeth) return  // this.teeth is not setted
    if(!this.incidents) return;  // There is no incidents
    let data = [];  // Array to store tooth incident data
    // Print incident
    this.incidents.forEach((v) => {
      // Select tooth part
      let component = this.selectComponent(v.component);
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
        case 11: _txt = this.inc_PDSupernumeraria(component, v.value); break;
        case 12: _txt = this.inc_PDExtruida(component, v.value); break;
        case 13: _txt = this.inc_PDIntruida(component, v.value); break;
        case 14: _txt = this.inc_Diastema(component, v.value); break;
        case 15: _txt = this.inc_Giroversion(component, v.value); break;
        case 16: _txt = this.inc_PosDent(component, v.value); break;
        case 17: _txt = this.inc_PDClavija(component, v.value); break;
        case 18: _txt = this.inc_PDEctopica(component, v.value); break;
        case 19: _txt = this.inc_Macrodoncia(component, v.value); break;
        case 20: _txt = this.inc_Microdoncia(component, v.value); break;
        case 21: _txt = this.inc_Fusion(component, v.value); break;
        case 22: _txt = this.inc_Geminacion(component, v.value); break;
        case 23: _txt = this.inc_Impactacion(component, v.value); break;
        case 24: _txt = this.inc_SupDesg(component, v.value); break;
        case 25: _txt = this.inc_RemRad(component, v.value); break;
        case 26: _txt = this.inc_MovPat(component, v.value); break;
        case 27: _txt = this.inc_CoronaTemp(component, v.value); break;
        case 28: _txt = this.inc_Corona(component, v.value); break;
        case 29: _txt = this.inc_EM(component, v.value); break;
        case 30: _txt = this.inc_ImplanteDental(component, v.value); break;
        case 31: _txt = this.inc_AOF(component, v.value); break;
        case 32: _txt = this.inc_AOR(component, v.value); break;
        case 33: _txt = this.inc_PF(component, v.value); break;
        case 34: _txt = this.inc_PR(component, v.value); break;
        case 35: _txt = this.inc_PT(component, v.value); break;
        case 36: _txt = this.inc_TP(component, v.value); break;
        case 37: _txt = this.inc_Transposicion(component, v.value); break;
        default: alert(`ERROR IN TEETH BUILD DATA: incident type ${v.type} not found in key ${v.key}`); break;
      }
      if(_txt) data.push(_txt);  // Add to tooth incident data when method returned
    });
    // Print tooth incident data
    this.ctx.lineWidth = 1;
    data.forEach((d, inx) => {
      let x = this.x + 4;
      let y = this.y + 12*(inx+1);
      let height = settings.height;
      let data_height = settings.data_height;
      let data_space = settings.data_space;
      y = this.orientation==='U' ? y-(data_space+data_height) : y-data_height+height;
      this.ctx.strokeStyle = d.color;
      this.ctx.strokeText(d.log, x, y);
    });
  }
  inc_LCD(c, v){  // 5.3.1  Lesión de caries dental
    // c is array
    this.ctx.fillStyle = "red";
    c.forEach((path) => {
      this.ctx.fill(path);
    });
    return {log: v.log, color: "red"};
  }
  inc_DDE(c, v){  // 5.3.2  Defectos de desarrollo de esmalte
    this.ctx.fillStyle = "red";
    c.forEach((path) => {
      this.ctx.fill(path);
    });
    return {log: v.log, color: "black"};
  }
  inc_Sellante(c, v){  // 5.3.3  Sellantes
    let color = v.state ? "blue" : "red";
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 3;
    // c is array
    c.forEach((path) => {
      this.ctx.stroke(path)
    });
    return {log: "S", color: color};
  }
  inc_Fractura(c, v){  // 5.3.4  Fractura
    let y = this.y;
    let width = settings.width*(this.body===2?1.3:1);
    if(this.orientation==='D')
      y += settings.height - (settings.data_space+settings.data_height);

    let vxo;
    let vyo;
    let vxf;
    let vyf;
    switch(v.fractura){
      case 1: vxo=0;vyo=(settings.root_height+settings.height)/2;vxf=width;vyf=vyo; break;  // Crown middle horizontal
      case 2: vxo=width/2;vyo=settings.root_height;vxf=vxo;vyf=settings.height; break;  // Crown middle vertical
      case 3: vxo=width;vyo=settings.root_height;vxf=0;vyf=settings.height; break;  // Diag left
      case 4: vxo=0;vyo=settings.root_height;vxf=width;vyf=settings.height; break;  // Diag right
      case 5: vxo=width/2;vyo=0;vxf=0;vyf=settings.height; break;  // All left
      case 6: vxo=width/2;vyo=0;vxf=width;vyf=settings.height; break;  // All right
      case 7: vxo=width/2;vyo=0;vxf=vxo;vyf=settings.height; break;  // All middle
      default: alert("ERROR FRACTURE CODE NOT FOUND, code: "+v.fractura); return;
    }

    if(this.orientation==='D'){
      vyo *= -1;
      vyf *= -1;
    }

    let xo = this.x + vxo;
    let yo = y + vyo;
    let xf = this.x + vxf;
    let yf = y + vyf;

    this.ctx.strokeStyle = "red";
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.moveTo(xo, yo);
    this.ctx.lineTo(xf, yf);
    this.ctx.stroke();
  }
  inc_FFP(c, v){  // 5.3.5  Fosas y fisuras profundas
    return {log: "FFP", color: "blue"};
  }
  inc_PDAusente(c, v){  // 5.3.6  Pieza dentaria ausente
    let width = settings.width*(this.body===2?1.3:1);
    let height = settings.height;
    let y = this.y;
    if(this.orientation==='D'){
      height *= -1;
      y += settings.height - (settings.data_height+settings.data_space);
    }

    this.ctx.strokeStyle = "blue";
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.moveTo(this.x, y);
    this.ctx.lineTo(this.x+width, y+height);
    this.ctx.moveTo(this.x+width, y);
    this.ctx.lineTo(this.x, y+height);
    this.ctx.stroke();
  }
  inc_PDErupcion(c, v){  // 5.3.7  Pieza dentaria en erupción
    let height = settings.height
    let width = settings.width*(this.body===2?1.3:1);
    let y = this.y;
    let x = this.x;
    if(this.orientation==='D'){
      height *= -1;
      y += settings.height - (settings.data_height+settings.data_space) - 3;
    }
    let eruptionX_0 = 1/3;
    let eruptionY_0 = 0/5;
    let eruptionX_1 = 2/3;
    let eruptionY_1 = 1/5;
    let eruptionX_2 = 1/3;
    let eruptionY_2 = 2/5;
    let eruptionX_3 = 1/2;
    let eruptionY_3 = 3/5;
    let eruptionX_4 = 1/3;
    let eruptionY_4 = 4/5;

    // Draw a blue x mark
    this.ctx.strokeStyle = "blue";
    this.ctx.lineWidth = 5;
    this.ctx.beginPath();
    this.ctx.moveTo(x+width*eruptionX_0, y+height*eruptionY_0);
    this.ctx.lineTo(x+width*eruptionX_1, y+height*eruptionY_1);
    this.ctx.lineTo(x+width*eruptionX_2, y+height*eruptionY_2);
    this.ctx.lineTo(x+width*eruptionX_3, y+height*eruptionY_3);
    this.ctx.lineTo(x+width*eruptionX_4, y+height*eruptionY_4);
    // Arrow
    this.ctx.moveTo(x+width*eruptionX_4, y+height*eruptionY_4);
    this.ctx.lineTo(
      x+width*eruptionX_4-5,
      y+height*eruptionY_4-10*Math.sign(height)
    );
    this.ctx.moveTo(x+width*eruptionX_4-2, y+height*eruptionY_4+2);
    this.ctx.lineTo(
      x+width*eruptionX_4+13,
      y+height*eruptionY_4-5*Math.sign(height)
    );

    this.ctx.stroke();
  }
  inc_RestDef(c, v){  // 5.3.8  Restauración definitiva
    let color = v.state ? "blue" : "red";
    this.ctx.fillStyle = color;
    // c is array
    c.forEach((path) => {
      this.ctx.fill(path)
    });
    return {log: v.log, color: color};
  }
  inc_RestTemp(c, v){  // 5.3.9  Restauración temporal
    this.ctx.strokeStyle = "red";
    this.ctx.lineWidth = 3;
    // c is array
    c.forEach((path) => {
      this.ctx.stroke(path)
    });
  }
  inc_EdentuloTotal(c, v){  // 5.3.10  Edéntulo Total
    /* This function must be called by the last tooth of teeths
      otherwise another incident may overdraw this draw
    */
    let direction = ["1", "2", "5", "6"].includes(String(this.key)[0]);
    let _teeth;
    if(direction) _teeth = this.teeth.upper_teeth;
    else _teeth = this.teeth.lower_teeth;
    let last_index = _teeth.length-1;
    let last_width = settings.width;
    if(_teeth[last_index].body===2) last_width*=1.3;
    let y = this.y;
    if(this.orientation==='D'){
      y -= settings.data_space+settings.root_height+settings.data_height;
    }

    this.ctx.strokeStyle = "blue";
    this.ctx.lineWidth = 4;
    this.ctx.beginPath();
    this.ctx.moveTo(_teeth[0].x, y+(settings.height+settings.root_height)/2);
    this.ctx.lineTo(_teeth[last_index].x+last_width, y+(settings.height+settings.root_height)/2);
    this.ctx.stroke();
  }
  inc_PDSupernumeraria(c, v){  // 5.3.11  Pieza dentaria supernumeraria
    let x = this.x + (v.orientation==='R' ? settings.width : 0);
    let y = this.y;
    if(this.orientation==='D'){
      y += settings.height - (settings.data_height+settings.data_space);
    }

    this.ctx.strokeStyle = "blue";
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(x, y, 8, 0, 2*Math.PI);
    this.ctx.stroke();
    this.ctx.lineWidth = 1;
    this.ctx.strokeText("S", x-3, y+3);
  }
  inc_PDExtruida(c, v){  // 5.3.12  Pieza dentaria extruida
    let y = this.y + settings.height+30;
    let x = this.x + (this.body===2?1.3:1)*settings.width/2;
    let height = 25;
    if(this.orientation==='D'){
      height *= -1;
      y -= settings.height*2+settings.data_space+settings.data_height;
    }

    this.ctx.lineWidth = 3;
    this.ctx.strokeStyle = "blue";
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(x, y-height);
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(x-8, y-height/2);
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(x+8, y-height/2);

    this.ctx.stroke();
  }
  inc_PDIntruida(c, v){  // 5.3.13  Pieza dentaria intruida
    let y = this.y + settings.height+5;
    let x = this.x + (this.body===2?1.3:1)*settings.width/2;
    let height = 25;
    if(this.orientation==='D'){
      height *= -1;
      y -= settings.height+settings.data_space+settings.data_height+10;
    }

    this.ctx.lineWidth = 3;
    this.ctx.strokeStyle = "blue";
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(x, y+height);
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(x-8, y+height/2);
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(x+8, y+height/2);

    this.ctx.stroke();
  }
  inc_Diastema(c, v){  // 5.3.14  Diastema
    let diastema_space = 2;
    let width = settings.width;
    let radius = settings.width;
    let x = this.x;
    let y = this.y + settings.root_height + (settings.height - settings.root_height)/2;
    let left = x + width - diastema_space;
    let right = x + diastema_space;
    if(this.orientation==='D'){
      y -= settings.root_height+settings.data_space+settings.data_height;
    }

    this.ctx.lineWidth = 3;
    this.ctx.strokeStyle = "blue";
    this.ctx.beginPath();
    if(v.orientation==='R'){
      right += this.body===2 ? width*.3 : 0;
      this.ctx.arc(right, y, radius, -40*Math.PI/180, 40*Math.PI/180);
    }else{
      this.ctx.arc(left, y, radius, 140*Math.PI/180, 220*Math.PI/180);
    }
    this.ctx.stroke();
  }
  inc_Giroversion(c, v){  // 5.3.15  Giroversión
    let cy = this.y;
    let y = this.y + settings.height + (this.body===2 ? 8 : 9);
    let width = this.body===2 ? settings.width*1.3/2 : settings.width/2;
    let x = this.x + width - (v.orientation==='R' ? this.body===2 ? -18 : -14 : this.body===2 ? 19 : 15);
    let angel_o = this.body===2 ? 65 : 70;
    let angel_f = this.body===2 ? 115 : 110;
    let _sign = v.orientation==='R' ? 1 : -1;
    if(this.orientation==='D'){
      y -= settings.data_space + settings.data_height + settings.height + 19;
      cy -= settings.data_space + (this.body===2 ? 6 : 3);
      angel_o += 180;
      angel_f += 180;
    }else if(this.orientation==='U'){
      cy += settings.root_height;
    }

    this.ctx.lineWidth = 3;
    this.ctx.strokeStyle = "blue";
    this.ctx.beginPath();
    this.ctx.arc(this.x+width, cy, 40, angel_o*Math.PI/180, angel_f*Math.PI/180);
    this.ctx.moveTo(x, y-2);
    this.ctx.lineTo(x-6*_sign, y+7);
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(x-6*_sign, y-7);
    this.ctx.stroke();
  }
  inc_PosDent(c, v){  // 5.3.16  Posición dentaria
    return {log: v.log, color: "blue"};
  }
  inc_PDClavija(c, v){  // 5.3.17  Pieza dentaria en clavija
    let data_space = settings.data_space;
    let x = this.x;
    let y = this.y - data_space;
    let width = this.body===2 ? settings.width*1.3 : settings.width;
    if(this.orientation==='D'){
      y += data_space + settings.root_height - 8;
    }else if(this.orientation==='U'){
      y += 22;
    }

    this.ctx.strokeStyle = "blue";
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(x+width/2, y-20);
    this.ctx.lineTo(x+width, y);
    this.ctx.lineTo(x, y);
    this.ctx.stroke();
  }
  inc_PDEctopica(c, v){  // 5.3.18  Pieza dentaria ectópica
    return {log: "E", color: "blue"};
  }
  inc_Macrodoncia(c, v){  // 5.3.19  Macrodoncia
    return {log: "MAC", color: "blue"};
  }
  inc_Microdoncia(c, v){  // 5.3.20  Microdoncia
    return {log: "MIC", color: "blue"};
  }
  inc_Fusion(c, v){  // 5.3.21  Fusión
    let data_space = settings.data_space;
    let width = this.body===2 ? settings.width*1.3 : settings.width;
    let x = this.x + width/2;
    let y = this.y - data_space - 7;
    if(this.orientation==='D'){
      y += data_space + settings.root_height - 8;
    }else if(this.orientation==='U'){
      y += 21;
    }
    let sign1 = 1;
    let sign2 = -1;
    if(v.orientation==='L'){
      sign1 = -1;
      sign2 = 1;
    }

    this.ctx.strokeStyle = "blue";
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.arc(x, y, 10, sign1*Math.PI/2, sign2*Math.PI/2);
    this.ctx.ellipse(x, y, width*3/4, 10, 0, sign2*Math.PI/2, sign1*Math.PI/2)
    this.ctx.stroke();
  }
  inc_Geminacion(c, v){  // 5.3.22  Geminación
    let data_space = settings.data_space;
    let width = this.body===2 ? settings.width*1.3 : settings.width;
    let x = this.x + width/2;
    let y = this.y - data_space - 7;
    if(this.orientation==='D'){
      y += data_space + settings.root_height - 8;
    }else if(this.orientation==='U'){
      y += 21;
    }

    this.ctx.strokeStyle = "blue";
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.arc(x, y, 10, 0, 2*Math.PI);
    this.ctx.stroke();
  }
  inc_Impactacion(c, v){  // 5.3.23  Impactación
    return {log: "I", color: "blue"};
  }
  inc_SupDesg(c, v){  // 5.3.24  Superficie desgastada
    this.ctx.strokeStyle = "red";
    this.ctx.lineWidth = 3;
    // c is array
    c.forEach((path) => {
      this.ctx.stroke(path)
    });
    return {log: "DES", color: "red"};
  }
  inc_RemRad(c, v){  // 5.3.25  Remanente radicular
    return {log: "RR", color: "red"};
  }
  inc_MovPat(c, v){  // 5.3.26  Movilidad Patológica
    v.log = isFinite(v.log) ? v.log : '';
    return {log: "M"+v.log, color: "red"};
  }
  inc_CoronaTemp(c, v){  // 5.3.27  Corona temporal
    this.ctx.lineWidth = 3;
    this.ctx.strokeStyle = "red";
    this.ctx.stroke(this.tooth);
    this.ctx.lineWidth = 1;
    return {log: "CT", color: "red"};
  }
  inc_Corona(c, v){  // 5.3.28  Corona
    this.ctx.lineWidth = 3;
    this.ctx.strokeStyle = v.state ? "blue" : "red";
    this.ctx.stroke(this.tooth);
    this.ctx.lineWidth = 1;

    return {log: v.log, color: "blue"};
  }
  inc_EM(c, v){  // 5.3.29  Espigo muñon
    let y = this.y;
    let width = settings.width*(this.body===2 ? 1.3 : 1);
    let height = settings.height;
    let sign = 1;
    if(this.orientation==='D'){
      height *= -1;
      y -= settings.data_space+settings.data_height+height;
      sign = -1;
    }

    this.ctx.strokeStyle = v.state ? "blue" : "red";
    // Draw vertical line
    this.ctx.lineWidth = 4;
    this.ctx.beginPath();
    this.ctx.moveTo(this.x+width/2, y);
    this.ctx.lineTo(this.x+width/2, y+height/2+sign*settings.root_height/2);
    this.ctx.stroke();
    // Draw square
    this.ctx.lineWidth = 3;
    if(this.body===2){
      this.ctx.stroke(this.tooth_center);
    }else{
      let long = 12
      this.ctx.rect(this.x+width/2-long/2, y+height/2+sign*settings.root_height/2-long/2, long, long);
      this.ctx.stroke();
    }
  }
  inc_ImplanteDental(c, v){  // 5.3.30  Implante dental
    let color = v.state ? "blue" : "red";
    return {log: "IMP", color: color};
  }
  inc_AOF(c, v){  // 5.3.31  Aparato ortodóntico fijo
    /* This function must be called by the last tooth of the affected teeth */
    let direction = ["1", "2", "5", "6"].includes(String(this.key)[0]);
    let _teeth;
    if(direction) _teeth = this.teeth.upper_teeth;
    else if(!direction) _teeth = this.teeth.lower_teeth;
    let start_index;
    let _inx = _teeth.some((tooth, inx) => {
      if(tooth.key==v.start_tooth_key){
        start_index = inx;
        return true;
      }
      return false;
    });
    if(!_inx){
      console.error("SOMETHING WENT WRONG, START_TOOTH_KEY VALUE WASN'T FOUND")
      return;
    }
    let y = this.y - 25;
    let height = 15;  // Size of the square face

    this.ctx.strokeStyle = v.state ? "blue" : "red";
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    let width = settings.width*(_teeth[start_index].body===2 ? 1.3 : 1);
    // Rectangle
    this.ctx.rect(_teeth[start_index].x, y-height/2, height, height)
    this.ctx.moveTo(_teeth[start_index].x+height, y);
    this.ctx.lineTo(this.x+width-height, y);
    // Rectangle
    this.ctx.rect(this.x+width-height, y-height/2, height, height)
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.lineWidth = 2;
    this.ctx.strokeText("+", _teeth[start_index].x+height/3, y+height/4);
    this.ctx.strokeText("+", this.x+width-height*11/16, y+height/4)
  }
  inc_AOR(c, v){  // 5.3.32  Aparato ortodóntico removible
    /* This function must be called by the last tooth of teeths
      otherwise another incident may overdraw this draw
    */
    let direction = ["1", "2", "5", "6"].includes(String(this.key)[0]);
    let _teeth = [];
    if(direction) _teeth = this.teeth.upper_teeth;
    else if(!direction) _teeth = this.teeth.lower_teeth;
    let y = this.y - 10;
    let height = 15;
    if(this.orientation==='D'){
      height *= -1;
      y -= 20;
    }

    this.ctx.strokeStyle = v.state ? "blue" : "red";
    this.ctx.lineWidth = 4;
    this.ctx.beginPath();
    this.ctx.moveTo(_teeth[0].x, y);
    _teeth.forEach((_tooth) => {
      let width = settings.width*(_tooth.body===2 ? 1.3 : 1);
      this.ctx.lineTo(_tooth.x, y);
      this.ctx.lineTo(_tooth.x+width/2, y-height);
      this.ctx.lineTo(_tooth.x+width+settings.tooth_spacing/2, y);
    });
    this.ctx.stroke();
  }
  inc_PF(c, v){  // 5.3.33  Prótesis fija
    /* This function must be called by the last tooth of teeths
      otherwise another incident may overdraw this draw
    */
    let direction = ["1", "2", "5", "6"].includes(String(this.key)[0]);
    let _teeth = direction ? this.teeth.upper_teeth : this.teeth.lower_teeth
    let start_index;
    let _inx = _teeth.some((tooth, inx) => {
      if(tooth.key==v.start_tooth_key){
        start_index = inx;
        return true;
      }
      return false;
    });
    if(!_inx){
      alert("SOMETHING WENT WRONG, START_TOOTH_KEY VALUE WASN'T FOUND")
      return;
    }
    let y = this.y - 25;
    let height = 15;
    if(this.orientation==='D'){
      height *= -1;
    }

    this.ctx.strokeStyle = v.state ? "blue" : "red";
    this.ctx.lineWidth = 4;
    this.ctx.beginPath();
    // Left corner
    this.ctx.moveTo(_teeth[start_index].x, y+height);
    let width = settings.width*(_teeth[start_index].body===2 ? 1.3 : 1);
    this.ctx.lineTo(_teeth[start_index].x, y);
    // Right corner
    this.ctx.lineTo(this.x+width, y);
    this.ctx.lineTo(this.x+width, y+height);
    this.ctx.stroke();
  }
  inc_PR(c, v){  // 5.3.34  Prótesis removible
    /* This function must be called by the last tooth of the affected teeth */
    let direction = ["1", "2", "5", "6"].includes(String(this.key)[0]);
    let _teeth;
    if(direction) _teeth = this.teeth.upper_teeth;
    else if(!direction) _teeth = this.teeth.lower_teeth;
    let start_index;
    let _inx = _teeth.some((tooth, inx) => {
      if(tooth.key==v.start_tooth_key){
        start_index = inx;
        return true;
      }
      return false;
    });
    if(!_inx){
      alert("SOMETHING WENT WRONG, START_TOOTH_KEY VALUE WASN'T FOUND")
      return;
    }
    let y = this.y - 25;
    let height = 5;
    if(this.orientation==='D'){
      height *= -1;
    }

    this.ctx.strokeStyle = v.state ? "blue" : "red";
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    let width = settings.width*(_teeth[start_index].body===2 ? 1.3 : 1);
    // Outter line
    this.ctx.moveTo(_teeth[start_index].x, y);
    this.ctx.lineTo(this.x+width, y);
    // Inner line
    this.ctx.moveTo(_teeth[start_index].x, y+height);
    this.ctx.lineTo(this.x+width, y+height);
    this.ctx.stroke();
  }
  inc_PT(c, v){  // 5.3.35  Prótesis total
    /* This function must be called by the last tooth of the affected teeth */
    let direction = ["1", "2", "5", "6"].includes(String(this.key)[0]);
    let _teeth = [];
    if(direction) _teeth = this.teeth.upper_teeth;
    else if(!direction) _teeth = this.teeth.lower_teeth;
    let start_index = 0;
    let y = this.y - 25;
    let height = 5;
    if(this.orientation==='D'){
      height *= -1;
    }

    this.ctx.strokeStyle = v.state ? "blue" : "red";
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    let width = settings.width*(_teeth[start_index].body===2 ? 1.3 : 1);
    // Outter line
    this.ctx.moveTo(_teeth[start_index].x, y);
    this.ctx.lineTo(_teeth[start_index].x+width+settings.tooth_spacing/2, y);
    this.ctx.lineTo(this.x+width+settings.tooth_spacing/2, y);
    // Inner line
    this.ctx.moveTo(_teeth[start_index].x, y+height);
    this.ctx.lineTo(_teeth[start_index].x+width+settings.tooth_spacing/2, y+height);
    this.ctx.lineTo(this.x+width+settings.tooth_spacing/2, y+height);
    this.ctx.stroke();
  }
  inc_TP(c, v){  // 5.3.36  Tratamiento pulpar
    let y = this.y;
    let width = settings.width*(this.body===2 ? 1.3 : 1);
    let height = settings.height;
    let sign = 1;
    if(this.orientation==='D'){
      height *= -1;
      y -= settings.data_space+settings.data_height+height;
      sign = -1;
    }

    this.ctx.strokeStyle = "blue";
    // Draw vertical line
    this.ctx.lineWidth = 4;
    this.ctx.beginPath();
    this.ctx.moveTo(this.x+width/2, y);
    this.ctx.lineTo(this.x+width/2, y+height/2+sign*settings.root_height/2);
    this.ctx.stroke();
    // Draw square
    this.ctx.fillStyle = "blue";
    this.ctx.beginPath();
    if(this.body===2){
      if(v.log===3) this.ctx.fill(this.tooth_center);
      else this.ctx.stroke(this.tooth_center);
    }else{
      let long = 12
      this.ctx.rect(this.x+width/2-long/2, y+height/2+sign*settings.root_height/2-long/2, long, long);
      if(v.log===3) this.ctx.fill();
      else this.ctx.stroke();
    }

    return {log: v.log, color: v.state?"blue":"red"};
  }
  inc_Transposicion(c, v){  // 5.3.37  Transposición
    let y = this.y + settings.height + (this.body===2 ? 10 : 9);
    let width = this.body===2 ? settings.width*1.3/2 : settings.width/2;
    let x = this.x + width - (v.orientation==='R' ? this.body===2 ? -18 : -14 : this.body===2 ? 19 : 15);
    let angel_o = this.body===2 ? 65 : 70;
    let angel_f = this.body===2 ? 115 : 110;
    let _sign = v.orientation==='R' ? 1 : -1;
    let rad_y = this.body===2 ? 180 : 300;
    let rad_x = this.body===2 ? 50 : 50;
    let cy = this.y;
    let _sign_y = 1;
    if(this.orientation==='D'){
      y -= settings.data_space + settings.data_height + settings.height + 19;
      cy -= settings.data_space + (this.body===2 ? 6 : 3);
      cy += rad_y*(this.body===2 ? 17/24 : 39/48);  // Fix cy by angle
      angel_o += 180;
      angel_f += 180;
      this.ctx.strokeStyle = "blue";
    }else if(this.orientation==='U'){
      this.ctx.strokeStyle = "green";
      cy += settings.root_height;
      cy -= rad_y*(this.body===2 ? 33/48 : 39/48);  // Fix cy by angle
      _sign_y *= -1;
    }
    let cx = this.x;
    if(v.orientation==='R'){
      cx += settings.width/(this.body===2?2:3);
      x += settings.width/(this.body===2?2:3) + 2;
    }else{
      cx -= settings.width/(this.body===2?2:3);
      x -= settings.width/(this.body===2?2:3) + 1;
    }

    this.ctx.lineWidth = 3;
    // this.ctx.strokeStyle = "blue";
    this.ctx.beginPath();
    this.ctx.ellipse(cx+width, cy, rad_x, rad_y, 0, angel_o*Math.PI/180, angel_f*Math.PI/180);
    if(v.orientation==='R') this.ctx.moveTo(x+2, y+_sign_y*2);
    if(v.orientation==='L') this.ctx.moveTo(x-2, y+_sign_y*2);
    if(this.body===2) this.ctx.lineTo(x-10*_sign, y-_sign_y*6);
    else this.ctx.lineTo(x-6*_sign, y-_sign_y*3);
    this.ctx.moveTo(x, y+_sign_y*2);
    if(this.body===2) this.ctx.lineTo(x+6*_sign, y-_sign_y*8);
    else this.ctx.lineTo(x+4*_sign, y-_sign_y*6);
    this.ctx.stroke();
  }
}
class Molar extends Tooth {
  constructor(ctx, x, y, key, orientation, root, incidents){
    // body: 2
    super(ctx, x, y, key, orientation, 2, incidents);
    this._root = root;
    this.genRoot();
  }
  molarBase(){
    let x = this.x;
    let y = this.y;
    let data_height = settings.data_height;
    let data_space = settings.data_space;
    y = this.orientation==='U' ? y+settings.root_height : y-(data_space+data_height);
    let width = settings.width*1.3;
    let height = settings.height-settings.root_height;

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
    let width = settings.width*1.3;
    let height = settings.root_height;
    let root = this._root;
    let data_height = settings.data_height;
    let data_space = settings.data_space;
    if(this.orientation==='D'){
      y = y-(data_space + data_height)+settings.height;  // Fix pixel
      height *= -1;
    }

    // Root area
    let _root = [];
    let _temp;
    if(root===3){
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
    }else if(root===2){
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
  draw(color=settings.strokeColor, data=true){
    this.ctx.strokeStyle = color;
    this.strokeBold(this.tooth);
    this.strokeBold(this.tooth_top);
    this.strokeBold(this.tooth_bottom);
    this.strokeBold(this.tooth_left);
    this.strokeBold(this.tooth_right);
    this.drawRoot();
    this.molarBase();

    if(data){
      // Ugly at redraw
      this.ctx.stroke(this.data_area);
      this.drawKey();
    }
  }
}
class Premolar extends Tooth {
  constructor(ctx, x, y, key, orientation, root, incidents){
    // body: 2
    super(ctx, x, y, key, orientation, 2, incidents);
    this._root = root;
    this.genRoot();
  }
  premolarBase(){
    let x = this.x;
    let y = this.y+settings.root_height;  // Y coordinate of tooth
    let width = settings.width*1.3;
    let height = settings.height-settings.root_height;
    if(this.orientation==='D'){
      y = y+settings.height-(settings.data_space+settings.data_height+settings.root_height*2);  // Fix pixel
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
    let width = settings.width*1.3;
    let height = settings.root_height;
    let root = this._root;
    let data_height = settings.data_height;
    let data_space = settings.data_space;
    let direction = ["1", "4", "5", "8"].includes(String(this.key)[0]);
    if(this.orientation==='D'){
      y = y-(data_space + data_height)+settings.height;  // Fix pixel
      height *= -1;
    }

    // Root area
    let _root = [];
    let _temp;
    if(root===1){
      _temp = new Path2D();
      _temp.moveTo(x+width*1/4, y+height);
      _temp.lineTo(x+width*2/4, y);
      _temp.lineTo(x+width*3/4, y+height);
      _root.push(_temp);
    }else if(root===2){
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
      if(!direction){  // Direction
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
  draw(color=settings.strokeColor, data=true){
    this.ctx.strokeStyle = color;
    this.strokeBold(this.tooth);
    this.strokeBold(this.tooth_top);
    this.strokeBold(this.tooth_bottom);
    this.strokeBold(this.tooth_left);
    this.strokeBold(this.tooth_right);
    this.drawRoot();
    this.premolarBase();

    if(data){
      // Ugly at redraw
      this.ctx.stroke(this.data_area);
      this.drawKey();
    }
  }
}
class Canine extends Tooth {
  constructor(ctx, x, y, key, orientation, root, incidents){
    // body: 2
    super(ctx, x, y, key, orientation, 2, incidents);
    this._root = root;
    this.genRoot();
  }
  genRoot(){
    let x = this.x;
    let y = this.y;
    let width = settings.width*1.3;
    let height = settings.root_height;
    let root = this._root;
    let data_height = settings.data_height;
    let data_space = settings.data_space;
    let direction = ["1", "4", "5", "8"].includes(String(this.key)[0]);
    if(this.orientation==='D'){
      y = y-(data_space + data_height)+settings.height;  // Fix pixel
      height *= -1;
    }

    // Root area
    let _root = [];
    let _temp;
    if(root===1){
      _temp = new Path2D();
      _temp.moveTo(x+width*1/4, y+height);
      _temp.lineTo(x+width*2/4, y);
      _temp.lineTo(x+width*3/4, y+height);
      _root.push(_temp);
    }else if(root===2){
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
      if(!direction){  // Direction
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
  draw(color=settings.strokeColor, data=true){
    this.ctx.strokeStyle = color;
    this.strokeBold(this.tooth);
    this.strokeBold(this.tooth_top);
    this.strokeBold(this.tooth_bottom);
    this.strokeBold(this.tooth_left);
    this.strokeBold(this.tooth_right);
    this.drawRoot();

    if(data){
      // Ugly at redraw
      this.ctx.stroke(this.data_area);
      this.drawKey();
    }
  }
}
class Incisor extends Tooth {
  constructor(ctx, x, y, key, orientation, incidents){
    // body: 1
    super(ctx, x, y, key, orientation, 1, incidents);
    this.drawRoot();
  }
  drawRoot(){
    let x = this.x;
    let y = this.y;
    let width = settings.width;
    let height = settings.root_height;
    let data_height = settings.data_height;
    let data_space = settings.data_space;
    if(this.orientation==='D'){
      y = y-(data_space + data_height)+settings.height;  // Fix pixel
      height *= -1;
    }

    // Root
    let _root = new Path2D();
    _root.moveTo(x, y+height);
    _root.lineTo(x+width/2, y);
    _root.lineTo(x+width, y+height);
    this.root = [_root];
  }
  draw(color=settings.strokeColor, data=true){
    this.ctx.strokeStyle = color;
    this.strokeBold(this.tooth);
    this.strokeBold(this.tooth_top);
    this.strokeBold(this.tooth_bottom);
    this.strokeBold(this.tooth_left);
    this.strokeBold(this.tooth_right);
    this.ctx.stroke(this.root[0]);

    if(data){
      // Ugly at redraw
      this.ctx.stroke(this.data_area);
      this.drawKey();
    }
  }
}
// Incident types
const incident_type = {
  component_tooth: [4, 5, 6, 7, 11, 12, 13, 15, 16, 17, 18, 19, 20, 22, 23, 25, 26, 27, 28, 29, 30, 36],  // tooth
  component_array: [1, 2, 8],  // component []
  component_line_array: [3, 9, 24],  // line []
  component_all: [10, 32, 35],  // all teeth block
  component_beside: [14, 21, 37],  // component,component (beside)
  component_range: [31, 33, 34],  // component && component
  incidents: [
    {},  // 0
    {log: [
      {key: "MB", text: "Mancha Blanca"},
      {key: "CE", text: "Lesión de Caries dental a nivel de esmalte"},
      {key: "CD", text: "Lesión de Caries dental a nivel de dentina"},
      {key: "CDP", text: "Lesión de Caries dental a nivel de dentina/compromiso de la pulpa"}
    ]},  // 1
    {log: [
      {key: "HP", text: "Hipoplasia"},
      {key: "HM", text: "Hipo mineralización"},
      {key: "O", text: "Opacidades del Esmalte"},
      {key: "D", text: "Decoloración del Esmalte"},
      {key: "Fluorosis", text: "Fluorosis"}
    ]},  // 2
    {state: true},  // 3
    {fractura: [
      {key: 1, text: "Fractura horizontal en la corona"},  // Crown middle vertical
      {key: 2, text: "Fractura vertical en la corona"},  // Crown middle horizontal
      {key: 3, text: "Fractura diagonal en la corona 1"},  // Diag left
      {key: 4, text: "Fractura diagonal en la corona 2"},  // Diag right
      {key: 5, text: "Fractura total 1"},  // All left
      {key: 6, text: "Fractura total 2"},  // All right
      {key: 7, text: "Fractura total 3"},  // All middle
    ]},  // 4
    {},  // 5
    {},  // 6
    {},  // 7
    {log: [
        {key: "AM", text: "Amalgama Dental"},
        {key: "R", text: "Resina"},
        {key: "IV", text: "Ionómetro de Vidrio"},
        {key: "IM", text: "Incrustación Metálica"},
        {key: "IE", text: "Incrustación Estética"},
        {key: "C", text: "Carilla Estética"}
      ],
      state: true
    },  // 8
    {},  // 9
    {},  // 10
    {orientation: true},  // 11
    {},  // 12
    {},  // 13
    {orientation: true},  // 14
    {orientation: true},  // 15
    {log: [
      {key: "M", text: "Mesializado"},
      {key: "D", text: "Distalizado"},
      {key: "V", text: "Vestibularizado"},
      {key: "P", text: "Palatinizado"},
      {key: "L", text: "Lingualizado"},
    ]},  // 16
    {},  // 17
    {},  // 18
    {},  // 19
    {},  // 20
    {orientation: true},  // 21
    {},  // 22
    {},  // 23
    {},  // 24
    {},  // 25
    {log: [
      {key: "1", text: "1"},
      {key: "2", text: "2"},
      {key: "3", text: "3"},
    ]},  // 26
    {},  // 27
    {log: [
        {key: "CM", text: "Corona Metálica"}, {key: "CF", text: "Corona Fenestrada"},
        {key: "CMC", text: "Corona Metal Cerámica"}, {key: "CV", text: "Corona Venner"},
        {key: "CJ", text: "Corona Jacket"}
      ],
      state: true
    },  // 28
    {state: true},  // 29
    {state: true},  // 30
    {state: true, amount: true},  // 31
    {state: true},  // 32
    {state: true, amount: true},  // 33
    {state: true, amount: true},  // 34
    {state: true},  // 35
    {log: [
        {key: "TC", text: "Tratamiento de conductos"},
        {key: "PC", text: "Pulpectomía"},
        {key: "PP", text: "Pulpotomía"}
      ],
      state: true
    },  // 36
    {orientation: true},  // 37
  ]
}
const inc_functions = [
  "Lesión de caries dental",  // 1
  "Defectos del desarrollo del esmalte",  // 2
  "Sellantes",  // 3
  "Fractura",  // 4
  "Fosas y fisuras profundas",  // 5
  "Pieza dentaria ausente",  // 6
  "Pieza dentaria en erupción",  // 7
  "Restauración definitiva",  // 8
  "Restauración temporal",  // 9
  "Edentulo total",  // 10
  "Pieza dentaria supernumeraria",  // 11
  "Pieza dentaria extruida",  // 12
  "Pieza dentaria intruida",  // 13
  "Diastema",  // 14
  "Giroversión",  // 15
  "Posición dentaria",  // 16
  "Pieza dentaria en clavija",  // 17
  "Pieza dentaria ectópica",  // 18
  "Macrodoncia",  // 19
  "Microdoncia",  // 20
  "Fusión",  // 21
  "Geminación",  // 22
  "Impactación",  // 23
  "Superficie desgastada",  // 24
  "Remanente radicular",  // 25
  "Movilidad patológica",  // 26
  "Corona temporal",  // 27
  "Corona",  // 28
  "Espigon - Muñon",  // 29
  "Implante dental",  // 30
  "Aparato ortodóntico fijo",  // 31
  "Aparato ortodóntico removible",  // 32
  "Prótesis fija",  // 33
  "Prótesis removible",  // 34
  "Prótesis total",  // 35
  "Tratamiento pulpar",  // 36
  "Transposición"  // 37
];
let inc_paths = [];
// Preview context
let pvw_ctx;

// Main component
function Odontograma(props){
  let __params__ = useParams()

  let [cita, setCita] = useState(false)
  /* We want to keep these values even when any state change, so we declare 'em as Ref
    We initialize its value and reference it's 'current' attribute (which is the actual value)
    declaring to useRef().current directly only works on objects
  */
  // Main variables
  let [teethState, setTeeth] = useState(false);  // Tooth data, redraw incidents, teeth reference
  // Panel state
  let [incident, setIncident] = useState(false);
  // Incident list
  let [incident_list, setIncidentList] = useState([]);
  // DOM variables
  let odontogram_type = useRef('A');
  // Odontograma
  const [odontogram, setOdontogram] = useState(-1)  // -1 to difference when it becomes False after asking the api
  // Odontograma inicial
  const [init_od, setInitOd] = useState(-1)  // -1 to difference when it becomes False after asking the api
  // Array odontograma evolucion log
  const [ar_ev_od_log, setArrayEvolutionOdLog] = useState([])
  // Incidence counter
  let inc_count_a = useRef(0)
  let inc_count_k = useRef(0)

  // Generic rest function
  const getCita = cita_pk => {
    if(__debug__) console.log("getCita")

    getDataByPK('atencion/cita', cita_pk)
    .then(setCita)
  }

  /* We use useCallback to avoid re declaration of methods (has no return)
    makes a better performance
    source:
      https://reactjs.org/docs/hooks-reference.html#usecallback
      https://stackoverflow.com/a/57294726/12322283
    Also we declare empty dependencies..
    'cuz this functions do not need to be re declared after some variable change
    We make some of these functions to depent of incident
    'cuz we use that variable in those functions or in functions that depends on 'em
  */
  const genTeeth = useCallback(() => {
      if(__debug__) console.log("genTeeth");

      // Generate Adult Teeth
      genATeeth()
      // Generate Kid Teeth
      genKTeeth()
  }, []);
  const genATeeth = () => {
    if(__debug__) console.log("genATeeth");

    // General
    let _left = (
      // Odontogram element width
      ctx.canvas.width-
      // Tooth with plus tooth spacing
      (settings.width+settings.tooth_spacing)*(2+16)
    )/2;  // Half of the total space left
    let _top = 40;
    let _build_data;
    // Teeth container
    let upper_teeth = [];
    let lower_teeth = [];

    /*** Generate Adult Teeth ***/
    // Upper teeth
    upper_teeth = [];
    _top += settings.data_height+settings.data_space;
    _build_data = build_data.build_adult_top
    _build_data.forEach((v)=>{
      // Calc coordinates
      let _x = _left;
      if(upper_teeth.length){
        let last_tooth = upper_teeth[upper_teeth.length-1];
        _x = last_tooth.x + settings.tooth_spacing;
        _x += last_tooth.body===2 ? settings.width*1.3 : settings.width;
      }

      // Create object with properties
      let a;
      switch(v.type){
        case 0: a = new Molar(ctx, _x, _top, v.key, v.orientation, v.root, v.incidents); break;
        case 1: a = new Premolar(ctx, _x, _top, v.key, v.orientation, v.root, v.incidents); break;
        case 2: a = new Canine(ctx, _x, _top, v.key, v.orientation, v.root, v.incidents); break;
        case 3: a = new Incisor(ctx, _x, _top, v.key, v.orientation, v.incidents); break;
        default: alert(`ERROR IN TEETH BUILD DATA: tooth type not found in key ${v.key}`); break;
      }
      a.setTeeth(teeth_a)  // Add teeth's memory reference
      upper_teeth.push(a);
    });
    teeth_a.upper_teeth = upper_teeth;
    // Lower teeth
    lower_teeth = [];
    _top *= 3;  // Dependant of canvas
    _build_data = build_data.build_adult_bottom
    _build_data.forEach((v)=>{
      // Calc coordinates
      let _x = _left;
      if(lower_teeth.length){
        let last_tooth = lower_teeth[lower_teeth.length-1];
        _x = last_tooth.x + settings.tooth_spacing;
        _x += last_tooth.body===2 ? settings.width*1.3 : settings.width;
      }

      // Create object with properties
      let a;
      switch(v.type){
        case 0: a = new Molar(ctx, _x, _top, v.key, v.orientation, v.root, v.incidents); break;
        case 1: a = new Premolar(ctx, _x, _top, v.key, v.orientation, v.root, v.incidents); break;
        case 2: a = new Canine(ctx, _x, _top, v.key, v.orientation, v.root, v.incidents); break;
        case 3: a = new Incisor(ctx, _x, _top, v.key, v.orientation, v.incidents); break;
        default: alert(`ERROR IN TEETH BUILD DATA: tooth type not found in key ${v.key}`); break;
      }
      a.setTeeth(teeth_a)  // Add teeth's memory reference
      lower_teeth.push(a);
    });
    teeth_a.lower_teeth = lower_teeth;
  }
  const genKTeeth = () => {
    if(__debug__) console.log("genKTeeth");

    // General
    let _left = (
      // Odontogram element width
      ctx.canvas.width-
      // Tooth with plus tooth spacing
      (settings.width+settings.tooth_spacing)*(2+10)
    )/2;  // Half of the total space left
    let _top = 40;
    let _build_data;
    // Teeth container
    let upper_teeth = [];
    let lower_teeth = [];

    /*** Generate Kid Teeth ***/
    // Upper teeth
    upper_teeth = [];
    _top += settings.data_height+settings.data_space;
    _build_data = build_data.build_kid_top;
    _build_data.forEach((v)=>{
      // Calc coordinates
      let _x = _left;
      if(upper_teeth.length){
        let last_tooth = upper_teeth[upper_teeth.length-1];
        _x = last_tooth.x + settings.tooth_spacing;
        _x += last_tooth.body===2 ? settings.width*1.3 : settings.width;
      }

      // Create object with properties
      let a;
      switch(v.type){
        case 0: a = new Molar(ctx, _x, _top, v.key, v.orientation, v.root, v.incidents); break;
        case 1: a = new Premolar(ctx, _x, _top, v.key, v.orientation, v.root, v.incidents); break;
        case 2: a = new Canine(ctx, _x, _top, v.key, v.orientation, v.root, v.incidents); break;
        case 3: a = new Incisor(ctx, _x, _top, v.key, v.orientation, v.incidents); break;
        default: alert(`ERROR IN TEETH BUILD DATA: tooth type not found in key ${v.key}`); break;
      }
      a.setTeeth(teeth_k)  // Add teeth's memory reference
      upper_teeth.push(a);
    });
    teeth_k.upper_teeth = upper_teeth;
    // Lower teeth
    lower_teeth = [];
    _top *= 3;  // Dependant of canvas
    _build_data = build_data.build_kid_bottom;
    _build_data.forEach((v)=>{
      // Calc coordinates
      let _x = _left;
      if(lower_teeth.length){
        let last_tooth = lower_teeth[lower_teeth.length-1];
        _x = last_tooth.x + settings.tooth_spacing;
        _x += last_tooth.body===2 ? settings.width*1.3 : settings.width;
      }

      // Create object with properties
      let a;
      switch(v.type){
        case 0: a = new Molar(ctx, _x, _top, v.key, v.orientation, v.root, v.incidents); break;
        case 1: a = new Premolar(ctx, _x, _top, v.key, v.orientation, v.root, v.incidents); break;
        case 2: a = new Canine(ctx, _x, _top, v.key, v.orientation, v.root, v.incidents); break;
        case 3: a = new Incisor(ctx, _x, _top, v.key, v.orientation, v.incidents); break;
        default: alert(`ERROR IN TEETH BUILD DATA: tooth type not found in key ${v.key}`); break;
      }
      a.setTeeth(teeth_k)  // Add teeth's memory reference
      lower_teeth.push(a);
    });
    teeth_k.lower_teeth = lower_teeth;
  }
  const changeTeethType = (type) => {
    if(__debug__) console.log("changeTeethType");

    if(type!='A'&&type!='K') return  // Allow only A || K
    if(odontogram_type == type) return  // Prevent redundancy
    /* Set global teeth */
    teeth = type=='A'?teeth_a:teeth_k
    setTeeth(teeth)  // Update reference
    // Change global variables value when change odontogram type
    currentTooth.tooth = null;
    currentTooth.path = null;
    currentTooth.preserve = false;
    odontogram_type.current = type;  // DOM odontogram type indicator
    // Generate squares
    genOdontogramSquares()
    // Print odontogram
    printTeeth()
  }
  const genOdontogramSquares = () => {
    /*** Generate Teeth Squares ***/
    // General
    let _left = (
      // Odontogram element width
      ctx.canvas.width-
      // Tooth with plus tooth spacing
      (settings.width+settings.tooth_spacing)*(2+ (odontogram_type.current=='A'?16:10))
    )/2;  // Half of the total space left
    let _top = 0;
    // Genereate square_top
    _top = 143.5;
    odontogram_squares.square_top = new Path2D();
    let _last_tooth = teeth.upper_teeth[teeth.upper_teeth.length-1];
    odontogram_squares.square_top.moveTo(_left-15, _top-settings.data_space-settings.data_height-32);
    odontogram_squares.square_top.lineTo(_left-15, _top+settings.height+32);
    odontogram_squares.square_top.lineTo(_last_tooth.x+settings.width*(_last_tooth.body===2?1.3:1)+15, _top+settings.height+32);
    odontogram_squares.square_top.lineTo(_last_tooth.x+settings.width*(_last_tooth.body===2?1.3:1)+15, _top-settings.data_space-settings.data_height-32);
    odontogram_squares.square_top.closePath();
    // Genereate square_bottom
    _top = 430.5;
    odontogram_squares.square_bottom = new Path2D();
    _last_tooth = teeth.lower_teeth[teeth.lower_teeth.length-1];
    odontogram_squares.square_bottom.moveTo(_left-15, _top-settings.data_space-settings.data_height-32);
    odontogram_squares.square_bottom.lineTo(_left-15, _top+settings.height+32);
    odontogram_squares.square_bottom.lineTo(_last_tooth.x+settings.width*(_last_tooth.body===2?1.3:1)+15, _top+settings.height+32);
    odontogram_squares.square_bottom.lineTo(_last_tooth.x+settings.width*(_last_tooth.body===2?1.3:1)+15, _top-settings.data_space-settings.data_height-32);
    odontogram_squares.square_bottom.closePath();
  }
  const printTeeth = useCallback(() => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);  // Clear canvas
    [...teeth.upper_teeth, ...teeth.lower_teeth].forEach((tooth) => {
      tooth.draw();
    });
    drawAllIncidences();
  }, []);
  const mouseInCanvas = useCallback((e, check=false) => {
    if(select_type===0) return;  // All teeth incidence

    let x = e.offsetX;
    let y = e.offsetY;
    // Check if mouse is in big squares
    let top = ctx.isPointInPath(odontogram_squares.square_top, x, y);
    let bottom = ctx.isPointInPath(odontogram_squares.square_bottom, x, y);
    if(top || bottom){
      // Clear canvas area
      let check_in_teeth;
      if(top){  // Square TOP is hover
        check_in_teeth = teeth.upper_teeth;  // Check in upper_teeth
      }else if(bottom){  // Square BOTTOM is hover
        check_in_teeth = teeth.lower_teeth;  // Check in lower_teeth
      }

      let noevenone = check_in_teeth.some((e) => {
        let isIn = ctx.isPointInPath(e.area, x, y);  // Is point in tooth area?
        if(isIn){  // Point is in tooth area
          // If it's not the current tooth (point has moved to other tooth)
          if(currentTooth.tooth && e!==currentTooth.tooth && !check){
            // If it's not the same tooth and preserve is true -> cancel
            if(currentTooth.preserve) return true;

            clearTooth();  // Clear tooth
          }

          // Stroke tooth
          currentTooth.tooth = e;  // Save this as current tooth
          if(check) return true;  // Here ends the check functions, now return fake current tooth

          if(select_type===4){  // Select lvl to tooth?
            e.draw(settings.hovercolor, false);  // Fix clearTooth
            if(!currentTooth.preserve){
              currentTooth.preserve = true;
              clearTooth();  // Fix tooth hover color
              currentTooth.preserve = false;
            }else{
              clearTooth();  // Fix tooth hover color
            }

          }else if(select_type===3){  // Select lvl is line part
            // Keep tooth as current tooth when check
            if(check) currentTooth.preserve = true;

            // Check if mouse is over root or tooth
            let lines = e.tooth_lines;

            // Check what path is mouse over
            let _noevenone = lines.some((path, inx) => {
              let found = ctx.isPointInStroke(path, x, y);  // Is point in line stroke?
              if(found){
                let _key = String(1100+inx)
                // If it's not the current line (point has moved to other line component)
                if(currentTooth.path && _key!==currentTooth.path.key) clearTooth();  // Clear tooth
                ctx.lineWidth = 3;
                ctx.strokeStyle = settings.hovercolor;

                ctx.stroke(path);
                currentTooth.path = {path: path, key: _key};

                return true;
              }
              return false;
            });
            if(!_noevenone && currentTooth.tooth) clearTooth();  // Fix draw when no line is pointed
          }else{  // Select lvl is in tooth part [1, 2]
            // IMPORTANT: Do not change the order of the following array, it'd cause bugs at saving incidence
            let paths = [
              e.tooth_top,  // 1001
              e.tooth_right,  // 1002
              e.tooth_bottom,  // 1003
              e.tooth_left,  // 1004
              e.tooth_center_tl,  // 1005
              e.tooth_center_tr,  // 1006
              e.tooth_center_br,  // 1007
              e.tooth_center_bl,  // 1008
            ];

            // Check what path is mouse over
            let _noevenone = paths.some((path, inx) => {
              let found = ctx.isPointInPath(path, x, y);  // Is point in tooth area?
              if(found){
                let _key = String(1000+inx+1)
                // If it's not the current path (point has moved to other tooth component)
                if(currentTooth.path && _key!==currentTooth.path.key) clearTooth();  // Clear tooth
                ctx.fillStyle = settings.hovercolor;

                ctx.fill(path);
                currentTooth.path = {path: path, key: _key};

                return true;
              }
              return false;
            });
            if(!_noevenone && currentTooth.tooth) clearTooth();  // Fix draw when no path is pointed
          } /* fin select type */

          return true;  // End loop
        }
        return false;  // Continue loop
      });
      if(!noevenone){
        clearTooth();  // Fix draw when no tooth is pointed
        if(!currentTooth.preserve) currentTooth.tooth = null;
      }
      // if(!noevenone && !currentTooth.tooth) clearTooth();  // Fix draw when no tooth is pointed

    }else if(currentTooth.tooth) clearTooth();
    if(pvw_ctx){  // Preview is being shown
      drawPreview();  // Update preview
    }
  }, [incident]);
  const clearTooth = useCallback((all=false) => {
    // Erase all block
    ctx.fillStyle = ctx.canvas.style.background ? ctx.canvas.style.background : "white";
    let _teeth;
    if(teeth.upper_teeth.indexOf(currentTooth.tooth)!==-1){
      _teeth = teeth.upper_teeth;
      ctx.fill(odontogram_squares.square_top);
    }
    else if(teeth.lower_teeth.indexOf(currentTooth.tooth)!==-1){
      _teeth = teeth.lower_teeth;
      ctx.fill(odontogram_squares.square_bottom);
    }else{
      _teeth = [...teeth.upper_teeth, ...teeth.lower_teeth];
      ctx.fill(odontogram_squares.square_top);
      ctx.fill(odontogram_squares.square_bottom);
    }
    if(all){
      _teeth = [...teeth.upper_teeth, ...teeth.lower_teeth];
      ctx.fill(odontogram_squares.square_top);
      ctx.fill(odontogram_squares.square_bottom);
    }

    // Re draw all block
    _teeth.forEach((tooth) => {
      tooth.draw();
    });
    // Re draw incidents
    drawAllIncidences(_teeth);
    drawSelectedPaths();
    currentTooth.path = null;  // Fix path not updating

    if(currentTooth.preserve) return;  // Preserve selected tooth
    // Remove current tooth reference
    currentTooth.tooth = null;
  }, [incident]);
  const toothPartClickHandle = useCallback((e, safe=false) => {
    if(select_type===0) return;  // All teeth incidence

    let ct = Object.assign({}, currentTooth);  // Clone of currentTooth
    currentTooth.preserve = false;  // Allow to change tooth at click
    mouseInCanvas(e, true);
    if(!currentTooth.tooth){  // Skip when click in empty area
      if(safe){
        currentTooth = ct;  // Preverse currentTooth in preview
        return;
      }
      inc_paths = [];  // Reset array
      clearTooth();
      return;
    }
    if(ct.tooth && currentTooth.tooth.key==ct.tooth.key){  // Same tooth
      if(select_type!==4){  // Not select tooth, instead save tooth part
        currentTooth.preserve = true;
        if(!currentTooth.path) return
        let taked_off = inc_paths.reduce((ar, path)=>{if(path.key!==currentTooth.path.key) ar.push(path); return ar;}, []);
        // Take out path object if it's already in array
        if(inc_paths.length === taked_off.length){  // If nothing was removed then currentPath wasn't in array so we added it
          inc_paths.push(currentTooth.path);  // Add path to array
        }else{  // Something were removed in taken_off
          inc_paths = taked_off;  // Replace current array
        }
      }else{  // Select tooth
        currentTooth.preserve = !ct.preserve;  // Switch preserve tooth
        inc_paths = [];  // Reset array
      }
    }else{  // Other tooth clicked
      inc_paths = [];  // Reset array
      currentTooth.preserve = true;  // Select this tooth
      if(incident_type.component_range.includes(incident)){  // If incident's component is range
        // Check if other tooth is in same square
        let direction = ["1", "2", "5", "6"].includes(String(ct.tooth.key)[0]);
        let _teeth;
        if(direction) _teeth = teeth.upper_teeth;
        else if(!direction) _teeth = teeth.lower_teeth;
        if(_teeth.indexOf(currentTooth.tooth)===-1){
          clearTooth(true);
          return;
        }

        // Can only select one tooth at the time (apart of current tooth)
        // inc_paths = [];  // Already executed before
        inc_paths.push({path: currentTooth.tooth.area, key: currentTooth.tooth.key});

        currentTooth = ct;  // Preserve current tooth
      }
    }
    // Preview
    if(select_type===3 && currentTooth.tooth) initPreview();

    clearTooth(true);  // Clear and redraw all | fix click in other square's tooth
    if(pvw_ctx && currentTooth.tooth) drawPreview();  // Update preview
  }, [incident]);
  const drawAllIncidences = useCallback((_teeth=false) => {
    _teeth = _teeth===false ? [...teeth.upper_teeth, ...teeth.lower_teeth] : _teeth;
    _teeth.forEach((tooth) => {
      tooth.drawIncidents();
    });
  }, []);
  const drawSelectedPaths = useCallback(() => {
    ctx.fillStyle = settings.toothhovercolor;
    if(currentTooth.tooth) ctx.fill(currentTooth.tooth.area);
    // All teeth incidence
    if(incident_type.component_range.includes(incident) && inc_paths.length===1){
      ctx.fill(inc_paths[0].path);
      return;
    }

    if(select_type===3){
      ctx.lineWidth = 3;
      ctx.strokeStyle = settings.hovercolor;
      if(inc_paths.hasOwnProperty("length")) inc_paths.forEach((path) => {
        ctx.stroke(path.path)
      });
    }else{
      ctx.fillStyle = settings.hovercolor;
      inc_paths.forEach((path) => {
        ctx.fill(path.path)
      });
    }
  }, [incident]);
  const initRegularOd = () => {
    if(__debug__) console.log("initRegularOd");
    /* Initialize canvas */
    // Elements
    let odontogram_el = document.getElementById('odontogram');
    ctx = odontogram_el.getContext('2d');
    // Generate teeth objects
    genTeeth()

    /* At this point odontogram is whether false or object */
    if(!odontogram){
      // Get last evolution state odontogram
      simpleGet(`atencion/paciente/${cita.paciente}/odontograma/evolucion/`)
      // If exists last evol od's get its incidences, if not initialize as regular od
      .then(res => res ? getIncidences(res.pk) : changeTeethType("A"))
      // Initialize brand new odontogram with last evol od's incidences
    }
    // If u don't want to get last evolution odontogram incidences
    // if(!odontogram) changeTeethType("A")
    else getIncidences()  // Get incidences
  }

  // Only run after first render
  useEffect(() => {
    if(__debug__) console.log("useEffect genTeeth");

    // If cita is not in props
    if(!cita) getCita(__params__.cita_pk)
  }, [genTeeth])
  // Cita
  useEffect(() => {
    if(__debug__) console.log("useEffect cita");
    if(!cita) return

    // Get odontogram
    getOdontogram()
    // Get initial odontogram
    getInitialOdontogram()
    // Get evolution odontogram
    getEvolutionOdontogram()
  }, [cita])
  // Run after teeth has changed
  useEffect(() => {
    if(__debug__) console.log("useEffect teethState");
    if(!teeth) return;

    ctx.canvas.onmousemove = (e)=>{mouseInCanvas(e)}  // Declare drawSelectedPaths listener
    ctx.canvas.onclick = (e)=>{toothPartClickHandle(e)}  // Declare toothPartClickHandle listener
    printTeeth();  // Draw odontogram
  }, [teethState])
  // Click listener in canvas
  useEffect(() => {
    if(__debug__) console.log("useEffect incident");
    if(!teethState) return  // Prevent execution before teeth is setted
    if(!ctx) return;  // Ctx is not defined

    inc_paths = [];  // Reset array
    if(incident===false){
      printTeeth();  // Draw odontogram
      if(pvw_ctx){
        pvw_ctx.canvas.onmousemove = null;  // To re declare drawSelectedPaths
        pvw_ctx.canvas.onclick = null;  // To re declare toothPartClickHandle
        pvw_ctx = null;
      }
      currentTooth = {tooth: null, path: null, preserve: false};
    }
    // All teeth incident
    if(incident_type.component_all.includes(incident)){
      currentTooth = {tooth: null, path: null, preserve: false};
      clearTooth();
    }
    // Add odontogram listeners
    ctx.canvas.onmousemove = (e)=>{mouseInCanvas(e)}  // To re declare drawSelectedPaths
    ctx.canvas.onclick = (e)=>{toothPartClickHandle(e)}  // To re declare toothPartClickHandle
    // Preview
    if(select_type===3 && currentTooth.tooth){
      initPreview();
    }
  }, [incident])
  // odontogram, init_od
  useEffect(() => {
    if(__debug__) console.log("useEffect odontogram, init_od");
    if(odontogram==-1 || init_od==-1) return

    // Check if odontogram and init_od are the same
    if(init_od && odontogram.pk == init_od.pk) return
    else initRegularOd()  // Initialize odontogram
  }, [odontogram, init_od])

  /* We declare this function as it is 'cuz we want it to be dinamically generated in every render
    that way it keeps updated with the newest state variables
  */
  // Initial odontogram
  function getOdontogram(){
    if(__debug__) console.log("getOdontogram");
    // Get odontograma
    simpleGet(`atencion/${cita.atencion}/odontograma/`)
    .then(setOdontogram,  // Save odontogram
      error_response => {
        // In case of error_response
        if(error_response.status == 404){
          if(__debug__) console.log("getOdontogram: brand new odontogram")
          setOdontogram(false)
        }
        else console.error("error", error_response)
      }
    )
  }
  function saveOdontogram(){
    // Save odontogram data to API
    let odontogram_data = {incidents: []};
    // Get teeth incidents' data
    teeth_a.lower_teeth.map((v) => {
      if(!v.incidents || v.incidents.length===0) return;
      // Fix support teeth
      if(v.incidents.filter(i => !i.support).length==0) return;
      // Save tooth with incidences
      odontogram_data.incidents.push({
        diente: v.key,
        incidents: v.incidents
      });
    });
    teeth_a.upper_teeth.map((v) => {
      if(!v.incidents || v.incidents.length===0) return;
      // Fix support teeth
      if(v.incidents.filter(i => !i.support).length==0) return;
      // Save tooth with incidences
      odontogram_data.incidents.push({
        diente: v.key,
        incidents: v.incidents
      });
    });
    teeth_k.lower_teeth.map((v) => {
      if(!v.incidents || v.incidents.length===0) return;
      // Fix support teeth
      if(v.incidents.filter(i => !i.support).length==0) return;
      // Save tooth with incidences
      odontogram_data.incidents.push({
        diente: v.key,
        incidents: v.incidents
      });
    });
    teeth_k.upper_teeth.map((v) => {
      if(!v.incidents || v.incidents.length===0) return;
      // Fix support teeth
      if(v.incidents.filter(i => !i.support).length==0) return;
      // Save tooth with incidences
      odontogram_data.incidents.push({
        diente: v.key,
        incidents: v.incidents
      });
    });
    // If there is no incident data
    if(odontogram_data.incidents.length===0){
      alert("El odontograma no tiene datos")
      return;
    }
    // Add odontogram data
    odontogram_data.observaciones = document.getElementById('textarea_observaciones').value;

    // Create or modify?
    if(!odontogram){  // Save to API
      odontogram_data.atencion = cita.atencion;
      odontogram_data.paciente = cita.paciente;

      let url = process.env.REACT_APP_PROJECT_API+'atencion/odontograma/';
      // Generate promise
      let result = new Promise((resolve, reject) => {
        // Fetch data to api
        let request = fetch(url, {
          method: 'POST',
          headers: {
            Authorization: localStorage.getItem('access_token'),  // Token
            'Content-Type': 'application/json'  // JSON type
          },
          body: JSON.stringify(odontogram_data)  // Data
        });
        // Once we get response we either return json data or error
        request.then(response => {
          if(response.ok){
            resolve(response.json())
          }else{
            reject(response.statusText)
          }
        }, () => handleErrorResponse('server'));
      });
      // Promise actions
      // Return Promise to handle saving initial odontogram
      return result.then(
        response_obj => {  // In case it's ok
          console.log("saveOdontogram response_obj", response_obj);
          setOdontogram(response_obj)  // Save odontogram
          handleErrorResponse('custom', "Exito", "Odontograma guardado exitosamente")
          return response_obj  // Return odontogram (handle save initial odontogram)
        },
        error => {  // In case of error
          console.log("WRONG!", error);
        }
      )
    }else{  // Modify
      let url = process.env.REACT_APP_PROJECT_API+`atencion/odontograma/${odontogram.pk}/`;
      // Generate promise
      let result = new Promise((resolve, reject) => {
        // Fetch data to api
        let request = fetch(url, {
          method: 'PUT',
          headers: {
            Authorization: localStorage.getItem('access_token'),  // Token
            'Content-Type': 'application/json'  // JSON type
          },
          body: JSON.stringify(odontogram_data)  // Data
        });
        // Once we get response we either return json data or error
        request.then(response => {
          if(response.ok){
            resolve(response.json())
          }else{
            reject(response.statusText)
          }
        }, () => handleErrorResponse('server'));
      });
      // Promise actions
      result.then(
        response_obj => {  // In case it's ok
          handleErrorResponse('custom', "Exito", "Odontograma actualizado exitosamente")
        },
        error => {  // In case of error
          console.log("WRONG!", error);
        }
      );
    }
  }
  function getIncidences(_od_pk=odontogram.pk){
    /* This function uses the 'odontogram' global object */
    /* This function should be called only once and only if odontogram exists */
    if(__debug__) console.log("getIncidences");
    // If _od_pk takes it's default value (odontogram.pk) and odontogram is false
    if(!_od_pk){
      console.error("getIncidences: can't get incidences from odontogram_pk=undefined");
      return
    }
    // Get incidents
    simpleGet(`atencion/odontograma/${_od_pk}/incidencia/`)
    .then(
      response => {
        // Set teeth incidence from db
        let new_inc_list = insertIncidencesInTeeth(response);
        // Redraw odontogram
        printTeeth()
        // Add to incident list
        setIncidentList(new_inc_list);
      },
      error => console.log("WRONG!", error)
    );
  }
  function insertIncidencesInTeeth(objs){
    /* This function require teethState to be already declared */
    if(__debug__) console.log("insertIncidencesInTeeth");
    let new_inc_list = [];
    // Reset teeth incidence counter
    inc_count_a.current = 0
    inc_count_k.current = 0
    // If there is no incidences to insert
    if(objs.length == 0){
      changeTeethType('A')  // Set default odontogram type
      return []
    }

    objs.forEach((inc) => {
      changeTeethType(inc.tipo_odontograma=="1"?"A":"K")
      /* getTooth from both A&K */
      let tooth = getToothByKey(inc.diente);
      if(!tooth) return  // If tooth is not found (below to another odontogram type) skip

      let inc_obj = {};
      inc_obj.type = parseInt(inc.type);
      inc_obj.value = {};
      inc_obj.value.log = inc.log;
      inc_obj.value.state = inc.state;
      inc_obj.value.orientation = inc.orientation;
      inc_obj.value.fractura = JSON.parse(inc.fractura);
      inc_obj.value.start_tooth_key = inc.start_tooth_key;
      inc_obj.component = JSON.parse(inc.component)
      inc_obj.odontogram_type = inc.tipo_odontograma;
      inc_obj.detalle = inc.detalle
      inc_obj.nueva_incidencia = false
      tooth.incidents.push(inc_obj);  // Add to global teeth data

      // Add incidence list
      new_inc_list.push({
        diente_inicio: Number(inc.start_tooth_key),
        diente: tooth.key,
        type: Number(inc.type),
        detalle: inc.detalle.length!=0?cFL(inc.detalle):"-",
        inx: tooth.incidents.length-1,
      });

      // Add to teeth counter
      if(inc.tipo_odontograma=="1") inc_count_a.current++
      else inc_count_k.current++

      // Fix aside incidences
      if(incident_type.component_beside.includes(inc_obj.type))
        addBesideIncidence(teeth, tooth, inc_obj);
    });
    return new_inc_list;
  }
  function getToothByKey(key){
    // Get tooth by key
    let tooth;
    let first_digit = parseInt(String(key)[0]);
    let last_digit = parseInt(String(key)[1]);
    let up = [1, 2, 5, 6].includes(first_digit);
    let _teeth = up ? teeth.upper_teeth : teeth.lower_teeth;
    let middle_range = _teeth.length/2;
    if(up){  // Upper side
      if([1, 5].includes(first_digit)){  // Left side
        tooth = _teeth[middle_range-last_digit];
      }else{  // Right side
        tooth = _teeth[middle_range+last_digit-1];
      }
    }else{  // Lower side
      if([4, 8].includes(first_digit)){  // Left side
        tooth = _teeth[middle_range-last_digit];
      }else{  // Right side
        tooth = _teeth[middle_range+last_digit-1];
      }
    }
    return tooth;
  }

  // Preview
  function initPreview(){
    let debug = false;
    // Fake area of odontogram canvas
    if(!pvw_ctx){
      let el_preview = document.getElementById("preview");
      pvw_ctx = el_preview.getContext('2d');
    }
    pvw_ctx.canvas.onmousemove = (e)=>{
      if(!currentTooth.tooth) return;

      let _offsetX = currentTooth.tooth.x + e.offsetX/preview_scale - preview_margin;
      let _offsetY;
      if(currentTooth.tooth.orientation==="D"){
        _offsetY = currentTooth.tooth.y + e.offsetY/preview_scale - preview_margin;
        _offsetY -= settings.data_height+settings.data_space;
      }else{
        _offsetY = currentTooth.tooth.y + e.offsetY/preview_scale - preview_margin;
      }
      let _e = {
        offsetX: _offsetX,
        offsetY: _offsetY
      };

      for(let i=1; i<=preview_select_margin; i++){
        if(debug) console.log(i);
        // X
        _e.offsetX = _offsetX-i;
        mouseInCanvas(_e);
        if(currentTooth.path) break;
        if(debug) console.log("NOT FOUND IN "+_e.offsetX);
        _e.offsetX = _offsetX+i;
        mouseInCanvas(_e);
        if(currentTooth.path) break;
        if(debug) console.log("NOT FOUND IN "+_e.offsetX);
        // Y
        _e.offsetY = _offsetY-i;
        mouseInCanvas(_e);
        if(currentTooth.path) break;
        if(debug) console.log("NOT FOUND IN "+_e.offsetY);
        _e.offsetY = _offsetY+i;
        mouseInCanvas(_e);
        if(currentTooth.path) break;
        if(debug) console.log("NOT FOUND IN "+_e.offsetY);
      }

      if(debug){
        ctx.strokeStyle = "gray";
        ctx.lineWidth = "1";
        ctx.moveTo(0, 0);
        ctx.lineTo(_e.offsetX, _e.offsetY);
        ctx.stroke();
      }
    }
    pvw_ctx.canvas.onclick = (e)=>{
      if(!currentTooth.tooth) return;

      let _offsetX = currentTooth.tooth.x + e.offsetX/preview_scale - preview_margin;
      let _offsetY;
      if(currentTooth.tooth.orientation==="D"){
        _offsetY = currentTooth.tooth.y + e.offsetY/preview_scale - preview_margin;
        _offsetY -= settings.data_height+settings.data_space;
      }else{
        _offsetY = currentTooth.tooth.y + e.offsetY/preview_scale - preview_margin;
      }
      let _e = {
        offsetX: _offsetX,
        offsetY: _offsetY
      };
      toothPartClickHandle(_e, true);
    }
    pvw_ctx.canvas.onmouseleave = ()=>{
      currentTooth.path = null;  // Fix bad mouse leave event
      drawPreview();
    }
    drawPreview();
  }
  function drawPreview(){
    if(!currentTooth.tooth){  // Clear preview if there is no current tooth
      pvw_ctx.fillStyle = "white";
      pvw_ctx.rect(0, 0, pvw_ctx.canvas.width, pvw_ctx.canvas.height);
      pvw_ctx.fill();
      return;
    }
    // Draw tooth in preview
    pvw_ctx.setTransform(1, 0, 0, 1, 0, 0);  // Reset previous scale
    pvw_ctx.scale(preview_scale, preview_scale);
    if(currentTooth.tooth.orientation==="D"){
      pvw_ctx.drawImage(
        ctx.canvas,
        -currentTooth.tooth.x+preview_margin,
        -currentTooth.tooth.y+settings.data_height+settings.data_space+preview_margin
      );
    }else{
      pvw_ctx.drawImage(ctx.canvas, -currentTooth.tooth.x+preview_margin, -currentTooth.tooth.y+preview_margin);
    }
  }

  // Initial odontogram
  const getInitialOdontogram = () => {
    simpleGet(`atencion/paciente/${cita.paciente}/odontograma/inicial/`)
    .then(response => {
      if(__debug__) console.log("getInitialOdontogram: response", response);
      // If response is false then there is no initial odontogram
      if(!response) if(__debug__) console.log("getInitialOdontogram: no initial odontogram");

      // Set response as initial odontogram
      setInitOd(response)
    })
  }
  const askSaveInitialOdontogram = () => {
    // Show alert
    window.$("#modal_save_init_od").modal("show")
  }
  const saveInitialOdontogram = () => {
    saveOdontogram()
    // Set init_od if r is an object
    .then(r => r ? setInitOd(r) : setInitOd(false))
  }
  // Evolution odontogram
  const getEvolutionOdontogram = () => {
    simpleGet(`atencion/paciente/${cita.paciente}/odontograma/evolucion/log/`)
    .then(response => {
      if(__debug__) console.log("getEvolutionOdontogram: response", response);
      // If response is empty array then there is no evolution log
      if(response.length == 0) if(__debug__) console.log("getEvolutionOdontogram: no evolution log");

      // Set response as initial odontogram (it comes pre sorted by api)
      setArrayEvolutionOdLog(response)
    })
  }


  /* Check if current odontogram is the init odontogram already setted
  * conditions:
  *   odontogram.pk is setted
  *   init_od can't be false
  *   odontogram.pk equals init_od.pk
  */
  return (odontogram==-1||init_od==-1) ? "loading"  // Still loading
    : (init_od && odontogram.pk == init_od.pk)  // init_od is setted and equals odontogram
    // Setted initial odontogram
    ? (
    <div>
      <div className="subheader">
        <h1 className="subheader-title">
          <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"
            data-prefix="fas" data-icon="tooth" className="svg-inline--fa fa-tooth fa-w-14"
            role="img" viewBox="0 0 448 512" style={{width: "15px", height: "16px", verticalAlign: "baseline", filter: "opacity(.9)"}}>
              <path fill="currentColor" d="M443.98 96.25c-11.01-45.22-47.11-82.06-92.01-93.72-32.19-8.36-63 5.1-89.14 24.33-3.25 2.39-6.96 3.73-10.5 5.48l28.32 18.21c7.42 4.77 9.58 14.67 4.8 22.11-4.46 6.95-14.27 9.86-22.11 4.8L162.83 12.84c-20.7-10.85-43.38-16.4-66.81-10.31-44.9 11.67-81 48.5-92.01 93.72-10.13 41.62-.42 80.81 21.5 110.43 23.36 31.57 32.68 68.66 36.29 107.35 4.4 47.16 10.33 94.16 20.94 140.32l7.8 33.95c3.19 13.87 15.49 23.7 29.67 23.7 13.97 0 26.15-9.55 29.54-23.16l34.47-138.42c4.56-18.32 20.96-31.16 39.76-31.16s35.2 12.85 39.76 31.16l34.47 138.42c3.39 13.61 15.57 23.16 29.54 23.16 14.18 0 26.48-9.83 29.67-23.7l7.8-33.95c10.61-46.15 16.53-93.16 20.94-140.32 3.61-38.7 12.93-75.78 36.29-107.35 21.95-29.61 31.66-68.8 21.53-110.43z"/>
          </svg> Odontograma inicial
        </h1>
      </div>
      {/* Paciente */}
      <div>
        <h5>Paciente: <i>{
          cita
          ? cFL(cita.paciente_data.nombre_principal)+" "+
            cita.paciente_data.ape_paterno.toUpperCase()+" "+
            cita.paciente_data.ape_materno.toUpperCase()
          : ""
        }</i></h5>
      </div>

      <OdontogramaInicial init_od={init_od} />
    </div>
    )
    // Brand new odontogram or evolution or whatsoever
    : (
    <>
      {/* ALERTS */}
      <div id="alert-custom" className="alert bg-warning-700" role="alert" style={{display: "none"}}>
        <strong id="alert-headline">Error!</strong> <span id="alert-text">Algo salió mal, parece que al programador se le olvidó especificar qué</span>.
      </div>
      {/* HEADER */}
      <div className="subheader">
        <h1 className="subheader-title">
          <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"
            data-prefix="fas" data-icon="tooth" className="svg-inline--fa fa-tooth fa-w-14"
            role="img" viewBox="0 0 448 512" style={{width: "15px", height: "16px", verticalAlign: "baseline", filter: "opacity(.9)"}}>
              <path fill="currentColor" d="M443.98 96.25c-11.01-45.22-47.11-82.06-92.01-93.72-32.19-8.36-63 5.1-89.14 24.33-3.25 2.39-6.96 3.73-10.5 5.48l28.32 18.21c7.42 4.77 9.58 14.67 4.8 22.11-4.46 6.95-14.27 9.86-22.11 4.8L162.83 12.84c-20.7-10.85-43.38-16.4-66.81-10.31-44.9 11.67-81 48.5-92.01 93.72-10.13 41.62-.42 80.81 21.5 110.43 23.36 31.57 32.68 68.66 36.29 107.35 4.4 47.16 10.33 94.16 20.94 140.32l7.8 33.95c3.19 13.87 15.49 23.7 29.67 23.7 13.97 0 26.15-9.55 29.54-23.16l34.47-138.42c4.56-18.32 20.96-31.16 39.76-31.16s35.2 12.85 39.76 31.16l34.47 138.42c3.39 13.61 15.57 23.16 29.54 23.16 14.18 0 26.48-9.83 29.67-23.7l7.8-33.95c10.61-46.15 16.53-93.16 20.94-140.32 3.61-38.7 12.93-75.78 36.29-107.35 21.95-29.61 31.66-68.8 21.53-110.43z"/>
          </svg> {init_od?"Odontograma de evolucion":"Odontograma inicial"}
        </h1>
        <div className="row">
          {!init_od ? ""
            : (
              <div style={{marginRight: "8px"}}>
                <button type="button" className="btn btn-secondary waves-effect waves-themed" data-toggle="modal" data-target="#initialodontogram_modal">Ver Inicial</button>
              </div>
            )
          }
          {!init_od ? ""
            : (
              <div style={{marginRight: "8px"}}>
                <button type="button" className="btn btn-secondary waves-effect waves-themed" data-toggle="modal" data-target="#evologod_modal">Registro de evolucion</button>
              </div>
            )
          }
          <div className="btn-group btn-group-toggle" data-toggle="buttons">
            <label className={"btn btn-info waves-effect waves-themed "+(odontogram_type.current==='A'?'active':'')} onClick={()=>changeTeethType('A')}>
              <input type="radio" name="odontogram_type" defaultChecked /> Adulto
              <span className="badge border border-light rounded-pill bg-info-500 position-absolute pos-top pos-right">{inc_count_a.current}</span>
            </label>
            <label className={"btn btn-info waves-effect waves-themed "+(odontogram_type.current==='K'?'active':'')} onClick={()=>changeTeethType('K')}>
              <input type="radio" name="odontogram_type" /> Infante
              <span className="badge border border-light rounded-pill bg-info-500 position-absolute pos-top pos-right">{inc_count_k.current}</span>
            </label>
          </div>
        </div>
      </div>
      {/* Paciente */}
      <div>
        <h5>Paciente: <i>{
          cita
          ? cFL(cita.paciente_data.nombre_principal)+" "+
            cita.paciente_data.ape_paterno.toUpperCase()+" "+
            cita.paciente_data.ape_materno.toUpperCase()
          : ""
        }</i></h5>
      </div>

      <div style={{whiteSpace: "nowrap"}}>
        <canvas id="odontogram" width="750" height="530" style={{background:"white", verticalAlign:"top"}}></canvas>
        <div style={{display: "inline-block"}}>
          {(()=>{
            if(incident)
              return <IncidentForm setTeeth={setTeeth} incident={incident}
                setIncident={setIncident} inc_list={incident_list}
                set_inc_list={setIncidentList} odontogram_type={odontogram_type.current} />
            else return <IncidentPanel setIncident={setIncident} />
          })()}
        </div>
      </div>
      <div>
        <div  className="row" style={{width: "100%"}}>
          <div className="col-sm" style={{height: "160px"}}>
            <label className="form-label" htmlFor="textarea_observaciones">Observaciones</label>
            <textarea className="form-control" id="textarea_observaciones" rows="5" defaultValue={odontogram.observaciones}></textarea>
          </div>
          <div style={{width: "325px"}}>
            <IncidentList inc_list={incident_list} set_inc_list={setIncidentList}
              getToothByKey={getToothByKey} clearTooth={clearTooth} />
          </div>
        </div><br/>
        <div className="btn-group btn-group-toggle" data-toggle="buttons">
          <button type="button" className="btn btn-success waves-effect waves-themed"
            onClick={init_od?saveOdontogram:askSaveInitialOdontogram} title="Asegurate de escribir las observaciones que encuentres">{init_od?"Guardar":"Guardar Odontograma Inicial"}</button>
          <button type="button" className="btn btn-secondary waves-effect waves-themed"
            onClick={()=>changeTeethType()}>Reiniciar</button>
        </div>
      </div>
      {!init_od ? ""
        : <InitialOdontogramModal init_od={init_od} />
      }
      {!init_od || ar_ev_od_log.length==0 ? ""
        // if there is no init_od or ar_ev_od_log is empty -> do nothing
        : <EvoLogOdModal evol_od={ar_ev_od_log} />
      }
      {init_od ? ""
        : <ModalCancel
            _id={"modal_save_init_od"}
            _title={"Guardar odontograma inicial"}
            _action_text={"Guardar"}
            _action_func={saveInitialOdontogram}
            _body_text={"Una vez guardado el odontograma inicial no puede ser modificado"} />
      }
    </>
  )
}
// Related components
function IncidentForm(props){
  if(props.incident>=incident_type.incidents.length){
    return (<button onClick={()=>props.setIncident(false)}>return</button>);
  }
  // Type of component select
  let inc_code = props.incident;
  let dom_select_info;
  let elements = [];  // Form fields array

  if( incident_type.component_array.includes(inc_code) ){
    select_type = 2;
    dom_select_info = [<i key="inc_title">Seleccione los elementos involucrados</i>];
  }
  else if( incident_type.component_line_array.includes(inc_code) ){
    select_type = 3;
    // Preview canvas
    elements.push(
      <div key="preview-canvas" className="form-group">
      <canvas id="preview"
        width={(settings.width*1.3+preview_margin*2)*preview_scale}
        height={(settings.height+preview_margin*2)*preview_scale}
        style={{background:`${settings.toothhovercolor}`,verticalAlign:"top"}}>
      </canvas>
      </div>
    );
    dom_select_info = [<i key="inc_title">Seleccione los bordes de la incidencia</i>];
  }
  else if( incident_type.component_tooth.includes(inc_code) ){
    select_type = 4;
    dom_select_info = [<i key="inc_title">Seleccione el diente</i>];
  }
  else if( incident_type.component_beside.includes(inc_code) ){
    select_type = 4;
  }
  else if( incident_type.component_range.includes(inc_code) ){
    select_type = 4;
    dom_select_info = [<i key="inc_title">Seleccione el otro extremo del rango</i>];
  }
  else if( incident_type.component_all.includes(inc_code) ){
    select_type = 0;
    dom_select_info = [<span key="inc_title" style={{fontSize: '1.4em'}}>Ubicación</span>];
    elements.push(
      <div key={"location_div"+inc_code} id="form-direction" className="form-group">
        <div className="custom-control custom-radio">
          <input type="radio" className="custom-control-input" id="all-up" name="all-direction" value="U" defaultChecked />
          <label className="custom-control-label" htmlFor="all-up">Arriba</label>
        </div>
        <div className="custom-control custom-radio">
          <input type="radio" className="custom-control-input" id="all-down" name="all-direction" value="D" />
          <label className="custom-control-label" htmlFor="all-down">Abajo</label>
        </div>
      </div>
    );
  }
  else return;


  let inc = incident_type.incidents[inc_code];

  // Form fields
  if(inc.hasOwnProperty("log")){
    const _elements = [];
    inc.log.forEach((v, i) => {
      _elements.push(
        <option key={"log_option_"+v.key} value={v.key}>{v.text}</option>
      );
    });
    // Add to main elements
    elements.push(
      <div key={"log_div"+inc_code} id="form-log" className="form-group">
        <span style={{fontSize: '1.4em'}}>Identificador</span>
        <label className="form-label" htmlFor="value-log"></label>
        <select className="form-control" id="value-log">
          {_elements}
        </select>
      </div>
    );
  }
  if(inc.hasOwnProperty("state")){
    // Add to main elements
    elements.push(
      <div key={"state_div"+inc_code} id="form-state" className="form-group">
        <span style={{fontSize: '1.4em'}}>Estado</span>
        <div className="custom-control custom-radio">
          <input type="radio" className="custom-control-input" id="value-state-T" value="true" name="inc_state" defaultChecked />
          <label className="custom-control-label" htmlFor="value-state-T">Buen estado</label>
        </div>
        <div className="custom-control custom-radio">
          <input type="radio" className="custom-control-input" id="value-state-F" value="false" name="inc_state" />
          <label className="custom-control-label" htmlFor="value-state-F">Mal estado</label>
        </div>
      </div>
    );
  }
  if(inc.hasOwnProperty("orientation")){
    // Add to main elements
    elements.push(
      <div key={"orientation_div"+inc_code} id="form-orientation" className="form-group">
      <span style={{fontSize: '1.4em'}}>Dirección</span>
        <div className="custom-control custom-radio">
          <input type="radio" className="custom-control-input" id="value-orientation-R" value="R" name="inc_orientation" defaultChecked />
          <label className="custom-control-label" htmlFor="value-orientation-R">Derecha</label>
        </div>
        <div className="custom-control custom-radio">
          <input type="radio" className="custom-control-input" id="value-orientation-L" value="L" name="inc_orientation" />
          <label className="custom-control-label" htmlFor="value-orientation-L">Izquierda</label>
        </div>
      </div>
    );
  }
  if(inc.hasOwnProperty("fractura")){
    const _elements = [];
    inc.fractura.forEach((v, i) => {
      _elements.push(
        <option key={"fractura_option_"+v.key} value={v.key}>{v.text}</option>
      );
    });
    // Add to main elements
    elements.push(
      <div key={"fractura_div"+inc_code} id="form-fractura" className="form-group">
        <span style={{fontSize: '1.4em'}}>Caso</span>
        <label className="form-label" htmlFor="value-fractura"></label>
        <select className="form-control" id="value-fractura">
          {_elements}
        </select>
      </div>
    );
  }
  // Add incidence detail form
  elements.push(
    <div key={"detail_div"+inc_code} id="form-group form-detail">
      <label className="form-label" htmlFor="inc_detail">Detalle de la incidencia: </label>
      <input type="text" id="inc_detail" name="inc_detail"
        className="form-control" />
    </div>
  );

  // Save incidence function
  const saveIncidence = () => {
    if(select_type===0){  // When select type is 0 there is no condition
    }else if(!currentTooth.tooth){  // When select type is other than 1 there should be a tooth selected
      alert("Debe seleccionar un diente");
      return;
    }else if(select_type!==4 && inc_paths.length<1){  // When select type is other than 4 there should be at least one component selected
      alert("Debe seleccionar al menos un componente");
      return;
    }

    // Incident
    let _inc_obj = {};  // Incident object
    _inc_obj.odontogram_type = props.odontogram_type=='A'?"1":"2"  // Specify what odontogram type does this incident belong
    _inc_obj.type = inc_code;  // Incident code
    _inc_obj.detalle = window.document.getElementById('inc_detail').value  // Incident detail
    _inc_obj.nueva_incidencia = true  // Nueva incidencia ingresada por el usuario

    // Get form data
    let _form_data = {};
    if(document.getElementById("form-log"))
      _form_data.log = document.getElementById("value-log").value;
    if(document.getElementById("form-state"))
      _form_data.state = document.getElementById('value-state-T').checked;
    if(document.getElementById("form-orientation"))
      _form_data.orientation = document.getElementById('value-orientation-R').checked ? 'R' : 'L';
    if(document.getElementById("form-fractura"))
      _form_data.fractura = parseInt(document.getElementById('value-fractura').value);
    _inc_obj.value = Object.assign({}, _form_data);  // Components of incident

    // Tooth && component
    let _tooth = currentTooth.tooth;
    if(select_type===0){
      // Select the last tooth
      let _teeth = document.getElementById("all-up").checked ? teeth.upper_teeth : teeth.lower_teeth;
      _tooth = _teeth[_teeth.length-1];  // Select last tooth
    }else if(select_type===4){
      if(incident_type.component_beside.includes(inc_code)){  // Only two teeth
        if( !addBesideIncidence(teeth, _tooth, _inc_obj) ) return;
      }else if(incident_type.component_range.includes(inc_code)){  // *Range of teeth
        if(inc_paths.length!==1 || !inc_paths[0].key){
          alert("Debe seleccionar el otro extremo del rango")
          return;
        }

        // Start tooth key
        _inc_obj.value.start_tooth_key = inc_paths[0].key;

        // Get other tooth object
        let location = ["1", "2", "5", "6"].includes(String(inc_paths[0].key)[0]);
        let _teeth;  // Get teeth
        if(location) _teeth = teeth.upper_teeth;
        else if(!location) _teeth = teeth.lower_teeth;
        let _other_tooth;  // Other tooth object
        let _inx;  // Other tooth index
        let _other_right = _teeth.some((tooth, inx) => {
          if(tooth.key==inc_paths[0].key){
            _other_tooth = tooth;
            _inx = inx;
            return true;
          }
          return false;
        });
        // Get current tooth index
        let inx = _teeth.indexOf(_tooth);
        if(_other_right===false || inx===false){
          alert("SOMETHING WENT WRONG, TOOTH INDEX WASN'T FOUND IN TEETH ARRAY")
          return;
        }
        // Change teeth if order is not right
        if(_inx > inx){
          _inc_obj.value.start_tooth_key = _tooth.key;
          _tooth = Object.assign({}, _other_tooth);
        }
      }
    }else{
      // Get components of incident, get only key
      _inc_obj.component = inc_paths.reduce((ar, v)=>{ar.push(parseInt(v.key)); return ar}, []);
    }

    _tooth.incidents.push(_inc_obj);  // Add incident object to tooth
    props.setTeeth(teeth);  // Save modified teeth
    // Add to incident list
    props.inc_list.push({
      diente_inicio: Number(_tooth.incidents[_tooth.incidents.length-1].value.start_tooth_key),
      diente: _tooth.key,
      type: Number(inc_code),
      inx: _tooth.incidents.length-1
    });
    props.set_inc_list(props.inc_list);
    // Return incident to false (finish the form)
    props.setIncident(false);
  }

  return (
    <div style={{width: "280px", paddingLeft: "10px"}}>
      <h1 style={{whiteSpace: "initial"}}>{inc_functions[inc_code-1]}</h1>
      <div className="form-group">{dom_select_info}</div>
      {elements}
      <br/>
      <button className="btn btn-secondary" onClick={()=>props.setIncident(false)}>Cancelar</button>
      <button className="btn btn-primary" onClick={()=>saveIncidence()}>Guardar</button>
    </div>
  )
}
function IncidentPanel(props){
  select_type = 4;
  let button_all_list = [];
  let button_range_list = [];
  let button_tooth_list = [];

  inc_functions.forEach((v, i) => {
    let button_list;
    // All
    if( incident_type.component_all.includes(i+1) ) button_list = button_all_list;
    // Range
    else if( incident_type.component_range.includes(i+1) ) button_list = button_range_list;
    // Tooth
    else button_list = button_tooth_list;

    button_list.push(
      <button
        key={"inc_button_"+i}
        type="button"
        className="btn btn-light waves-effect waves-themed"
        onClick={()=>props.setIncident(i+1)}>
          {v}
      </button>
    );
  });
  useEffect(() => {
    if(window.$) window.$('#slimscroll').slimScroll({
      width: "280",
      height: "505",
      size: "4px",
      color: "rgba(0,0,0,0.6)",
      distance: "4px",
      railcolor: "#fafafa",
    });
  }, []);

  return (
    <div>
      <div style={{height: "25px", textAlign: "center"}}>
        <span className="fw-500" style={{fontSize: "1.3em"}}>LISTA DE INCIDENCIAS</span>
      </div>

      {/* slimscroll */}
      <div id="slimscroll" className="custom-scroll" style={{width:"280px", height: "505px"}}>
        <div className="p-3"> {/* slimscroll CONTENT*/}
          {/* acordion */}
          <div className="accordion" id="incidence-panel" style={{whiteSpace: "normal"}}>
            {/* Tooth */}
            <div className="card">
              <div className="card-header">
                <button className="btn-block btn btn-secondary waves-effect waves-themed" data-toggle="collapse" data-target="#incidence-tooth" aria-expanded="false">
                  <span className="collapsed-reveal">
                    <i className="fal fa-minus fs-xl"></i>
                  </span>
                  <span className="collapsed-hidden">
                    <i className="fal fa-plus fs-xl"></i>
                  </span>
                  Un solo diente
                </button>
              </div>
              <div id="incidence-tooth" className="collapse">
                <div className="btn-group-vertical" role="group" style={{width: "100%"}}>
                  {/* BUTTONS GROUP */}
                  {button_tooth_list}
                </div>
              </div>
            </div>
            {/* Range */}
            <div className="card">
              <div className="card-header">
                <button className="btn-block btn btn-secondary waves-effect waves-themed" data-toggle="collapse" data-target="#incidence-range" aria-expanded="true">
                  <span className="collapsed-reveal">
                    <i className="fal fa-minus fs-xl"></i>
                  </span>
                  <span className="collapsed-hidden">
                    <i className="fal fa-plus fs-xl"></i>
                  </span>
                  Rango de dientes
                </button>
              </div>
              <div id="incidence-range" className="collapse show">
                <div className="btn-group-vertical" role="group" style={{width: "100%"}}>
                  {/* BUTTONS GROUP */}
                  {button_range_list}
                </div>
              </div>
            </div>
            {/* All */}
            <div className="card">
              <div className="card-header">
                <button className="btn-block btn btn-secondary waves-effect waves-themed" data-toggle="collapse" data-target="#incidence-all" aria-expanded="true">
                  <span className="collapsed-reveal"><i className="fal fa-minus fs-xl"></i></span>
                  <span className="collapsed-hidden"><i className="fal fa-plus fs-xl"></i></span>
                  Todos los dientes
                </button>
              </div>
              <div id="incidence-all" className="collapse show">
                <div className="btn-group-vertical" role="group" style={{width: "100%"}}>
                  {/* BUTTONS GROUP */}
                  {button_all_list}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
function IncidentList(props){
  let [, updateState] = useState();
  /* Set new state to empty object value
    'cuz when React compares the last state with the new empty object value
    it'll be different 'cuz objects are always different
    btw we're using forceUpdate function 'cuz our elements are dinamically generated
    and its changes are not tracked by react so their changes won't fire a render
    that's why we've used forceUpdate function
  */
  const forceUpdate = () => updateState({});

  let elements = [];
  props.inc_list.forEach((inc, inx) => {
    elements.push(
      <div key={"inc_list_"+inx} style={{cursor: "pointer"}}>
          <button onClick={()=>deleteIncidence(inx)}
            className="btn btn-danger btn-xs btn-icon rounded-circle"
            style={{marginRight: "7px"}}>
            <i className="fal fa-times"></i>
          </button>
          <div style={{display: "inline-block"}} title={inc.detalle}>
            <span>Diente: </span><b>{inc.diente_inicio?`${inc.diente_inicio} - ${inc.diente}`:inc.diente}</b><span> &nbsp;{inc_functions[inc.type-1]}</span>
          </div>
      </div>
    );
  });

  // Delete incidence
  function deleteIncidence(inx){
    let _fake_list = props.inc_list;

    // Get tooth from incidence
    let _tooth = props.getToothByKey(_fake_list[inx].diente);
    // Fix beside teeth incidence before delete incidence
    if(incident_type.component_beside.includes(_fake_list[inx].type)){
      // Direction of aside tooth
      let _direction =
        (_tooth.incidents[_fake_list[inx].inx].value.orientation==="R")
        ? 1 : -1;
      // Get aside tooth
      let _tooth2 = (_tooth.orientation=="U"?teeth.upper_teeth:teeth.lower_teeth)[
        (_tooth.orientation=="U"?teeth.upper_teeth:teeth.lower_teeth)
        .indexOf(_tooth)+_direction
      ];
      // Remove incidence from aside tooth
      _tooth2.incidents = _tooth2.incidents.filter(i => {
        return !(
          i.type==_fake_list[inx].type ||
          i.value.orientation=="R"?1:-1 != _direction
        );
      });
    }
    // Delete incidence from its tooth
    _tooth.incidents.splice(_fake_list[inx].inx, 1);
    // Delete incidence from list
    let a = _fake_list.splice(inx, 1);
    // Fix index in other incidences of the same tooth
    _fake_list.map((inc) => {
      if(inc.diente==_tooth.key){  // Same tooth
        // Index is upper than the one we're erasing
        if(inc.inx>inx){
          inc.inx--;
          return inc;
        }
      }
      return inc;
    });

    props.clearTooth();  // Delete incidence drawing
    props.set_inc_list(_fake_list);
    forceUpdate();  // Force update
  }

  useEffect(() => {
    if(window.$) window.$('#slimscroll-inc_list').slimScroll({
      height: "137",
      size: "4px",
      color: "rgba(0,0,0,0.6)",
      railVisible: true,
      alwaysVisible: true,
      railcolor: "#fafafa",
    });
  }, []);

  return (
    <div>
      <label className="form-label">Incidencias en el odontograma</label><br/>
      <div id="slimscroll-inc_list" className="custom-scroll">
        <div style={{paddingLeft: "5px"}}> {/* slimscroll CONTENT*/}
          {elements.length==0?"No hay ninguna incidencia":elements}
        </div>
      </div>
    </div>
  )
}
// Initial odontogram
function InitialOdontogramModal({init_od}){
  return (
    <RegularModalCentered
      _title={"Odontograma inicial"}
      _id={"initialodontogram_modal"}
      _body={
        <OdontogramaInicial init_od={init_od}/>
      }
      _min_width={"1000"} />
  )
}
function OdontogramaInicial({init_od}){
  /* Prefijo de las variables de este contexto
  * o_: variable inicial
  * init_od: odontogram object (this component don't handle bad odontogram object, check it out before using this)
  */
  const [o_ctx, setOCtx] = useState(false)  // Canvas context
  const [o_teeth, setOTeeth] = useState([])  // Data current teeth
  const [o_teeth_a, setOTeethA] = useState([])  // Data teeth adult
  const [o_teeth_k, setOTeethK] = useState([])  // Data teeth kid
  const [o_inc_list, setOIncList] = useState([])  // Data teeth kid
  const [o_od_type, setOOdType] = useState(false)  // Current odontogram type
  // Incidence counter
  let o_inc_count_a = useRef(0)
  let o_inc_count_k = useRef(0)

  // Flujo incidencias
  const genTeeth = () => {
      if(__debug__) console.log("od_inicial: genTeeth")

      // Generate Adult Teeth
      genATeeth()
      // Generate Kid Teeth
      genKTeeth()
  }
  const genATeeth = () => {
    if(__debug__) console.log("od_inicial: genATeeth")

    // General
    let _left = (
      // Odontogram element width
      o_ctx.canvas.width-
      // Tooth with plus tooth spacing
      (settings.width+settings.tooth_spacing)*(2+16)
    )/2  // Half of the total space left
    let _top = 40
    let _build_data
    // Teeth container
    let upper_teeth = []
    let lower_teeth = []

    /*** Generate Adult Teeth ***/
    // Upper teeth
    let _teeth_a = []
    upper_teeth = []
    _top += settings.data_height+settings.data_space
    _build_data = build_data.build_adult_top
    _build_data.forEach((v)=>{
      // Calc coordinates
      let _x = _left
      if(upper_teeth.length){
        let last_tooth = upper_teeth[upper_teeth.length-1]
        _x = last_tooth.x + settings.tooth_spacing
        _x += last_tooth.body===2 ? settings.width*1.3 : settings.width
      }

      // Create object with properties
      let a
      switch(v.type){
        case 0: a = new Molar(o_ctx, _x, _top, v.key, v.orientation, v.root, v.incidents); break;
        case 1: a = new Premolar(o_ctx, _x, _top, v.key, v.orientation, v.root, v.incidents); break;
        case 2: a = new Canine(o_ctx, _x, _top, v.key, v.orientation, v.root, v.incidents); break;
        case 3: a = new Incisor(o_ctx, _x, _top, v.key, v.orientation, v.incidents); break;
        default: alert(`ERROR IN TEETH BUILD DATA: tooth type not found in key ${v.key}`); break;
      }
      a.setTeeth(_teeth_a)  // Add teeth's memory reference
      upper_teeth.push(a)
    })
    _teeth_a.upper_teeth = upper_teeth
    // Lower teeth
    lower_teeth = []
    _top *= 3  // Dependant of canvas
    _build_data = build_data.build_adult_bottom
    _build_data.forEach((v)=>{
      // Calc coordinates
      let _x = _left
      if(lower_teeth.length){
        let last_tooth = lower_teeth[lower_teeth.length-1]
        _x = last_tooth.x + settings.tooth_spacing
        _x += last_tooth.body===2 ? settings.width*1.3 : settings.width
      }

      // Create object with properties
      let a
      switch(v.type){
        case 0: a = new Molar(o_ctx, _x, _top, v.key, v.orientation, v.root, v.incidents); break;
        case 1: a = new Premolar(o_ctx, _x, _top, v.key, v.orientation, v.root, v.incidents); break;
        case 2: a = new Canine(o_ctx, _x, _top, v.key, v.orientation, v.root, v.incidents); break;
        case 3: a = new Incisor(o_ctx, _x, _top, v.key, v.orientation, v.incidents); break;
        default: alert(`ERROR IN TEETH BUILD DATA: tooth type not found in key ${v.key}`); break;
      }
      a.setTeeth(_teeth_a)  // Add teeth's memory reference
      lower_teeth.push(a)
    })
    _teeth_a.lower_teeth = lower_teeth
    setOTeethA(_teeth_a)
  }
  const genKTeeth = () => {
    if(__debug__) console.log("od_inicial: genKTeeth")

    // General
    let _left = (
      // Odontogram element width
      o_ctx.canvas.width-
      // Tooth with plus tooth spacing
      (settings.width+settings.tooth_spacing)*(2+10)
    )/2  // Half of the total space left
    let _top = 40
    let _build_data
    // Teeth container
    let upper_teeth = []
    let lower_teeth = []

    /*** Generate Kid Teeth ***/
    // Upper teeth
    let _teeth_k = []
    upper_teeth = []
    _top += settings.data_height+settings.data_space
    _build_data = build_data.build_kid_top
    _build_data.forEach((v)=>{
      // Calc coordinates
      let _x = _left
      if(upper_teeth.length){
        let last_tooth = upper_teeth[upper_teeth.length-1]
        _x = last_tooth.x + settings.tooth_spacing
        _x += last_tooth.body===2 ? settings.width*1.3 : settings.width
      }

      // Create object with properties
      let a
      switch(v.type){
        case 0: a = new Molar(o_ctx, _x, _top, v.key, v.orientation, v.root, v.incidents); break;
        case 1: a = new Premolar(o_ctx, _x, _top, v.key, v.orientation, v.root, v.incidents); break;
        case 2: a = new Canine(o_ctx, _x, _top, v.key, v.orientation, v.root, v.incidents); break;
        case 3: a = new Incisor(o_ctx, _x, _top, v.key, v.orientation, v.incidents); break;
        default: alert(`ERROR IN TEETH BUILD DATA: tooth type not found in key ${v.key}`); break;
      }
      a.setTeeth(_teeth_k)  // Add teeth's memory reference
      upper_teeth.push(a)
    })
    _teeth_k.upper_teeth = upper_teeth
    // Lower teeth
    lower_teeth = []
    _top *= 3  // Dependant of canvas
    _build_data = build_data.build_kid_bottom
    _build_data.forEach((v)=>{
      // Calc coordinates
      let _x = _left
      if(lower_teeth.length){
        let last_tooth = lower_teeth[lower_teeth.length-1]
        _x = last_tooth.x + settings.tooth_spacing
        _x += last_tooth.body===2 ? settings.width*1.3 : settings.width
      }

      // Create object with properties
      let a
      switch(v.type){
        case 0: a = new Molar(o_ctx, _x, _top, v.key, v.orientation, v.root, v.incidents); break;
        case 1: a = new Premolar(o_ctx, _x, _top, v.key, v.orientation, v.root, v.incidents); break;
        case 2: a = new Canine(o_ctx, _x, _top, v.key, v.orientation, v.root, v.incidents); break;
        case 3: a = new Incisor(o_ctx, _x, _top, v.key, v.orientation, v.incidents); break;
        default: alert(`ERROR IN TEETH BUILD DATA: tooth type not found in key ${v.key}`); break;
      }
      a.setTeeth(_teeth_k)  // Add teeth's memory reference
      lower_teeth.push(a)
    })
    _teeth_k.lower_teeth = lower_teeth
    setOTeethK(_teeth_k)
  }
  const getIncidences = () => {
    /* This function uses the 'odontogram' global object */
    /* This function should be called only once and only if odontogram exists */
    if(__debug__) console.log("od_inicial: getIncidences")

    // Get incidents
    simpleGet(`atencion/odontograma/${init_od.pk}/incidencia/`)
    .then(insertIncidencesInTeeth)  // Add incidences to teeth
    .then(changeOdType)
  }
  const getToothByKey = (_teeth_, key) => {
    /* Search for the tooth inside the given teeth object
    */
    // Get tooth by key
    let tooth
    let first_digit = parseInt(String(key)[0])
    let last_digit = parseInt(String(key)[1])
    let up = [1, 2, 5, 6].includes(first_digit)
    let _teeth = up ? _teeth_.upper_teeth : _teeth_.lower_teeth
    let middle_range = _teeth.length/2
    if(up){  // Upper side
      if([1, 5].includes(first_digit)){  // Left side
        tooth = _teeth[middle_range-last_digit]
      }else{  // Right side
        tooth = _teeth[middle_range+last_digit-1]
      }
    }else{  // Lower side
      if([4, 8].includes(first_digit)){  // Left side
        tooth = _teeth[middle_range-last_digit]
      }else{  // Right side
        tooth = _teeth[middle_range+last_digit-1]
      }
    }

    return tooth
  }
  const insertIncidencesInTeeth = objs => {
    /* This function require teethState to be already declared
    * This function will return the last odontogram type in incidence
    */
    if(__debug__) console.log("od_inicial: insertIncidencesInTeeth")
    let last_od_type = "1"
    let _o_inc_list = []
    // Reset teeth incidence counter
    o_inc_count_a.current = 0
    o_inc_count_k.current = 0
    // If there is no incidences to insert
    if(objs.length == 0) changeOdType('A')  // Set default odontogram type

    objs.forEach(inc => {
      /* getTooth from both A&K */
      let _teeth = inc.tipo_odontograma=="1"?o_teeth_a:o_teeth_k
      let tooth = getToothByKey(_teeth, inc.diente)
      if(!tooth){
        console.error("Tooth not found");
        console.error("inc:", inc);
        return
      }

      let inc_obj = {}
      inc_obj.type = parseInt(inc.type)
      inc_obj.value = {}
      inc_obj.value.log = inc.log
      inc_obj.value.state = inc.state
      inc_obj.value.orientation = inc.orientation
      inc_obj.value.fractura = JSON.parse(inc.fractura)
      inc_obj.value.start_tooth_key = inc.start_tooth_key
      inc_obj.component = JSON.parse(inc.component)
      inc_obj.odontogram_type = inc.tipo_odontograma
      inc_obj.detalle = inc.detalle
      inc_obj.nueva_incidencia = false
      tooth.incidents.push(inc_obj)  // Add to global teeth data

      // Set last odontogram type in incidence
      last_od_type = inc.tipo_odontograma

      // Add incidence to o_inc_list
      _o_inc_list.push({
        diente_inicio: Number(inc.start_tooth_key),
        diente: tooth.key,
        type: Number(inc.type),
        detalle: inc_obj.detalle,
      });

      // Add to teeth counter
      if(inc.tipo_odontograma=="1") o_inc_count_a.current++
      else o_inc_count_k.current++

      // Fix aside incidences
      if(incident_type.component_beside.includes(inc_obj.type))
        addBesideIncidence(_teeth, tooth, inc_obj)
    })

    // Set incidence list
    setOIncList(_o_inc_list)

    return last_od_type=="1"?'A':'K'
  }
  const printOdontogram = () => {
    if(__debug__) console.log("od_inicial: printOdontogram")

    o_ctx.clearRect(0, 0, o_ctx.canvas.width, o_ctx.canvas.height)  // Clear canvas
    // All teeth
    let all_teeth = [...o_teeth.upper_teeth, ...o_teeth.lower_teeth]
    all_teeth.forEach(tooth => tooth.draw())
    all_teeth.forEach(tooth => tooth.drawIncidents())
  }

  // Funciones de vista
  const changeOdType = type => {
    if(__debug__) console.log("od_inicial: changeOdType")

    if(type!='A'&&type!='K') return  // Allow only A || K
    if(o_od_type == type) return  // Prevent redundancy

    // Set teeth according to odontogram type
    setOTeeth(type=='A'?o_teeth_a:o_teeth_k)
    setOOdType(type)
  }

  // Only run after first render
  useEffect(() => {
    if(__debug__) console.log("od_inicial: useEffect genTeeth")
    // Elements
    let odontogram_el = document.getElementById('odontograma_inicial')

    // Save 2d context of odontogram
    setOCtx(odontogram_el.getContext('2d'))
  }, [])
  // After both teeth types are setted
  useEffect(() => {
    if(__debug__) console.log("od_inicial: useEffect o_teeth_a, o_teeth_k")

    if(!o_teeth_a.hasOwnProperty("upper_teeth") || !o_teeth_k.hasOwnProperty("upper_teeth")) return
    // Get incidences
    getIncidences()
  }, [o_teeth_a, o_teeth_k])
  // After odontogram type has changed
  useEffect(() => {
    if(!o_od_type) return

    printOdontogram()
  }, [o_od_type])
  // After ctx has changed
  useEffect(() => {
    if(!o_ctx) return

    genTeeth()  // Generate teeth objects
  }, [o_ctx])

  return (
    <div className="row">
      <canvas id="odontograma_inicial" width="750" height="530" style={{
        background:"white",
        width: "750px",
        height: "530px",
      }}></canvas>

      {/* SideBar */}
      <div style={{flex: "1 1 0%", paddingLeft: "15px"}}>
        {/* Odontogram type*/}
        <div className="btn-group btn-group-toggle" data-toggle="buttons">
          <label className={"btn btn-info waves-effect waves-themed "+(o_od_type=='A'?'active':'')} onClick={()=>changeOdType('A')}>
            <input type="radio" name="odontogram_type" /> Adulto
            <span className="badge border border-light rounded-pill bg-info-500 position-absolute pos-top pos-right">{o_inc_count_a.current}</span>
          </label>
          <label className={"btn btn-info waves-effect waves-themed "+(o_od_type=='K'?'active':'')} onClick={()=>changeOdType('K')}>
            <input type="radio" name="odontogram_type" /> Infante
            <span className="badge border border-light rounded-pill bg-info-500 position-absolute pos-top pos-right">{o_inc_count_k.current}</span>
          </label>
        </div>
        <hr style={{borderBottomWidth: "2px", borderBottomStyle: "solid"}}/> {/* Separator */}
        {/* Incidences list */}
        <b style={{fontSize: "1.4em"}}>Incidencias</b><br/>
        <div>
          {o_inc_list.length==0
            ? <span style={{fontSize: "1.2em"}}>No hay ninguna incidencia</span>
            : o_inc_list.map((inc, inx) => (
              <div key={"o-inc-"+inx} style={{fontSize: "1.2em", cursor: "pointer"}}  title={inc.detalle}>
                <span>Diente: </span>
                <b>{inc.diente_inicio?`${inc.diente_inicio} - ${inc.diente}`:inc.diente}</b>
                <span> &nbsp;{inc_functions[inc.type-1]}</span>
              </div>
            ))
          }
        </div>
        <hr style={{borderBottomWidth: "2px", borderBottomStyle: "solid"}}/> {/* Separator */}
        {/* Odontogram observations */}
        <b style={{fontSize: "1.4em"}}>Observaciones</b><br/>
        <span style={{fontSize: "1.2em"}}>{cFL(init_od.observaciones)}</span>
      </div>
    </div>
  )
}
// Evolution odontogram
function EvoLogOdModal({evol_od}){
  return (
    <RegularModalCentered _title={"Registro de evolución"}
      _id={"evologod_modal"}
      _body={
        <EvolutionOdontogramLog evol_od={evol_od} />
      }
      _min_width={"600"} />
  )
}
function EvolutionOdontogramLog({evol_od}){
  useEffect(() => {
    if(__debug__) console.log("od_evolucion");

  }, [])


  return (
    <div className="row">
      <div style={{width: "100%"}}>
        {/* Incidence log list */}
        {evol_od.length==0 ? <span style={{fontSize: "1.2em"}}>No hay registros de incidencias</span>
          : evol_od.map(inc => (
            <div key={"ev_od_inc-"+inc.pk}>
              <div className="row no-gutters row-grid align-items-stretch">
                <div className="col-md">
                  <div className="p-3">
                    <div className="d-flex">
                      <div className="d-inline-flex flex-column">
                        {/* Nombre */}
                        <span className="fs-xl text-truncate text-truncate-lg text-info" style={{fontWeight: "bold", whiteSpace: "initial"}}>
                          {inc_functions[inc.type-1]}
                        </span>
                        {/* Fecha */}
                        <span>Fecha: <i className="text-truncate text-truncate-xl">{inc.fecha}</i></span>
                        {/* Diente */}
                        <span>Diente: <span className="text-truncate text-truncate-xl">{inc.start_tooth_key?`${inc.start_tooth_key} - ${inc.diente}`:inc.diente}</span></span>
                        {/* Log */}
                        {!inc.log ? ""
                          : <span>Notacion: <i className="text-truncate text-truncate-xl">{inc.log}</i></span>
                        }
                        {/* Estado */}
                        {inc.state==undefined ? ""
                          : <span>Estado: <b className="text-truncate text-truncate-xl" style={{color: inc.state?"blue":"red"}}>{inc.state?"Bueno":"Malo"}</b></span>
                        }
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-7">
                  <div className="p-3">
                    <div className="d-flex">
                      <div className="d-inline-flex flex-column">
                        {/* <span>Detalle:</span> */}
                        {/* Detalle */}
                        {inc.detalle && inc.detalle.length!=0
                          ? (
                            <span className="mt-1 d-block fs-sm fw-400 text-dark" style={{paddingLeft: "10px",lineBreak: "auto"}}>
                              {inc.detalle}
                            </span>
                          ) : ""}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <hr style={{borderBottomStyle: "solid", marginTop: "5px", marginBottom: "5px"}}/>
            </div>
          ))
        }
      </div>
    </div>
  )
}

// Function
function addBesideIncidence(_teeth, _tooth, _inc){
  // console.log(_tooth, _inc)
  let _sign = _inc.value.orientation==='R'?1:-1;  // Aside tooth is left or right
  // Get _inx && side tooth
  let _inx = _teeth.upper_teeth.indexOf(_tooth);
  let _side_tooth;
  if(_inx!==-1){
    // Check if it's posible to add aside tooth incident
    if((_sign===1 && _inx===_teeth.upper_teeth.length-1) || (_sign===-1 && _inx===0)){
      alert("No es posible agregar la incidencia en esa dirección")
      return false;
    }
    _side_tooth = _teeth.upper_teeth[_inx+_sign];
  }else{
    _inx = _teeth.lower_teeth.indexOf(_tooth);
    if(_inx!==-1){
      // Check if it's posible to add aside tooth incident
      if((_sign===1 && _inx===_teeth.upper_teeth.length-1) || (_sign===-1 && _inx===0)){
        alert("No es posible agregar la incidencia en esa dirección")
        return false;
      }
      _side_tooth = _teeth.lower_teeth[_inx+_sign];
    }else{
      alert("Ha ocurrido un error, diente no encontrado")
      return false;
    }
  }

  // console.log(_sign, _inx, _side_tooth);
  // Fake incident object
  let _inc_obj_fake = {};
  _inc_obj_fake.support = true;  // This incidence is just to support
  _inc_obj_fake.type = _inc.type;  // Incident code
  _inc_obj_fake.value = Object.assign({}, _inc.value);  // Incident value
  _inc_obj_fake.value.orientation = _sign===1?'L':'R';  // Change orientation
  // console.log(_inc_obj_fake);

  // Add incident to aside tooth with other orientation
  _side_tooth.incidents.push(_inc_obj_fake);

  return true;
}

export default Odontograma;
// eslint-disable-next-line react-hooks/exhaustive-deps
