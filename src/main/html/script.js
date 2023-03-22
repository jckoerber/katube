// ********************
// * AbstractItemList *
// ********************
class AbstractItemList {
 constructor(storageId) {
  this.storageId = storageId;

  this.itemArray = new Array();
  this.itemIndex = 0;
 }

 // toString
 toString() {
  let result = '';

  for (const item of this.itemArray) {
   if (result.length > 0) {
    result += ', ';
   }

   result += '"' + item.name + '"';
  }

  return result;
 }

 // store
 store() {
  if (this.storageId) {
   if (this.itemArray.length > 0) {
    localStorage.setItem(this.storageId, this.toString());
   } else {
    localStorage.removeItem(this.storageId);
   }
  }
 }

 // load
 load() {
  if (this.storageId) {
   let nameItem = localStorage.getItem(this.storageId);

   if (nameItem) {
    let nameArray = JSON.parse('[' + nameItem + ']');

    for (const name of nameArray) {
     this.addItem(name);
    }
   }
  }
 }

 // clear
 clear() {
  this.itemArray = new Array();
  this.itemIndex = 0;

  this.store();
 }

 // addItem
 addItem(item) {
  this.itemArray.push(item);

  item.index = this.itemIndex;

  this.itemIndex++;

  this.store();

  return item;
 }

 // getItemPosition
 getItemPosition(index) {
  let result = -1;

  for (let position = 0; result == -1 && position < this.itemArray.length; position++) {
   if (this.itemArray[position].index === index) {
    result = position;
   }
  }

  return result;
 }

 // getItem
 getItem(index) {
  let result = undefined;

  let position = this.getItemPosition(index);

  if (position != -1) {
   result = this.itemArray[position];
  }

  return result;
 }

 // moveItem
 moveItem(index, move, relative) {
  let result = move;

  let position = this.getItemPosition(index);

  if (relative) {
   result += position;
  }

  result %= this.itemArray.length;

  if (result < 0) {
   result += this.itemArray.length;
  }

  if (result != position) {
   let item = this.itemArray[position];

   while (position > result) {
    this.itemArray[position] = this.itemArray[position - 1];

    position--;
   }

   while (position < result) {
    this.itemArray[position] = this.itemArray[position + 1];

    position++;
   }

   this.itemArray[position] = item;

   this.store();
  }

  return result;
 }

 // removeItem
 removeItem(index) {
  let result = this.getItemPosition(index);

  if (result != -1) {
   this.itemArray.splice(result, 1);

   this.store();
  }

  return result;
 }

 // containsItem
 containsItem(name) {
  let result = false;

  for (let position = 0; !result && position < this.itemArray.length; position++) {
   if (this.itemArray[position].name === name) {
    result = true;
   }
  }

  return result;
 }
}

// ********
// * Play *
// ********
class Play {
 constructor(name) {
  this.name = name;

  this.index = -1;
 }
}

// ************
// * PlayList *
// ************
class PlayList extends AbstractItemList {
 constructor(storageId, name) {
  super(storageId);

  this.name = name;

  this.index = -1;
 }

 // addItem
 addItem(name) {
  return super.addItem(new Play(name));
 }
}

// ****************
// * PlayListList *
// ****************
class PlayListList extends AbstractItemList {
 constructor(storageId, storagePrefix) {
  super(storageId);

  this.storagePrefix = storagePrefix;

  this.load();
 }

 // load
 load() {
  super.load();

  for (const item of this.itemArray) {
   item.load();
  }
 }

 // clear
 clear() {
  for (const item of this.itemArray) {
   item.clear();
  }

  super.clear();
 }

 // addItem
 addItem(name) {
  return super.addItem(new PlayList(this.storagePrefix + name, name));
 }
}

// **********
// * Player *
// **********
class Player {
 constructor() {
  this.playListList = new PlayListList('katube-playListList', 'katube-playList-');
  this.resultPlayList = new PlayList(undefined, undefined);
  this.playList = undefined;
  this.dictionary = undefined;

  this.loadDictionary();
 }

 // escapeName
 escapeName(name) {
  let result = name.split('');

  for (let index = 0; index < result.length; index++) {
   if (' !#$%&()*+-/0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXZ[]abcdefghijklmnopqrstuvwxyz{|}~'.indexOf(result[index]) == -1) {
    result[index] = '?';
   }
  }

  return result.join('');
 }

 // createPlayList
 createPlayList() {
  let name = this.escapeName(document.getElementById('createPlayListInput').value);

  if (!this.playListList.containsItem(name)) {
   this.appendPlayList(this.playListList.addItem(name));
  }
 }

 // listPlayList
 listPlayList() {
  let output = document.getElementById('listPlayListOutput');

  for (const item of this.playListList.itemArray) {
   this.appendPlayList(item);
  }
 }

