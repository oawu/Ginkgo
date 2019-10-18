
function Timer(time, func) {
  if (!(this instanceof Timer)) return new Timer(time, func);
  
  var arr = [], timer = null, defaultTime = time, stop = func === true;

  this.cancel = function(func) { clearTimeout(timer); typeof func === 'function' && func(); return this; };
  this.delay = function(func, time) {
    return typeof func === 'function' ? arr.push({ time: typeof time === 'number' ? time : defaultTime, func: func }) && this : this; };

  this.run = function(index) {
    typeof index !== 'number' && (index = 0);

    if (typeof arr[index] === 'undefined' || stop) return this;

    var tmp = arr[index];

    if (tmp.time === null)
      timer = setTimeout(function() {
        tmp.func.call(this) !== false ? this.run(index + 1) : this.run(arr.length);
      }.bind(this));
    else
      timer = setTimeout(function() {
        tmp.func.call(this) !== false ? this.run(index + 1) : this.run(arr.length);
      }.bind(this), tmp.time);

    return this;
  };

  this.delay(func, time);
}

Timer.all = {};

Timer.replace = {
  delay: function(key, time, func) {
    Timer.clean(key);
    typeof time === 'function' && (func = time) && (time = null);
    typeof time !== 'number' && (time = null);
    return Timer.all[key] = Timer(time, func).run();
  },
  animate: function(key, time) {
    Timer.clean(key);
    return Timer.all[key] = Timer(time);
  }
};

Timer.only = {
  delay: function(key, time, func) {
    if (Timer.has(key)) return true;
    typeof time === 'function' && (func = time) && (time = null);
    return Timer.all[key] = Timer(time, func).run();
  },
  animate: function(key, time) {
    return Timer.all[key] = Timer(time, Timer.has(key));
  }
}

Timer.has = function(key) {
  return typeof Timer.all[key] !== 'undefined' && Timer.all[key] instanceof Timer;
};

Timer.clean = function(key) {
  if (!Timer.has(key)) return true;

  Timer.all[key].cancel(function() {
    Timer.all[key] = null;
    delete Timer.all[key];
  });

  return !Timer.has(key);
};
Timer.cleanAll = function() {
  for (i in Timer.all)
    Timer.clean(i);
};

Timer.replace.animate('aa')
     .delay(function() { console.error('1'); })
     .delay(function() { console.error('2'); }, 500)
     .delay(function() { console.error('3'); return false; })
     .delay(function() { console.error('4'); })
     .run();

Timer.replace.animate('aa')
     .delay(function() { console.error('a-1'); })
     .delay(function() { console.error('a-2'); }, 500)
     .delay(function() { console.error('a-3'); return false; })
     .delay(function() { console.error('a-4'); })
     .run();
Timer.cleanAll();
// setTimeout(function() {
//   Timer.clean('aa');
//   console.error('stop');
// }, 1000)


// A-222
// B-111
// Timer.replace.delay ('aa', 2000, function(timer) {
//   console.error('A-111');
// })
// Timer.replace.delay ('aa', 1000, function() {
//   console.error('A-222');
// })

// Timer.only.delay ('bb', 2000, function(timer) {
//   console.error('B-111');
  
// })
// Timer.only.delay ('bb', 1000, function() {
//   console.error('B-222');
// })

// Timer.replace.delay ('aa', function(timer) {
//   console.error('A-111');
// })
// Timer.replace.delay ('aa', function() {
//   console.error('A-222');
// })

// Timer.only.delay ('bb', function(timer) {
//   console.error('B-111');
  
// })
// Timer.only.delay ('bb', function() {
//   console.error('B-222');
// })

