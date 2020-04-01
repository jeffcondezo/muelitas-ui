import React, { useState, useEffect } from 'react';

// General properties
let teeth;
let ctx;  // Context 2d
// Objects properties
let scale = .9;
let settings = {
  strokeColor: "#777",
  tooth_spacing: 7*scale,
  width: 30*scale,
  height: 65*scale,
  root_height: 32*scale,
  data_height: 35*scale,
  data_space: 80*scale,
}
// Classes
class Tooth {
  constructor(x, y, key, orientation, body, incidents){
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
    let width = this.body==2 ? settings.width*1.3 : settings.width;  // Fix width by body
    let height = settings.height;
    let root_height = settings.root_height;
    let data_height = settings.data_height;
    let data_space = settings.data_space;
    let _y;

    // Data area
    let _data_area = new Path2D();
    _y = this.orientation=='U' ? y-(data_space+data_height) : y-data_height+height;
    _data_area.rect(x, _y, width, data_height);
    this.data_area = _data_area;

    // General area
    let _area = new Path2D();
    _y = this.orientation=='U' ? y : y-(data_space+data_height);
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
    let data_height = settings.data_height;
    let data_space = settings.data_space;
    y = this.orientation=='U' ? y+settings.root_height : y-(data_space+data_height);
    let root = this.root;
    let width = this.body==2 ? settings.width*1.3 : settings.width;  // Fix width by body
    let height = settings.height-settings.root_height;
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
    if(this.body==2){
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
    if(this.body==2){
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
    let width = this.body==2 ? settings.width*1.3 : settings.width;  // Fix width by body
    let height = settings.height;
    let data_height = settings.data_height;
    let data_space = settings.data_space;
    // Tooth key
    ctx.strokeStyle = settings.strokeColor;
    if(this.orientation=='U') ctx.strokeText(this.key, x-6+width/2, y-data_space+18);
    else if(this.orientation=='D') ctx.strokeText(this.key, x-6+width/2, y-(data_space+data_height)+height+data_space-10);
  }
  strokeBold(e){
    ctx.beginPath(); ctx.lineWidth = 1.5;  // Bold line width
    ctx.stroke(e);
    ctx.beginPath(); ctx.lineWidth = 1;  // Restore line width
  }

  // Incidents from Manual_Odontograma_Electronico
  selectComponent(key){
    if(typeof(key)==="undefined") return null;  // If component is not specified
    // Select tooth part
    if(typeof(key)==="number") key = [key];  // Fake array
    // Array of components
    let component = [];
    key.forEach((k) => {
      switch(k){
        case 11: component.push(this.tooth_top); break;
        case 12: component.push(this.tooth_right); break;
        case 13: component.push(this.tooth_bottom); break;
        case 14: component.push(this.tooth_left); break;
        case 15: component.push(this.tooth_center); break;
        case 51: component.push(this.tooth_center_tl); break;
        case 52: component.push(this.tooth_center_tr); break;
        case 53: component.push(this.tooth_center_br); break;
        case 54: component.push(this.tooth_center_bl); break;
        case 10: component.push(this.tooth_lines[0]); break;  // line_t
        case 20: component.push(this.tooth_lines[1]); break;  // line_r
        case 30: component.push(this.tooth_lines[2]); break;  // line_b
        case 40: component.push(this.tooth_lines[3]); break;  // line_l
        case 111: component.push(this.tooth_lines[4]); break;  // line_tl
        case 112: component.push(this.tooth_lines[5]); break;  // line_tr
        case 113: component.push(this.tooth_lines[6]); break;  // line_br
        case 114: component.push(this.tooth_lines[7]); break;  // line_bl
        case 511: component.push(this.tooth_lines[8]); break;  // line_ct1
        case 512: component.push(this.tooth_lines[9]); break;  // line_ct2
        case 521: component.push(this.tooth_lines[10]); break;  // line_cr1
        case 522: component.push(this.tooth_lines[11]); break;  // line_cr2
        case 531: component.push(this.tooth_lines[12]); break;  // line_cb1
        case 532: component.push(this.tooth_lines[13]); break;  // line_cb2
        case 541: component.push(this.tooth_lines[14]); break;  // line_cl1
        case 542: component.push(this.tooth_lines[15]); break;  // line_cl2
        case 551: component.push(this.tooth_lines[16]); break;  // line_cct
        case 552: component.push(this.tooth_lines[17]); break;  // line_ccr
        case 553: component.push(this.tooth_lines[18]); break;  // line_ccb
        case 554: component.push(this.tooth_lines[19]); break;  // line_ccl
        case 115: component.push(this.tooth_lines[20]); break;  // line_ccc
      }
    });
    if(component.length===1) component = component[0];  // Fix num to array

    return component;
  }
  drawIncidents(){
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
      }
      if(_txt) data.push(_txt);  // Add to tooth incident data when method returned
    });
    // Print tooth incident data
    ctx.lineWidth = 1;
    data.forEach((d, inx) => {
      let x = this.x + 4;
      let y = this.y + 12*(inx+1);
      let height = settings.height;
      let data_height = settings.data_height;
      let data_space = settings.data_space;
      y = this.orientation=='U' ? y-(data_space+data_height) : y-data_height+height;
      ctx.strokeStyle = d.color;
      ctx.strokeText(d.log, x, y);
    });
  }
  inc_LCD(c, v){  // 5.3.1  Lesión de caries dental
    // v is array
    ctx.fillStyle = "red";
    c.forEach((path) => {
      ctx.fill(path);
    });
    let txt;
    switch(v){
      case 1: txt = "MB"; break;
      case 2: txt = "CE"; break;
      case 3: txt = "CD"; break;
      case 4: txt = "CDP"; break;
    }
    return {log: txt, color: "red"};
  }
  inc_DDE(c, v){  // 5.3.2  Defectos de desarrollo de esmalte
    ctx.fillStyle = "red";
    ctx.fill(c);
    let txt;
    switch(v){
      case 1: txt = "HP"; break;
      case 2: txt = "HM"; break;
      case 3: txt = "O"; break;
      case 4: txt = "D"; break;
      case 5: txt = "Fluorosis"; break;
    }
    return {log: txt, color: "blue"};
  }
  inc_Sellante(c, v){  // 5.3.3  Sellantes
    let color = v ? "blue" : "red";
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    // v is array
    c.forEach((path) => {
      ctx.stroke(path)
    });
    return {log: "S", color: color};
  }
  inc_Fractura(c, v){  // 5.3.4  Fractura
    let y = this.y;
    if(this.orientation=='D'){
      v.yo *= -1;
      v.yf *= -1;
      y += settings.height - (settings.data_space+settings.data_height);
    }
    let xo = this.x + v.xo;
    let yo = y + v.yo;
    let xf = this.x + v.xf;
    let yf = y + v.yf;

    ctx.strokeStyle = "red";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(xo, yo);
    ctx.lineTo(xf, yf);
    ctx.stroke();
  }
  inc_FFP(c, v){  // 5.3.5  Fosas y fisuras profundas
    return {log: "FFP", color: "blue"};
  }
  inc_PDAusente(c, v){  // 5.3.6  Pieza dentaria ausente
    let width = settings.width*(this.body==2?1.3:1);
    let height = settings.height;
    let y = this.y;
    if(this.orientation=='D'){
      height *= -1;
      y += settings.height - (settings.data_height+settings.data_space);
    }

    ctx.strokeStyle = "blue";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(this.x, y);
    ctx.lineTo(this.x+width, y+height);
    ctx.moveTo(this.x+width, y);
    ctx.lineTo(this.x, y+height);
    ctx.stroke();
  }
  inc_PDErupcion(c, v){  // 5.3.7  Pieza dentaria en erupción
    let height = settings.height
    let width = settings.width*(this.body==2?1.3:1);
    let y = this.y;
    let x = this.x;
    if(this.orientation=='D'){
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
    ctx.strokeStyle = "blue";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(x+width*eruptionX_0, y+height*eruptionY_0);
    ctx.lineTo(x+width*eruptionX_1, y+height*eruptionY_1);
    ctx.lineTo(x+width*eruptionX_2, y+height*eruptionY_2);
    ctx.lineTo(x+width*eruptionX_3, y+height*eruptionY_3);
    ctx.lineTo(x+width*eruptionX_4, y+height*eruptionY_4);
    // Arrow
    ctx.moveTo(x+width*eruptionX_4, y+height*eruptionY_4);
    ctx.lineTo(
      x+width*eruptionX_4-5,
      y+height*eruptionY_4-10*Math.sign(height)
    );
    ctx.moveTo(x+width*eruptionX_4-2, y+height*eruptionY_4+2);
    ctx.lineTo(
      x+width*eruptionX_4+13,
      y+height*eruptionY_4-5*Math.sign(height)
    );

    ctx.stroke();
  }
  inc_RestDef(c, v){  // 5.3.8  Restauración definitiva
    let color = v.state ? "blue" : "red";
    ctx.fillStyle = color;
    // v is array
    c.forEach((path) => {
      ctx.fill(path)
    });
    let txt;
    switch(v.log){
      case 1: txt = "AM"; break;
      case 2: txt = "R"; break;
      case 3: txt = "IV"; break;
      case 4: txt = "IM"; break;
      case 5: txt = "IE"; break;
      case 6: txt = "C"; break;
    }
    return {log: txt, color: color};
  }
  inc_RestTemp(c, v){  // 5.3.9  Restauración temporal
    ctx.strokeStyle = "red";
    ctx.lineWidth = 3;
    // v is array
    c.forEach((path) => {
      ctx.stroke(path)
    });
  }
  inc_EdentuloTotal(c, v){  // 5.3.10  Edéntulo Total
    /* This function must be called by the last tooth of teeths
      otherwise another incident may overdraw this draw
    */
    let direction = ["1", "2", "5", "6"].includes(String(this.key)[0]);
    let _teeth = [];
    if(direction) _teeth = teeth.upper_teeth;
    else if(!direction) _teeth = teeth.lower_teeth;
    let last_index = _teeth.length-1;
    let last_width = settings.width;
    if(_teeth[last_index].body==2) last_width*=1.3;
    let y = this.y;
    if(this.orientation=='D'){
      y -= settings.data_space+settings.root_height+settings.data_height;
    }

    ctx.strokeStyle = "blue";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(_teeth.upper_teeth.x, y+(settings.height+settings.root_height)/2);
    ctx.lineTo(_teeth[last_index].x+last_width, y+(settings.height+settings.root_height)/2);
    ctx.stroke();
  }
  inc_PDSupernumeraria(c, v){  // 5.3.11  Pieza dentaria supernumeraria
    let x = this.x + (v ? settings.width : 0);
    let y = this.y;
    if(this.orientation=='D'){
      y += settings.height - (settings.data_height+settings.data_space);
    }

    ctx.strokeStyle = "blue";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, 2*Math.PI);
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.strokeText("S", x-3, y+3);
  }
  inc_PDExtruida(c, v){  // 5.3.12  Pieza dentaria extruida
    let y = this.y + settings.height+30;
    let x = this.x + settings.width/2;
    let height = 25;
    if(this.orientation=='D'){
      height *= -1;
      y -= settings.height*2+settings.data_space+settings.data_height;
    }

    ctx.lineWidth = 3;
    ctx.strokeStyle = "blue";
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y-height);
    ctx.moveTo(x, y);
    ctx.lineTo(x-8, y-height/2);
    ctx.moveTo(x, y);
    ctx.lineTo(x+8, y-height/2);

    ctx.stroke();
  }
  inc_PDIntruida(c, v){  // 5.3.13  Pieza dentaria intruida
    let y = this.y + settings.height+5;
    let x = this.x + settings.width/2;
    let height = 25;
    if(this.orientation=='D'){
      height *= -1;
      y -= settings.height+settings.data_space+settings.data_height+10;
    }

    ctx.lineWidth = 3;
    ctx.strokeStyle = "blue";
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y+height);
    ctx.moveTo(x, y);
    ctx.lineTo(x-8, y+height/2);
    ctx.moveTo(x, y);
    ctx.lineTo(x+8, y+height/2);

    ctx.stroke();
  }
  inc_Diastema(c, v){  // 5.3.14  Diastema
    let tooth_space = settings.tooth_spacing;
    let diastema_space = 2;
    let width = settings.width;
    let radius = settings.width;
    let x = this.x;
    let y = this.y + settings.root_height + (settings.height - settings.root_height)/2;
    let left = x + width - diastema_space;
    let right = x + diastema_space;
    if(this.orientation=='D'){
      y -= settings.root_height+settings.data_space+settings.data_height;
    }

    ctx.lineWidth = 3;
    ctx.strokeStyle = "blue";
    ctx.beginPath();
    if(v==='R'){
      right += this.body==2 ? width*.3 : 0;
      ctx.arc(right, y, radius, -40*Math.PI/180, 40*Math.PI/180);
    }else if(v==='L'){
      ctx.arc(left, y, radius, 140*Math.PI/180, 220*Math.PI/180);
    }
    ctx.stroke();
  }
  inc_Giroversion(c, v){  // 5.3.15  Giroversión
    let cy = this.y;
    let y = this.y + settings.height + (this.body==2 ? 8 : 9);
    let width = this.body==2 ? settings.width*1.3/2 : settings.width/2;
    let x = this.x + width - (v=='R' ? this.body==2 ? -18 : -14 : this.body==2 ? 19 : 15);
    let angel_o = this.body==2 ? 65 : 70;
    let angel_f = this.body==2 ? 115 : 110;
    let _sign = v=='R' ? 1 : -1;
    if(this.orientation=='D'){
      y -= settings.data_space + settings.data_height + settings.height + 19;
      cy -= settings.data_space + (this.body==2 ? 6 : 3);
      angel_o += 180;
      angel_f += 180;
    }else if(this.orientation=='U'){
      cy += settings.root_height;
    }

    ctx.lineWidth = 3;
    ctx.strokeStyle = "blue";
    ctx.beginPath();
    ctx.arc(this.x+width, cy, 40, angel_o*Math.PI/180, angel_f*Math.PI/180);
    ctx.moveTo(x, y-2);
    ctx.lineTo(x-6*_sign, y+7);
    ctx.moveTo(x, y);
    ctx.lineTo(x-6*_sign, y-7);
    ctx.stroke();
  }
  inc_PosDent(c, v){  // 5.3.16  Posición dentaria
    let txt;
    switch(v){
      case 1: txt = "M"; break;
      case 2: txt = "D"; break;
      case 3: txt = "V"; break;
      case 4: txt = "P"; break;
      case 5: txt = "L"; break;
    }
    return {log: txt, color: "blue"};
  }
  inc_PDClavija(c, v){  // 5.3.17  Pieza dentaria en clavija
    let data_space = settings.data_space;
    let x = this.x;
    let y = this.y - data_space;
    let width = this.body==2 ? settings.width*1.3 : settings.width;
    let height = settings.height;
    if(this.orientation=='D'){
      y += data_space + settings.root_height - 8;
    }else if(this.orientation=='U'){
      y += 22;
    }

    ctx.strokeStyle = "blue";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x+width/2, y-20);
    ctx.lineTo(x+width, y);
    ctx.lineTo(x, y);
    ctx.stroke();
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
    let width = this.body==2 ? settings.width*1.3 : settings.width;
    let x = this.x + width/2;
    let y = this.y - data_space - 7;
    if(this.orientation=='D'){
      y += data_space + settings.root_height - 8;
    }else if(this.orientation=='U'){
      y += 21;
    }
    let sign1 = 1;
    let sign2 = -1;
    if(v==='L'){
      sign1 = -1;
      sign2 = 1;
    }

    ctx.strokeStyle = "blue";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, 10, sign1*Math.PI/2, sign2*Math.PI/2);
    ctx.ellipse(x, y, width*3/4, 10, 0, sign2*Math.PI/2, sign1*Math.PI/2)
    ctx.stroke();
  }
  inc_Geminacion(c, v){  // 5.3.22  Geminación
    let data_space = settings.data_space;
    let width = this.body==2 ? settings.width*1.3 : settings.width;
    let x = this.x + width/2;
    let y = this.y - data_space - 7;
    if(this.orientation=='D'){
      y += data_space + settings.root_height - 8;
    }else if(this.orientation=='U'){
      y += 21;
    }

    ctx.strokeStyle = "blue";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, 2*Math.PI);
    ctx.stroke();
  }
  inc_Impactacion(c, v){  // 5.3.23  Impactación
    return {log: "I", color: "blue"};
  }
  inc_SupDesg(c, v){  // 5.3.24  Superficie desgastada
    ctx.strokeStyle = "red";
    ctx.lineWidth = 3;
    // v is array
    c.forEach((path) => {
      ctx.stroke(path)
    });
    return {log: "DES", color: "red"};
  }
  inc_RemRad(c, v){  // 5.3.25  Remanente radicular
    return {log: "RR", color: "red"};
  }
  inc_MovPat(c, v){  // 5.3.26  Movilidad Patológica
    v = isFinite(v) ? v : '';
    return {log: "M"+v, color: "red"};
  }
  inc_CoronaTemp(c, v){  // 5.3.27  Corona temporal
    ctx.lineWidth = 3;
    ctx.strokeStyle = "red";
    ctx.stroke(this.tooth);
    ctx.lineWidth = 1;
    return {log: "CT", color: "red"};
  }
  inc_Corona(c, v){  // 5.3.28  Corona
    ctx.lineWidth = 3;
    ctx.strokeStyle = v.state ? "blue" : "red";
    ctx.stroke(this.tooth);
    ctx.lineWidth = 1;

    let txt;
    switch(v.log){
      case 1: txt = "CM"; break;
      case 2: txt = "CF"; break;
      case 3: txt = "CMC"; break;
      case 4: txt = "CV"; break;
      case 5: txt = "CJ"; break;
    }
    return {log: txt, color: "blue"};
  }
  inc_EM(c, v){  // 5.3.29  Espigo muñon
    let y = this.y;
    let width = settings.width*(this.body==2 ? 1.3 : 1);
    let height = settings.height;
    let sign = 1;
    if(this.orientation=='D'){
      height *= -1;
      y -= settings.data_space+settings.data_height+height;
      sign = -1;
    }

    ctx.strokeStyle = v ? "blue" : "red";
    // Draw vertical line
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(this.x+width/2, y);
    ctx.lineTo(this.x+width/2, y+height/2+sign*settings.root_height/2);
    ctx.stroke();
    // Draw square
    ctx.lineWidth = 3;
    if(this.body==2){
      ctx.stroke(this.tooth_center);
    }else{
      let long = 12
      ctx.rect(this.x+width/2-long/2, y+height/2+sign*settings.root_height/2-long/2, long, long);
      ctx.stroke();
    }
  }
  inc_ImplanteDental(c, v){  // 5.3.30  Implante dental
    let color = v ? "blue" : "red";
    return {log: "IMP", color: color};
  }
  inc_AOF(c, v){  // 5.3.31  Aparato ortodóntico fijo
    /* This function must be called by the last tooth of the affected teeth */
    let direction = ["1", "2", "5", "6"].includes(String(this.key)[0]);
    let _teeth = [];
    if(direction) _teeth = teeth.upper_teeth;
    else if(!direction) _teeth = teeth.lower_teeth;
    let start_index = _teeth.length-v.amount;
    let y = this.y - 25;
    let height = 15;

    ctx.strokeStyle = v.state ? "blue" : "red";
    ctx.lineWidth = 3;
    ctx.beginPath();
    let width = settings.width*(_teeth[start_index].body==2 ? 1.3 : 1);
    // Rectangle
    ctx.rect(_teeth[start_index].x, y-height/2, height, height)
    ctx.moveTo(_teeth[start_index].x+height, y);
    ctx.lineTo(_teeth[start_index].x+width+settings.tooth_spacing/2, y);
    ctx.lineTo(this.x+width+settings.tooth_spacing-height, y);
    // Rectangle
    ctx.rect(this.x+width+settings.tooth_spacing-height, y-height/2, height, height)
    ctx.stroke();
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeText("+", _teeth[start_index].x+height/3, y+height/4);
    ctx.strokeText("+", this.x+width+settings.tooth_spacing-height*11/16, y+height/4)
  }
  inc_AOR(c, v){  // 5.3.32  Aparato ortodóntico removible
    /* This function must be called by the last tooth of teeths
      otherwise another incident may overdraw this draw
    */
    let direction = ["1", "2", "5", "6"].includes(String(this.key)[0]);
    let _teeth = [];
    if(direction) _teeth = teeth.upper_teeth;
    else if(!direction) _teeth = teeth.lower_teeth;
    let last_index = _teeth.length-1;
    let y = this.y - 10;
    let height = 15;
    if(this.orientation=='D'){
      height *= -1;
      y -= 20;
    }

    ctx.strokeStyle = v ? "blue" : "red";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(_teeth.upper_teeth.x, y);
    _teeth.forEach((_tooth) => {
      let width = settings.width*(_tooth.body==2 ? 1.3 : 1);
      ctx.lineTo(_tooth.x, y);
      ctx.lineTo(_tooth.x+width/2, y-height);
      ctx.lineTo(_tooth.x+width+settings.tooth_spacing/2, y);
    });
    ctx.stroke();
  }
  inc_PF(c, v){  // 5.3.33  Prótesis fija
    /* This function must be called by the last tooth of teeths
      otherwise another incident may overdraw this draw
    */
    let direction = ["1", "2", "5", "6"].includes(String(this.key)[0]);
    let _teeth = [];
    if(direction) _teeth = teeth.upper_teeth;
    else if(!direction) _teeth = teeth.lower_teeth;
    let start_index = _teeth.length-v.amount;
    let y = this.y - 25;
    let height = 15;
    if(this.orientation=='D'){
      height *= -1;
    }

    ctx.strokeStyle = v.state ? "blue" : "red";
    ctx.lineWidth = 4;
    ctx.beginPath();
    // Left corner
    ctx.moveTo(_teeth[start_index].x, y+height);
    let width = settings.width*(_teeth[start_index].body==2 ? 1.3 : 1);
    ctx.lineTo(_teeth[start_index].x, y);
    ctx.lineTo(_teeth[start_index].x+width+settings.tooth_spacing/2, y);
    // Right corner
    ctx.lineTo(this.x+width+settings.tooth_spacing/2, y);
    ctx.lineTo(this.x+width+settings.tooth_spacing/2, y+height);
    ctx.stroke();
  }
  inc_PR(c, v){  // 5.3.34  Prótesis removible
    /* This function must be called by the last tooth of the affected teeth */
    let direction = ["1", "2", "5", "6"].includes(String(this.key)[0]);
    let _teeth = [];
    if(direction) _teeth = teeth.upper_teeth;
    else if(!direction) _teeth = teeth.lower_teeth;
    let start_index = _teeth.length-v.amount;
    let y = this.y - 25;
    let height = 5;
    if(this.orientation=='D'){
      height *= -1;
    }

    ctx.strokeStyle = v.state ? "blue" : "red";
    ctx.lineWidth = 3;
    ctx.beginPath();
    let width = settings.width*(_teeth[start_index].body==2 ? 1.3 : 1);
    // Outter line
    ctx.moveTo(_teeth[start_index].x, y);
    ctx.lineTo(_teeth[start_index].x+width+settings.tooth_spacing/2, y);
    ctx.lineTo(this.x+width+settings.tooth_spacing/2, y);
    // Inner line
    ctx.moveTo(_teeth[start_index].x, y+height);
    ctx.lineTo(_teeth[start_index].x+width+settings.tooth_spacing/2, y+height);
    ctx.lineTo(this.x+width+settings.tooth_spacing/2, y+height);
    ctx.stroke();
  }
  inc_PT(c, v){  // 5.3.35  Prótesis total
    /* This function must be called by the last tooth of the affected teeth */
    let direction = ["1", "2", "5", "6"].includes(String(this.key)[0]);
    let _teeth = [];
    if(direction) _teeth = teeth.upper_teeth;
    else if(!direction) _teeth = teeth.lower_teeth;
    let start_index = 0;
    let y = this.y - 25;
    let height = 5;
    if(this.orientation=='D'){
      height *= -1;
    }

    ctx.strokeStyle = v.state ? "blue" : "red";
    ctx.lineWidth = 3;
    ctx.beginPath();
    let width = settings.width*(_teeth[start_index].body==2 ? 1.3 : 1);
    // Outter line
    ctx.moveTo(_teeth[start_index].x, y);
    ctx.lineTo(_teeth[start_index].x+width+settings.tooth_spacing/2, y);
    ctx.lineTo(this.x+width+settings.tooth_spacing/2, y);
    // Inner line
    ctx.moveTo(_teeth[start_index].x, y+height);
    ctx.lineTo(_teeth[start_index].x+width+settings.tooth_spacing/2, y+height);
    ctx.lineTo(this.x+width+settings.tooth_spacing/2, y+height);
    ctx.stroke();
  }
  inc_TP(c, v){  // 5.3.36  Tratamiento pulpar
    let y = this.y;
    let width = settings.width*(this.body==2 ? 1.3 : 1);
    let height = settings.height;
    let sign = 1;
    if(this.orientation=='D'){
      height *= -1;
      y -= settings.data_space+settings.data_height+height;
      sign = -1;
    }

    ctx.strokeStyle = "blue";
    // Draw vertical line
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(this.x+width/2, y);
    ctx.lineTo(this.x+width/2, y+height/2+sign*settings.root_height/2);
    ctx.stroke();
    // Draw square
    ctx.fillStyle = "blue";
    ctx.beginPath();
    if(this.body==2){
      if(v.log==3) ctx.fill(this.tooth_center);
      else ctx.stroke(this.tooth_center);
    }else{
      let long = 12
      ctx.rect(this.x+width/2-long/2, y+height/2+sign*settings.root_height/2-long/2, long, long);
      if(v.log==3) ctx.fill();
      else ctx.stroke();
    }

    let txt;
    switch(v.log){
      case 1: txt = "TC"; break;
      case 2: txt = "PC"; break;
      case 3: txt = "PP"; break;
    }
    return {log: txt, color: v.state?"blue":"red"};
  }
  inc_Transposicion(c, v){  // 5.3.37  Transposición
    let y = this.y + settings.height + (this.body==2 ? 10 : 9);
    let width = this.body==2 ? settings.width*1.3/2 : settings.width/2;
    let x = this.x + width - (v=='R' ? this.body==2 ? -18 : -14 : this.body==2 ? 19 : 15);
    let angel_o = this.body==2 ? 65 : 70;
    let angel_f = this.body==2 ? 115 : 110;
    let _sign = v=='R' ? 1 : -1;
    let rad_y = this.body==2 ? 180 : 300;
    let rad_x = this.body==2 ? 50 : 50;
    let cy = this.y;
    let _sign_y = 1;
    if(this.orientation=='D'){
      y -= settings.data_space + settings.data_height + settings.height + 19;
      cy -= settings.data_space + (this.body==2 ? 6 : 3);
      cy += rad_y*(this.body==2 ? 17/24 : 39/48);  // Fix cy by angle
      angel_o += 180;
      angel_f += 180;
      ctx.strokeStyle = "blue";
    }else if(this.orientation=='U'){
      ctx.strokeStyle = "green";
      cy += settings.root_height;
      cy -= rad_y*(this.body==2 ? 33/48 : 39/48);  // Fix cy by angle
      _sign_y *= -1;
    }
    let cx = this.x;
    if(v=='R'){
      cx += settings.width/(this.body==2?2:3);
      x += settings.width/(this.body==2?2:3) + 2;
    }else if(v=='L'){
      cx -= settings.width/(this.body==2?2:3);
      x -= settings.width/(this.body==2?2:3) + 1;
    }

    ctx.lineWidth = 3;
    // ctx.strokeStyle = "blue";
    ctx.beginPath();
    ctx.ellipse(cx+width, cy, rad_x, rad_y, 0, angel_o*Math.PI/180, angel_f*Math.PI/180);
    if(v=='R') ctx.moveTo(x+2, y+_sign_y*2);
    if(v=='L') ctx.moveTo(x-2, y+_sign_y*2);
    if(this.body==2) ctx.lineTo(x-10*_sign, y-_sign_y*6);
    else ctx.lineTo(x-6*_sign, y-_sign_y*3);
    ctx.moveTo(x, y+_sign_y*2);
    if(this.body==2) ctx.lineTo(x+6*_sign, y-_sign_y*8);
    else ctx.lineTo(x+4*_sign, y-_sign_y*6);
    ctx.stroke();
  }
}
class Molar extends Tooth {
  constructor(x, y, key, orientation, root, incidents){
    // body: 2
    super(x, y, key, orientation, 2, incidents);
    this._root = root;
    this.genRoot();
  }
  molarBase(){
    let x = this.x;
    let y = this.y;
    let data_height = settings.data_height;
    let data_space = settings.data_space;
    y = this.orientation=='U' ? y+settings.root_height : y-(data_space+data_height);
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
    if(this.orientation=='D'){
      y = y-(data_space + data_height)+settings.height;  // Fix pixel
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
      ctx.stroke(i);
    });
  }
  draw(){
    ctx.strokeStyle = settings.strokeColor;
    this.strokeBold(this.tooth);
    this.strokeBold(this.tooth_top);
    this.strokeBold(this.tooth_bottom);
    this.strokeBold(this.tooth_left);
    this.strokeBold(this.tooth_right);
    this.drawRoot();
    this.molarBase();

    ctx.stroke(this.data_area);
    this.drawKey();
  }
}
class Premolar extends Tooth {
  constructor(x, y, key, orientation, root, incidents){
    // body: 2
    super(x, y, key, orientation, 2, incidents);
    this._root = root;
    this.genRoot();
  }
  premolarBase(){
    let x = this.x;
    let y = this.y+settings.root_height;  // Y coordinate of tooth
    let width = settings.width*1.3;
    let height = settings.height-settings.root_height;
    if(this.orientation=='D'){
      y = y+settings.height-(settings.data_space+settings.data_height+settings.root_height*2);  // Fix pixel
      height *= -1;
    }

    // horizontal line
    ctx.beginPath();
    ctx.moveTo(x+width/4, y+height/2);
    ctx.lineTo(x+width*3/4, y+height/2);
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.lineWidth = 1;
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
    if(this.orientation=='D'){
      y = y-(data_space + data_height)+settings.height;  // Fix pixel
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
      ctx.stroke(i);
    });
  }
  draw(){
    ctx.strokeStyle = settings.strokeColor;
    this.strokeBold(this.tooth);
    this.strokeBold(this.tooth_top);
    this.strokeBold(this.tooth_bottom);
    this.strokeBold(this.tooth_left);
    this.strokeBold(this.tooth_right);
    this.drawRoot();
    this.premolarBase();

    ctx.stroke(this.data_area);
    this.drawKey();
  }
}
class Canine extends Tooth {
  constructor(x, y, key, orientation, root, incidents){
    // body: 2
    super(x, y, key, orientation, 2, incidents);
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
    if(this.orientation=='D'){
      y = y-(data_space + data_height)+settings.height;  // Fix pixel
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
      ctx.stroke(i);
    });
  }
  draw(){
    ctx.strokeStyle = settings.strokeColor;
    this.strokeBold(this.tooth);
    this.strokeBold(this.tooth_top);
    this.strokeBold(this.tooth_bottom);
    this.strokeBold(this.tooth_left);
    this.strokeBold(this.tooth_right);
    this.drawRoot();

    ctx.stroke(this.data_area);
    this.drawKey();
  }
}
class Incisor extends Tooth {
  constructor(x, y, key, orientation, incidents){
    // body: 1
    super(x, y, key, orientation, 1, incidents);
    this.drawRoot();
  }
  drawRoot(){
    let x = this.x;
    let y = this.y;
    let width = settings.width;
    let height = settings.root_height;
    let data_height = settings.data_height;
    let data_space = settings.data_space;
    if(this.orientation=='D'){
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
  draw(){
    ctx.strokeStyle = settings.strokeColor;
    this.strokeBold(this.tooth);
    this.strokeBold(this.tooth_top);
    this.strokeBold(this.tooth_bottom);
    this.strokeBold(this.tooth_left);
    this.strokeBold(this.tooth_right);
    ctx.stroke(this.root[0]);

    ctx.stroke(this.data_area);
    this.drawKey();
  }
}

function Odontograma(props){
  let cita = props.data.cita;
  // Odontogram data
  let build_data = {
    build_adult_top: [
      {key: 18, orientation: 'U', type: 0, root: 3, incidents: [{component: [53, 54, 13], type: 1, value:3}]},
      {key: 17, orientation: 'U', type: 0, root: 3, incidents: [{component: [511, 512, 521, 522, 531, 553, 554, 542], type: 3, value:true}]},
      {key: 16, orientation: 'U', type: 0, root: 3, incidents: [{type: 4, value:{xo: 2, yo: 22, xf: 26, yf: 58}}]},
      {key: 15, orientation: 'U', type: 1, root: 1, incidents: [{type: 6}]},
      {key: 14, orientation: 'U', type: 2, root: 2, incidents: [{type: 7}]},
      {key: 13, orientation: 'U', type: 3, incidents: [{component: [12, 14], type: 8, value: {log: 2, state: true}}]},
      {key: 12, orientation: 'U', type: 3, incidents: [{component: [10, 20, 111, 113, 115], type: 9}]},
      {key: 11, orientation: 'U', type: 3, incidents: [{type: 11, value: true}, {type: 24, component: [112, 114, 115]}]},
      {key: 21, orientation: 'U', type: 3, incidents: [{type: 12}, {type: 36, value: {log: 3, state: false}}]},
      {key: 22, orientation: 'U', type: 3, incidents: [{type: 13}, {type: 29, value: true}]},
      {key: 23, orientation: 'U', type: 3, incidents: [{type: 14, value: 'R'}]},
      {key: 24, orientation: 'U', type: 1, root: 2, incidents: [{type: 15, value: 'R'}, {type: 14, value: 'L'}]},
      {key: 25, orientation: 'U', type: 1, root: 1, incidents: [{type: 16, value: 3}, {type: 16, value: 4}, {type: 22}]},
      {key: 26, orientation: 'U', type: 0, root: 3, incidents: [{type: 17}]},
      {key: 27, orientation: 'U', type: 0, root: 3, incidents: [{type: 21, value: 'R'}]},
      {key: 28, orientation: 'U', type: 0, root: 3, incidents: [{type: 21, value: 'L'}, {type: 33, value: {amount: 4, state: false}}]},
    ],
    build_kid_top: [
      {key: 55, orientation: 'U', type: 0, root: 3, incidents: [{component: 13, type: 2, value: 1}]},
      {key: 54, orientation: 'U', type: 0, root: 3, incidents: [{component: 12, type: 2, value: 1}]},
      {key: 53, orientation: 'U', type: 3, incidents: [{component: 11, type: 2, value: 1}]},
      {key: 52, orientation: 'U', type: 3, incidents: [{component: 11, type: 2, value: 1}]},
      {key: 51, orientation: 'U', type: 3, incidents: [{component: 11, type: 2, value: 1}]},
      {key: 61, orientation: 'U', type: 3, incidents: [{component: 11, type: 2, value: 1}]},
      {key: 62, orientation: 'U', type: 3, incidents: [{component: 11, type: 2, value: 1}]},
      {key: 63, orientation: 'U', type: 3, incidents: [{component: 11, type: 2, value: 1}]},
      {key: 64, orientation: 'U', type: 0, root: 3, incidents: [{component: 11, type: 2, value: 1}]},
      {key: 65, orientation: 'U', type: 0, root: 3, incidents: [{component: 11, type: 2, value: 1}]},
    ],
    build_adult_bottom: [
      {key: 48, orientation: 'D', type: 0, root: 2, incidents: [{type: 23}, {type: 30, value: false}]},
      {key: 47, orientation: 'D', type: 0, root: 2, incidents: [{type: 24, component: [541, 542, 532, 552, 521]}]},
      {key: 46, orientation: 'D', type: 0, root: 2, incidents: [{type: 7}]},
      {key: 45, orientation: 'D', type: 1, root: 1, incidents: [{type: 25}]},
      {key: 44, orientation: 'D', type: 1, root: 1, incidents: [{type: 26, value: 5}]},
      {key: 43, orientation: 'D', type: 3, incidents: [{type: 27}]},
      {key: 42, orientation: 'D', type: 3, incidents: [{type: 28, value: {log: 5, state: true}}]},
      {key: 41, orientation: 'D', type: 3, incidents: [{type: 29, value: true}]},
      {key: 31, orientation: 'D', type: 3, incidents: [{type: 15, value: 'R'}]},
      {key: 32, orientation: 'D', type: 3, incidents: [{type: 37, value: 'R'}]},
      {key: 33, orientation: 'D', type: 3, incidents: [{type: 37, value: 'L'}]},
      {key: 34, orientation: 'D', type: 1, root: 1, incidents: []},
      {key: 35, orientation: 'D', type: 1, root: 1, incidents: [{type: 15, value: 'R'}]},
      {key: 36, orientation: 'D', type: 0, root: 2, incidents: []},
      {key: 37, orientation: 'D', type: 0, root: 2, incidents: [{type: 37, value: 'R'}, {type: 36, value: {log: 3, state: false}}]},
      {key: 38, orientation: 'D', type: 0, root: 2, incidents: [{type: 37, value: 'L'}, {type: 31, value: {amount: 6, state: true}}]},
    ],
    build_kid_bottom: [
      {key: 85, orientation: 'D', type: 0, root: 2, incidents: [{component: 12, type: 2, value: 1}]},
      {key: 84, orientation: 'D', type: 0, root: 2, incidents: [{component: 12, type: 2, value: 1}]},
      {key: 83, orientation: 'D', type: 3, incidents: []},
      {key: 82, orientation: 'D', type: 3, incidents: [{component: 11, type: 2, value: 1}]},
      {key: 81, orientation: 'D', type: 3, incidents: [{component: 11, type: 2, value: 1}]},
      {key: 71, orientation: 'D', type: 3, incidents: [{component: 11, type: 2, value: 1}]},
      {key: 72, orientation: 'D', type: 3, incidents: [{component: 11, type: 2, value: 1}]},
      {key: 73, orientation: 'D', type: 3, incidents: [{component: 11, type: 2, value: 1}]},
      {key: 74, orientation: 'D', type: 0, root: 2, incidents: [{component: 11, type: 2, value: 1}]},
      {key: 75, orientation: 'D', type: 0, root: 2, incidents: [{component: 11, type: 2, value: 1}]},
    ]
  }
  let odontogram_squares = {
    square_top: null,
    square_bottom: null
  }
  // Main variables
  let currentTooth = {tooth: null, path: null};
  let [teethState, setTeeth] = useState(false);  // Tooth data, redraw incidents

  function genTeeth(type='A'){
    // General
    let _left = (
      // Odontogram element width
      ctx.canvas.width-
      // Tooth with plus tooth spacing
      (settings.width+settings.tooth_spacing)*(2+ (type=='A'?16:10))
    )/2;  // Half of the total space left
    let _top = 30;
    let _build_data;
    teeth = [];  // Reset teeth array

    // Upper teeth
    let upper_teeth = [];
    _top += settings.data_height+settings.data_space;
    _build_data = type=='A' ? build_data.build_adult_top : build_data.build_kid_top;
    _build_data.forEach((v)=>{
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
        case 0: a = new Molar(_x, _top, v.key, v.orientation, v.root, v.incidents); break;
        case 1: a = new Premolar(_x, _top, v.key, v.orientation, v.root, v.incidents); break;
        case 2: a = new Canine(_x, _top, v.key, v.orientation, v.root, v.incidents); break;
        case 3: a = new Incisor(_x, _top, v.key, v.orientation, v.incidents); break;
      }
      upper_teeth.push(a);
    });
    teeth.upper_teeth = upper_teeth;
    // Genereate square_top
    odontogram_squares.square_top = new Path2D();
    let _last_tooth = upper_teeth[upper_teeth.length-1];
    odontogram_squares.square_top.moveTo(_left-15, _top-settings.data_space-settings.data_height-32);
    odontogram_squares.square_top.lineTo(_left-15, _top+settings.height+32);
    odontogram_squares.square_top.lineTo(_last_tooth.x+settings.width*(_last_tooth.body==2?1.3:1)+15, _top+settings.height+32);
    odontogram_squares.square_top.lineTo(_last_tooth.x+settings.width*(_last_tooth.body==2?1.3:1)+15, _top-settings.data_space-settings.data_height-32);
    odontogram_squares.square_top.closePath();

    // Lower teeth
    let lower_teeth = [];
    _top *= 3;  // Dependant of canvas
    _build_data = type=='A' ? build_data.build_adult_bottom : build_data.build_kid_bottom;
    _build_data.forEach((v)=>{
      // Calc coordinates
      let _x = _left;
      if(lower_teeth.length){
        let last_tooth = lower_teeth[lower_teeth.length-1];
        _x = last_tooth.x + settings.tooth_spacing;
        _x += last_tooth.body==2 ? settings.width*1.3 : settings.width;
      }

      // Create object with properties
      let a;
      switch(v.type){
        case 0: a = new Molar(_x, _top, v.key, v.orientation, v.root, v.incidents); break;
        case 1: a = new Premolar(_x, _top, v.key, v.orientation, v.root, v.incidents); break;
        case 2: a = new Canine(_x, _top, v.key, v.orientation, v.root, v.incidents); break;
        case 3: a = new Incisor(_x, _top, v.key, v.orientation, v.incidents); break;
      }
      lower_teeth.push(a);
    });
    teeth.lower_teeth = lower_teeth;
    // Genereate square_bottom
    odontogram_squares.square_bottom = new Path2D();
    _last_tooth = lower_teeth[lower_teeth.length-1];
    odontogram_squares.square_bottom.moveTo(_left-15, _top-settings.data_space-settings.data_height-32);
    odontogram_squares.square_bottom.lineTo(_left-15, _top+settings.height+32);
    odontogram_squares.square_bottom.lineTo(_last_tooth.x+settings.width*(_last_tooth.body==2?1.3:1)+15, _top+settings.height+32);
    odontogram_squares.square_bottom.lineTo(_last_tooth.x+settings.width*(_last_tooth.body==2?1.3:1)+15, _top-settings.data_space-settings.data_height-32);
    odontogram_squares.square_bottom.closePath();

    setTeeth(teeth);
  }
  function printTeeth(){
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);  // Clear canvas
    [...teeth.upper_teeth, ...teeth.lower_teeth].forEach((tooth) => {
      tooth.draw();
    });
    drawAllIncidents();
  }
  function mouseInCanvas(e){
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
          if(currentTooth.tooth && e!=currentTooth.tooth) clearTooth();  // Clear tooth

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
          let _noevenone = paths.some((path) => {
            let found = ctx.isPointInPath(path, x, y);  // Is point in tooth area?
            if(found){
              // If it's not the current path (point has moved to other tooth component)
              if(currentTooth.path && path!=currentTooth.path) clearTooth();  // Clear tooth
              currentTooth.tooth = e;  // Save this as current tooth
              ctx.fillStyle = "skyblue";

              // Print tooth part
              ctx.fill(path);
              currentTooth.path = path;

              return true;
            }
            return false;
          });
          if(!_noevenone && currentTooth.tooth) clearTooth();  // Fix draw when no path is pointed

          return true;  // End loop
        }
        return false;  // Continue loop
      });
      if(!noevenone && currentTooth.tooth) clearTooth();  // Fix draw when no tooth is pointer

    }else if(currentTooth.tooth) clearTooth();
  }
  function clearTooth(){
    // Clear tooth
    let margin = 2;

    // Erase all block
    ctx.fillStyle = ctx.canvas.style.background ? ctx.canvas.style.background : "white";
    let _teeth;
    if(teeth.upper_teeth.indexOf(currentTooth.tooth)!==-1){
      _teeth = teeth.upper_teeth;
      ctx.fill(odontogram_squares.square_top);
    }
    if(teeth.lower_teeth.indexOf(currentTooth.tooth)!==-1){
      _teeth = teeth.lower_teeth;
      ctx.fill(odontogram_squares.square_bottom);
    }
    // Re draw all block
    _teeth.forEach((tooth) => {
      tooth.draw();
    });
    // Re draw incidents
    drawAllIncidents(_teeth);

    // Remove current tooth reference
    currentTooth.tooth = null;
    currentTooth.path = null;
  }
  function toothPartClickHandle(){
    if(!currentTooth.tooth) return;
    console.log("currentTooth:", currentTooth);
  }
  function drawAllIncidents(_teeth=false){
    _teeth = _teeth===false ? [...teeth.upper_teeth, ...teeth.lower_teeth] : _teeth;
    _teeth.forEach((tooth) => {
      tooth.drawIncidents();
    });
  }

  // Only run after first render
  useEffect(() => {
    // Elements
    let odontogram_el = document.getElementById('odontogram');
    ctx = odontogram_el.getContext('2d');
    odontogram_el.onmouseenter = ()=>{odontogram_el.onmousemove = (e)=>{mouseInCanvas(e)}}
    odontogram_el.onmouseleave = ()=>{odontogram_el.onmousemove = null}
    odontogram_el.onclick = ()=>{toothPartClickHandle()};
    genTeeth('A');
  }, []);
  // Run after teeth has changed
  useEffect(() => {
    if(!teeth) return;
    printTeeth();  // Draw odontogram
  }, [teethState]);

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
          <label className="btn btn-info waves-effect waves-themed active" onClick={()=>genTeeth('A')}>
            <input type="radio" name="odontogram_type" defaultChecked /> Adulto
          </label>
          <label className="btn btn-info waves-effect waves-themed" onClick={()=>genTeeth('K')}>
            <input type="radio" name="odontogram_type" /> Infante
          </label>
        </div>
      </div>
      <div>
        <div className="odontogram_container">
          <canvas id="odontogram" width="800" height="530"></canvas>
        </div>
      </div>
    </>
  );
}

export default Odontograma;
