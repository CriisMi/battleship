/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/pubsub-js/src/pubsub.js":
/*!**********************************************!*\
  !*** ./node_modules/pubsub-js/src/pubsub.js ***!
  \**********************************************/
/***/ (function(module, exports, __webpack_require__) {

/* module decorator */ module = __webpack_require__.nmd(module);
/**
 * Copyright (c) 2010,2011,2012,2013,2014 Morgan Roderick http://roderick.dk
 * License: MIT - http://mrgnrdrck.mit-license.org
 *
 * https://github.com/mroderick/PubSubJS
 */

(function (root, factory){
    'use strict';

    var PubSub = {};

    if (root.PubSub) {
        PubSub = root.PubSub;
        console.warn("PubSub already loaded, using existing version");
    } else {
        root.PubSub = PubSub;
        factory(PubSub);
    }
    // CommonJS and Node.js module support
    if (true){
        if (module !== undefined && module.exports) {
            exports = module.exports = PubSub; // Node.js specific `module.exports`
        }
        exports.PubSub = PubSub; // CommonJS module 1.1.1 spec
        module.exports = exports = PubSub; // CommonJS
    }
    // AMD support
    /* eslint-disable no-undef */
    else {}

}(( typeof window === 'object' && window ) || this, function (PubSub){
    'use strict';

    var messages = {},
        lastUid = -1,
        ALL_SUBSCRIBING_MSG = '*';

    function hasKeys(obj){
        var key;

        for (key in obj){
            if ( Object.prototype.hasOwnProperty.call(obj, key) ){
                return true;
            }
        }
        return false;
    }

    /**
     * Returns a function that throws the passed exception, for use as argument for setTimeout
     * @alias throwException
     * @function
     * @param { Object } ex An Error object
     */
    function throwException( ex ){
        return function reThrowException(){
            throw ex;
        };
    }

    function callSubscriberWithDelayedExceptions( subscriber, message, data ){
        try {
            subscriber( message, data );
        } catch( ex ){
            setTimeout( throwException( ex ), 0);
        }
    }

    function callSubscriberWithImmediateExceptions( subscriber, message, data ){
        subscriber( message, data );
    }

    function deliverMessage( originalMessage, matchedMessage, data, immediateExceptions ){
        var subscribers = messages[matchedMessage],
            callSubscriber = immediateExceptions ? callSubscriberWithImmediateExceptions : callSubscriberWithDelayedExceptions,
            s;

        if ( !Object.prototype.hasOwnProperty.call( messages, matchedMessage ) ) {
            return;
        }

        for (s in subscribers){
            if ( Object.prototype.hasOwnProperty.call(subscribers, s)){
                callSubscriber( subscribers[s], originalMessage, data );
            }
        }
    }

    function createDeliveryFunction( message, data, immediateExceptions ){
        return function deliverNamespaced(){
            var topic = String( message ),
                position = topic.lastIndexOf( '.' );

            // deliver the message as it is now
            deliverMessage(message, message, data, immediateExceptions);

            // trim the hierarchy and deliver message to each level
            while( position !== -1 ){
                topic = topic.substr( 0, position );
                position = topic.lastIndexOf('.');
                deliverMessage( message, topic, data, immediateExceptions );
            }

            deliverMessage(message, ALL_SUBSCRIBING_MSG, data, immediateExceptions);
        };
    }

    function hasDirectSubscribersFor( message ) {
        var topic = String( message ),
            found = Boolean(Object.prototype.hasOwnProperty.call( messages, topic ) && hasKeys(messages[topic]));

        return found;
    }

    function messageHasSubscribers( message ){
        var topic = String( message ),
            found = hasDirectSubscribersFor(topic) || hasDirectSubscribersFor(ALL_SUBSCRIBING_MSG),
            position = topic.lastIndexOf( '.' );

        while ( !found && position !== -1 ){
            topic = topic.substr( 0, position );
            position = topic.lastIndexOf( '.' );
            found = hasDirectSubscribersFor(topic);
        }

        return found;
    }

    function publish( message, data, sync, immediateExceptions ){
        message = (typeof message === 'symbol') ? message.toString() : message;

        var deliver = createDeliveryFunction( message, data, immediateExceptions ),
            hasSubscribers = messageHasSubscribers( message );

        if ( !hasSubscribers ){
            return false;
        }

        if ( sync === true ){
            deliver();
        } else {
            setTimeout( deliver, 0 );
        }
        return true;
    }

    /**
     * Publishes the message, passing the data to it's subscribers
     * @function
     * @alias publish
     * @param { String } message The message to publish
     * @param {} data The data to pass to subscribers
     * @return { Boolean }
     */
    PubSub.publish = function( message, data ){
        return publish( message, data, false, PubSub.immediateExceptions );
    };

    /**
     * Publishes the message synchronously, passing the data to it's subscribers
     * @function
     * @alias publishSync
     * @param { String } message The message to publish
     * @param {} data The data to pass to subscribers
     * @return { Boolean }
     */
    PubSub.publishSync = function( message, data ){
        return publish( message, data, true, PubSub.immediateExceptions );
    };

    /**
     * Subscribes the passed function to the passed message. Every returned token is unique and should be stored if you need to unsubscribe
     * @function
     * @alias subscribe
     * @param { String } message The message to subscribe to
     * @param { Function } func The function to call when a new message is published
     * @return { String }
     */
    PubSub.subscribe = function( message, func ){
        if ( typeof func !== 'function'){
            return false;
        }

        message = (typeof message === 'symbol') ? message.toString() : message;

        // message is not registered yet
        if ( !Object.prototype.hasOwnProperty.call( messages, message ) ){
            messages[message] = {};
        }

        // forcing token as String, to allow for future expansions without breaking usage
        // and allow for easy use as key names for the 'messages' object
        var token = 'uid_' + String(++lastUid);
        messages[message][token] = func;

        // return token for unsubscribing
        return token;
    };

    PubSub.subscribeAll = function( func ){
        return PubSub.subscribe(ALL_SUBSCRIBING_MSG, func);
    };

    /**
     * Subscribes the passed function to the passed message once
     * @function
     * @alias subscribeOnce
     * @param { String } message The message to subscribe to
     * @param { Function } func The function to call when a new message is published
     * @return { PubSub }
     */
    PubSub.subscribeOnce = function( message, func ){
        var token = PubSub.subscribe( message, function(){
            // before func apply, unsubscribe message
            PubSub.unsubscribe( token );
            func.apply( this, arguments );
        });
        return PubSub;
    };

    /**
     * Clears all subscriptions
     * @function
     * @public
     * @alias clearAllSubscriptions
     */
    PubSub.clearAllSubscriptions = function clearAllSubscriptions(){
        messages = {};
    };

    /**
     * Clear subscriptions by the topic
     * @function
     * @public
     * @alias clearAllSubscriptions
     * @return { int }
     */
    PubSub.clearSubscriptions = function clearSubscriptions(topic){
        var m;
        for (m in messages){
            if (Object.prototype.hasOwnProperty.call(messages, m) && m.indexOf(topic) === 0){
                delete messages[m];
            }
        }
    };

    /**
       Count subscriptions by the topic
     * @function
     * @public
     * @alias countSubscriptions
     * @return { Array }
    */
    PubSub.countSubscriptions = function countSubscriptions(topic){
        var m;
        // eslint-disable-next-line no-unused-vars
        var token;
        var count = 0;
        for (m in messages) {
            if (Object.prototype.hasOwnProperty.call(messages, m) && m.indexOf(topic) === 0) {
                for (token in messages[m]) {
                    count++;
                }
                break;
            }
        }
        return count;
    };


    /**
       Gets subscriptions by the topic
     * @function
     * @public
     * @alias getSubscriptions
    */
    PubSub.getSubscriptions = function getSubscriptions(topic){
        var m;
        var list = [];
        for (m in messages){
            if (Object.prototype.hasOwnProperty.call(messages, m) && m.indexOf(topic) === 0){
                list.push(m);
            }
        }
        return list;
    };

    /**
     * Removes subscriptions
     *
     * - When passed a token, removes a specific subscription.
     *
	 * - When passed a function, removes all subscriptions for that function
     *
	 * - When passed a topic, removes all subscriptions for that topic (hierarchy)
     * @function
     * @public
     * @alias subscribeOnce
     * @param { String | Function } value A token, function or topic to unsubscribe from
     * @example // Unsubscribing with a token
     * var token = PubSub.subscribe('mytopic', myFunc);
     * PubSub.unsubscribe(token);
     * @example // Unsubscribing with a function
     * PubSub.unsubscribe(myFunc);
     * @example // Unsubscribing from a topic
     * PubSub.unsubscribe('mytopic');
     */
    PubSub.unsubscribe = function(value){
        var descendantTopicExists = function(topic) {
                var m;
                for ( m in messages ){
                    if ( Object.prototype.hasOwnProperty.call(messages, m) && m.indexOf(topic) === 0 ){
                        // a descendant of the topic exists:
                        return true;
                    }
                }

                return false;
            },
            isTopic    = typeof value === 'string' && ( Object.prototype.hasOwnProperty.call(messages, value) || descendantTopicExists(value) ),
            isToken    = !isTopic && typeof value === 'string',
            isFunction = typeof value === 'function',
            result = false,
            m, message, t;

        if (isTopic){
            PubSub.clearSubscriptions(value);
            return;
        }

        for ( m in messages ){
            if ( Object.prototype.hasOwnProperty.call( messages, m ) ){
                message = messages[m];

                if ( isToken && message[value] ){
                    delete message[value];
                    result = value;
                    // tokens are unique, so we can just stop here
                    break;
                }

                if (isFunction) {
                    for ( t in message ){
                        if (Object.prototype.hasOwnProperty.call(message, t) && message[t] === value){
                            delete message[t];
                            result = true;
                        }
                    }
                }
            }
        }

        return result;
    };
}));


/***/ }),

/***/ "./src/game.js":
/*!*********************!*\
  !*** ./src/game.js ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "game": () => (/* binding */ game)
/* harmony export */ });
/* harmony import */ var _gameboard__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./gameboard */ "./src/gameboard.js");
/* harmony import */ var pubsub_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! pubsub-js */ "./node_modules/pubsub-js/src/pubsub.js");
/* harmony import */ var pubsub_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(pubsub_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _interface__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./interface */ "./src/interface.js");
/* harmony import */ var _player__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./player */ "./src/player.js");





