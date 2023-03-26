// ************
// * ItemList *
// ************
class ItemList {
 constructor() {
  this.itemArray = new Array();
 }

 // clear
 clear() {
  this.itemArray = new Array();
 }

 // addItem
 addItem(item) {
  let result = item;

  this.itemArray.push(result);

  return result;
 }

 // shiftItemPosition
 shiftItemPosition(position, shift, relative) {
  let result = -1;

  let length = this.itemArray.length;

  if (length != 0) {
   result = shift;

   if (relative) {
    result += position;
   }

   result %= length;

   if (result < 0) {
    result += length;
   }
  }

  return result;
 }

 // moveItem
 moveItem(position, shift, relative) {
  let result = -1;

  if (position != -1) {
   let newPosition = this.shiftItemPosition(position, shift, relative);

   if (position != newPosition) {
    result = newPosition;

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
  }

  return result;
 }

 // removeItem
 removeItem(position) {
  let result = -1;

  if (position != -1) {
   result = position;

   this.itemArray.splice(result, 1);

   this.store();
  }

  return result;
 }
}

// *****************
// * NamedItemList *
// *****************
class NamedItemList extends ItemList {
 constructor(storageId) {
  super();

  this.storageId = storageId;
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
  super.clear();

  this.store();
 }

 // addItem
 addItem(item) {
  let result = super.addItem(item);

  this.store();

  return result;
 }

 // getNamedItemPosition
 getNamedItemPosition(name) {
  let result = -1;

  for (let position = 0, maxPosition = this.itemArray.length; result == -1 && position < maxPosition; position++) {
   if (this.itemArray[position].name == name) {
    result = position;
   }
  }

  return result;
 }
}

// *******************
// * IndexedItemList *
// *******************
class IndexedItemList extends NamedItemList {
 constructor(storageId) {
  super(storageId);

  this.itemIndex = 0;
 }

 // clear
 clear() {
  super.clear();

  this.itemIndex = -1;
 }

 // addItem
 addItem(item) {
  let result = super.addItem(item);

  result.index = this.itemIndex++;

  return result;
 }

 // getIndexedItemPosition
 getIndexedItemPosition(index) {
  let result = -1;

  for (let position = 0, maxPosition = this.itemArray.length; result == -1 && position < maxPosition; position++) {
   if (this.itemArray[position].index == index) {
    result = position;
   }
  }

  return result;
 }

 // getIndexedItem
 getIndexedItem(index) {
  let result = undefined;

  let position = this.getIndexedItemPosition(index);

  if (position != -1) {
   result = this.itemArray[position];
  }

  return result;
 }
}

// *********************
// * PaginatedItemList *
// *********************
class PaginatedItemList extends IndexedItemList {
 constructor(storageId) {
  super(storageId);

  this.pageSize = 20;
 }

 // getPageCount
 getPageCount() {
  return Math.ceil(this.itemArray.length / this.pageSize);
 }

