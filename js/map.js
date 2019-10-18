/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */
 
var _mKeys = ['AIzaSyBF02Xytwx2peyWWpiUwkQDgng_FYmnBaA'];
var _mDefaultPosition = { lat: 23.77133806905457, lng: 120.70937982351438 };
var _gInited = false;
var _mInited = false;
var _mFunc = null;
var _mMap = null;

window.gmc = function() { $(window).trigger('gm'); };

function OAM(t) { this._div=null, this._option=Object.assign({className:"",top:0,left:0,width:32,height:32,html:"",map:null,position:null,css:{}},t),this._option.map&&this.setMap(this._option.map)}
function iOM() { OAM.prototype=new google.maps.OverlayView,Object.assign(OAM.prototype,{setPoint:function(){ if (!this._div) return; if(!this._option.position) return this._div.style.left="-999px",void(this._div.style.top="-999px"); if (!this.getProjection()) return;var t=this.getProjection().fromLatLngToDivPixel(this._option.position);t&&(this._div.style.left=t.x-this._option.width/2+this._option.left+"px",this._div.style.top=t.y-this._option.height/2+this._option.top+"px")},draw:function(){this.setPoint()},onAdd: function() {for(var t in this._div=document.createElement("div"),this._div.style.position="absolute",this._div.className=this._option.className,this._div.style.width=this._option.width+"px",this._div.style.height=this._option.height+"px",this._div.innerHTML=this._option.html,this._option.css)"width"!=t&&"height"!=t&&"top"!=t&&"left"!=t&&"bottom"!=t&&"right"!=t&&(this._div.style[t]=this._option.css[t]);var i=this;google.maps.event.addDomListener(this._div,"click",function(t){t.stopPropagation&&t.stopPropagation(),google.maps.event.trigger(i,"click")}),this.getPanes().overlayImage.appendChild(this._div)},remove:function(){return this._div&&(this._div.parentNode.removeChild(this._div),this._div=null),this},setHtml:function(t){this._option.html=t;return this._div&&(this._div.innerHTML=this._option.html),this},getClassName:function(){return this._option.className},setClassName:function(t){this._option.className=t;return this._div&&(this._div.className=this._option.className),this},setPosition:function(t){return this.map&&(this._option.position=t,this.setPoint()),this},getPosition:function(){return this._option.position}})}

function genLatLng(t) { return new google.maps.LatLng(t[0].lat, t[0].lng); }
function googleMapsCallback() { if (_mInited) return; else _mInited = true; _mDefaultPosition = genLatLng([_mDefaultPosition]); _mFunc && _mFunc(); }
function googleInit() { if (_gInited) return; else _gInited = true; $(window).bind('gm', googleMapsCallback); var key = _mKeys[Math.floor((Math.random() * _mKeys.length))]; $.getScript('https://maps.googleapis.com/maps/api/js?' + (key ? 'key=' + key + '&' : '') + 'language=zh-TW&libraries=visualization&callback=gmc', googleMapsCallback); return true; }