const game = () => {
  (0,_interface__WEBPACK_IMPORTED_MODULE_2__.addShipDisplay)();
  let shipDirection = [0, 1];
  let shipCount = 0;
  let shipLength = 4;

  pubsub_js__WEBPACK_IMPORTED_MODULE_1___default().subscribe("ship_added", () => {
    shipCount += 1;
    shipLength = (0,_interface__WEBPACK_IMPORTED_MODULE_2__.returnShipLength)(shipCount);
    if (shipCount >= 10) {
      (0,_interface__WEBPACK_IMPORTED_MODULE_2__.displayShipToAdd)(0, shipDirection);
      (0,_interface__WEBPACK_IMPORTED_MODULE_2__.deactivateBoard)(gameboard1, field1);
      (0,_interface__WEBPACK_IMPORTED_MODULE_2__.activateBoard)(gameboard2, field2);

      (0,_interface__WEBPACK_IMPORTED_MODULE_2__.playTurn)(player1, player2, gameboard1, gameboard2, field1, field2);
    } else {
      (0,_interface__WEBPACK_IMPORTED_MODULE_2__.displayShipToAdd)(shipLength, shipDirection);
      (0,_interface__WEBPACK_IMPORTED_MODULE_2__.addShipOnField)(gameboard1, field1, shipLength, shipDirection);
    }
  });

  let player1 = (0,_player__WEBPACK_IMPORTED_MODULE_3__.player)();
  player1.changeStatus();
  let gameboard1 = (0,_gameboard__WEBPACK_IMPORTED_MODULE_0__.gameboard)();
  let player2 = (0,_player__WEBPACK_IMPORTED_MODULE_3__.player)();
  let gameboard2 = (0,_gameboard__WEBPACK_IMPORTED_MODULE_0__.gameboard)();

  let field1 = document.querySelector(".gameboards").children[0];
  (0,_interface__WEBPACK_IMPORTED_MODULE_2__.createBoard)(field1);
  let field2 = document.querySelector(".gameboards").children[1];
  (0,_interface__WEBPACK_IMPORTED_MODULE_2__.createBoard)(field2);

  (0,_interface__WEBPACK_IMPORTED_MODULE_2__.displayBoard)(gameboard1, field1);

  (0,_interface__WEBPACK_IMPORTED_MODULE_2__.addShipOnField2)(gameboard2);
  (0,_interface__WEBPACK_IMPORTED_MODULE_2__.displayBoard)(gameboard2, field2, 1);

  (0,_interface__WEBPACK_IMPORTED_MODULE_2__.displayShipToAdd)(shipLength, shipDirection);
  (0,_interface__WEBPACK_IMPORTED_MODULE_2__.addShipOnField)(gameboard1, field1, shipLength, shipDirection);
  pubsub_js__WEBPACK_IMPORTED_MODULE_1___default().subscribe("change_direction", () => {
    shipDirection = (0,_interface__WEBPACK_IMPORTED_MODULE_2__.changeShipDirection)(shipDirection);
    (0,_interface__WEBPACK_IMPORTED_MODULE_2__.displayShipToAdd)(shipLength, shipDirection);
    (0,_interface__WEBPACK_IMPORTED_MODULE_2__.addShipOnField)(gameboard1, field1, shipLength, shipDirection);
  });

  pubsub_js__WEBPACK_IMPORTED_MODULE_1___default().subscribe("hit_shot1", () => {
    (0,_interface__WEBPACK_IMPORTED_MODULE_2__.playTurn)(player1, player2, gameboard1, gameboard2, field1, field2);
  });
  pubsub_js__WEBPACK_IMPORTED_MODULE_1___default().subscribe("hit_shot2", () => {
    (0,_interface__WEBPACK_IMPORTED_MODULE_2__.playTurn)(player1, player2, gameboard1, gameboard2, field1, field2);
  });

  pubsub_js__WEBPACK_IMPORTED_MODULE_1___default().subscribe("missed_shot1", () => {
    player1.changeStatus();
    player2.changeStatus();
    (0,_interface__WEBPACK_IMPORTED_MODULE_2__.playTurn)(player1, player2, gameboard1, gameboard2, field1, field2);
  });
  pubsub_js__WEBPACK_IMPORTED_MODULE_1___default().subscribe("missed_shot2", () => {
    player1.changeStatus();
    player2.changeStatus();
    (0,_interface__WEBPACK_IMPORTED_MODULE_2__.playTurn)(player1, player2, gameboard1, gameboard2, field1, field2);
  });
};




/***/ }),

/***/ "./src/gameboard.js":
/*!**************************!*\
  !*** ./src/gameboard.js ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "gameboard": () => (/* binding */ gameboard)
/* harmony export */ });
/* harmony import */ var _ship__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ship */ "./src/ship.js");


const gameboard = () => {
  let board = [];
  let shipCount = 0;
  let ships = [];
  for (let i = 0; i < 10; i++) {
    board[i] = [];
    for (let j = 0; j < 10; j++) {
      board[i][j] = undefined;
    }
  }

  const addShip = (length, i, j, dir = [0, 1]) => {
    ships[shipCount] = (0,_ship__WEBPACK_IMPORTED_MODULE_0__.ship)(length);
    for (let k = 0; k < length; k++) {
      board[i - dir[1] * k][j + dir[0] * k] = shipCount;
    }
    shipCount++;
  };

  const receiveAttack = (i, j) => {
    /* if missed shot cell value will change to -1 
    if hit cell value will change to -2*/
    if (board[i][j] === undefined) {
      board[i][j] = -1;
    } else if (board[i][j] !== -1 && board[i][j] !== -2) {
      let ship = board[i][j];
      ships[ship].hit();
      board[i][j] = -2;
    }
  };

  const checkAllSunk = () => {
    for (let i = 0; i < ships.length; i++) {
      if (!ships[i].isSunk()) {
        return false;
      }
    }
    return true;
  };

  const getCoordinateStatus = (i, j) => {
    return board[i][j];
  };

  const getBoard = () => board;

  const getShip = (n) => ships[n];

  return {
    getBoard,
    addShip,
    getCoordinateStatus,
    receiveAttack,
    getShip,
    checkAllSunk,
  };
};




/***/ }),

/***/ "./src/interface.js":
/*!**************************!*\
  !*** ./src/interface.js ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "activateBoard": () => (/* binding */ activateBoard),
/* harmony export */   "addShipDisplay": () => (/* binding */ addShipDisplay),
/* harmony export */   "addShipOnField": () => (/* binding */ addShipOnField),
/* harmony export */   "addShipOnField2": () => (/* binding */ addShipOnField2),
/* harmony export */   "changeShipDirection": () => (/* binding */ changeShipDirection),
/* harmony export */   "createBoard": () => (/* binding */ createBoard),
/* harmony export */   "deactivateBoard": () => (/* binding */ deactivateBoard),
/* harmony export */   "displayBoard": () => (/* binding */ displayBoard),
/* harmony export */   "displayShipToAdd": () => (/* binding */ displayShipToAdd),
/* harmony export */   "playTurn": () => (/* binding */ playTurn),
/* harmony export */   "returnShipLength": () => (/* binding */ returnShipLength)
/* harmony export */ });
/* harmony import */ var _game__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./game */ "./src/game.js");
/* harmony import */ var _gameboard__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./gameboard */ "./src/gameboard.js");
/* harmony import */ var _player__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./player */ "./src/player.js");
/* harmony import */ var pubsub_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! pubsub-js */ "./node_modules/pubsub-js/src/pubsub.js");
/* harmony import */ var pubsub_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(pubsub_js__WEBPACK_IMPORTED_MODULE_3__);





function createBoard(field) {
  for (let j = 0; j < 10; j++) {
    let row = document.createElement("div");
    row.className = "row";
    for (let i = 0; i < 10; i++) {
      let cell = document.createElement("div");
      cell.className = "cell";
      row.appendChild(cell);
    }

    field.appendChild(row);
  }
}

function displayBoard(gameBoard, field, player = 0) {
  let board = gameBoard.getBoard();
  for (let i = 0; i < 10; i++) {
    let row = field.children[i];
    for (let j = 0; j < 10; j++) {
      let cell = row.children[j];
      if (board[i][j] === undefined) {
        cell.style.backgroundColor = "white";
      } else if (board[i][j] === -1) {
        cell.style.backgroundColor = "grey";
      } else if (board[i][j] === -2) {
        cell.style.backgroundColor = "red";
      } else {
        if (player === 0) {
          cell.style.backgroundColor = "black";
        }
      }
    }
  }
}

function activateBoard(gameBoard, field) {
  let board = gameBoard.getBoard();
  for (let i = 0; i < 10; i++) {
    let row = field.children[i];
    for (let j = 0; j < 10; j++) {
      let cell = row.children[j];
      if (board[i][j] !== -1 && board[i][j] !== -2) {
        cell.addEventListener("click", () => {
          gameBoard.receiveAttack(i, j);
          displayBoard(gameBoard, field, 1);
          if (gameBoard.getBoard()[i][j] === -1) {
            pubsub_js__WEBPACK_IMPORTED_MODULE_3___default().publish("missed_shot1");
          } else if (gameBoard.getBoard()[i][j] === -2) {
            pubsub_js__WEBPACK_IMPORTED_MODULE_3___default().publish("hit_shot1");
          }
        });
      }
    }
  }
}

function deactivateBoard(gameBoard, field, player) {
  while (field.firstChild) {
    field.removeChild(field.lastChild);
  }
  createBoard(field);
  displayBoard(gameBoard, field, player);
}

function playTurn(player1, player2, gameboard1, gameboard2, field1, field2) {
  console.log(player1.isTurn());
  if (player1.isTurn()) {
    deactivateBoard(gameboard2, field2, 1);
    activateBoard(gameboard2, field2);
  } else {
    setTimeout(() => {
      deactivateBoard(gameboard2, field2, 1);
      let hit = player2.hit(gameboard1);
      gameboard1.receiveAttack(hit[0], hit[1]);
      displayBoard(gameboard1, field1);
      if (gameboard1.getBoard()[hit[0]][hit[1]] === -1) {
        pubsub_js__WEBPACK_IMPORTED_MODULE_3___default().publish("missed_shot2");
      } else if (gameboard1.getBoard()[hit[0]][hit[1]] === -2) {
        pubsub_js__WEBPACK_IMPORTED_MODULE_3___default().publish("hit_shot2");
      }
    }, 500);
  }
}

function addShipDisplay() {
  let container = document.querySelector(".display");
  for (let i = 0; i < 49; i++) {
    let cell = document.createElement("div");
    container.appendChild(cell);
  }
  container.addEventListener("click", () => {
    pubsub_js__WEBPACK_IMPORTED_MODULE_3___default().publish("change_direction");
  });
}

function changeShipDirection(direction) {
  let dir = direction.toString();
  if (dir === "0,1") {
    direction = [1, 0];
  } else if (dir === "1,0") {
    direction = [0, -1];
  } else if (dir === "0,-1") {
    direction = [-1, 0];
  } else {
    direction = [0, 1];
  }

  return direction;
}

function displayShipToAdd(length, direction) {
  let container = document.querySelector(".display");
  for (let i = 0; i < 49; i++) {
    container.children[i].style.backgroundColor = "white";
  }
  for (let i = 0; i < length; i++) {
    container.children[
      24 - direction[1] * i * 7 + direction[0] * i
    ].style.backgroundColor = "black";
  }
  container.children[24].style.backgroundColor = "red";
  if (length === 0) {
    container.children[24].style.backgroundColor = "white";
  }
}

