/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */
_gInited = false;
_mKeys = ['AIzaSyBF02Xytwx2peyWWpiUwkQDgng_FYmnBaA'];
_mInited = false;
_mDefaultPosition = [23.568799919847155, 120.30368325706013];
_mMap = false;
_mPathA = null;
_markers = [];

function genLatLng(t) { return new google.maps.LatLng(t[0][0], t[0][1]); }
function googleInit() { if (_gInited) return; else _gInited = true; $(window).bind('gm', googleMapsCallback); var key = _mKeys[Math.floor((Math.random() * _mKeys.length))]; $.getScript('https://maps.googleapis.com/maps/api/js?' + (key ? 'key=' + key + '&' : '') + 'language=zh-TW&libraries=visualization&callback=gmc', googleMapsCallback); return true; }
function googleMapsCallback() { if (_mInited) return; else _mInited = true; _mDefaultPosition = genLatLng([_mDefaultPosition]); _mFunc && _mFunc(); }
function OAM(t) { this._div=null, this._option=Object.assign({className:"",top:0,left:0,width:32,height:32,html:"",map:null,position:null,css:{}},t),this._option.map&&this.setMap(this._option.map)}
function iOM() { OAM.prototype=new google.maps.OverlayView,Object.assign(OAM.prototype,{setPoint:function(){ if (!this._div) return; if(!this._option.position) return this._div.style.left="-999px",void(this._div.style.top="-999px"); if (!this.getProjection()) return;var t=this.getProjection().fromLatLngToDivPixel(this._option.position);t&&(this._div.style.left=t.x-this._option.width/2+this._option.left+"px",this._div.style.top=t.y-this._option.height/2+this._option.top+"px")},draw:function(){this.setPoint()},onAdd: function() {for(var t in this._div=document.createElement("div"),this._div.style.position="absolute",this._div.className=this._option.className,this._div.style.width=this._option.width+"px",this._div.style.height=this._option.height+"px",this._div.innerHTML=this._option.html,this._option.css)"width"!=t&&"height"!=t&&"top"!=t&&"left"!=t&&"bottom"!=t&&"right"!=t&&(this._div.style[t]=this._option.css[t]);var i=this;google.maps.event.addDomListener(this._div,"click",function(t){t.stopPropagation&&t.stopPropagation(),google.maps.event.trigger(i,"click")}),this.getPanes().overlayImage.appendChild(this._div)},remove:function(){return this._div&&(this._div.parentNode.removeChild(this._div),this._div=null),this},setHtml:function(t){this._option.html=t;return this._div&&(this._div.innerHTML=this._option.html),this},setPosition:function(t){return this.map&&(this._option.position=t,this.setPoint()),this},getPosition:function(){return this._option.position}})}

window.gmc = function() { $(window).trigger('gm'); };

$(function() {

  function newM(e) {
    var marker = new google.maps.Marker({
      map: _mMap,
      draggable: true,
      position: genLatLng([e])
    });

    marker.addListener('dragend', function(e) {
      path();
    });
    marker.addListener('rightclick', function(e) {
      var i = _markers.indexOf(marker);
      if (i === -1)
        return;
      _markers = _markers.splice(0, i).concat(_markers.splice(i))
      marker.setMap(null);
      path();
    });

    _markers.push(marker);
    path();
  }
  function path() {
    _mPathA.setPath(_markers.map(function(t) {
      return t.position;
    }));
    ;
  }

  _mFunc = function() {
    if (_mMap) return;
    else _mMap = new google.maps.Map($('#map').get(0), { zoom: 16, clickableIcons: false, disableDefaultUI: true, gestureHandling: 'greedy', center: _mDefaultPosition });
    iOM();
    
    _mPathA = new google.maps.Polyline({ map: _mMap, strokeWeight: 5, strokeColor: 'rgba(252, 108, 181, .75)' });

    // _mMap.addListener('idle', function(e) {
    //   console.error(_mMap.center.lat());
    //   console.error(_mMap.center.lng());
      
    // //   newM([e.latLng.lat(), e.latLng.lng()]);
    // // console.error(e.latLng.lat(), e.latLng.lng());
    
    // });

    var u = [{t: '出發', p: [23.563945984925816, 120.30398179936753]}, {t: '副爐家', p: [23.566041878704862, 120.30593175497711]}, {t: '正爐家', p: [23.573073525074694, 120.30147979971616]}, {t: '入廟', p: [23.56775224626597, 120.30464347984525]}];
    for (var i = 0; i < u.length; i++)
      new OAM({ map: _mMap, position: genLatLng([u[i].p]), width: 10, height: 10, className: 'aaa', html: "<div><div>" + u[i].t + "</div></div>" });

    var t = [[23.56395705191745, 120.30392775067071], [23.564538498035276, 120.30404576786736], [23.564366400086712, 120.30491806378575], [23.565513440513673, 120.30514080824821], [23.56527629865777, 120.3065146327159], [23.565779645190936, 120.30656559468719], [23.565873068814508, 120.30595136882278], [23.56600091156007, 120.30590040685149], [23.566020579663725, 120.3059728264949], [23.565930181937777, 120.30602172028148], [23.565844133903287, 120.30656889092052], [23.566493811123102, 120.30663527211277], [23.567088767723444, 120.30610955914585], [23.567287905487717, 120.30545778235523], [23.567592327018698, 120.30554787133588], [23.568300368316685, 120.30601457570447], [23.56886827368262, 120.30512676452054], [23.56953875547732, 120.30411566091584], [23.570050111441592, 120.30324126077699], [23.57081740411194, 120.30355254019685], [23.571193542290203, 120.3026244958777], [23.572118857287204, 120.30306620231602], [23.5726695323262, 120.30327005020115], [23.573775802407358, 120.30286235443089], [23.573485714709832, 120.30186457267735], [23.573097291196056, 120.30199063650105], [23.573116958237033, 120.30152929655048], [23.57305058196195, 120.30152661434147], [23.573028456529464, 120.30200941196415], [23.572728533632464, 120.30213011136982], [23.57298420565331, 120.30302060476276], [23.57265232360688, 120.3031520330045], [23.572172936947858, 120.30295354953739], [23.57117700486049, 120.30248952737782], [23.571086043427563, 120.30251366725895], [23.568697419029412, 120.30138365053426], [23.5683827354306, 120.30242434763204], [23.56810516596381, 120.30234803438168], [23.56652681632904, 120.30207444906216], [23.56571995999771, 120.30194732214818], [23.56563145330549, 120.30186685587773], [23.565016821853433, 120.30173810984502], [23.564564451267508, 120.30398043658147], [23.564636602976474, 120.30404033619504], [23.566196207125525, 120.30433488830886], [23.567152563834288, 120.30448240980468], [23.567720474163085, 120.30464066013656]];
    // for (var i = 0; i < t.length; i++)
      // newM(t[i]);

    _mPathA.setPath(t.map(function(i) { return genLatLng([i]); }));
  };
  googleInit();  
  $('#btn').click(function() {
    console.error(_markers.map(function(t) {
      return '[' + t.position.lat() + ', ' + t.position.lng() + ']';
    }).join(', '));
  });
});