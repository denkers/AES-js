function SafeExchange() {}

//Large prime used, modulo prime
SafeExchange.prime = '108838049659940303356103757286832107246140775791152305372594007835539736018383';

//Prime generator
SafeExchange.gen	= '2';

//returns a random big string integer for secret
SafeExchange.generateSecret = function()
{
	return bigInt2str(randBigInt(80), 10);
};


//returns a random big integer for secret
SafeExchange.generateSecretInt = function()
{
	return randBigInt(80);
};


//returns a hash of the private key to be
//used as the IV, can additionally pass another IV
SafeExchange.generateIV = function(private_key)
{
	return YaMD5.hashStr(private_key);
};	


//converts and returns the prime string to big int
SafeExchange.primeToBigInt = function()
{
	return str2bigInt(SafeExchange.prime, 10, 80);
};


//converts and returns the prime gen string to big int
SafeExchange.genToBigInt = function()
{
	return str2bigInt(SafeExchange.gen, 10, 80);
};


//returns the public key for secret
//PublicKey = gen^secret mod prime
SafeExchange.generatePublicKey = function(secret)
{
	var pVal	=	SafeExchange.primeToBigInt();
	var gVal	=	SafeExchange.genToBigInt();
	return powMod(gVal, secret, pVal);
};


//returns the private key for the secret and public key
//PrivateKey = public_key^secret mod prime
//return MD5(PrivateKey)
SafeExchange.generatePrivateKey = function(public_key, secret)
{
	var pVal		=	SafeExchange.primeToBigInt();
	var result		=	powMod(public_key, secret, pVal);
	var strResult	=	bigInt2str(result, 10);

	return YaMD5.hashStr(strResult);
};


//converts a big into string and returns its hash
SafeExchange.makeHash = function(bigint)
{
	var str = bigInt2str(bigint, 10);
	return YaMD5.hashStr(str);
};


//Signs the digital signature
//Creates a hashed message and encrypts it
//encrypts the message and returns the encrypted hash and encrypted message
SafeExchange.signMessage = function(message, pkey, iv)
{
	var hashedMsg	=	YaMD5.hashStr(message); //hash message
	var encHash		=	AES.encryptMessage(hashedMsg, pkey, iv, 128); //encrypt hash
	var encMsg		=	AES.encryptMessage(message, pkey, iv, 128); //encrypt message

	//return hash and message
	return { msg: encMsg, hash: encHash };
};


//Releases the the digital signature
//decrypts the hash and the message passed
//computes the hash of the message to compare with hash
//hash strings should match if they are unmodified
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