 // appendPlayList
 appendPlayList(playList) {
  let output = document.getElementById('listPlayListOutput');
  let div = document.createElement('div');

  div.setAttribute('id', 'play-list-' + playList.index);

  div.innerHTML = '';

  div.innerHTML += '<a href="#" onclick="return PLAYER.removePlayList(' + playList.index + ');"><img width="16" src="img/remove.bmp"/></a> ';
  div.innerHTML += '<a href="#" onclick="return PLAYER.movePlayList(' + playList.index + ', 0, false);"><img width="16" src="img/upgrade-2.bmp"/></a> ';
  div.innerHTML += '<a href="#" onclick="return PLAYER.movePlayList(' + playList.index + ', -1, true);"><img width="16" src="img/upgrade-0.bmp"/></a> ';
  div.innerHTML += '<a href="#" onclick="return PLAYER.movePlayList(' + playList.index + ', 1, true);"><img width="16" src="img/downgrade-0.bmp"/></a> ';
  div.innerHTML += '<a href="#" onclick="return PLAYER.movePlayList(' + playList.index + ', -1, false);"><img width="16" src="img/downgrade-2.bmp"/></a> ';
  div.innerHTML += '<a href="#" onclick="return PLAYER.setPlayList(' + playList.index + ');">' + playList.name + '</a>';

  output.appendChild(div);
 }

 // movePlayList
 movePlayList(index, move, relative) {
  let position = this.playListList.getItemPosition(index);
  let newPosition = this.playListList.moveItem(index, move, relative);

  if (newPosition != position) {
   let output = document.getElementById('listPlayListOutput');

   if (newPosition < position) {
    output.insertBefore(output.children[position], output.children[newPosition]);
   } else if (newPosition + 1 < output.children.length) {
    output.insertBefore(output.children[position], output.children[newPosition + 1]);
   } else {
    output.appendChild(output.children[position]);
   }

   // todo - changer le positionnement
  }

  return false;
 }

 // removePlayList
 removePlayList(index) {
  let position = this.playListList.removeItem(index);

  if (position != -1) {
   let output = document.getElementById('listPlayListOutput');

   output.removeChild(output.children[position]);
  }

  return false;
 }

 // setPlayList
 setPlayList(index) {
  this.playList = this.playListList.getItem(index);

  this.listPlay();

  return false;
 }

 // listPlay
 listPlay() {
  let output = document.getElementById('listPlayOutput');

  output.innerHTML = '';

  if (this.playList) {
   let firstVideo = undefined;
   let previousVideo = undefined;
   let position = 0;

   for (const play of this.playList.itemArray) {
    this.insertPlay(play, position);
//    if (!play.name.endsWith('.avi.json') && !play.name.endsWith('.mkv.json')) {
//     if (!firstVideo) {
//      firstVideo = video;
//     }
//
//     if (previousVideo) {
//      previousVideo.onended = function() {
//       video.play();
//      }
//     }

//     previousVideo = video;

     position++;
    }
   }

//   if (previousVideo) {
//     previousVideo.onended = function() {
//      firstVideo.play();
//     }
//   }
//  }
 }

 // insertPlay
 insertPlay(play, position) {
  let output = document.getElementById('listPlayOutput');

  let div = document.createElement('div');
  let table = document.createElement('table');
  let tr = document.createElement('tr');
  let firstTd = document.createElement('td');
  let secondTd = document.createElement('td');
  let video = document.createElement('video');

  div.setAttribute('id', 'play-' + play.index);

  video.setAttribute('id', play.index);
  video.setAttribute('width', '400');
  video.setAttribute('controls', 'true');

  video.volume = 0.1;

  firstTd.appendChild(video);
  tr.appendChild(firstTd);
  tr.appendChild(secondTd);
  table.appendChild(tr);
  div.appendChild(table);
  output.appendChild(div);

  this.loadPlay(play, video, secondTd, this.playList.name, position);
 }

 // addPlay
 addPlay(index, name) {
  let item = this.playListList.getItem(index);

  if (item) {
   let play = item.addItem(name);

   if (this.playList && this.playList.index === index) {
    // todo remove du length
    this.insertPlay(play, this.playList.itemArray.length);
   }
  }

  return false;
 }

 // showAddPlayOutput
 showAddPlayOutput(event, name) {
  var div = document.getElementById('addPlayOutput');

  div.innerHTML = '';

  for (const item of this.playListList.itemArray) {
   if (div.innerHTML.length > 0) {
    div.innerHTML += '<br/>';
   }

   div.innerHTML += '<a href="#" onclick="return PLAYER.addPlay(' + item.index + ', \'' + name + '\');">' + item.name + '</a>';
  }

  div.style.top = event.pageY - 20;
  div.style.left = event.pageX - 20;
  div.style.display = 'block';

  return false;
 }

 // hideAddPlayOutput
 hideAddPlayOutput() {
  var div = document.getElementById('addPlayOutput');

  div.style.display = 'none';
 }

 // removePlay
 removePlay(index) {
  let position = this.playList.removeItem(index);

  if (position != -1) {
   let output = document.getElementById('listPlayOutput');

   output.removeChild(output.children[position]);
  }

  return false;
 }