$(function() {
  var $body = $('body');
  var $map = $('#map');

  function el(e, a, t, h) {if (!(this instanceof el)) return h ? new el(e, a, t).toHTML() : new el(e, a, t).toString();
    if (!e || typeof e !== 'string') { t = a; a = e; e = 'component'; }

    a = Array.isArray(a) ? a.map(function(b) {
      b = [b.substr(0, (b.indexOf('='))), b.substr((b.indexOf('=')) + 1)].map(function(c) { return c.trim(); }).filter(function(c) { return c.length; })
      var k = b.slice(0, 1).join('='), v = b.slice(1).join('='); if (!(k && v)) return null;

      k = k == '@if' ? 'v-if' : k;
      k = k == '@for' ? 'v-for' : k;
      k = k == '@on' ? 'v-on' : k;
      k = k == '@bind' ? 'v-bind' : k;
      k = k == '@html' ? 'v-html' : k;
      k = k == '@text' ? 'v-text' : k;
      k = k == '@model' ? 'v-model.trim' : k;
      k = k == '@focus' ? 'v-on:focus' : k;
      k = k == '@click' ? 'v-on:click' : k;
      k = k[0] == '@' ? ':' + k.substr(1) : k

      return k + '="' + v.replace(/"/g, "'") + '"';
    }).filter(function(b) { return b; }).join(' ') : '';

    t = Array.isArray(t) ? t.join('') : t;
    t = typeof t === 'string' ? t : '';

    this.toString = function() {
      return 'area,base,br,col,command,embed,hr,img,input,keygen,link,meta,param,source,track,wbr'.split(/,/).indexOf(e) != -1
        ? '<' + e + (a && ' ' + a) + ' />'
        : '<' + e + (a && ' ' + a) + '>' + t + '</' + e + '>'
    };
    this.toHTML = function() {
      var el = document.createElement('template');
      el.innerHTML = this;
      el = el.content.firstChild;
      document.body.appendChild(el);
      return el;
    };
  }


  _mFunc = function() {
      iOM();
    // if (_mMap) return;
    // else _mMap = new google.maps.Map($map.get(0), { zoom: 10, clickableIcons: false, disableDefaultUI: true, gestureHandling: 'greedy', center: _mDefaultPosition }); iOM();
    // _mMap.mapTypes.set('ms', new google.maps.StyledMapType([{stylers: [{gamma: 0}, {weight: 0.75}] }, {featureType: 'all', stylers: [{ visibility: 'on' }]}, {featureType: 'administrative', stylers: [{ visibility: 'on' }]}, {featureType: 'landscape', stylers: [{ visibility: 'on' }]}, {featureType: 'poi', stylers: [{ visibility: 'on' }]}, {featureType: 'road', stylers: [{ visibility: 'simplified' }]}, {featureType: 'road.arterial', stylers: [{ visibility: 'on' }]}, {featureType: 'transit', stylers: [{ visibility: 'on' }]}, {featureType: 'water', stylers: [{ color: '#b3d1ff', visibility: 'on' }]}, {elementType: "labels.icon", stylers:[{ visibility: 'off' }]}]));
    // _mMap.setMapTypeId('ms');
// // app

//     Vue.component('map', {
//       props: {
//         map: Map,
//       },
//       // watch: {
//       //   // 'map.map': function() {
//       //   //   // var map = this.map.map;
//       //   //   // this.map.markers.forEach(function(marker) { marker.marker.setMap(map); });
//       //   //   // _mMap.mapTypes.set('ms', new google.maps.StyledMapType([{stylers: [{gamma: 0}, {weight: 0.75}] }, {featureType: 'all', stylers: [{ visibility: 'on' }]}, {featureType: 'administrative', stylers: [{ visibility: 'on' }]}, {featureType: 'landscape', stylers: [{ visibility: 'on' }]}, {featureType: 'poi', stylers: [{ visibility: 'on' }]}, {featureType: 'road', stylers: [{ visibility: 'simplified' }]}, {featureType: 'road.arterial', stylers: [{ visibility: 'on' }]}, {featureType: 'transit', stylers: [{ visibility: 'on' }]}, {featureType: 'water', stylers: [{ color: '#b3d1ff', visibility: 'on' }]}, {elementType: "labels.icon", stylers:[{ visibility: 'off' }]}]));
//       //   //   // _mMap.setMapTypeId('ms');
//       //   // }
//       // },
//       mounted: function() {
//         this.map.map = new google.maps.Map(this.$el, { zoom: 10, clickableIcons: false, disableDefaultUI: true, gestureHandling: 'greedy', center: _mDefaultPosition });
        
//         // var marker = new google.maps.Marker({
//         //   position: _mDefaultPosition,
//         // });
//         //   marker.map = this.map.map


//         // console.error(marker);
        
//       },
//       template: el('div', ['id=map'],
//         el([
//           '@for=(marker, i) in map.markers',
//           '@key=i',
//           '@is=marker.component',
//           '@map=map',
//           '@marker=marker'])),
//     });

//     Vue.component('marker', {
//       props: {
//         map: Map,
//         marker: Marker,
//       },
//       watch: {
//         'marker.lat': function(a) {
//           console.error(a);
//           this.marker.updatePosioion()
//         },
//         'marker.lng': function() {
//           this.marker.updatePosioion()
//         },
//         'map.map': function() {
//           this.marker.addMap(this.map.map)
//         },
//       },
//       mounted: function() {

//         // this.marker.marker.setMap(this.map.map);
//         // _mMap = new google.maps.Map(this.$el, { zoom: 10, clickableIcons: false, disableDefaultUI: true, gestureHandling: 'greedy', center: _mDefaultPosition });
//       },
//       template: el('div', ['class=marker']),
//     });

//     function Marker(lat, lng) { if (!(this instanceof Marker)) return new Marker(lat, lng)
//       this.lat = lat,
//       this.lng = lng,

//       this.component = Vue.component('marker');
//       this.addMap = function(map) {
//         this.marker.setMap(map);
//       }
//       this.updatePosioion = function() {
//         this.marker.setPosition(new google.maps.LatLng(this.lat, this.lng))
//       };
//       this.marker = new google.maps.Marker({
//         position: new google.maps.LatLng(this.lat, this.lng),
//       });
//     }
      // var a = Marker(23.77133806905457, 120.70937982351438);
      // setTimeout(function() {
      //   a.lat = 23.74;
      // }, 1000)
      // this.markers = [a, Marker(23.76133806905457, 120.71937982351438)]
      



    Vue.component('marker', {
      props: {
        map: Map,
        marker: Marker,
      },
      mounted: function() {
        this.map.gMap && this.marker.setGMap(this.map.gMap);
      },
      updated: function() {
        console.error('1');
        
      },
      watch: {
        'marker.lat': function(a) {
          console.error(a);
          // this.marker.updatePosioion()
        },
        'marker.lng': function(a) {
          console.error(a);
          // this.marker.updatePosioion()
        },
        // 'map.map': function() {
        //   this.marker.addMap(this.map.map)
        // },
      },
      // mounted: function() {
        // this.marker.gMap = this.map.gMap;

//         // this.marker.marker.setMap(this.map.map);
//         // _mMap = new google.maps.Map(this.$el, { zoom: 10, clickableIcons: false, disableDefaultUI: true, gestureHandling: 'greedy', center: _mDefaultPosition });
      // },
      template: el('div'),
    });

    Vue.component('map', {
      props: { map: Map },
      watch: {
        'map.markers': function() {
          console.error('1');
          
      //   //   // var map = this.map.map;
      //   //   // this.map.markers.forEach(function(marker) { marker.marker.setMap(map); });
      //   //   // _mMap.mapTypes.set('ms', new google.maps.StyledMapType([{stylers: [{gamma: 0}, {weight: 0.75}] }, {featureType: 'all', stylers: [{ visibility: 'on' }]}, {featureType: 'administrative', stylers: [{ visibility: 'on' }]}, {featureType: 'landscape', stylers: [{ visibility: 'on' }]}, {featureType: 'poi', stylers: [{ visibility: 'on' }]}, {featureType: 'road', stylers: [{ visibility: 'simplified' }]}, {featureType: 'road.arterial', stylers: [{ visibility: 'on' }]}, {featureType: 'transit', stylers: [{ visibility: 'on' }]}, {featureType: 'water', stylers: [{ color: '#b3d1ff', visibility: 'on' }]}, {elementType: "labels.icon", stylers:[{ visibility: 'off' }]}]));
      //   //   // _mMap.setMapTypeId('ms');
        }
      },
      mounted: function() {
        this.map.setGMap(new google.maps.Map(this.$el, { zoom: 10, clickableIcons: false, disableDefaultUI: true, gestureHandling: 'greedy', center: _mDefaultPosition }));
        
        // var marker = new google.maps.Marker({
        //   position: _mDefaultPosition,
        // });
        //   marker.map = this.map.map


        // console.error(marker);
        
      },
      template: el('div', ['id=map'],
        el([
          '@for=(marker, i) in map.markers',
          '@key=i',
          '@is=marker.component',
          '@map=map',
          '@marker=marker'])),
    });

    function Marker(lat, lng, option) { if (!(this instanceof Marker)) return new Marker(lat, lng, option)
      this.component = Vue.component('marker');
      this.lat = lat;
      this.lng = lng;
      // this.gMap = null;
      this.gMarker = new google.maps.Marker({
        ...option,
        position: new google.maps.LatLng(this.lat, this.lng),
      });

      // {
        // map: _mMap,
        // position: genLatLng(data),
        // width: 24,
        // height: 24,
        // className: 'stopMarker',
        // html: ("<div cnt='" + data.length + "'>" + '<span data-title="停留了 ' + TimeTool.elapsed(data[0].elapsed) + '"></span>' + "</div>")
      // }
      // );

      // this.gMarker.setMap(this.gMap)
      
      this.setGMap = function(gMap) {
        this.gMarker.setMap(gMap instanceof google.maps.Map ? gMap : null);
      }
    }

    function Map(lat, lng) { if (!(this instanceof Map)) return new Map(lat, lng)
      this.component = Vue.component('map');

      this.markers = [Marker(23.77133806905457, 120.70937982351438, {
        width: 24,
        height: 24,
        className: 'aa',
      })];

      this.gMap = null;

      this.setGMap = function(gMap) {
        gMap instanceof google.maps.Map && (this.gMap = gMap);
        this.gMap && this.markers.forEach(function(marker) { marker.setGMap(this); }.bind(this.gMap));
      }

      setTimeout(function() {
        // this.markers.push(Marker(23.7, 120.70937982351438, {
        //   width: 24,
        //   height: 24,
        //   className: 'aa',
        // }))
        
        this.markers[0] = Marker(23.7, 120.70937982351438, {
          width: 24,
          height: 24,
          className: 'aa',
        });

        // this.markers[0].lat = 12

      }.bind(this), 1000);
    }



    var vue = new Vue({
      data: {
        map: Map(23.77133806905457, 120.70937982351438)
      },
      el: '#app',
    });
  };

  googleInit();
});