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
 removeItem(itemIndex) {
  let itemPosition = this.getItemPosition(itemIndex);

  if (itemPosition != -1) {
   this.itemArray.splice(itemPosition, 1);

   this.store();
  }
 }

 // upgradeItem
 upgradeItem(itemIndex) {
  let itemPosition = this.getItemPosition(itemIndex);

  if (itemPosition != -1 && itemPosition > 0) {
   let item = this.itemArray[itemPosition];

   this.itemArray[itemPosition] = this.itemArray[itemPosition - 1];
   this.itemArray[itemPosition - 1] = item;

   this.store();
  }
 }

 // downgradeItem
 downgradeItem(itemIndex) {
  let itemPosition = this.getItemPosition(itemIndex);

  if (itemPosition != -1 && itemPosition < (this.itemArray.length - 1)) {
   let item = this.itemArray[itemPosition];

   this.itemArray[itemPosition] = this.itemArray[itemPosition + 1];
   this.itemArray[itemPosition + 1] = item;

   this.store();
  }
 }

 // containsItem
 containsItem(itemName) {
  let result = false;

  for (let position = 0; !result && position < this.itemArray.length; position++) {
   if (this.itemArray[position].name === itemName) {
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

  output.innerHTML = '';

  for (let item of this.playListList.itemArray) {
   if (output.innerHTML.length > 0) {
    output.innerHTML += '<br/>';
   }

   output.innerHTML += '<a href="#" onclick="return PLAYER.removePlayList(' + item.index + ');"><img width="16" src="img/remove.bmp"/></a> ';
   output.innerHTML += '<a href="#" onclick="return PLAYER.upgradePlayList(' + item.index + ');"><img width="16" src="img/upgrade.bmp"/></a> ';
   output.innerHTML += '<a href="#" onclick="return PLAYER.downgradePlayList(' + item.index + ');"><img width="16" src="img/downgrade.bmp"/></a> ';
   output.innerHTML += '<a href="#" onclick="return PLAYER.setPlayList(' + item.index + ');">' + item.name + '</a>';
  }
 }

 // removePlayList
 removePlayList(index) {
  this.playListList.removeItem(index);

  this.listPlayList();

  return false;
 }

 // upgradePlayList
 upgradePlayList(index) {
  this.playListList.upgradeItem(index);

  this.listPlayList();

  return false;
 }

 // downgradePlayList
 downgradePlayList(index) {
  this.playListList.downgradeItem(index);

  this.listPlayList();

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

   for (const play of this.playList.itemArray) {
    let table = document.createElement('table');
    let tr = document.createElement('tr');
    let firstTd = document.createElement('td');
    let secondTd = document.createElement('td');
    let video = document.createElement('video');

    video.setAttribute('width', '400');
    video.setAttribute('controls', 'true');

    firstTd.appendChild(video);
    tr.appendChild(firstTd);
    tr.appendChild(secondTd);
    table.appendChild(tr);
    output.appendChild(table);

    this.loadPlay(play, video, secondTd);

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
    this.listPlay();
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
  this.playList.removeItem(index);

  this.listPlay();

  return false;
 }

 // upgradePlay
 upgradePlay(index) {
  this.playList.upgradeItem(index);

  this.listPlay();

  return false;
 }

 // downgradePlay
 downgradePlay(index) {
  this.playList.downgradeItem(index);

  this.listPlay();

  return false;
 }

 // loadPlay
 loadPlay(play, video, text) {
  let xhr = new XMLHttpRequest();

  xhr.responseType = 'text';

  xhr.open('GET', 'summary/' + play.name);
  xhr.send();
  xhr.onload = function() {
   if (xhr.status != 200) {
    console.log('An error occured while retrieving link file "' + play.name + '".');
   } else {
    let link = JSON.parse(xhr.response);
    let source = document.createElement('source');

    source.setAttribute('src', 'data' + link.path);
    source.setAttribute('type', link.mimeType);

    video.appendChild(source);

    text.innerHTML = '<b>' + link.title + '</b>';

    for (const principal of link.principalArray) {
     text.innerHTML += '<br/>' + principal;
    }

    text.innerHTML += '<br/>';
    text.innerHTML += '<br/>';
    text.innerHTML += '<br/>';
    text.innerHTML += '<a href="#" onclick="return PLAYER.showAddPlayOutput(event, \'' + play.name + '\');"><img width="16" src="img/add.bmp"/></a> ';
    text.innerHTML += '<a href="#" onclick="return PLAYER.removePlay(' + play.index + ');"><img width="16" src="img/remove.bmp"/></a> ';
    text.innerHTML += '<a href="#" onclick="return PLAYER.upgradePlay(' + play.index + ');"><img width="16" src="img/upgrade.bmp"/></a> ';
    text.innerHTML += '<a href="#" onclick="return PLAYER.downgradePlay(' + play.index + ');"><img width="16" src="img/downgrade.bmp"/></a>';
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

  this.listPlay();
 }

 loadDictionary() {
  let xhr = new XMLHttpRequest();

  xhr.responseType = 'text';

  xhr.open('GET', 'summary/dictionary.json');
  xhr.send();
  xhr.onload = function() {
   if (xhr.status != 200) {
    console.log('An error occured while retrieving dictionary file.');
   } else {
    PLAYER.dictionary = JSON.parse(xhr.response);
   }
  }
 }
}

let PLAYER = new Player();