 // movePlay
 movePlay(index, move, relative) {
  let position = this.playList.getItemPosition(index);
  let newPosition = this.playList.moveItem(index, move, relative);

  if (newPosition != position) {
   let output = document.getElementById('listPlayOutput');

   if (newPosition < position) {
    output.insertBefore(output.children[position], output.children[newPosition]);
   } else if (newPosition + 1 < output.children.length) {
    output.insertBefore(output.children[position], output.children[newPosition + 1]);
   } else {
    output.appendChild(output.children[position]);
   }
  }

  return false;
 }

 // loadPlay
 loadPlay(play, video, text, name, position) {
  let xhr = new XMLHttpRequest();

  xhr.responseType = 'text';

  xhr.open('GET', 'summary/' + play.name);
  xhr.send();
  xhr.onload = function() {
   if (xhr.status != 200) {
    console.log('An error occurred while retrieving link file "' + play.name + '".');
   } else {
    let link = JSON.parse(xhr.response);
    let source = document.createElement('source');

    source.setAttribute('src', 'data' + link.path);
    source.setAttribute('type', link.mimeType);

    video.appendChild(source);

//    if (play.keep) {
//     if (!play.ended) {
//      video.currentTime = play.currentTime;
//     }
//
//     video.volume = play.volume;
//
//     if (!play.paused) {
//      video.play();
//     }
//
//     play.keep = false;
//    }

    text.innerHTML = '<b>' + link.title + '</b>';

    for (const principal of link.principalArray) {
     text.innerHTML += '<br/>' + principal;
    }

    text.innerHTML += '<br/>';
    text.innerHTML += '<br/>';
    text.innerHTML += '<br/>';
    text.innerHTML += '<a href="#" onclick="return PLAYER.showAddPlayOutput(event, \'' + play.name + '\');"><img width="16" src="img/add.bmp"/></a> ';
    text.innerHTML += '<a href="#" onclick="return PLAYER.removePlay(' + play.index + ');"><img width="16" src="img/remove.bmp"/></a> ';
    text.innerHTML += '<a href="#" onclick="return PLAYER.movePlay(' + play.index + ', 0, false);"><img width="16" src="img/upgrade-2.bmp"/></a> ';
    text.innerHTML += '<a href="#" onclick="return PLAYER.movePlay(' + play.index + ', -10, true);"><img width="16" src="img/upgrade-1.bmp"/></a> ';
    text.innerHTML += '<a href="#" onclick="return PLAYER.movePlay(' + play.index + ', -1, true);"><img width="16" src="img/upgrade-0.bmp"/></a> ';
    text.innerHTML += '<a href="#" onclick="return PLAYER.movePlay(' + play.index + ', 1, true);"><img width="16" src="img/downgrade-0.bmp"/></a> ';
    text.innerHTML += '<a href="#" onclick="return PLAYER.movePlay(' + play.index + ', 10, true);"><img width="16" src="img/downgrade-1.bmp"/></a> ';
    text.innerHTML += '<a href="#" onclick="return PLAYER.movePlay(' + play.index + ', -1, false);"><img width="16" src="img/downgrade-2.bmp"/></a> ';
    text.innerHTML += '<br/>';
    text.innerHTML += '<b>[' + (position + 1) + ']</b>';

    if (name) {
     text.innerHTML += ' <b>' + name + '</b>';
    }

    text.innerHTML += '<br/>';
    text.innerHTML += '<i>' + link.name + '</i>';
   }
  }
 }

 // getTage
 getTag(tagName) {
  let result = undefined;

  if (this.dictionary) {

   for (const tag of this.dictionary.tagArray) {
    if (tag.name == tagName) {
     result = tag;
     break;
    }
   }
  }

  return result;
 }

 // searchPlay
 searchPlay() {
  let tagNameArray = document.getElementById('searchPlayInput').value.split(' ');
  let countMap = new Map();
  let countArray = new Array();

  for (const tagName of tagNameArray) {
   let tag = this.getTag(tagName.toLowerCase());

   if (tag) {
    for (const reference of tag.referenceArray) {
     let previousCount = countMap.get(reference.name);

     if (previousCount) {
      countMap.set(reference.name, parseInt(reference.count) + previousCount);
     } else {
      countMap.set(reference.name, parseInt(reference.count));
     }
    }
   }
  }

  for (const countEntry of countMap) {
   countArray.push(countEntry);
  }

  countArray.sort((first, second) => second[1] - first[1]);

  this.resultPlayList.clear();

  for (const count of countArray) {
   this.resultPlayList.addItem(count[0]);
  }

  this.playList = this.resultPlayList;

  this.listPlay(false);
 }

 loadDictionary() {
  let xhr = new XMLHttpRequest();

  xhr.responseType = 'text';

  xhr.open('GET', 'summary/dictionary.json');
  xhr.send();
  xhr.onload = function() {
   if (xhr.status != 200) {
    console.log('An error occurred while retrieving dictionary file.');
   } else {
    PLAYER.dictionary = JSON.parse(xhr.response);
   }
  }
 }
}

let PLAYER = new Player();


