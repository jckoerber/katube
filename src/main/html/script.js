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

  for (let item of this.itemArray) {
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
 }

 // getItem
 getItem(itemIndex) {
  let result = undefined;

  for (let position = 0; !result && position < this.itemArray.length; position++) {
   if (this.itemArray[position].index === itemIndex) {
    result = this.itemArray[position];
   }
  }

  return result;
 }

 // getItemPosition
 getItemPosition(itemIndex) {
  let result = -1;

  for (let position = 0; result == -1 && position < this.itemArray.length; position++) {
   if (this.itemArray[position].index === itemIndex) {
    result = position;
   }
  }

  return result;
 }

 // removeItem
 removeItem(position) {
  this.itemArray.splice(position, 1);

  this.store();
 }

 // moveItem
 moveItem(position, newPosition) {
  newPosition = newPosition % this.itemArray.length;

  if (newPosition < 0) {
   newPosition += this.itemArray.length;
  }

  if (newPosition != position) {
   let item = this.itemArray[position];

   while (position > newPosition) {
    this.itemArray[position] = this.itemArray[position - 1];

    position--;
   }

   while (position < newPosition) {
    this.itemArray[position] = this.itemArray[position + 1];

    position++;
   }

   this.itemArray[position] = item;

   this.store();
  }
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
 addItem(itemName) {
  super.addItem(new Play(itemName));
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

  for (let item of this.itemArray) {
   item.load();
  }
 }

 // clear
 clear() {
  for (let item of this.itemArray) {
   item.clear();
  }

  super.clear();
 }

 // addItem
 addItem(itemName) {
  super.addItem(new PlayList(this.storagePrefix + itemName, itemName));
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
  let playListName = this.escapeName(document.getElementById('createPlayListInput').value);

  if (!this.playListList.containsItem(playListName)) {
   this.playListList.addItem(playListName);
  }

  this.listPlayList();
 }

 // listPlayList
 listPlayList() {
  let output = document.getElementById('listPlayListOutput');
  let position = 0;

  output.innerHTML = '';

  for (let item of this.playListList.itemArray) {
   if (output.innerHTML.length > 0) {
    output.innerHTML += '<br/>';
   }

   output.innerHTML += '<a href="#" onclick="return PLAYER.removePlayList(' + position + ');"><img width="16" src="img/remove.bmp"/></a> ';
   output.innerHTML += '<a href="#" onclick="return PLAYER.movePlayList(' + position + ', ' + 0 + ');"><img width="16" src="img/upgrade-2.bmp"/></a> ';
   output.innerHTML += '<a href="#" onclick="return PLAYER.movePlayList(' + position + ', ' + (position - 1) + ');"><img width="16" src="img/upgrade-0.bmp"/></a> ';
   output.innerHTML += '<a href="#" onclick="return PLAYER.movePlayList(' + position + ', ' + (position + 1) + ');"><img width="16" src="img/downgrade-0.bmp"/></a> ';
   output.innerHTML += '<a href="#" onclick="return PLAYER.movePlayList(' + position + ', ' + -1 + ');"><img width="16" src="img/downgrade-2.bmp"/></a> ';
   output.innerHTML += '<a href="#" onclick="return PLAYER.setPlayList(' + position + ');">' + item.name + '</a>';

   position++;
  }
 }

 // removePlayList
 removePlayList(index) {
  this.playListList.removeItem(index);

  this.listPlayList();

  return false;
 }

 // movePlayList
 movePlayList(position, newPosition) {
  this.playListList.moveItem(position, newPosition);

  this.listPlayList();

  return false;
 }

 // setPlayList
 setPlayList(position) {
  this.playList = this.playListList.getItem(position);

  this.listPlay(false);

  return false;
 }

 // listPlay
 listPlay(keep) {
  if (keep) {
   for (const play of this.playList.itemArray) {
    let video = document.getElementById(play.index);

    if (video) {
     play.keep = true;
     play.currentTime = video.currentTime;
     play.volume = video.volume;
     play.paused = video.paused;
     play.ended = video.ended;
    }
   }
  }

  let output = document.getElementById('listPlayOutput');

  output.innerHTML = '';

  if (this.playList) {
   let firstVideo = undefined;
   let previousVideo = undefined;
   let position = 0;

   for (const play of this.playList.itemArray) {
    let table = document.createElement('table');
    let tr = document.createElement('tr');
    let firstTd = document.createElement('td');
    let secondTd = document.createElement('td');
    let video = document.createElement('video');

    video.setAttribute('id', play.index);
    video.setAttribute('width', '400');
    video.setAttribute('controls', 'true');

    video.volume = 0.1;

    firstTd.appendChild(video);
    tr.appendChild(firstTd);
    tr.appendChild(secondTd);
    table.appendChild(tr);
    output.appendChild(table);

    this.loadPlay(play, video, secondTd, this.playList.name, position);

    if (!play.name.endsWith('.avi.json') && !play.name.endsWith('.mkv.json')) {
     if (!firstVideo) {
      firstVideo = video;
     }

     if (previousVideo) {
      previousVideo.onended = function() {
       video.play();
      }
     }

     previousVideo = video;

     position++;
    }
   }

   if (previousVideo) {
     previousVideo.onended = function() {
      firstVideo.play();
     }
   }
  }
 }

 // addPlay
 addPlay(index, name) {
  let item = this.playListList.getItem(index);

  if (item) {
   item.addItem(name);

   if (this.playList && this.playList.index === index) {
    this.listPlay(true);
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
 removePlay(position) {
  this.playList.removeItem(position);

  this.listPlay(true);

  return false;
 }

 // movePlay
 movePlay(position, newPosition) {
  this.playList.moveItem(position, newPosition);

  this.listPlay(true);

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

    if (play.keep) {
     if (!play.ended) {
      video.currentTime = play.currentTime;
     }

     video.volume = play.volume;

     if (!play.paused) {
      video.play();
     }

     play.keep = false;
    }

    text.innerHTML = '<b>' + link.title + '</b>';

    for (const principal of link.principalArray) {
     text.innerHTML += '<br/>' + principal;
    }

    text.innerHTML += '<br/>';
    text.innerHTML += '<br/>';
    text.innerHTML += '<br/>';
    text.innerHTML += '<a href="#" onclick="return PLAYER.showAddPlayOutput(event, \'' + play.name + '\');"><img width="16" src="img/add.bmp"/></a> ';
    text.innerHTML += '<a href="#" onclick="return PLAYER.removePlay(' + position + ');"><img width="16" src="img/remove.bmp"/></a> ';
    text.innerHTML += '<a href="#" onclick="return PLAYER.movePlay(' + position + ', ' + 0 + ');"><img width="16" src="img/upgrade-2.bmp"/></a> ';
    text.innerHTML += '<a href="#" onclick="return PLAYER.movePlay(' + position + ', ' + (position - 10) + ');"><img width="16" src="img/upgrade-1.bmp"/></a> ';
    text.innerHTML += '<a href="#" onclick="return PLAYER.movePlay(' + position + ', ' + (position - 1) + ');"><img width="16" src="img/upgrade-0.bmp"/></a> ';
    text.innerHTML += '<a href="#" onclick="return PLAYER.movePlay(' + position + ', ' + (position + 1) + ');"><img width="16" src="img/downgrade-0.bmp"/></a> ';
    text.innerHTML += '<a href="#" onclick="return PLAYER.movePlay(' + position + ', ' + (position + 10) + ');"><img width="16" src="img/downgrade-1.bmp"/></a> ';
    text.innerHTML += '<a href="#" onclick="return PLAYER.movePlay(' + position + ', ' + -1 + ');"><img width="16" src="img/downgrade-2.bmp"/></a> ';
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


