sand.define('DOM/toDOM', [
], function(r, module) {
  
  var toDOM = function(obj, scope, force) {
    if (!obj) return null;

    if (obj.nodeName) return obj; // it is already a DOM element

    if (typeof(obj) === 'string') return toDOM({ tag : obj }, scope, force);
    if (obj.length) return toDOM({ tag : obj[0], children : obj[1] }, scope, force); // it is an array, like ['table', [['tr']]], we format the array to a JSON

    // at this point (hopefully :-) we have a formated JSON
    // we parse the implicit declarations ({ tag : '#some-id.some-class.some-other-class' } -> { tag : 'div', attr : { id : 'some-id' ...}})
    var parse = {}, cl;
    if (!obj.tag) parse.tag = 'div'; // defaults to div
    else {
      // we search for innerHTML
      var split  = obj.tag.split(/ /);
      var firstPart = split.shift();
      if (split.length) parse.innerHTML = split.join(' ');

      if (obj.innerHTML) parse.innerHTML = obj.innerHTML;
      
      split = firstPart.split(/\.|#/);

      parse.tag = split.shift() || 'div'; // defaults to div
      if (split.length) {
        parse.attr = obj.attr || {};

        // we search for classes
        var cls = '',
          reg = /\.([^\.$#]*)/g;
        while (cl = reg.exec(firstPart)) cls += cl[1] + ' ';
        if (cls) parse.attr['class'] = cls.slice(0, cls.length - 1);

        // we search for id
        var id = /#([^\.$]*)/.exec(firstPart);
        if (id) parse.attr.id = id[1];
      }
    }

    parse.attr = parse.attr || obj.attr;
    parse.innerHTML = parse.innerHTML || obj.innerHTML;

    // at this point we have an almost explicit format
    var el = document.createElement(parse.tag);
    obj.as = obj.as || obj.label;

    if (parse.attr) for (var attr in parse.attr) el.setAttribute(attr, parse.attr[attr]);
    if (obj.as) scope[obj.as] = el; // we reference the element in the scope
      
    if (!obj.as && scope && (parse.attr && typeof(parse.attr['class']) === 'string') && ((force && (cl = parse.attr['class'].split(' ')[0])) || !scope[cl = parse.attr['class'].split(' ')[0]])) scope[cl] = el; // implicit declaration of label

    if (typeof(parse.innerHTML) !== 'undefined') el.innerHTML = parse.innerHTML;

    if (module && module.require && (module.require('DOM/UA') === 'ipad') && obj.events) {
      var handle = module.require('DOM/handle')(el);
      for (var evt in obj.events) handle.on(evt, obj.events[evt]);
    }
    else if (obj.events) {
      for (var evt in obj.events) el['on' + evt] = obj.events[evt];
    }

    if (obj.style) {
      if (typeof(obj.style) === 'string') el.setAttribute('style', obj.style);
      else for (var style in obj.style) el.style[style] = obj.style[style];
    }

    if (obj.children) for (var k = -1, l = obj.children.length; ++k < l; ) if (cl = toDOM(obj.children[k], scope, force)) el.appendChild(cl);

    return el;
  };

  return toDOM;
    
});