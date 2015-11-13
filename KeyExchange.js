function KeyExchange() {}

KeyExchange.prime = '108838049659940303356103757286832107246140775791152305372594007835539736018383';

//mod prime root
KeyExchange.gen	= '2';


KeyExchange.generateSecret = function()
{
	return bigInt2str(randBigInt(256), 10);
};


KeyExchange.generateSecretInt = function()
{
	return randBigInt(256);
};


var bobSecret = KeyExchange.generateSecretInt();
var aliceSecret = KeyExchange.generateSecretInt();
var primeVal = str2bigInt(KeyExchange.prime, 10, 80);
var eVal = str2bigInt(KeyExchange.gen, 10, 80);

var bobE = powMod(eVal, bobSecret, primeVal);
var aliceE = powMod(eVal, aliceSecret, primeVal);

var bSec = powMod(aliceE, bobSecret, primeVal);
var aSec = powMod(bobE, aliceSecret, primeVal);

var bStr = bigInt2str(bSec, 10);
var aStr = bigInt2str(aSec, 10);

var md5str = YaMD5.hashStr(aStr);
var md5str2 = YaMD5.hashStr(bStr);

  // var g = str2bigInt("2", 10, 80); 
console.log('bob: ' + bStr + ' \nalice: ' + aStr + '\nhash: ' + md5str + '\nhash2: ' + md5str2);