function addShipOnField(gameBoard, field, length, direction) {
  deactivateBoard(gameBoard, field, 0);

  activateBoard1(gameBoard, field, length, direction);
}

function activateBoard1(gameBoard, field, length, direction) {
  let board = gameBoard.getBoard();
  for (let i = 0; i < 10; i++) {
    let row = field.children[i];
    for (let j = 0; j < 10; j++) {
      let cell = row.children[j];
      if (board[i][j] === undefined) {
        cell.addEventListener("click", () => {
          if (checkIfShipFits(gameBoard, length, direction, i, j)) {
            gameBoard.addShip(length, i, j, direction);
            displayBoard(gameBoard, field);
            pubsub_js__WEBPACK_IMPORTED_MODULE_3___default().publish("ship_added");
          }
        });
      }
    }
  }
}

function checkIfShipFits(gameBoard, length, direction, i, j) {
  let board = gameBoard.getBoard();
  let rowRange = [0, 10];
  let cellRange = [0, 10];

  if (direction[1] === 1) {
    rowRange = [length - 1, 10];
  } else if (direction[1] === -1) {
    rowRange = [0, 10 - length + 1];
  }
  if (direction[0] === 1) {
    cellRange = [0, 10 - length + 1];
  } else if (direction[0] === -1) {
    cellRange = [length - 1, 10];
  }
  if (
    i < rowRange[0] ||
    i >= rowRange[1] ||
    j < cellRange[0] ||
    j >= cellRange[1]
  ) {
    return false;
  }

  for (let k = 0; k < length; k++) {
    if (board[i - direction[1] * k][j + direction[0] * k] !== undefined) {
      return false;
    }
  }

  return true;
}

function addShipOnField2(gameBoard) {
  for (let i = 0; i < 10; i++) {
    let direction = generateRandomDir();
    let length = returnShipLength(i);
    let point = generateShipBase(gameBoard);

    do {
      point = generateShipBase(gameBoard);
    } while (
      !checkIfShipFits(gameBoard, length, direction, point[0], point[1])
    );

    gameBoard.addShip(length, point[0], point[1], direction);
  }
}

function returnShipLength(shipCount) {
  let shipLength = 4;
  if (shipCount > 5) {
    shipLength = 1;
  } else if (shipCount > 2) {
    shipLength = 2;
  } else if (shipCount > 0) {
    shipLength = 3;
  }
  return shipLength;
}

function generateRandomDir() {
  let x = Math.floor(Math.random() * 4);
  if (x === 0) {
    return [0, 1];
  } else if (x === 1) {
    return [1, 0];
  } else if (x === 2) {
    return [0, -1];
  } else if (x === 3) {
    return [-1, 0];
  }
}

function generateShipBase(board) {
  let b = board.getBoard();
  let i;
  let j;
  do {
    i = Math.floor(Math.random() * 10);
    j = Math.floor(Math.random() * 10);
  } while (b[i][j] !== undefined);
  return [i, j];
}

function changeStatus() {
  player1.changeStatus();
  player2.changeStatus();
}




/***/ }),

/***/ "./src/player.js":
/*!***********************!*\
  !*** ./src/player.js ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "player": () => (/* binding */ player)
/* harmony export */ });
const player = () => {
  let isCurrent = false;
  const isTurn = () => isCurrent;

  const changeStatus = () => {
    isCurrent = !isCurrent;
  };

  const hit = (board) => {
    let b = board.getBoard();
    let i;
    let j;
    let options = [];
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        if (b[i][j] != -1 && b[i][j] != -2) {
          options.push([i, j]);
        }
      }
    }
    let x = Math.floor(Math.random() * options.length);
    return options[x];
  };

  return { isTurn, changeStatus, hit };
};




/***/ }),

/***/ "./src/ship.js":
/*!*********************!*\
  !*** ./src/ship.js ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ship": () => (/* binding */ ship)
/* harmony export */ });
const ship = (length) => {
  let hits = 0;
  let sunk = false;

  const hit = () => {
    hits++;
  };

  const isSunk = () => {
    if (hits >= length) {
      return true;
    } else {
      return false;
    }
  };

  const getHits = () => hits;
  return { length, getHits, isSunk, hit };
};