 // getPage
 getPage(number) {
  let result = new Array();

  for (let position = number * this.pageSize, maxPosition = Math.min(position + this.pageSize, this.itemArray.length); position < maxPosition; position++) {
   result.push(this.itemArray[position]);
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
class PlayList extends PaginatedItemList {
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
class PlayListList extends IndexedItemList {
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

// ***********************
// * PlayListListManager *
// ***********************
class PlayListListManager {
 constructor() {
  this.playListList = new PlayListList('katube-playListList', 'katube-playList-');
 }

 // displayPlayListList
 displayPlayListList() {
  let output = document.getElementById('displayPlayListListOutput');

  for (const item of this.playListList.itemArray) {
   this.appendPlayList(item);
  }
 }

 // appendPlayList
 appendPlayList(playList) {
  let output = document.getElementById('displayPlayListListOutput');
  let div = document.createElement('div');

  div.setAttribute('id', 'play-list-' + playList.index);

  div.innerHTML = '';

  div.innerHTML += '<a href="#" onclick="return PLAYER.removePlayList(' + playList.index + ');"><img width="16" src="img/remove.bmp" alt="remove"/></a> ';
  div.innerHTML += '<a href="#" onclick="return PLAYER.movePlayList(' + playList.index + ', 0, false);"><img width="16" src="img/upgrade-totally.bmp" alt="upgrade totally"/></a> ';
  div.innerHTML += '<a href="#" onclick="return PLAYER.movePlayList(' + playList.index + ', -1, true);"><img width="16" src="img/upgrade.bmp" alt="upgrade"/></a> ';
  div.innerHTML += '<a href="#" onclick="return PLAYER.movePlayList(' + playList.index + ', 1, true);"><img width="16" src="img/downgrade.bmp" alt="downgrade"/></a> ';
  div.innerHTML += '<a href="#" onclick="return PLAYER.movePlayList(' + playList.index + ', -1, false);"><img width="16" src="img/downgrade-totally.bmp" alt="downgrade totally"/></a> ';
  div.innerHTML += '<a href="#" onclick="return PLAYER.setDisplayedPlayList(' + playList.index + ');">' + playList.name + '</a>';

  output.appendChild(div);
 }

 // escapeName
 escapeName(name) {
  let result = name.split('');

  for (let index = 0, maxIndex = result.length; index < maxIndex; index++) {
   if (' !#$%&()*+-/0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXZ[]abcdefghijklmnopqrstuvwxyz{|}~'.indexOf(result[index]) == -1) {
    result[index] = '?';
   }
  }

  return result.join('');
 }

 // createPlayList
 createPlayList() {
  let name = this.escapeName(document.getElementById('createPlayListInput').value);

  if (name.length > 0 && this.playListList.getNamedItemPosition(name) == -1) {
   this.appendPlayList(this.playListList.addItem(name));
  }
 }

 // movePlayList
 movePlayList(index, shift, relative) {
  let position = this.playListList.getIndexedItemPosition(index);
  let newPosition = this.playListList.moveItem(position, shift, relative);

  if (newPosition != -1) {
   let output = document.getElementById('displayPlayListListOutput');

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

 // removePlayList
 removePlayList(index) {
  let position = this.playListList.getIndexedItemPosition(index);
  let removedPosition = this.playListList.removeItem(position);

  if (removedPosition != -1) {
   let output = document.getElementById('displayPlayListListOutput');

   output.removeChild(output.children[removedPosition]);
  }

  return false;
 }
}

// *******************
// * PlayListManager *
// *******************
class PlayListManager extends PlayListListManager {
 constructor() {
  super();

  this.displayedPlayList = undefined;
  this.displayedPageNumber = -1;
 }

 // setDisplayedPlayList
 setDisplayedPlayList(index) {
  this.displayedPlayList = this.playListList.getIndexedItem(index);
  this.displayedPageNumber = 0;

  this.displayPlayList();

  return false;
 }

 // displayPagination
 displayPagination(id) {
  let output = document.getElementById(id);

  output.innerHTML = '';

  if (this.displayedPlayList) {
   let count = this.displayedPlayList.getPageCount();

   for (let number = 0, maxNumber = count; number < maxNumber; number++) {
    if (output.innerHTML.length > 0) {
     output.innerHTML += ' ';
    }

    if (number == this.displayedPageNumber) {
     output.innerHTML += number + 1;
    } else {
     output.innerHTML += '<a href="#" onclick="return PLAYER.loadPage(' + number + ');">' + (number + 1) + '</a>';
    }
   }
  }
 }

 // displayPlayList
 displayPlayList() {
  this.displayPagination('displayPaginationTopOutput');

  let output = document.getElementById('displayPlayListOutput');

  output.innerHTML = '';

  let position = this.displayedPageNumber * this.displayedPlayList.pageSize;

  for (const play of this.displayedPlayList.getPage(this.displayedPageNumber)) {
   this.insertPlay(play, position);

   position++;
  }

  this.displayPagination('displayPaginationBottomOutput');
 }

 // loadPage
 loadPage(number) {
  this.displayedPageNumber = number;

  this.displayPlayList();

  return false;
 }

 // insertPlay
 insertPlay(play, position) {
  let output = document.getElementById('displayPlayListOutput');

  let div = document.createElement('div');
  let table = document.createElement('table');
  let tr = document.createElement('tr');
  let firstTd = document.createElement('td');
  let secondTd = document.createElement('td');
  let video = document.createElement('video');

  div.setAttribute('id', 'play-' + play.index);

  video.setAttribute('id', play.index);
  video.setAttribute('width', '400');

  firstTd.appendChild(video);
  tr.appendChild(firstTd);
  tr.appendChild(secondTd);
  table.appendChild(tr);
  div.appendChild(table);
  output.appendChild(div);

  this.loadPlay(play, video, secondTd, this.displayedPlayList.name, position);
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

    video.preload = 'metadata';

    video.onloadedmetadata = function() {
     video.currentTime = Math.floor(video.duration / 60);
    }

    text.innerHTML = '<b>' + link.title + '</b>';

    for (const principal of link.principalArray) {
     text.innerHTML += '<br/>' + principal;
    }

    text.innerHTML += '<br/>';
    text.innerHTML += '<br/>';
    text.innerHTML += '<br/>';
    text.innerHTML += '<a href="#" onclick="return PLAYER.removePlay(' + play.index + ');"><img width="16" src="img/remove.bmp" alt=""/></a> ';
    text.innerHTML += '<a href="#" onclick="return PLAYER.movePlay(' + play.index + ', 0, false);"><img width="16" src="img/upgrade-totally.bmp" alt="upgrade totally"/></a> ';
    text.innerHTML += '<a href="#" onclick="return PLAYER.movePlay(' + play.index + ', -10, true);"><img width="16" src="img/upgrade-more.bmp" alt="upgrade more"/></a> ';
    text.innerHTML += '<a href="#" onclick="return PLAYER.movePlay(' + play.index + ', -1, true);"><img width="16" src="img/upgrade.bmp" alt="upgrade"/></a> ';
    text.innerHTML += '<a href="#" onclick="return PLAYER.movePlay(' + play.index + ', 1, true);"><img width="16" src="img/downgrade.bmp" alt="downgrade"/></a> ';
    text.innerHTML += '<a href="#" onclick="return PLAYER.movePlay(' + play.index + ', 10, true);"><img width="16" src="img/downgrade-more.bmp" alt="downgrade more"/></a> ';
    text.innerHTML += '<a href="#" onclick="return PLAYER.movePlay(' + play.index + ', -1, false);"><img width="16" src="img/downgrade-totally.bmp" alt="downgrade totally"/></a> ';
    text.innerHTML += '<a href="#" onclick="return PLAYER.playPlay(' + play.index + ');"><img width="16" src="img/load.bmp" alt="load"/></a> ';
    text.innerHTML += '<a href="#" onclick="return PLAYER.playPlay(' + play.index + ');"><img width="16" src="img/play.bmp" alt="play"/></a> ';
    text.innerHTML += '<a href="#" onclick="return PLAYER.showAddPlayOutput(event, \'' + play.name + '\');"><img width="16" src="img/add.bmp" alt="add"/></a>';
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

 // addPlay
 addPlay(index, name) {
  let item = this.playListList.getIndexedItem(index);

  if (item) {
   let play = item.addItem(name);

   if (this.displayedPlayList && this.displayedPlayList.index == index) {
    this.displayPlayList();
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

 // movePlay
 movePlay(index, shift, relative) {
  let position = this.displayedPlayList.getIndexedItemPosition(index);
  let newPosition = this.displayedPlayList.moveItem(position, shift, relative);

  if (newPosition != -1) {
   this.displayPlayList();
  }

  return false;
 }

 // removePlay
 removePlay(index) {
  let position = this.displayedPlayList.getIndexedItemPosition(index);
  let removedPosition = this.displayedPlayList.removeItem(position);

  if (removedPosition != -1) {
   this.displayPlayList();
  }

  return false;
 }
}

// ***************
// * PlayManager *
// ***************
class PlayManager extends PlayListManager {
 constructor() {
  super();

  this.playedPlayList = undefined;
 }

 // playPlay
 playPlay(index) {
  this.playedPlayList = this.displayedPlayList;

  this.playIt(index);

  return false;
 }

 // playIt
 playIt(index) {
  let xhr = new XMLHttpRequest();

  xhr.responseType = 'text';

  xhr.open('GET', 'summary/' + this.playedPlayList.getIndexedItem(index).name);
  xhr.send();
  xhr.onload = function() {
   if (xhr.status != 200) {
    console.log('An error occurred while retrieving link file "' + play.name + '".');
   } else {
    let link = JSON.parse(xhr.response);
    let video = document.getElementById('playVideoOutput');
    let child = video.firstChild;
    let source = document.createElement('source');

    if (child) {
     video.removeChild(child);
    }

    source.setAttribute('src', 'data' + link.path);
    source.setAttribute('type', link.mimeType);

    video.appendChild(source);

    video.load();

    if (video.canPlayType) {
    video.play();

     video.onended = function() {PLAYER.playNextPlay(index);};
    } else {
     PLAYER.playNextPlay(index);
    }
   }
  }

  return false;
 }

 // playNextPlay
 playNextPlay(index) {
  let position = this.playedPlayList.getIndexedItemPosition(index);

  position = this.playedPlayList.shiftItemPosition(position, 1, true);

  if (position != -1) {
   this.playIt(this.playedPlayList.itemArray[position].index);
  }
 }
}

// *****************
// * SearchManager *
// *****************
class SearchManager extends PlayManager {
 constructor() {
  super();

  this.resultPlayList = new PlayList(undefined, undefined);
  this.dictionary = undefined;

  this.loadDictionary();
 }

 // getTag
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

 // getTranslation
 getTranslation(translationKey) {
  let result = undefined;

  if (this.dictionary) {
   for (const translation of this.dictionary.translationArray) {
    if (translation.key == translationKey) {
     result = translation;
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
   this.resultPlayList.addItem(this.getTranslation(count[0]).value);
  }

  this.displayedPlayList = this.resultPlayList;
  this.displayedPageNumber = 0;

  this.displayPlayList();
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

let PLAYER = new SearchManager();

window.onload = function() {
 PLAYER.displayPlayListList();
}