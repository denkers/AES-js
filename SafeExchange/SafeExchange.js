function SafeExchange() {}

SafeExchange.prime = '108838049659940303356103757286832107246140775791152305372594007835539736018383';

SafeExchange.gen	= '2';

SafeExchange.generateSecret = function()
{
	return bigInt2str(randBigInt(80), 10);
};

SafeExchange.generateIV = function(private_key)
{
	return YaMD5.hashStr(private_key);
};	

SafeExchange.generateSecretInt = function()
{
	return randBigInt(80);
};

SafeExchange.primeToBigInt = function()
{
	return str2bigInt(SafeExchange.prime, 10, 80);
};

SafeExchange.genToBigInt = function()
{
	return str2bigInt(SafeExchange.gen, 10, 80);
};

SafeExchange.generatePublicKey = function(secret)
{
	var pVal	=	SafeExchange.primeToBigInt();
	var gVal	=	SafeExchange.genToBigInt();
	return powMod(gVal, secret, pVal);
};

SafeExchange.generatePrivateKey = function(public_key, secret)
{
	var pVal		=	SafeExchange.primeToBigInt();
	var result		=	powMod(public_key, secret, pVal);
	var strResult	=	bigInt2str(result, 10);

	return YaMD5.hashStr(strResult);
};

SafeExchange.makeHash = function(bigint)
{
	var str = bigInt2str(bigint, 10);
	return YaMD5.hashStr(str);
};

SafeExchange.signMessage = function(message, pkey, iv)
{
	var hashedMsg	=	YaMD5.hashStr(message);
	var encHash		=	AES.encryptMessage(hashedMsg, pkey, iv, 128);
	var encMsg		=	AES.encryptMessage(message, pkey, iv, 128);

	return { msg: encMsg, hash: encHash };
};

SafeExchange.releaseMessage = function(message, hash, pkey, iv)
{
	var decHash	=	AES.decryptMessage(hash, pkey, iv, 128);
	var decMsg	=	AES.decryptMessage(message, pkey, iv, 128);
	var msgHash	=	YaMD5.hashStr(decMsg);

	if(msgHash == decHash)
		return decMsg;
	else
		return null;
};

