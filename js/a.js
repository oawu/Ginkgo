var a = [
  {key: 'id', name: 'id', type: 'Number'},
  {key: 'name', name: 'name', type: 'String'},

  {key: 'user', name: 'user', type: 'Object'},
  {key: 'user.id', name: 'user.id', type: 'Number'},
  {key: 'user.name', name: 'user.name', type: 'String'},
  {key: 'user.avatar.ori', name: 'user.avatar.ori', type: 'URL'},
  {key: 'user.avatar.w100', name: 'user.avatar.w100', type: 'URL'},
  {key: 'user.avatar', name: 'user.avatar', type: 'Object'},

  {key: 'user.sex', name: 'user.sex', type: 'String'},
];
var x = {
  id:   {leave: 'id', name: 'id', type: 'Number', branchs: {}},
  name: {leave: 'name', name: 'name', type: 'String', branchs: {}},
  user: {leave: 'user', name: 'user', type: 'Object', branchs: {
    id: {leave: 'id', name: 'user.id', type: 'Number', branchs: {}},
    name: {leave: 'name', name: 'user.name', type: 'String', branchs: {}},
    avatar: {leave: 'avatar', name: 'user.avatar', type: 'Object', branchs: {
      ori: {leave: 'ori', name: 'user.avatar.ori', type: 'URL', branchs: {}},
      w100: {leave: 'w100', name: 'user.avatar.w100', type: 'URL', branchs: {}},
    }},
    sex: {leave: 'sex', name: 'user.sex', type: 'String', branchs: {}},
  }},
};

a = a.map(function(a) {
  a.key = a.key.split('.');
  return a;
});

var max = Math.max.apply(null, a.map(function(a) {
  return a.key.length
}));

function tree(datas) {
  var tmp = {};

  for (var i = 0; i < max; i++) {
    for (var j = 0; j < datas.length; j++) {
      if (datas[j].key.length != i + 1)
        continue;

      if (typeof datas[j].key[i] === 'undefined')
        continue;

      var branchs = tmp;

      for (var k = 0; k < i; k++)
        if (typeof branchs[datas[j].key[k]] !== 'undefined')
          branchs = branchs[datas[j].key[k]].branchs;
        else {
          j = datas.length;
          branchs = null
          break;
        }

      if (branchs)
        branchs[datas[j].key[i]] = {leave: datas[j].key[i], name: datas[j].name, type: datas[j].type, branchs: {}};
    }
  }

  return tmp;
}

console.error(tree(a));


// for (var i in a) {
//   if (a[i].key.length == 1)
//     if (typeof tmp[a[i].key[0]] === 'undefined') {
//       tmp[a[i].key[0]] = {
//         leave: { key: a[i].key[0], name: a[i].name, type: a[i].type},
//         branchs: []
//       };
//       a[i] = null;
//     }
// }
// a = a.filter(function(a) { return a !== null; });
// console.error(tmp, a);