/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			loaded: false,
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/node module decorator */
/******/ 	(() => {
/******/ 		__webpack_require__.nmd = (module) => {
/******/ 			module.paths = [];
/******/ 			if (!module.children) module.children = [];
/******/ 			return module;
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _game__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./game */ "./src/game.js");


(0,_game__WEBPACK_IMPORTED_MODULE_0__.game)();

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Q0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQWNFOzs7Ozs7Ozs7Ozs7Ozs7O0FDbFFGO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9CQUFvQixRQUFRO0FBQzVCLHNCQUFzQixRQUFRO0FBQzlCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsV0FBVztBQUNYOztBQUVrQjs7Ozs7Ozs7Ozs7Ozs7OztBQzNCbEI7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBOztBQUVBO0FBQ0EsV0FBVztBQUNYOztBQUVnQjs7Ozs7OztVQ3BCaEI7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7OztXQ3pCQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsaUNBQWlDLFdBQVc7V0FDNUM7V0FDQTs7Ozs7V0NQQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLHlDQUF5Qyx3Q0FBd0M7V0FDakY7V0FDQTtXQUNBOzs7OztXQ1BBOzs7OztXQ0FBO1dBQ0E7V0FDQTtXQUNBLHVEQUF1RCxpQkFBaUI7V0FDeEU7V0FDQSxnREFBZ0QsYUFBYTtXQUM3RDs7Ozs7V0NOQTtXQUNBO1dBQ0E7V0FDQTtXQUNBOzs7Ozs7Ozs7Ozs7O0FDSjhCOztBQUU5QiwyQ0FBSSIsInNvdXJjZXMiOlsid2VicGFjazovL2JhdHRsZXNoaXAvLi9ub2RlX21vZHVsZXMvcHVic3ViLWpzL3NyYy9wdWJzdWIuanMiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC8uL3NyYy9nYW1lLmpzIiwid2VicGFjazovL2JhdHRsZXNoaXAvLi9zcmMvZ2FtZWJvYXJkLmpzIiwid2VicGFjazovL2JhdHRsZXNoaXAvLi9zcmMvaW50ZXJmYWNlLmpzIiwid2VicGFjazovL2JhdHRsZXNoaXAvLi9zcmMvcGxheWVyLmpzIiwid2VicGFjazovL2JhdHRsZXNoaXAvLi9zcmMvc2hpcC5qcyIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2JhdHRsZXNoaXAvd2VicGFjay9ydW50aW1lL2NvbXBhdCBnZXQgZGVmYXVsdCBleHBvcnQiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL2JhdHRsZXNoaXAvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwL3dlYnBhY2svcnVudGltZS9ub2RlIG1vZHVsZSBkZWNvcmF0b3IiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC8uL3NyYy9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgMjAxMCwyMDExLDIwMTIsMjAxMywyMDE0IE1vcmdhbiBSb2RlcmljayBodHRwOi8vcm9kZXJpY2suZGtcbiAqIExpY2Vuc2U6IE1JVCAtIGh0dHA6Ly9tcmducmRyY2subWl0LWxpY2Vuc2Uub3JnXG4gKlxuICogaHR0cHM6Ly9naXRodWIuY29tL21yb2Rlcmljay9QdWJTdWJKU1xuICovXG5cbihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSl7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIFB1YlN1YiA9IHt9O1xuXG4gICAgaWYgKHJvb3QuUHViU3ViKSB7XG4gICAgICAgIFB1YlN1YiA9IHJvb3QuUHViU3ViO1xuICAgICAgICBjb25zb2xlLndhcm4oXCJQdWJTdWIgYWxyZWFkeSBsb2FkZWQsIHVzaW5nIGV4aXN0aW5nIHZlcnNpb25cIik7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5QdWJTdWIgPSBQdWJTdWI7XG4gICAgICAgIGZhY3RvcnkoUHViU3ViKTtcbiAgICB9XG4gICAgLy8gQ29tbW9uSlMgYW5kIE5vZGUuanMgbW9kdWxlIHN1cHBvcnRcbiAgICBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKXtcbiAgICAgICAgaWYgKG1vZHVsZSAhPT0gdW5kZWZpbmVkICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gICAgICAgICAgICBleHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSBQdWJTdWI7IC8vIE5vZGUuanMgc3BlY2lmaWMgYG1vZHVsZS5leHBvcnRzYFxuICAgICAgICB9XG4gICAgICAgIGV4cG9ydHMuUHViU3ViID0gUHViU3ViOyAvLyBDb21tb25KUyBtb2R1bGUgMS4xLjEgc3BlY1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSBQdWJTdWI7IC8vIENvbW1vbkpTXG4gICAgfVxuICAgIC8vIEFNRCBzdXBwb3J0XG4gICAgLyogZXNsaW50LWRpc2FibGUgbm8tdW5kZWYgKi9cbiAgICBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpe1xuICAgICAgICBkZWZpbmUoZnVuY3Rpb24oKSB7IHJldHVybiBQdWJTdWI7IH0pO1xuICAgICAgICAvKiBlc2xpbnQtZW5hYmxlIG5vLXVuZGVmICovXG4gICAgfVxuXG59KCggdHlwZW9mIHdpbmRvdyA9PT0gJ29iamVjdCcgJiYgd2luZG93ICkgfHwgdGhpcywgZnVuY3Rpb24gKFB1YlN1Yil7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIG1lc3NhZ2VzID0ge30sXG4gICAgICAgIGxhc3RVaWQgPSAtMSxcbiAgICAgICAgQUxMX1NVQlNDUklCSU5HX01TRyA9ICcqJztcblxuICAgIGZ1bmN0aW9uIGhhc0tleXMob2JqKXtcbiAgICAgICAgdmFyIGtleTtcblxuICAgICAgICBmb3IgKGtleSBpbiBvYmope1xuICAgICAgICAgICAgaWYgKCBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBrZXkpICl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSBmdW5jdGlvbiB0aGF0IHRocm93cyB0aGUgcGFzc2VkIGV4Y2VwdGlvbiwgZm9yIHVzZSBhcyBhcmd1bWVudCBmb3Igc2V0VGltZW91dFxuICAgICAqIEBhbGlhcyB0aHJvd0V4Y2VwdGlvblxuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBwYXJhbSB7IE9iamVjdCB9IGV4IEFuIEVycm9yIG9iamVjdFxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHRocm93RXhjZXB0aW9uKCBleCApe1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gcmVUaHJvd0V4Y2VwdGlvbigpe1xuICAgICAgICAgICAgdGhyb3cgZXg7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY2FsbFN1YnNjcmliZXJXaXRoRGVsYXllZEV4Y2VwdGlvbnMoIHN1YnNjcmliZXIsIG1lc3NhZ2UsIGRhdGEgKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHN1YnNjcmliZXIoIG1lc3NhZ2UsIGRhdGEgKTtcbiAgICAgICAgfSBjYXRjaCggZXggKXtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoIHRocm93RXhjZXB0aW9uKCBleCApLCAwKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNhbGxTdWJzY3JpYmVyV2l0aEltbWVkaWF0ZUV4Y2VwdGlvbnMoIHN1YnNjcmliZXIsIG1lc3NhZ2UsIGRhdGEgKXtcbiAgICAgICAgc3Vic2NyaWJlciggbWVzc2FnZSwgZGF0YSApO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGRlbGl2ZXJNZXNzYWdlKCBvcmlnaW5hbE1lc3NhZ2UsIG1hdGNoZWRNZXNzYWdlLCBkYXRhLCBpbW1lZGlhdGVFeGNlcHRpb25zICl7XG4gICAgICAgIHZhciBzdWJzY3JpYmVycyA9IG1lc3NhZ2VzW21hdGNoZWRNZXNzYWdlXSxcbiAgICAgICAgICAgIGNhbGxTdWJzY3JpYmVyID0gaW1tZWRpYXRlRXhjZXB0aW9ucyA/IGNhbGxTdWJzY3JpYmVyV2l0aEltbWVkaWF0ZUV4Y2VwdGlvbnMgOiBjYWxsU3Vic2NyaWJlcldpdGhEZWxheWVkRXhjZXB0aW9ucyxcbiAgICAgICAgICAgIHM7XG5cbiAgICAgICAgaWYgKCAhT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKCBtZXNzYWdlcywgbWF0Y2hlZE1lc3NhZ2UgKSApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAocyBpbiBzdWJzY3JpYmVycyl7XG4gICAgICAgICAgICBpZiAoIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzdWJzY3JpYmVycywgcykpe1xuICAgICAgICAgICAgICAgIGNhbGxTdWJzY3JpYmVyKCBzdWJzY3JpYmVyc1tzXSwgb3JpZ2luYWxNZXNzYWdlLCBkYXRhICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjcmVhdGVEZWxpdmVyeUZ1bmN0aW9uKCBtZXNzYWdlLCBkYXRhLCBpbW1lZGlhdGVFeGNlcHRpb25zICl7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBkZWxpdmVyTmFtZXNwYWNlZCgpe1xuICAgICAgICAgICAgdmFyIHRvcGljID0gU3RyaW5nKCBtZXNzYWdlICksXG4gICAgICAgICAgICAgICAgcG9zaXRpb24gPSB0b3BpYy5sYXN0SW5kZXhPZiggJy4nICk7XG5cbiAgICAgICAgICAgIC8vIGRlbGl2ZXIgdGhlIG1lc3NhZ2UgYXMgaXQgaXMgbm93XG4gICAgICAgICAgICBkZWxpdmVyTWVzc2FnZShtZXNzYWdlLCBtZXNzYWdlLCBkYXRhLCBpbW1lZGlhdGVFeGNlcHRpb25zKTtcblxuICAgICAgICAgICAgLy8gdHJpbSB0aGUgaGllcmFyY2h5IGFuZCBkZWxpdmVyIG1lc3NhZ2UgdG8gZWFjaCBsZXZlbFxuICAgICAgICAgICAgd2hpbGUoIHBvc2l0aW9uICE9PSAtMSApe1xuICAgICAgICAgICAgICAgIHRvcGljID0gdG9waWMuc3Vic3RyKCAwLCBwb3NpdGlvbiApO1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uID0gdG9waWMubGFzdEluZGV4T2YoJy4nKTtcbiAgICAgICAgICAgICAgICBkZWxpdmVyTWVzc2FnZSggbWVzc2FnZSwgdG9waWMsIGRhdGEsIGltbWVkaWF0ZUV4Y2VwdGlvbnMgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZGVsaXZlck1lc3NhZ2UobWVzc2FnZSwgQUxMX1NVQlNDUklCSU5HX01TRywgZGF0YSwgaW1tZWRpYXRlRXhjZXB0aW9ucyk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaGFzRGlyZWN0U3Vic2NyaWJlcnNGb3IoIG1lc3NhZ2UgKSB7XG4gICAgICAgIHZhciB0b3BpYyA9IFN0cmluZyggbWVzc2FnZSApLFxuICAgICAgICAgICAgZm91bmQgPSBCb29sZWFuKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCggbWVzc2FnZXMsIHRvcGljICkgJiYgaGFzS2V5cyhtZXNzYWdlc1t0b3BpY10pKTtcblxuICAgICAgICByZXR1cm4gZm91bmQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbWVzc2FnZUhhc1N1YnNjcmliZXJzKCBtZXNzYWdlICl7XG4gICAgICAgIHZhciB0b3BpYyA9IFN0cmluZyggbWVzc2FnZSApLFxuICAgICAgICAgICAgZm91bmQgPSBoYXNEaXJlY3RTdWJzY3JpYmVyc0Zvcih0b3BpYykgfHwgaGFzRGlyZWN0U3Vic2NyaWJlcnNGb3IoQUxMX1NVQlNDUklCSU5HX01TRyksXG4gICAgICAgICAgICBwb3NpdGlvbiA9IHRvcGljLmxhc3RJbmRleE9mKCAnLicgKTtcblxuICAgICAgICB3aGlsZSAoICFmb3VuZCAmJiBwb3NpdGlvbiAhPT0gLTEgKXtcbiAgICAgICAgICAgIHRvcGljID0gdG9waWMuc3Vic3RyKCAwLCBwb3NpdGlvbiApO1xuICAgICAgICAgICAgcG9zaXRpb24gPSB0b3BpYy5sYXN0SW5kZXhPZiggJy4nICk7XG4gICAgICAgICAgICBmb3VuZCA9IGhhc0RpcmVjdFN1YnNjcmliZXJzRm9yKHRvcGljKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmb3VuZDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwdWJsaXNoKCBtZXNzYWdlLCBkYXRhLCBzeW5jLCBpbW1lZGlhdGVFeGNlcHRpb25zICl7XG4gICAgICAgIG1lc3NhZ2UgPSAodHlwZW9mIG1lc3NhZ2UgPT09ICdzeW1ib2wnKSA/IG1lc3NhZ2UudG9TdHJpbmcoKSA6IG1lc3NhZ2U7XG5cbiAgICAgICAgdmFyIGRlbGl2ZXIgPSBjcmVhdGVEZWxpdmVyeUZ1bmN0aW9uKCBtZXNzYWdlLCBkYXRhLCBpbW1lZGlhdGVFeGNlcHRpb25zICksXG4gICAgICAgICAgICBoYXNTdWJzY3JpYmVycyA9IG1lc3NhZ2VIYXNTdWJzY3JpYmVycyggbWVzc2FnZSApO1xuXG4gICAgICAgIGlmICggIWhhc1N1YnNjcmliZXJzICl7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIHN5bmMgPT09IHRydWUgKXtcbiAgICAgICAgICAgIGRlbGl2ZXIoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoIGRlbGl2ZXIsIDAgKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQdWJsaXNoZXMgdGhlIG1lc3NhZ2UsIHBhc3NpbmcgdGhlIGRhdGEgdG8gaXQncyBzdWJzY3JpYmVyc1xuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBhbGlhcyBwdWJsaXNoXG4gICAgICogQHBhcmFtIHsgU3RyaW5nIH0gbWVzc2FnZSBUaGUgbWVzc2FnZSB0byBwdWJsaXNoXG4gICAgICogQHBhcmFtIHt9IGRhdGEgVGhlIGRhdGEgdG8gcGFzcyB0byBzdWJzY3JpYmVyc1xuICAgICAqIEByZXR1cm4geyBCb29sZWFuIH1cbiAgICAgKi9cbiAgICBQdWJTdWIucHVibGlzaCA9IGZ1bmN0aW9uKCBtZXNzYWdlLCBkYXRhICl7XG4gICAgICAgIHJldHVybiBwdWJsaXNoKCBtZXNzYWdlLCBkYXRhLCBmYWxzZSwgUHViU3ViLmltbWVkaWF0ZUV4Y2VwdGlvbnMgKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogUHVibGlzaGVzIHRoZSBtZXNzYWdlIHN5bmNocm9ub3VzbHksIHBhc3NpbmcgdGhlIGRhdGEgdG8gaXQncyBzdWJzY3JpYmVyc1xuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBhbGlhcyBwdWJsaXNoU3luY1xuICAgICAqIEBwYXJhbSB7IFN0cmluZyB9IG1lc3NhZ2UgVGhlIG1lc3NhZ2UgdG8gcHVibGlzaFxuICAgICAqIEBwYXJhbSB7fSBkYXRhIFRoZSBkYXRhIHRvIHBhc3MgdG8gc3Vic2NyaWJlcnNcbiAgICAgKiBAcmV0dXJuIHsgQm9vbGVhbiB9XG4gICAgICovXG4gICAgUHViU3ViLnB1Ymxpc2hTeW5jID0gZnVuY3Rpb24oIG1lc3NhZ2UsIGRhdGEgKXtcbiAgICAgICAgcmV0dXJuIHB1Ymxpc2goIG1lc3NhZ2UsIGRhdGEsIHRydWUsIFB1YlN1Yi5pbW1lZGlhdGVFeGNlcHRpb25zICk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFN1YnNjcmliZXMgdGhlIHBhc3NlZCBmdW5jdGlvbiB0byB0aGUgcGFzc2VkIG1lc3NhZ2UuIEV2ZXJ5IHJldHVybmVkIHRva2VuIGlzIHVuaXF1ZSBhbmQgc2hvdWxkIGJlIHN0b3JlZCBpZiB5b3UgbmVlZCB0byB1bnN1YnNjcmliZVxuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBhbGlhcyBzdWJzY3JpYmVcbiAgICAgKiBAcGFyYW0geyBTdHJpbmcgfSBtZXNzYWdlIFRoZSBtZXNzYWdlIHRvIHN1YnNjcmliZSB0b1xuICAgICAqIEBwYXJhbSB7IEZ1bmN0aW9uIH0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gY2FsbCB3aGVuIGEgbmV3IG1lc3NhZ2UgaXMgcHVibGlzaGVkXG4gICAgICogQHJldHVybiB7IFN0cmluZyB9XG4gICAgICovXG4gICAgUHViU3ViLnN1YnNjcmliZSA9IGZ1bmN0aW9uKCBtZXNzYWdlLCBmdW5jICl7XG4gICAgICAgIGlmICggdHlwZW9mIGZ1bmMgIT09ICdmdW5jdGlvbicpe1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgbWVzc2FnZSA9ICh0eXBlb2YgbWVzc2FnZSA9PT0gJ3N5bWJvbCcpID8gbWVzc2FnZS50b1N0cmluZygpIDogbWVzc2FnZTtcblxuICAgICAgICAvLyBtZXNzYWdlIGlzIG5vdCByZWdpc3RlcmVkIHlldFxuICAgICAgICBpZiAoICFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoIG1lc3NhZ2VzLCBtZXNzYWdlICkgKXtcbiAgICAgICAgICAgIG1lc3NhZ2VzW21lc3NhZ2VdID0ge307XG4gICAgICAgIH1cblxuICAgICAgICAvLyBmb3JjaW5nIHRva2VuIGFzIFN0cmluZywgdG8gYWxsb3cgZm9yIGZ1dHVyZSBleHBhbnNpb25zIHdpdGhvdXQgYnJlYWtpbmcgdXNhZ2VcbiAgICAgICAgLy8gYW5kIGFsbG93IGZvciBlYXN5IHVzZSBhcyBrZXkgbmFtZXMgZm9yIHRoZSAnbWVzc2FnZXMnIG9iamVjdFxuICAgICAgICB2YXIgdG9rZW4gPSAndWlkXycgKyBTdHJpbmcoKytsYXN0VWlkKTtcbiAgICAgICAgbWVzc2FnZXNbbWVzc2FnZV1bdG9rZW5dID0gZnVuYztcblxuICAgICAgICAvLyByZXR1cm4gdG9rZW4gZm9yIHVuc3Vic2NyaWJpbmdcbiAgICAgICAgcmV0dXJuIHRva2VuO1xuICAgIH07XG5cbiAgICBQdWJTdWIuc3Vic2NyaWJlQWxsID0gZnVuY3Rpb24oIGZ1bmMgKXtcbiAgICAgICAgcmV0dXJuIFB1YlN1Yi5zdWJzY3JpYmUoQUxMX1NVQlNDUklCSU5HX01TRywgZnVuYyk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFN1YnNjcmliZXMgdGhlIHBhc3NlZCBmdW5jdGlvbiB0byB0aGUgcGFzc2VkIG1lc3NhZ2Ugb25jZVxuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBhbGlhcyBzdWJzY3JpYmVPbmNlXG4gICAgICogQHBhcmFtIHsgU3RyaW5nIH0gbWVzc2FnZSBUaGUgbWVzc2FnZSB0byBzdWJzY3JpYmUgdG9cbiAgICAgKiBAcGFyYW0geyBGdW5jdGlvbiB9IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGNhbGwgd2hlbiBhIG5ldyBtZXNzYWdlIGlzIHB1Ymxpc2hlZFxuICAgICAqIEByZXR1cm4geyBQdWJTdWIgfVxuICAgICAqL1xuICAgIFB1YlN1Yi5zdWJzY3JpYmVPbmNlID0gZnVuY3Rpb24oIG1lc3NhZ2UsIGZ1bmMgKXtcbiAgICAgICAgdmFyIHRva2VuID0gUHViU3ViLnN1YnNjcmliZSggbWVzc2FnZSwgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIC8vIGJlZm9yZSBmdW5jIGFwcGx5LCB1bnN1YnNjcmliZSBtZXNzYWdlXG4gICAgICAgICAgICBQdWJTdWIudW5zdWJzY3JpYmUoIHRva2VuICk7XG4gICAgICAgICAgICBmdW5jLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBQdWJTdWI7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIENsZWFycyBhbGwgc3Vic2NyaXB0aW9uc1xuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAYWxpYXMgY2xlYXJBbGxTdWJzY3JpcHRpb25zXG4gICAgICovXG4gICAgUHViU3ViLmNsZWFyQWxsU3Vic2NyaXB0aW9ucyA9IGZ1bmN0aW9uIGNsZWFyQWxsU3Vic2NyaXB0aW9ucygpe1xuICAgICAgICBtZXNzYWdlcyA9IHt9O1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBDbGVhciBzdWJzY3JpcHRpb25zIGJ5IHRoZSB0b3BpY1xuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAYWxpYXMgY2xlYXJBbGxTdWJzY3JpcHRpb25zXG4gICAgICogQHJldHVybiB7IGludCB9XG4gICAgICovXG4gICAgUHViU3ViLmNsZWFyU3Vic2NyaXB0aW9ucyA9IGZ1bmN0aW9uIGNsZWFyU3Vic2NyaXB0aW9ucyh0b3BpYyl7XG4gICAgICAgIHZhciBtO1xuICAgICAgICBmb3IgKG0gaW4gbWVzc2FnZXMpe1xuICAgICAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChtZXNzYWdlcywgbSkgJiYgbS5pbmRleE9mKHRvcGljKSA9PT0gMCl7XG4gICAgICAgICAgICAgICAgZGVsZXRlIG1lc3NhZ2VzW21dO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAgIENvdW50IHN1YnNjcmlwdGlvbnMgYnkgdGhlIHRvcGljXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogQHB1YmxpY1xuICAgICAqIEBhbGlhcyBjb3VudFN1YnNjcmlwdGlvbnNcbiAgICAgKiBAcmV0dXJuIHsgQXJyYXkgfVxuICAgICovXG4gICAgUHViU3ViLmNvdW50U3Vic2NyaXB0aW9ucyA9IGZ1bmN0aW9uIGNvdW50U3Vic2NyaXB0aW9ucyh0b3BpYyl7XG4gICAgICAgIHZhciBtO1xuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW51c2VkLXZhcnNcbiAgICAgICAgdmFyIHRva2VuO1xuICAgICAgICB2YXIgY291bnQgPSAwO1xuICAgICAgICBmb3IgKG0gaW4gbWVzc2FnZXMpIHtcbiAgICAgICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwobWVzc2FnZXMsIG0pICYmIG0uaW5kZXhPZih0b3BpYykgPT09IDApIHtcbiAgICAgICAgICAgICAgICBmb3IgKHRva2VuIGluIG1lc3NhZ2VzW21dKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvdW50Kys7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb3VudDtcbiAgICB9O1xuXG5cbiAgICAvKipcbiAgICAgICBHZXRzIHN1YnNjcmlwdGlvbnMgYnkgdGhlIHRvcGljXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogQHB1YmxpY1xuICAgICAqIEBhbGlhcyBnZXRTdWJzY3JpcHRpb25zXG4gICAgKi9cbiAgICBQdWJTdWIuZ2V0U3Vic2NyaXB0aW9ucyA9IGZ1bmN0aW9uIGdldFN1YnNjcmlwdGlvbnModG9waWMpe1xuICAgICAgICB2YXIgbTtcbiAgICAgICAgdmFyIGxpc3QgPSBbXTtcbiAgICAgICAgZm9yIChtIGluIG1lc3NhZ2VzKXtcbiAgICAgICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwobWVzc2FnZXMsIG0pICYmIG0uaW5kZXhPZih0b3BpYykgPT09IDApe1xuICAgICAgICAgICAgICAgIGxpc3QucHVzaChtKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbGlzdDtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBzdWJzY3JpcHRpb25zXG4gICAgICpcbiAgICAgKiAtIFdoZW4gcGFzc2VkIGEgdG9rZW4sIHJlbW92ZXMgYSBzcGVjaWZpYyBzdWJzY3JpcHRpb24uXG4gICAgICpcblx0ICogLSBXaGVuIHBhc3NlZCBhIGZ1bmN0aW9uLCByZW1vdmVzIGFsbCBzdWJzY3JpcHRpb25zIGZvciB0aGF0IGZ1bmN0aW9uXG4gICAgICpcblx0ICogLSBXaGVuIHBhc3NlZCBhIHRvcGljLCByZW1vdmVzIGFsbCBzdWJzY3JpcHRpb25zIGZvciB0aGF0IHRvcGljIChoaWVyYXJjaHkpXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogQHB1YmxpY1xuICAgICAqIEBhbGlhcyBzdWJzY3JpYmVPbmNlXG4gICAgICogQHBhcmFtIHsgU3RyaW5nIHwgRnVuY3Rpb24gfSB2YWx1ZSBBIHRva2VuLCBmdW5jdGlvbiBvciB0b3BpYyB0byB1bnN1YnNjcmliZSBmcm9tXG4gICAgICogQGV4YW1wbGUgLy8gVW5zdWJzY3JpYmluZyB3aXRoIGEgdG9rZW5cbiAgICAgKiB2YXIgdG9rZW4gPSBQdWJTdWIuc3Vic2NyaWJlKCdteXRvcGljJywgbXlGdW5jKTtcbiAgICAgKiBQdWJTdWIudW5zdWJzY3JpYmUodG9rZW4pO1xuICAgICAqIEBleGFtcGxlIC8vIFVuc3Vic2NyaWJpbmcgd2l0aCBhIGZ1bmN0aW9uXG4gICAgICogUHViU3ViLnVuc3Vic2NyaWJlKG15RnVuYyk7XG4gICAgICogQGV4YW1wbGUgLy8gVW5zdWJzY3JpYmluZyBmcm9tIGEgdG9waWNcbiAgICAgKiBQdWJTdWIudW5zdWJzY3JpYmUoJ215dG9waWMnKTtcbiAgICAgKi9cbiAgICBQdWJTdWIudW5zdWJzY3JpYmUgPSBmdW5jdGlvbih2YWx1ZSl7XG4gICAgICAgIHZhciBkZXNjZW5kYW50VG9waWNFeGlzdHMgPSBmdW5jdGlvbih0b3BpYykge1xuICAgICAgICAgICAgICAgIHZhciBtO1xuICAgICAgICAgICAgICAgIGZvciAoIG0gaW4gbWVzc2FnZXMgKXtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwobWVzc2FnZXMsIG0pICYmIG0uaW5kZXhPZih0b3BpYykgPT09IDAgKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGEgZGVzY2VuZGFudCBvZiB0aGUgdG9waWMgZXhpc3RzOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgaXNUb3BpYyAgICA9IHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgKCBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwobWVzc2FnZXMsIHZhbHVlKSB8fCBkZXNjZW5kYW50VG9waWNFeGlzdHModmFsdWUpICksXG4gICAgICAgICAgICBpc1Rva2VuICAgID0gIWlzVG9waWMgJiYgdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyxcbiAgICAgICAgICAgIGlzRnVuY3Rpb24gPSB0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicsXG4gICAgICAgICAgICByZXN1bHQgPSBmYWxzZSxcbiAgICAgICAgICAgIG0sIG1lc3NhZ2UsIHQ7XG5cbiAgICAgICAgaWYgKGlzVG9waWMpe1xuICAgICAgICAgICAgUHViU3ViLmNsZWFyU3Vic2NyaXB0aW9ucyh2YWx1ZSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKCBtIGluIG1lc3NhZ2VzICl7XG4gICAgICAgICAgICBpZiAoIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCggbWVzc2FnZXMsIG0gKSApe1xuICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBtZXNzYWdlc1ttXTtcblxuICAgICAgICAgICAgICAgIGlmICggaXNUb2tlbiAmJiBtZXNzYWdlW3ZhbHVlXSApe1xuICAgICAgICAgICAgICAgICAgICBkZWxldGUgbWVzc2FnZVt2YWx1ZV07XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAvLyB0b2tlbnMgYXJlIHVuaXF1ZSwgc28gd2UgY2FuIGp1c3Qgc3RvcCBoZXJlXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChpc0Z1bmN0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAoIHQgaW4gbWVzc2FnZSApe1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChtZXNzYWdlLCB0KSAmJiBtZXNzYWdlW3RdID09PSB2YWx1ZSl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIG1lc3NhZ2VbdF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbn0pKTtcbiIsImltcG9ydCB7IGdhbWVib2FyZCB9IGZyb20gXCIuL2dhbWVib2FyZFwiO1xuaW1wb3J0IFB1YlN1YiwgeyBwdWJsaXNoU3luYyB9IGZyb20gXCJwdWJzdWItanNcIjtcbmltcG9ydCB7XG4gIGFjdGl2YXRlQm9hcmQsXG4gIGFkZFNoaXBEaXNwbGF5LFxuICBhZGRTaGlwT25GaWVsZCxcbiAgYWRkU2hpcE9uRmllbGQyLFxuICBjaGFuZ2VTaGlwRGlyZWN0aW9uLFxuICBjcmVhdGVCb2FyZCxcbiAgZGVhY3RpdmF0ZUJvYXJkLFxuICBkaXNwbGF5Qm9hcmQsXG4gIGRpc3BsYXlTaGlwVG9BZGQsXG4gIHBsYXlUdXJuLFxuICByZXR1cm5TaGlwTGVuZ3RoLFxufSBmcm9tIFwiLi9pbnRlcmZhY2VcIjtcbmltcG9ydCB7IHBsYXllciB9IGZyb20gXCIuL3BsYXllclwiO1xuXG5jb25zdCBnYW1lID0gKCkgPT4ge1xuICBhZGRTaGlwRGlzcGxheSgpO1xuICBsZXQgc2hpcERpcmVjdGlvbiA9IFswLCAxXTtcbiAgbGV0IHNoaXBDb3VudCA9IDA7XG4gIGxldCBzaGlwTGVuZ3RoID0gNDtcblxuICBQdWJTdWIuc3Vic2NyaWJlKFwic2hpcF9hZGRlZFwiLCAoKSA9PiB7XG4gICAgc2hpcENvdW50ICs9IDE7XG4gICAgc2hpcExlbmd0aCA9IHJldHVyblNoaXBMZW5ndGgoc2hpcENvdW50KTtcbiAgICBpZiAoc2hpcENvdW50ID49IDEwKSB7XG4gICAgICBkaXNwbGF5U2hpcFRvQWRkKDAsIHNoaXBEaXJlY3Rpb24pO1xuICAgICAgZGVhY3RpdmF0ZUJvYXJkKGdhbWVib2FyZDEsIGZpZWxkMSk7XG4gICAgICBhY3RpdmF0ZUJvYXJkKGdhbWVib2FyZDIsIGZpZWxkMik7XG5cbiAgICAgIHBsYXlUdXJuKHBsYXllcjEsIHBsYXllcjIsIGdhbWVib2FyZDEsIGdhbWVib2FyZDIsIGZpZWxkMSwgZmllbGQyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZGlzcGxheVNoaXBUb0FkZChzaGlwTGVuZ3RoLCBzaGlwRGlyZWN0aW9uKTtcbiAgICAgIGFkZFNoaXBPbkZpZWxkKGdhbWVib2FyZDEsIGZpZWxkMSwgc2hpcExlbmd0aCwgc2hpcERpcmVjdGlvbik7XG4gICAgfVxuICB9KTtcblxuICBsZXQgcGxheWVyMSA9IHBsYXllcigpO1xuICBwbGF5ZXIxLmNoYW5nZVN0YXR1cygpO1xuICBsZXQgZ2FtZWJvYXJkMSA9IGdhbWVib2FyZCgpO1xuICBsZXQgcGxheWVyMiA9IHBsYXllcigpO1xuICBsZXQgZ2FtZWJvYXJkMiA9IGdhbWVib2FyZCgpO1xuXG4gIGxldCBmaWVsZDEgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmdhbWVib2FyZHNcIikuY2hpbGRyZW5bMF07XG4gIGNyZWF0ZUJvYXJkKGZpZWxkMSk7XG4gIGxldCBmaWVsZDIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmdhbWVib2FyZHNcIikuY2hpbGRyZW5bMV07XG4gIGNyZWF0ZUJvYXJkKGZpZWxkMik7XG5cbiAgZGlzcGxheUJvYXJkKGdhbWVib2FyZDEsIGZpZWxkMSk7XG5cbiAgYWRkU2hpcE9uRmllbGQyKGdhbWVib2FyZDIpO1xuICBkaXNwbGF5Qm9hcmQoZ2FtZWJvYXJkMiwgZmllbGQyLCAxKTtcblxuICBkaXNwbGF5U2hpcFRvQWRkKHNoaXBMZW5ndGgsIHNoaXBEaXJlY3Rpb24pO1xuICBhZGRTaGlwT25GaWVsZChnYW1lYm9hcmQxLCBmaWVsZDEsIHNoaXBMZW5ndGgsIHNoaXBEaXJlY3Rpb24pO1xuICBQdWJTdWIuc3Vic2NyaWJlKFwiY2hhbmdlX2RpcmVjdGlvblwiLCAoKSA9PiB7XG4gICAgc2hpcERpcmVjdGlvbiA9IGNoYW5nZVNoaXBEaXJlY3Rpb24oc2hpcERpcmVjdGlvbik7XG4gICAgZGlzcGxheVNoaXBUb0FkZChzaGlwTGVuZ3RoLCBzaGlwRGlyZWN0aW9uKTtcbiAgICBhZGRTaGlwT25GaWVsZChnYW1lYm9hcmQxLCBmaWVsZDEsIHNoaXBMZW5ndGgsIHNoaXBEaXJlY3Rpb24pO1xuICB9KTtcblxuICBQdWJTdWIuc3Vic2NyaWJlKFwiaGl0X3Nob3QxXCIsICgpID0+IHtcbiAgICBwbGF5VHVybihwbGF5ZXIxLCBwbGF5ZXIyLCBnYW1lYm9hcmQxLCBnYW1lYm9hcmQyLCBmaWVsZDEsIGZpZWxkMik7XG4gIH0pO1xuICBQdWJTdWIuc3Vic2NyaWJlKFwiaGl0X3Nob3QyXCIsICgpID0+IHtcbiAgICBwbGF5VHVybihwbGF5ZXIxLCBwbGF5ZXIyLCBnYW1lYm9hcmQxLCBnYW1lYm9hcmQyLCBmaWVsZDEsIGZpZWxkMik7XG4gIH0pO1xuXG4gIFB1YlN1Yi5zdWJzY3JpYmUoXCJtaXNzZWRfc2hvdDFcIiwgKCkgPT4ge1xuICAgIHBsYXllcjEuY2hhbmdlU3RhdHVzKCk7XG4gICAgcGxheWVyMi5jaGFuZ2VTdGF0dXMoKTtcbiAgICBwbGF5VHVybihwbGF5ZXIxLCBwbGF5ZXIyLCBnYW1lYm9hcmQxLCBnYW1lYm9hcmQyLCBmaWVsZDEsIGZpZWxkMik7XG4gIH0pO1xuICBQdWJTdWIuc3Vic2NyaWJlKFwibWlzc2VkX3Nob3QyXCIsICgpID0+IHtcbiAgICBwbGF5ZXIxLmNoYW5nZVN0YXR1cygpO1xuICAgIHBsYXllcjIuY2hhbmdlU3RhdHVzKCk7XG4gICAgcGxheVR1cm4ocGxheWVyMSwgcGxheWVyMiwgZ2FtZWJvYXJkMSwgZ2FtZWJvYXJkMiwgZmllbGQxLCBmaWVsZDIpO1xuICB9KTtcbn07XG5cbmV4cG9ydCB7IGdhbWUgfTtcbiIsImltcG9ydCB7IHNoaXAgfSBmcm9tIFwiLi9zaGlwXCI7XG5cbmNvbnN0IGdhbWVib2FyZCA9ICgpID0+IHtcbiAgbGV0IGJvYXJkID0gW107XG4gIGxldCBzaGlwQ291bnQgPSAwO1xuICBsZXQgc2hpcHMgPSBbXTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCAxMDsgaSsrKSB7XG4gICAgYm9hcmRbaV0gPSBbXTtcbiAgICBmb3IgKGxldCBqID0gMDsgaiA8IDEwOyBqKyspIHtcbiAgICAgIGJvYXJkW2ldW2pdID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IGFkZFNoaXAgPSAobGVuZ3RoLCBpLCBqLCBkaXIgPSBbMCwgMV0pID0+IHtcbiAgICBzaGlwc1tzaGlwQ291bnRdID0gc2hpcChsZW5ndGgpO1xuICAgIGZvciAobGV0IGsgPSAwOyBrIDwgbGVuZ3RoOyBrKyspIHtcbiAgICAgIGJvYXJkW2kgLSBkaXJbMV0gKiBrXVtqICsgZGlyWzBdICoga10gPSBzaGlwQ291bnQ7XG4gICAgfVxuICAgIHNoaXBDb3VudCsrO1xuICB9O1xuXG4gIGNvbnN0IHJlY2VpdmVBdHRhY2sgPSAoaSwgaikgPT4ge1xuICAgIC8qIGlmIG1pc3NlZCBzaG90IGNlbGwgdmFsdWUgd2lsbCBjaGFuZ2UgdG8gLTEgXG4gICAgaWYgaGl0IGNlbGwgdmFsdWUgd2lsbCBjaGFuZ2UgdG8gLTIqL1xuICAgIGlmIChib2FyZFtpXVtqXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBib2FyZFtpXVtqXSA9IC0xO1xuICAgIH0gZWxzZSBpZiAoYm9hcmRbaV1bal0gIT09IC0xICYmIGJvYXJkW2ldW2pdICE9PSAtMikge1xuICAgICAgbGV0IHNoaXAgPSBib2FyZFtpXVtqXTtcbiAgICAgIHNoaXBzW3NoaXBdLmhpdCgpO1xuICAgICAgYm9hcmRbaV1bal0gPSAtMjtcbiAgICB9XG4gIH07XG5cbiAgY29uc3QgY2hlY2tBbGxTdW5rID0gKCkgPT4ge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2hpcHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmICghc2hpcHNbaV0uaXNTdW5rKCkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcblxuICBjb25zdCBnZXRDb29yZGluYXRlU3RhdHVzID0gKGksIGopID0+IHtcbiAgICByZXR1cm4gYm9hcmRbaV1bal07XG4gIH07XG5cbiAgY29uc3QgZ2V0Qm9hcmQgPSAoKSA9PiBib2FyZDtcblxuICBjb25zdCBnZXRTaGlwID0gKG4pID0+IHNoaXBzW25dO1xuXG4gIHJldHVybiB7XG4gICAgZ2V0Qm9hcmQsXG4gICAgYWRkU2hpcCxcbiAgICBnZXRDb29yZGluYXRlU3RhdHVzLFxuICAgIHJlY2VpdmVBdHRhY2ssXG4gICAgZ2V0U2hpcCxcbiAgICBjaGVja0FsbFN1bmssXG4gIH07XG59O1xuXG5leHBvcnQgeyBnYW1lYm9hcmQgfTtcbiIsImltcG9ydCB7IGdhbWUgfSBmcm9tIFwiLi9nYW1lXCI7XG5pbXBvcnQgeyBnYW1lYm9hcmQgfSBmcm9tIFwiLi9nYW1lYm9hcmRcIjtcbmltcG9ydCB7IHBsYXllciB9IGZyb20gXCIuL3BsYXllclwiO1xuaW1wb3J0IFB1YlN1YiBmcm9tIFwicHVic3ViLWpzXCI7XG5cbmZ1bmN0aW9uIGNyZWF0ZUJvYXJkKGZpZWxkKSB7XG4gIGZvciAobGV0IGogPSAwOyBqIDwgMTA7IGorKykge1xuICAgIGxldCByb3cgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIHJvdy5jbGFzc05hbWUgPSBcInJvd1wiO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMTA7IGkrKykge1xuICAgICAgbGV0IGNlbGwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgY2VsbC5jbGFzc05hbWUgPSBcImNlbGxcIjtcbiAgICAgIHJvdy5hcHBlbmRDaGlsZChjZWxsKTtcbiAgICB9XG5cbiAgICBmaWVsZC5hcHBlbmRDaGlsZChyb3cpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGRpc3BsYXlCb2FyZChnYW1lQm9hcmQsIGZpZWxkLCBwbGF5ZXIgPSAwKSB7XG4gIGxldCBib2FyZCA9IGdhbWVCb2FyZC5nZXRCb2FyZCgpO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IDEwOyBpKyspIHtcbiAgICBsZXQgcm93ID0gZmllbGQuY2hpbGRyZW5baV07XG4gICAgZm9yIChsZXQgaiA9IDA7IGogPCAxMDsgaisrKSB7XG4gICAgICBsZXQgY2VsbCA9IHJvdy5jaGlsZHJlbltqXTtcbiAgICAgIGlmIChib2FyZFtpXVtqXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGNlbGwuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gXCJ3aGl0ZVwiO1xuICAgICAgfSBlbHNlIGlmIChib2FyZFtpXVtqXSA9PT0gLTEpIHtcbiAgICAgICAgY2VsbC5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBcImdyZXlcIjtcbiAgICAgIH0gZWxzZSBpZiAoYm9hcmRbaV1bal0gPT09IC0yKSB7XG4gICAgICAgIGNlbGwuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gXCJyZWRcIjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChwbGF5ZXIgPT09IDApIHtcbiAgICAgICAgICBjZWxsLnN0eWxlLmJhY2tncm91bmRDb2xvciA9IFwiYmxhY2tcIjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBhY3RpdmF0ZUJvYXJkKGdhbWVCb2FyZCwgZmllbGQpIHtcbiAgbGV0IGJvYXJkID0gZ2FtZUJvYXJkLmdldEJvYXJkKCk7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgMTA7IGkrKykge1xuICAgIGxldCByb3cgPSBmaWVsZC5jaGlsZHJlbltpXTtcbiAgICBmb3IgKGxldCBqID0gMDsgaiA8IDEwOyBqKyspIHtcbiAgICAgIGxldCBjZWxsID0gcm93LmNoaWxkcmVuW2pdO1xuICAgICAgaWYgKGJvYXJkW2ldW2pdICE9PSAtMSAmJiBib2FyZFtpXVtqXSAhPT0gLTIpIHtcbiAgICAgICAgY2VsbC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgICAgIGdhbWVCb2FyZC5yZWNlaXZlQXR0YWNrKGksIGopO1xuICAgICAgICAgIGRpc3BsYXlCb2FyZChnYW1lQm9hcmQsIGZpZWxkLCAxKTtcbiAgICAgICAgICBpZiAoZ2FtZUJvYXJkLmdldEJvYXJkKClbaV1bal0gPT09IC0xKSB7XG4gICAgICAgICAgICBQdWJTdWIucHVibGlzaChcIm1pc3NlZF9zaG90MVwiKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGdhbWVCb2FyZC5nZXRCb2FyZCgpW2ldW2pdID09PSAtMikge1xuICAgICAgICAgICAgUHViU3ViLnB1Ymxpc2goXCJoaXRfc2hvdDFcIik7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gZGVhY3RpdmF0ZUJvYXJkKGdhbWVCb2FyZCwgZmllbGQsIHBsYXllcikge1xuICB3aGlsZSAoZmllbGQuZmlyc3RDaGlsZCkge1xuICAgIGZpZWxkLnJlbW92ZUNoaWxkKGZpZWxkLmxhc3RDaGlsZCk7XG4gIH1cbiAgY3JlYXRlQm9hcmQoZmllbGQpO1xuICBkaXNwbGF5Qm9hcmQoZ2FtZUJvYXJkLCBmaWVsZCwgcGxheWVyKTtcbn1cblxuZnVuY3Rpb24gcGxheVR1cm4ocGxheWVyMSwgcGxheWVyMiwgZ2FtZWJvYXJkMSwgZ2FtZWJvYXJkMiwgZmllbGQxLCBmaWVsZDIpIHtcbiAgY29uc29sZS5sb2cocGxheWVyMS5pc1R1cm4oKSk7XG4gIGlmIChwbGF5ZXIxLmlzVHVybigpKSB7XG4gICAgZGVhY3RpdmF0ZUJvYXJkKGdhbWVib2FyZDIsIGZpZWxkMiwgMSk7XG4gICAgYWN0aXZhdGVCb2FyZChnYW1lYm9hcmQyLCBmaWVsZDIpO1xuICB9IGVsc2Uge1xuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgZGVhY3RpdmF0ZUJvYXJkKGdhbWVib2FyZDIsIGZpZWxkMiwgMSk7XG4gICAgICBsZXQgaGl0ID0gcGxheWVyMi5oaXQoZ2FtZWJvYXJkMSk7XG4gICAgICBnYW1lYm9hcmQxLnJlY2VpdmVBdHRhY2soaGl0WzBdLCBoaXRbMV0pO1xuICAgICAgZGlzcGxheUJvYXJkKGdhbWVib2FyZDEsIGZpZWxkMSk7XG4gICAgICBpZiAoZ2FtZWJvYXJkMS5nZXRCb2FyZCgpW2hpdFswXV1baGl0WzFdXSA9PT0gLTEpIHtcbiAgICAgICAgUHViU3ViLnB1Ymxpc2goXCJtaXNzZWRfc2hvdDJcIik7XG4gICAgICB9IGVsc2UgaWYgKGdhbWVib2FyZDEuZ2V0Qm9hcmQoKVtoaXRbMF1dW2hpdFsxXV0gPT09IC0yKSB7XG4gICAgICAgIFB1YlN1Yi5wdWJsaXNoKFwiaGl0X3Nob3QyXCIpO1xuICAgICAgfVxuICAgIH0sIDUwMCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gYWRkU2hpcERpc3BsYXkoKSB7XG4gIGxldCBjb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmRpc3BsYXlcIik7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgNDk7IGkrKykge1xuICAgIGxldCBjZWxsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoY2VsbCk7XG4gIH1cbiAgY29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgUHViU3ViLnB1Ymxpc2goXCJjaGFuZ2VfZGlyZWN0aW9uXCIpO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gY2hhbmdlU2hpcERpcmVjdGlvbihkaXJlY3Rpb24pIHtcbiAgbGV0IGRpciA9IGRpcmVjdGlvbi50b1N0cmluZygpO1xuICBpZiAoZGlyID09PSBcIjAsMVwiKSB7XG4gICAgZGlyZWN0aW9uID0gWzEsIDBdO1xuICB9IGVsc2UgaWYgKGRpciA9PT0gXCIxLDBcIikge1xuICAgIGRpcmVjdGlvbiA9IFswLCAtMV07XG4gIH0gZWxzZSBpZiAoZGlyID09PSBcIjAsLTFcIikge1xuICAgIGRpcmVjdGlvbiA9IFstMSwgMF07XG4gIH0gZWxzZSB7XG4gICAgZGlyZWN0aW9uID0gWzAsIDFdO1xuICB9XG5cbiAgcmV0dXJuIGRpcmVjdGlvbjtcbn1cblxuZnVuY3Rpb24gZGlzcGxheVNoaXBUb0FkZChsZW5ndGgsIGRpcmVjdGlvbikge1xuICBsZXQgY29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5kaXNwbGF5XCIpO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IDQ5OyBpKyspIHtcbiAgICBjb250YWluZXIuY2hpbGRyZW5baV0uc3R5bGUuYmFja2dyb3VuZENvbG9yID0gXCJ3aGl0ZVwiO1xuICB9XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICBjb250YWluZXIuY2hpbGRyZW5bXG4gICAgICAyNCAtIGRpcmVjdGlvblsxXSAqIGkgKiA3ICsgZGlyZWN0aW9uWzBdICogaVxuICAgIF0uc3R5bGUuYmFja2dyb3VuZENvbG9yID0gXCJibGFja1wiO1xuICB9XG4gIGNvbnRhaW5lci5jaGlsZHJlblsyNF0uc3R5bGUuYmFja2dyb3VuZENvbG9yID0gXCJyZWRcIjtcbiAgaWYgKGxlbmd0aCA9PT0gMCkge1xuICAgIGNvbnRhaW5lci5jaGlsZHJlblsyNF0uc3R5bGUuYmFja2dyb3VuZENvbG9yID0gXCJ3aGl0ZVwiO1xuICB9XG59XG5cbmZ1bmN0aW9uIGFkZFNoaXBPbkZpZWxkKGdhbWVCb2FyZCwgZmllbGQsIGxlbmd0aCwgZGlyZWN0aW9uKSB7XG4gIGRlYWN0aXZhdGVCb2FyZChnYW1lQm9hcmQsIGZpZWxkLCAwKTtcblxuICBhY3RpdmF0ZUJvYXJkMShnYW1lQm9hcmQsIGZpZWxkLCBsZW5ndGgsIGRpcmVjdGlvbik7XG59XG5cbmZ1bmN0aW9uIGFjdGl2YXRlQm9hcmQxKGdhbWVCb2FyZCwgZmllbGQsIGxlbmd0aCwgZGlyZWN0aW9uKSB7XG4gIGxldCBib2FyZCA9IGdhbWVCb2FyZC5nZXRCb2FyZCgpO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IDEwOyBpKyspIHtcbiAgICBsZXQgcm93ID0gZmllbGQuY2hpbGRyZW5baV07XG4gICAgZm9yIChsZXQgaiA9IDA7IGogPCAxMDsgaisrKSB7XG4gICAgICBsZXQgY2VsbCA9IHJvdy5jaGlsZHJlbltqXTtcbiAgICAgIGlmIChib2FyZFtpXVtqXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGNlbGwuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgICAgICBpZiAoY2hlY2tJZlNoaXBGaXRzKGdhbWVCb2FyZCwgbGVuZ3RoLCBkaXJlY3Rpb24sIGksIGopKSB7XG4gICAgICAgICAgICBnYW1lQm9hcmQuYWRkU2hpcChsZW5ndGgsIGksIGosIGRpcmVjdGlvbik7XG4gICAgICAgICAgICBkaXNwbGF5Qm9hcmQoZ2FtZUJvYXJkLCBmaWVsZCk7XG4gICAgICAgICAgICBQdWJTdWIucHVibGlzaChcInNoaXBfYWRkZWRcIik7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gY2hlY2tJZlNoaXBGaXRzKGdhbWVCb2FyZCwgbGVuZ3RoLCBkaXJlY3Rpb24sIGksIGopIHtcbiAgbGV0IGJvYXJkID0gZ2FtZUJvYXJkLmdldEJvYXJkKCk7XG4gIGxldCByb3dSYW5nZSA9IFswLCAxMF07XG4gIGxldCBjZWxsUmFuZ2UgPSBbMCwgMTBdO1xuXG4gIGlmIChkaXJlY3Rpb25bMV0gPT09IDEpIHtcbiAgICByb3dSYW5nZSA9IFtsZW5ndGggLSAxLCAxMF07XG4gIH0gZWxzZSBpZiAoZGlyZWN0aW9uWzFdID09PSAtMSkge1xuICAgIHJvd1JhbmdlID0gWzAsIDEwIC0gbGVuZ3RoICsgMV07XG4gIH1cbiAgaWYgKGRpcmVjdGlvblswXSA9PT0gMSkge1xuICAgIGNlbGxSYW5nZSA9IFswLCAxMCAtIGxlbmd0aCArIDFdO1xuICB9IGVsc2UgaWYgKGRpcmVjdGlvblswXSA9PT0gLTEpIHtcbiAgICBjZWxsUmFuZ2UgPSBbbGVuZ3RoIC0gMSwgMTBdO1xuICB9XG4gIGlmIChcbiAgICBpIDwgcm93UmFuZ2VbMF0gfHxcbiAgICBpID49IHJvd1JhbmdlWzFdIHx8XG4gICAgaiA8IGNlbGxSYW5nZVswXSB8fFxuICAgIGogPj0gY2VsbFJhbmdlWzFdXG4gICkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGZvciAobGV0IGsgPSAwOyBrIDwgbGVuZ3RoOyBrKyspIHtcbiAgICBpZiAoYm9hcmRbaSAtIGRpcmVjdGlvblsxXSAqIGtdW2ogKyBkaXJlY3Rpb25bMF0gKiBrXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59XG5cbmZ1bmN0aW9uIGFkZFNoaXBPbkZpZWxkMihnYW1lQm9hcmQpIHtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCAxMDsgaSsrKSB7XG4gICAgbGV0IGRpcmVjdGlvbiA9IGdlbmVyYXRlUmFuZG9tRGlyKCk7XG4gICAgbGV0IGxlbmd0aCA9IHJldHVyblNoaXBMZW5ndGgoaSk7XG4gICAgbGV0IHBvaW50ID0gZ2VuZXJhdGVTaGlwQmFzZShnYW1lQm9hcmQpO1xuXG4gICAgZG8ge1xuICAgICAgcG9pbnQgPSBnZW5lcmF0ZVNoaXBCYXNlKGdhbWVCb2FyZCk7XG4gICAgfSB3aGlsZSAoXG4gICAgICAhY2hlY2tJZlNoaXBGaXRzKGdhbWVCb2FyZCwgbGVuZ3RoLCBkaXJlY3Rpb24sIHBvaW50WzBdLCBwb2ludFsxXSlcbiAgICApO1xuXG4gICAgZ2FtZUJvYXJkLmFkZFNoaXAobGVuZ3RoLCBwb2ludFswXSwgcG9pbnRbMV0sIGRpcmVjdGlvbik7XG4gIH1cbn1cblxuZnVuY3Rpb24gcmV0dXJuU2hpcExlbmd0aChzaGlwQ291bnQpIHtcbiAgbGV0IHNoaXBMZW5ndGggPSA0O1xuICBpZiAoc2hpcENvdW50ID4gNSkge1xuICAgIHNoaXBMZW5ndGggPSAxO1xuICB9IGVsc2UgaWYgKHNoaXBDb3VudCA+IDIpIHtcbiAgICBzaGlwTGVuZ3RoID0gMjtcbiAgfSBlbHNlIGlmIChzaGlwQ291bnQgPiAwKSB7XG4gICAgc2hpcExlbmd0aCA9IDM7XG4gIH1cbiAgcmV0dXJuIHNoaXBMZW5ndGg7XG59XG5cbmZ1bmN0aW9uIGdlbmVyYXRlUmFuZG9tRGlyKCkge1xuICBsZXQgeCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDQpO1xuICBpZiAoeCA9PT0gMCkge1xuICAgIHJldHVybiBbMCwgMV07XG4gIH0gZWxzZSBpZiAoeCA9PT0gMSkge1xuICAgIHJldHVybiBbMSwgMF07XG4gIH0gZWxzZSBpZiAoeCA9PT0gMikge1xuICAgIHJldHVybiBbMCwgLTFdO1xuICB9IGVsc2UgaWYgKHggPT09IDMpIHtcbiAgICByZXR1cm4gWy0xLCAwXTtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZW5lcmF0ZVNoaXBCYXNlKGJvYXJkKSB7XG4gIGxldCBiID0gYm9hcmQuZ2V0Qm9hcmQoKTtcbiAgbGV0IGk7XG4gIGxldCBqO1xuICBkbyB7XG4gICAgaSA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwKTtcbiAgICBqID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTApO1xuICB9IHdoaWxlIChiW2ldW2pdICE9PSB1bmRlZmluZWQpO1xuICByZXR1cm4gW2ksIGpdO1xufVxuXG5mdW5jdGlvbiBjaGFuZ2VTdGF0dXMoKSB7XG4gIHBsYXllcjEuY2hhbmdlU3RhdHVzKCk7XG4gIHBsYXllcjIuY2hhbmdlU3RhdHVzKCk7XG59XG5cbmV4cG9ydCB7XG4gIGNyZWF0ZUJvYXJkLFxuICBkaXNwbGF5Qm9hcmQsXG4gIHBsYXlUdXJuLFxuICBhY3RpdmF0ZUJvYXJkLFxuICBhZGRTaGlwRGlzcGxheSxcbiAgZGlzcGxheVNoaXBUb0FkZCxcbiAgY2hhbmdlU2hpcERpcmVjdGlvbixcbiAgYWRkU2hpcE9uRmllbGQsXG4gIGRlYWN0aXZhdGVCb2FyZCxcbiAgcmV0dXJuU2hpcExlbmd0aCxcbiAgYWRkU2hpcE9uRmllbGQyLFxufTtcbiIsImNvbnN0IHBsYXllciA9ICgpID0+IHtcbiAgbGV0IGlzQ3VycmVudCA9IGZhbHNlO1xuICBjb25zdCBpc1R1cm4gPSAoKSA9PiBpc0N1cnJlbnQ7XG5cbiAgY29uc3QgY2hhbmdlU3RhdHVzID0gKCkgPT4ge1xuICAgIGlzQ3VycmVudCA9ICFpc0N1cnJlbnQ7XG4gIH07XG5cbiAgY29uc3QgaGl0ID0gKGJvYXJkKSA9PiB7XG4gICAgbGV0IGIgPSBib2FyZC5nZXRCb2FyZCgpO1xuICAgIGxldCBpO1xuICAgIGxldCBqO1xuICAgIGxldCBvcHRpb25zID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCAxMDsgaSsrKSB7XG4gICAgICBmb3IgKGxldCBqID0gMDsgaiA8IDEwOyBqKyspIHtcbiAgICAgICAgaWYgKGJbaV1bal0gIT0gLTEgJiYgYltpXVtqXSAhPSAtMikge1xuICAgICAgICAgIG9wdGlvbnMucHVzaChbaSwgal0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGxldCB4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogb3B0aW9ucy5sZW5ndGgpO1xuICAgIHJldHVybiBvcHRpb25zW3hdO1xuICB9O1xuXG4gIHJldHVybiB7IGlzVHVybiwgY2hhbmdlU3RhdHVzLCBoaXQgfTtcbn07XG5cbmV4cG9ydCB7IHBsYXllciB9O1xuIiwiY29uc3Qgc2hpcCA9IChsZW5ndGgpID0+IHtcbiAgbGV0IGhpdHMgPSAwO1xuICBsZXQgc3VuayA9IGZhbHNlO1xuXG4gIGNvbnN0IGhpdCA9ICgpID0+IHtcbiAgICBoaXRzKys7XG4gIH07XG5cbiAgY29uc3QgaXNTdW5rID0gKCkgPT4ge1xuICAgIGlmIChoaXRzID49IGxlbmd0aCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH07XG5cbiAgY29uc3QgZ2V0SGl0cyA9ICgpID0+IGhpdHM7XG4gIHJldHVybiB7IGxlbmd0aCwgZ2V0SGl0cywgaXNTdW5rLCBoaXQgfTtcbn07XG5cbmV4cG9ydCB7IHNoaXAgfTtcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0aWQ6IG1vZHVsZUlkLFxuXHRcdGxvYWRlZDogZmFsc2UsXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuXHRtb2R1bGUubG9hZGVkID0gdHJ1ZTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSAobW9kdWxlKSA9PiB7XG5cdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuXHRcdCgpID0+IChtb2R1bGVbJ2RlZmF1bHQnXSkgOlxuXHRcdCgpID0+IChtb2R1bGUpO1xuXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCB7IGE6IGdldHRlciB9KTtcblx0cmV0dXJuIGdldHRlcjtcbn07IiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubm1kID0gKG1vZHVsZSkgPT4ge1xuXHRtb2R1bGUucGF0aHMgPSBbXTtcblx0aWYgKCFtb2R1bGUuY2hpbGRyZW4pIG1vZHVsZS5jaGlsZHJlbiA9IFtdO1xuXHRyZXR1cm4gbW9kdWxlO1xufTsiLCJpbXBvcnQgeyBnYW1lIH0gZnJvbSBcIi4vZ2FtZVwiO1xuXG5nYW1lKCk7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=