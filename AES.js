function AES() {}

AES.encrypt = function()
{


};

AES.decrypt = function()
{


};


var bin = 'abcdefghijklmnop';
var state = Structure.strToState(bin);
console.log('plain');
Structure.printState(state);
Engine.shiftRows(state, true);
console.log('byte sub');
Structure.printState(state);
//var x = Structure.padBin(bin.charCodeAt(bin.length - 1).toString(2));

//console.log(String.fromCharCode(parseInt(x, 2)));

